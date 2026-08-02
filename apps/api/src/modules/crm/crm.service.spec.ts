import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { LEAD_REPOSITORY } from "./domain/lead-repository.interface";
import { InMemoryLeadRepository } from "./infra/in-memory-lead.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { NOTIFICATION_REPOSITORY } from "../notifications/domain/notification-repository.interface";
import { InMemoryNotificationRepository } from "../notifications/infra/in-memory-notification.repository";
import { ClientsService } from "../clients/clients.service";
import { CLIENT_REPOSITORY } from "../clients/domain/client-repository.interface";
import { InMemoryClientRepository } from "../clients/infra/in-memory-client.repository";

describe("CrmService", () => {
  let service: CrmService;
  let notificationsService: NotificationsService;
  let leadRepository: InMemoryLeadRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CrmService,
        InMemoryLeadRepository,
        { provide: LEAD_REPOSITORY, useExisting: InMemoryLeadRepository },
        NotificationsService,
        InMemoryNotificationRepository,
        { provide: NOTIFICATION_REPOSITORY, useExisting: InMemoryNotificationRepository },
        ClientsService,
        InMemoryClientRepository,
        { provide: CLIENT_REPOSITORY, useExisting: InMemoryClientRepository },
      ],
    }).compile();

    service = moduleRef.get(CrmService);
    notificationsService = moduleRef.get(NotificationsService);
    leadRepository = moduleRef.get(InMemoryLeadRepository);
  });

  describe("criação e listagem", () => {
    it("cria lead com status inicial NOVO", async () => {
      const lead = await service.createLead(
        "org-1",
        "Marina Costa",
        "48999990000",
        "INDICACAO",
        "Apartamento",
        "R$40-60k",
        "3 meses",
      );

      expect(lead.status).toBe("NOVO");
      expect(lead.origin).toBe("INDICACAO");
    });

    it("lista apenas leads da organização correta", async () => {
      await service.createLead("org-1", "Lead A", null, "OUTRO", null, null, null);
      await service.createLead("org-2", "Lead B", null, "OUTRO", null, null, null);

      const lista = await service.listLeads("org-1");
      expect(lista).toHaveLength(1);
      expect(lista[0].name).toBe("Lead A");
    });
  });

  describe("mudança de status e follow-up automático", () => {
    it("agenda follow-up automaticamente para 4 dias ao marcar REUNIAO_MARCADA", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "INSTAGRAM_ORGANICO", null, null, null);

      const updated = await service.updateStatus(lead.id, "org-1", "REUNIAO_MARCADA");

      expect(updated.nextFollowUpAt).not.toBeNull();
      const diffDays = Math.round(
        (updated.nextFollowUpAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      expect(diffDays).toBe(4);
    });

    it("agenda follow-up automaticamente ao marcar AGUARDANDO_DECISAO", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "INSTAGRAM_ORGANICO", null, null, null);

      const updated = await service.updateStatus(lead.id, "org-1", "AGUARDANDO_DECISAO");

      expect(updated.nextFollowUpAt).not.toBeNull();
    });

    it("limpa o follow-up ao fechar ou perder o lead", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "INSTAGRAM_ORGANICO", null, null, null);
      await service.updateStatus(lead.id, "org-1", "AGUARDANDO_DECISAO");

      const updated = await service.updateStatus(lead.id, "org-1", "PERDIDO");
      expect(updated.nextFollowUpAt).toBeNull();
    });
  });

  describe("perda e reabertura de lead", () => {
    it("marca lead como perdido exigindo motivo", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      const updated = await service.markAsLost(lead.id, "org-1", "Fechou com concorrente");

      expect(updated.status).toBe("PERDIDO");
      expect(updated.lossReason).toBe("Fechou com concorrente");
    });

    it("rejeita marcar como perdido sem motivo", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      await expect(service.markAsLost(lead.id, "org-1", "")).rejects.toThrow(BadRequestException);
    });

    it("reabre um lead perdido preservando os dados de qualificação", async () => {
      const lead = await service.createLead(
        "org-1",
        "Rafael",
        "48999990000",
        "INDICACAO",
        "Casa",
        "R$80-100k",
        null,
      );
      await service.markAsLost(lead.id, "org-1", "Sem orçamento no momento");

      const reopened = await service.reopenLead(lead.id, "org-1");

      expect(reopened.status).toBe("QUALIFICADO");
      expect(reopened.lossReason).toBeNull();
      expect(reopened.projectType).toBe("Casa");
      expect(reopened.budgetRange).toBe("R$80-100k");
    });

    it("rejeita reabrir um lead que não está perdido", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      await expect(service.reopenLead(lead.id, "org-1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("conversão em cliente (fecha o funil)", () => {
    it("cria um cliente real a partir dos dados do lead e marca o lead como FECHADO", async () => {
      const lead = await service.createLead(
        "org-1",
        "Rafael Souza",
        "48999990000",
        "INDICACAO",
        "Casa",
        "R$80-100k",
        null,
      );

      const client = await service.convertToClient(lead.id, "org-1");

      expect(client.name).toBe("Rafael Souza");
      expect(client.phone).toBe("48999990000");

      const updatedLead = await service.getLead(lead.id, "org-1");
      expect(updatedLead.status).toBe("FECHADO");
      expect(updatedLead.clientId).toBe(client.id);
    });

    it("rejeita converter um lead que já foi convertido", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      await service.convertToClient(lead.id, "org-1");

      await expect(service.convertToClient(lead.id, "org-1")).rejects.toThrow(BadRequestException);
    });

    it("rejeita converter lead de outra organização (isolamento multi-tenant)", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      await expect(service.convertToClient(lead.id, "org-2")).rejects.toThrow(NotFoundException);
    });
  });

  describe("alerta de follow-up (integração com Notificações)", () => {
    it("gera notificação LEAD_SEM_FOLLOWUP quando o prazo de 4 dias já passou", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      await service.updateStatus(lead.id, "org-1", "AGUARDANDO_DECISAO");

      // Simula que o follow-up já venceu, sem esperar 4 dias de verdade
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await leadRepository.update(lead.id, { nextFollowUpAt: past });

      const result = await service.checkFollowUpsAndNotify("org-1", "user-socia");

      expect(result.notified).toBe(1);
      const notifications = await notificationsService.listForUser("user-socia");
      expect(notifications.some((n) => n.type === "LEAD_SEM_FOLLOWUP")).toBe(true);
    });

    it("NÃO notifica leads fechados ou perdidos, mesmo com follow-up vencido", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      await service.markAsLost(lead.id, "org-1", "Sem orçamento");

      const result = await service.checkFollowUpsAndNotify("org-1", "user-socia");
      expect(result.notified).toBe(0);
    });

    it("NÃO duplica notificação ao rodar a checagem duas vezes para o mesmo lead", async () => {
      const lead = await service.createLead("org-1", "Rafael", null, "OUTRO", null, null, null);
      await service.updateStatus(lead.id, "org-1", "AGUARDANDO_DECISAO");
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await leadRepository.update(lead.id, { nextFollowUpAt: past });

      await service.checkFollowUpsAndNotify("org-1", "user-socia");
      const second = await service.checkFollowUpsAndNotify("org-1", "user-socia");

      expect(second.notified).toBe(0);
    });
  });
});
