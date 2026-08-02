import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  LEAD_REPOSITORY,
  LeadOrigin,
  LeadRepository,
  LeadStatus,
} from "./domain/lead-repository.interface";
import { NotificationsService } from "../notifications/notifications.service";
import { ClientsService } from "../clients/clients.service";

const FOLLOW_UP_DAYS = 4; // confirmado no Discovery original — "deixo uns 4 dias e depois chamo"

@Injectable()
export class CrmService {
  constructor(
    @Inject(LEAD_REPOSITORY) private readonly repo: LeadRepository,
    private readonly notifications: NotificationsService,
    private readonly clients: ClientsService,
  ) {}

  async createLead(
    organizationId: string,
    name: string,
    contact: string | null,
    origin: LeadOrigin,
    projectType: string | null,
    budgetRange: string | null,
    desiredDeadline: string | null,
  ) {
    return this.repo.create({
      organizationId,
      name,
      contact,
      origin,
      projectType,
      budgetRange,
      desiredDeadline,
    });
  }

  async listLeads(organizationId: string) {
    return this.repo.listByOrganization(organizationId);
  }

  async getLead(id: string, organizationId: string) {
    const lead = await this.repo.findById(id, organizationId);
    if (!lead) throw new NotFoundException("Lead não encontrado");
    return lead;
  }

  // ── Mudança de status do funil ──
  // Ao entrar em REUNIAO_MARCADA ou AGUARDANDO_DECISAO, agenda
  // automaticamente o próximo follow-up para 4 dias à frente — reflete
  // exatamente o hábito relatado no Discovery ("deixo uns 4 dias e
  // depois chamo"), sem depender de a sócia lembrar manualmente.
  async updateStatus(id: string, organizationId: string, status: LeadStatus) {
    await this.getLead(id, organizationId); // valida existência + organização

    const data: { status: LeadStatus; nextFollowUpAt?: Date | null } = { status };

    if (status === "REUNIAO_MARCADA" || status === "AGUARDANDO_DECISAO") {
      const nextFollowUp = new Date();
      nextFollowUp.setDate(nextFollowUp.getDate() + FOLLOW_UP_DAYS);
      data.nextFollowUpAt = nextFollowUp;
    }

    if (status === "FECHADO" || status === "PERDIDO") {
      data.nextFollowUpAt = null; // não faz sentido cobrar follow-up de lead encerrado
    }

    return this.repo.update(id, data);
  }

  async markAsLost(id: string, organizationId: string, reason: string) {
    await this.getLead(id, organizationId);
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("É obrigatório informar o motivo da perda");
    }
    return this.repo.update(id, { status: "PERDIDO", lossReason: reason, nextFollowUpAt: null });
  }

  // Reabre um lead perdido, preservando o histórico de qualificação já
  // preenchido (nome, contato, tipo, orçamento) — não recria do zero.
  async reopenLead(id: string, organizationId: string) {
    const lead = await this.getLead(id, organizationId);
    if (lead.status !== "PERDIDO") {
      throw new BadRequestException("Só é possível reabrir um lead marcado como perdido");
    }
    return this.repo.update(id, { status: "QUALIFICADO", lossReason: null });
  }

  // ── Conversão em cliente (fecha o funil) ──
  // Cria um Cliente de verdade a partir dos dados já coletados no lead,
  // sem pedir para redigitar nada — e marca o lead como FECHADO.
  async convertToClient(id: string, organizationId: string) {
    const lead = await this.getLead(id, organizationId);

    if (lead.status === "FECHADO") {
      throw new BadRequestException("Este lead já foi convertido em cliente");
    }

    const client = await this.clients.createClient(
      organizationId,
      lead.name,
      null,
      lead.contact,
      null,
      null,
      null,
      null,
      null,
    );

    await this.repo.update(id, { status: "FECHADO", clientId: client.id, nextFollowUpAt: null });

    return client;
  }

  // ── Alerta de follow-up (integração com Notificações) ──
  // Mesmo padrão do checkLateStagesAndNotify do módulo Projetos: hoje
  // só sob demanda (este endpoint), não um agendador automático em
  // segundo plano — mesma limitação já documentada.
  async checkFollowUpsAndNotify(organizationId: string, notifyUserId: string) {
    const leads = await this.repo.listByOrganization(organizationId);
    const now = new Date();
    let notified = 0;

    for (const lead of leads) {
      if (!lead.nextFollowUpAt) continue;
      if (lead.status === "FECHADO" || lead.status === "PERDIDO") continue;
      if (lead.nextFollowUpAt.getTime() > now.getTime()) continue;

      const result = await this.notifications.notifyUserOnce(
        notifyUserId,
        "LEAD_SEM_FOLLOWUP",
        "lead",
        lead.id,
        `O lead "${lead.name}" está sem follow-up há mais de ${FOLLOW_UP_DAYS} dias.`,
      );
      if (result) notified++;
    }

    return { checked: leads.length, notified };
  }
}
