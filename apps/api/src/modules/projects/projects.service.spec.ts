import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { PROJECT_REPOSITORY } from "./domain/project-repository.interface";
import { InMemoryProjectRepository } from "./infra/in-memory-project.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { NOTIFICATION_REPOSITORY } from "../notifications/domain/notification-repository.interface";
import { InMemoryNotificationRepository } from "../notifications/infra/in-memory-notification.repository";
import { ClientsService } from "../clients/clients.service";
import { CLIENT_REPOSITORY } from "../clients/domain/client-repository.interface";
import { InMemoryClientRepository } from "../clients/infra/in-memory-client.repository";

describe("ProjectsService", () => {
  let service: ProjectsService;
  let notificationsService: NotificationsService;
  let clientOrg1Id: string;
  let clientOrg2Id: string;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        InMemoryProjectRepository,
        { provide: PROJECT_REPOSITORY, useExisting: InMemoryProjectRepository },
        NotificationsService,
        InMemoryNotificationRepository,
        { provide: NOTIFICATION_REPOSITORY, useExisting: InMemoryNotificationRepository },
        ClientsService,
        InMemoryClientRepository,
        { provide: CLIENT_REPOSITORY, useExisting: InMemoryClientRepository },
      ],
    }).compile();

    service = moduleRef.get(ProjectsService);
    notificationsService = moduleRef.get(NotificationsService);

    const clientsService = moduleRef.get(ClientsService);
    const clientOrg1 = await clientsService.createClient(
      "org-1",
      "Cliente Teste Org1",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    const clientOrg2 = await clientsService.createClient(
      "org-2",
      "Cliente Teste Org2",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    clientOrg1Id = clientOrg1.id;
    clientOrg2Id = clientOrg2.id;
  });

  describe("criação de projeto e etapas automáticas", () => {
    it("cria um projeto vinculado à organização correta", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");

      expect(project.organizationId).toBe("org-1");
      expect(project.name).toBe("Casa Boa Vista");
      expect(project.status).toBe("ATIVO");
    });

    it("cria automaticamente as 8 etapas padrão, na ordem correta", async () => {
      const { stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");

      expect(stages).toHaveLength(8);
      expect(stages.map((s) => s.type)).toEqual([
        "BRIEFING",
        "MEDICAO",
        "ESTUDO_PRELIMINAR",
        "LAYOUT",
        "EXECUTIVO",
        "ORCAMENTO",
        "OBRA",
        "ENTREGA",
      ]);
      expect(stages.every((s) => s.status === "NAO_INICIADO")).toBe(true);
    });

    it("não lista projeto de outra organização", async () => {
      await service.createProject("org-1", clientOrg1Id, "Projeto A", "INTERIORES");
      await service.createProject("org-2", clientOrg2Id, "Projeto B", "INTERIORES");

      const listaOrg1 = await service.listProjects("org-1");

      expect(listaOrg1).toHaveLength(1);
      expect(listaOrg1[0].name).toBe("Projeto A");
    });
  });

  describe("regra de negócio: etapa atrasada (PRD v2.0 §3.3)", () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000);

    it("considera atrasada uma etapa com prazo no passado e status não aprovado", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(true);
    });

    it("NÃO considera atrasada uma etapa com prazo no futuro", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: amanha,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("NÃO considera atrasada uma etapa já aprovada, mesmo com prazo vencido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "APROVADO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: new Date(),
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("NÃO considera atrasada uma etapa sem prazo definido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: null,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("NÃO considera atrasada nenhuma etapa de projeto PAUSADO, mesmo com prazo vencido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "PAUSADO")).toBe(false);
    });

    it("NÃO considera atrasada nenhuma etapa de projeto CANCELADO", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "CANCELADO")).toBe(false);
    });

    it("NÃO considera atrasada uma etapa em modo exceção (ciclo aberto), mesmo com prazo vencido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "CICLO_ABERTO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("não aplica tolerância de carência — 1 segundo após o prazo já é atrasado", () => {
      const umSegundoAtras = new Date(Date.now() - 1000);
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: umSegundoAtras,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(true);
    });
  });

  describe("rodada de revisão — CR-000 (2 por projeto, não por etapa)", () => {
    it("permite registrar a 1ª e a 2ª rodada normalmente", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Apto Itacorubi", "INTERIORES");

      const r1 = await service.addRevisionRound(project.id, "cliente", "ajuste 1");
      const r2 = await service.addRevisionRound(project.id, "cliente", "ajuste 2");

      expect(r1.number).toBe(1);
      expect(r2.number).toBe(2);
    });

    it("bloqueia a 3ª rodada e orienta a criar um orçamento (aditivo), não permite como 'rodada extra'", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Apto Itacorubi", "INTERIORES");

      await service.addRevisionRound(project.id, "cliente", "ajuste 1");
      await service.addRevisionRound(project.id, "cliente", "ajuste 2");

      await expect(
        service.addRevisionRound(project.id, "cliente", "ajuste 3"),
      ).rejects.toThrow(BadRequestException);

      try {
        await service.addRevisionRound(project.id, "cliente", "ajuste 3");
      } catch (e) {
        const response = (e as BadRequestException).getResponse() as Record<string, unknown>;
        expect(response.code).toBe("REVISION_ROUNDS_EXHAUSTED");
        expect(response.suggestedAction).toBe("CREATE_BUDGET_AMENDMENT");
      }
    });

    it("a contagem de rodadas é por PROJETO INTEIRO, não some entre projetos diferentes", async () => {
      const { project: p1 } = await service.createProject("org-1", clientOrg1Id, "Projeto 1", "INTERIORES");
      const { project: p2 } = await service.createProject("org-1", clientOrg1Id, "Projeto 2", "INTERIORES");

      await service.addRevisionRound(p1.id, "cliente", "ajuste");
      await service.addRevisionRound(p1.id, "cliente", "ajuste");

      const r1 = await service.addRevisionRound(p2.id, "cliente", "ajuste");
      expect(r1.number).toBe(1);
    });

    it("cria um orçamento/aditivo vinculado ao projeto", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Apto Itacorubi", "INTERIORES");

      const amendment = await service.createBudgetAmendment(
        project.id,
        "Cliente pediu 3ª rodada de ajustes",
      );

      expect(amendment.projectId).toBe(project.id);
      expect(amendment.reason).toContain("3ª rodada");
    });
  });

  describe("modo exceção (S1-9)", () => {
    it("permite marcar uma etapa como ciclo aberto", async () => {
      const { stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      const stage = stages[4]; // EXECUTIVO

      const updated = await service.setStageMode(stage.id, "CICLO_ABERTO");

      expect(updated.mode).toBe("CICLO_ABERTO");
    });

    it("permite registrar interação livre em etapa que está em ciclo aberto", async () => {
      const { stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      const stage = stages[4];

      await service.setStageMode(stage.id, "CICLO_ABERTO");
      const note = await service.addOpenCycleNote(stage.id, "Cliente pediu nova versão da cozinha");

      expect(note.description).toBe("Cliente pediu nova versão da cozinha");
    });

    it("bloqueia registro de interação livre em etapa que NÃO está em ciclo aberto", async () => {
      const { stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      const stage = stages[4]; // ainda em modo PADRAO

      await expect(
        service.addOpenCycleNote(stage.id, "Tentativa indevida"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("pausado/cancelado (S1-10)", () => {
    it("pausa um projeto exigindo motivo", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");

      const updated = await service.pauseProject(project.id, "org-1", "Cliente pediu tempo");

      expect(updated.status).toBe("PAUSADO");
      expect(updated.statusReason).toBe("Cliente pediu tempo");
    });

    it("rejeita pausar sem informar motivo", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");

      await expect(service.pauseProject(project.id, "org-1", "")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("cancela um projeto exigindo motivo", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");

      const updated = await service.cancelProject(project.id, "org-1", "Cliente desistiu");

      expect(updated.status).toBe("CANCELADO");
    });

    it("rejeita pausar/cancelar projeto de outra organização (isolamento multi-tenant)", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");

      await expect(
        service.pauseProject(project.id, "org-2", "Motivo qualquer"),
      ).rejects.toThrow(NotFoundException);
    });

    it("reativa um projeto pausado", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      await service.pauseProject(project.id, "org-1", "Pausa temporária");

      const reactivated = await service.reactivateProject(project.id, "org-1");

      expect(reactivated.status).toBe("ATIVO");
      expect(reactivated.statusReason).toBeNull();
    });
  });

  describe("sub-entregas (S1-7)", () => {
    it("permite adicionar sub-entregas com responsáveis diferentes na etapa Executivo", async () => {
      const { stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      const executivo = stages.find((s) => s.type === "EXECUTIVO")!;

      const d1 = await service.addDeliverable(executivo.id, "Executivo de obra", "user-vitoria", null);
      const d2 = await service.addDeliverable(
        executivo.id,
        "Caderno de interiores",
        "user-thaina",
        null,
      );

      expect(d1.responsibleId).toBe("user-vitoria");
      expect(d2.responsibleId).toBe("user-thaina");
      expect(d1.name).not.toBe(d2.name);
    });
  });

  describe("cliente é pré-requisito do projeto", () => {
    it("rejeita criar projeto com cliente inexistente", async () => {
      await expect(
        service.createProject("org-1", "cliente-que-nao-existe", "Projeto X", "INTERIORES"),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejeita criar projeto com cliente de outra organização (isolamento multi-tenant)", async () => {
      await expect(
        service.createProject("org-1", clientOrg2Id, "Projeto X", "INTERIORES"),
      ).rejects.toThrow(NotFoundException);
    });

    it("vincula corretamente o clientId ao projeto criado", async () => {
      const { project } = await service.createProject(
        "org-1",
        clientOrg1Id,
        "Casa Boa Vista",
        "INTERIORES",
      );

      expect(project.clientId).toBe(clientOrg1Id);
    });
  });

  describe("Templates de Projeto (CR-001, item 2)", () => {
    it("cria projeto sem template normalmente (sem prazos automáticos)", async () => {
      const { stages } = await service.createProject("org-1", clientOrg1Id, "Sem Template", "INTERIORES");
      expect(stages.every((s) => s.dueDate === null)).toBe(true);
    });

    it("aplica prazos automáticos por etapa quando um template é informado", async () => {
      const { project, stages } = await service.createProject(
        "org-1",
        clientOrg1Id,
        "Com Template",
        "INTERIORES",
        "interiores-padrao",
      );

      const briefing = stages.find((s) => s.type === "BRIEFING")!;
      const entrega = stages.find((s) => s.type === "ENTREGA")!;

      expect(briefing.dueDate).not.toBeNull();
      expect(entrega.dueDate).not.toBeNull();

      const expectedBriefingDue = new Date(project.createdAt);
      expectedBriefingDue.setDate(expectedBriefingDue.getDate() + 3);
      expect(briefing.dueDate!.toDateString()).toBe(expectedBriefingDue.toDateString());
    });

    it("rejeita template inexistente", async () => {
      await expect(
        service.createProject("org-1", clientOrg1Id, "Projeto X", "INTERIORES", "template-que-nao-existe"),
      ).rejects.toThrow(BadRequestException);
    });

    it("prazos de etapas posteriores são sempre maiores ou iguais aos anteriores (template consistente)", async () => {
      const { stages } = await service.createProject(
        "org-1",
        clientOrg1Id,
        "Consistencia",
        "ARQUITETONICO",
        "arquitetonico-residencial",
      );

      const withDueDate = stages.filter((s) => s.dueDate !== null);
      for (let i = 1; i < withDueDate.length; i++) {
        expect(withDueDate[i].dueDate!.getTime()).toBeGreaterThanOrEqual(
          withDueDate[i - 1].dueDate!.getTime(),
        );
      }
    });

    it("template 'consultoria-rapida' não define prazo para etapas que não fazem parte do fluxo enxuto (ex: OBRA)", async () => {
      const { stages } = await service.createProject(
        "org-1",
        clientOrg1Id,
        "Consultoria X",
        "CONSULTORIA",
        "consultoria-rapida",
      );

      const obra = stages.find((s) => s.type === "OBRA")!;
      expect(obra.dueDate).toBeNull();
    });
  });

  describe("Portal do Cliente (CR-001, item 1)", () => {
    it("gera um token de acesso único para cada projeto criado", async () => {
      const { project: p1 } = await service.createProject("org-1", clientOrg1Id, "Projeto 1", "INTERIORES");
      const { project: p2 } = await service.createProject("org-1", clientOrg1Id, "Projeto 2", "INTERIORES");

      expect(p1.clientAccessToken).toBeDefined();
      expect(p1.clientAccessToken).not.toBe(p2.clientAccessToken);
    });

    it("retorna a visão pública do projeto a partir do token, sem exigir organização", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");

      const publicView = await service.getProjectForClient(project.clientAccessToken);

      expect(publicView.projectName).toBe("Casa Boa Vista");
      expect(publicView.stages).toHaveLength(8);
    });

    it("a visão pública NÃO expõe dados sensíveis (id interno, organizationId, motivo de pausa)", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      await service.pauseProject(project.id, "org-1", "Motivo confidencial do cliente concorrente");

      const publicView = await service.getProjectForClient(project.clientAccessToken);

      expect(publicView).not.toHaveProperty("organizationId");
      expect(publicView).not.toHaveProperty("id");
      expect(JSON.stringify(publicView)).not.toContain("Motivo confidencial");
    });

    it("rejeita token inválido/inexistente", async () => {
      await expect(service.getProjectForClient("token-que-nao-existe")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("integração com Notificações (Sprint 2)", () => {
    it("gera notificação RODADAS_ESGOTADAS quando a 3ª rodada é bloqueada", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Apto Itacorubi", "INTERIORES");

      await service.addRevisionRound(project.id, "user-socia", "ajuste 1");
      await service.addRevisionRound(project.id, "user-socia", "ajuste 2");

      try {
        await service.addRevisionRound(project.id, "user-socia", "ajuste 3");
      } catch {
        // esperado — já testado em outro bloco; aqui o foco é a notificação
      }

      const notifications = await notificationsService.listForUser("user-socia");
      const revisionNotification = notifications.find((n) => n.type === "RODADAS_ESGOTADAS");

      expect(revisionNotification).toBeDefined();
      expect(revisionNotification!.referenceId).toBe(project.id);
    });

    it("NÃO gera notificação quando a rodada é registrada dentro do limite (1ª ou 2ª)", async () => {
      const { project } = await service.createProject("org-1", clientOrg1Id, "Apto Itacorubi", "INTERIORES");

      await service.addRevisionRound(project.id, "user-socia", "ajuste 1");

      const notifications = await notificationsService.listForUser("user-socia");
      expect(notifications.filter((n) => n.type === "RODADAS_ESGOTADAS")).toHaveLength(0);
    });

    it("checkLateStagesAndNotify gera notificação ETAPA_ATRASADA para etapa vencida", async () => {
      const { project, stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await service.updateStageStatus(stages[0].id, "EM_ANDAMENTO", ontem);

      const result = await service.checkLateStagesAndNotify("org-1", "user-socia");

      expect(result.notified).toBe(1);
      const notifications = await notificationsService.listForUser("user-socia");
      expect(notifications.some((n) => n.type === "ETAPA_ATRASADA")).toBe(true);
    });

    it("checkLateStagesAndNotify NÃO duplica notificação ao rodar duas vezes para a mesma etapa", async () => {
      const { stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await service.updateStageStatus(stages[0].id, "EM_ANDAMENTO", ontem);

      await service.checkLateStagesAndNotify("org-1", "user-socia");
      const secondRun = await service.checkLateStagesAndNotify("org-1", "user-socia");

      expect(secondRun.notified).toBe(0); // já notificado na primeira vez
    });

    it("checkLateStagesAndNotify NÃO notifica etapa de projeto pausado", async () => {
      const { project, stages } = await service.createProject("org-1", clientOrg1Id, "Casa Boa Vista", "INTERIORES");
      const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await service.updateStageStatus(stages[0].id, "EM_ANDAMENTO", ontem);
      await service.pauseProject(project.id, "org-1", "Cliente pediu tempo");

      const result = await service.checkLateStagesAndNotify("org-1", "user-socia");

      expect(result.notified).toBe(0);
    });
  });
});
