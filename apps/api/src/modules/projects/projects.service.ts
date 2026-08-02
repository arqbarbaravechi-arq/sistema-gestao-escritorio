import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  PROJECT_REPOSITORY,
  ProjectRepository,
  ProjectStageRecord,
  ProjectStatus,
  ProjectType,
  StageStatus,
} from "./domain/project-repository.interface";
import { NotificationsService } from "../notifications/notifications.service";
import { findTemplate } from "./domain/project-templates";

const MAX_REVISION_ROUNDS = 2; // CR-000 — 2 rodadas por projeto, confirmado pela sócia

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly repo: ProjectRepository,
    private readonly notifications: NotificationsService,
  ) {}

  // Templates de Projeto (CR-001, item 2) — templateId é opcional; sem
  // ele, o comportamento é idêntico ao de antes (etapas sem prazo).
  async createProject(
    organizationId: string,
    name: string,
    type: ProjectType,
    templateId?: string,
  ) {
    const project = await this.repo.createProject({ organizationId, name, type });
    let stages = await this.repo.createStagesForProject(project.id);

    if (templateId) {
      const template = findTemplate(templateId);
      if (!template) {
        throw new BadRequestException(`Template "${templateId}" não encontrado`);
      }

      stages = await Promise.all(
        stages.map(async (stage) => {
          const daysOffset = template.stageDurations[stage.type];
          if (daysOffset === undefined) return stage;

          const dueDate = new Date(project.createdAt);
          dueDate.setDate(dueDate.getDate() + daysOffset);

          return this.repo.updateStage(stage.id, { dueDate });
        }),
      );
    }

    return { project, stages };
  }

  async listProjects(organizationId: string) {
    return this.repo.listProjects(organizationId);
  }

  async getProject(id: string, organizationId: string) {
    const project = await this.repo.findProjectById(id, organizationId);
    if (!project) throw new NotFoundException("Projeto não encontrado");

    const stages = await this.repo.listStagesByProject(id);
    const stagesWithDeliverables = await Promise.all(
      stages.map(async (stage) => ({
        ...stage,
        late: this.isStageLate(stage, project.status),
        deliverables: await this.repo.listDeliverablesByStage(stage.id),
      })),
    );

    const revisionRoundsUsed = await this.repo.countRevisionRounds(id);

    return {
      project,
      stages: stagesWithDeliverables,
      revisionRoundsUsed,
      revisionRoundsAvailable: Math.max(0, MAX_REVISION_ROUNDS - revisionRoundsUsed),
    };
  }

  // ── Portal do Cliente (CR-001, item 1) ──
  // Visão pública, somente leitura, sem exigir login — acessível por
  // quem tiver o link (token). Deliberadamente NÃO inclui: valor de
  // contrato, motivo de pausa/cancelamento, responsáveis internos por
  // nome, ou qualquer rodada de revisão detalhada além da contagem.
  // Decisão de escopo desta entrega (ver relatório): sem infraestrutura
  // de e-mail configurada, o "portal" é um link compartilhável, não um
  // login de cliente com magic-link — isso fica para quando o e-mail
  // transacional estiver disponível.
  async getProjectForClient(token: string) {
    const project = await this.repo.findProjectByClientToken(token);
    if (!project) throw new NotFoundException("Link inválido ou projeto não encontrado");

    const stages = await this.repo.listStagesByProject(project.id);

    return {
      projectName: project.name,
      projectType: project.type,
      status: project.status,
      stages: stages.map((s) => ({
        type: s.type,
        status: s.status,
        mode: s.mode,
      })),
    };
  }

  // ── Regra de negócio: "atrasado" (PRD v2.0 §3.3) ──
  // Etapa atrasada = data prevista passou sem status "APROVADO", sem
  // tolerância de carência. Exceções (decisões explícitas desta
  // implementação, documentadas no relatório de entrega):
  //   - Projeto PAUSADO ou CANCELADO nunca gera atraso.
  //   - Etapa em modo CICLO_ABERTO (modo exceção) nunca gera atraso —
  //     forçar prazo rígido contradiz o próprio propósito do modo exceção.
  isStageLate(stage: ProjectStageRecord, projectStatus: ProjectStatus, now: Date = new Date()): boolean {
    if (projectStatus === "PAUSADO" || projectStatus === "CANCELADO") return false;
    if (stage.mode === "CICLO_ABERTO") return false;
    if (!stage.dueDate) return false;
    if (stage.status === "APROVADO") return false;
    return now.getTime() > stage.dueDate.getTime();
  }

  async updateStageStatus(stageId: string, status: StageStatus, dueDate?: Date | null) {
    const stage = await this.repo.findStageById(stageId);
    if (!stage) throw new NotFoundException("Etapa não encontrada");

    const data: Partial<ProjectStageRecord> = { status };
    if (dueDate !== undefined) data.dueDate = dueDate;
    if (status === "APROVADO") data.completedAt = new Date();

    return this.repo.updateStage(stageId, data);
  }

  async setStageResponsible(stageId: string, responsibleId: string) {
    const stage = await this.repo.findStageById(stageId);
    if (!stage) throw new NotFoundException("Etapa não encontrada");
    return this.repo.updateStage(stageId, { responsibleId });
  }

  // ── Sub-entregas (S1-7) ──
  async addDeliverable(
    stageId: string,
    name: string,
    responsibleId: string | null,
    dueDate: Date | null,
  ) {
    const stage = await this.repo.findStageById(stageId);
    if (!stage) throw new NotFoundException("Etapa não encontrada");
    return this.repo.createDeliverable({ stageId, name, responsibleId, dueDate });
  }

  async updateDeliverableStatus(deliverableId: string, status: StageStatus) {
    return this.repo.updateDeliverable(deliverableId, { status });
  }

  // ── Rodada de revisão — CR-000 (S1-8) ──
  // Regra confirmada pela sócia: 2 rodadas por PROJETO INTEIRO (não por
  // etapa/sub-entrega). Ao tentar uma 3ª, a API bloqueia e orienta a
  // criar um orçamento/aditivo (BudgetAmendment) em vez de permitir a
  // rodada — nunca trata como "rodada extra" implícita.
  async addRevisionRound(
    projectId: string,
    requestedBy: string | null,
    description: string | null,
  ) {
    const currentCount = await this.repo.countRevisionRounds(projectId);

    if (currentCount >= MAX_REVISION_ROUNDS) {
      // Notifica quem tentou a ação — simplificação documentada: o
      // roteamento correto ("avisar a sócia/gestora do projeto", não
      // necessariamente quem clicou) depende de um conceito de
      // responsável/gestor do projeto que ainda não existe no modelo.
      // Ver relatório de entrega da Sprint 2 para este ponto em aberto.
      if (requestedBy) {
        await this.notifications.notifyUser(
          requestedBy,
          "RODADAS_ESGOTADAS",
          "project",
          projectId,
          "As 2 rodadas de revisão incluídas no contrato já foram usadas neste projeto.",
        );
      }

      throw new BadRequestException({
        message:
          "As 2 rodadas de revisão incluídas no contrato já foram usadas. " +
          "Alterações adicionais exigem um novo orçamento (aditivo).",
        code: "REVISION_ROUNDS_EXHAUSTED",
        suggestedAction: "CREATE_BUDGET_AMENDMENT",
      });
    }

    return this.repo.createRevisionRound({ projectId, requestedBy, description });
  }

  // Verificação de etapas atrasadas — hoje só sob demanda (ver limitação
  // documentada no controller). Evita duplicar notificação para a mesma
  // etapa (notifyUserOnce).
  async checkLateStagesAndNotify(organizationId: string, notifyUserId: string) {
    const projects = await this.repo.listProjects(organizationId);
    let notified = 0;

    for (const project of projects) {
      const stages = await this.repo.listStagesByProject(project.id);
      for (const stage of stages) {
        if (this.isStageLate(stage, project.status)) {
          const result = await this.notifications.notifyUserOnce(
            notifyUserId,
            "ETAPA_ATRASADA",
            "project_stage",
            stage.id,
            `A etapa "${stage.type}" do projeto "${project.name}" está atrasada.`,
          );
          if (result) notified++;
        }
      }
    }

    return { checked: projects.length, notified };
  }

  async createBudgetAmendment(projectId: string, reason: string) {
    return this.repo.createBudgetAmendment({ projectId, reason });
  }

  // ── Modo exceção (S1-9) ──
  async setStageMode(stageId: string, mode: "PADRAO" | "CICLO_ABERTO") {
    const stage = await this.repo.findStageById(stageId);
    if (!stage) throw new NotFoundException("Etapa não encontrada");
    return this.repo.updateStage(stageId, { mode });
  }

  async addOpenCycleNote(stageId: string, description: string) {
    const stage = await this.repo.findStageById(stageId);
    if (!stage) throw new NotFoundException("Etapa não encontrada");
    if (stage.mode !== "CICLO_ABERTO") {
      throw new BadRequestException(
        "Esta etapa não está em modo exceção — não é possível registrar interação livre.",
      );
    }
    return this.repo.createOpenCycleNote({ stageId, description });
  }

  // ── Pausado/Cancelado (S1-10) ──
  async pauseProject(id: string, organizationId: string, reason: string) {
    const project = await this.repo.findProjectById(id, organizationId);
    if (!project) throw new NotFoundException("Projeto não encontrado");
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("É obrigatório informar o motivo da pausa");
    }
    return this.repo.updateProjectStatus(id, "PAUSADO", reason);
  }

  async cancelProject(id: string, organizationId: string, reason: string) {
    const project = await this.repo.findProjectById(id, organizationId);
    if (!project) throw new NotFoundException("Projeto não encontrado");
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("É obrigatório informar o motivo do cancelamento");
    }
    return this.repo.updateProjectStatus(id, "CANCELADO", reason);
  }

  async reactivateProject(id: string, organizationId: string) {
    const project = await this.repo.findProjectById(id, organizationId);
    if (!project) throw new NotFoundException("Projeto não encontrado");
    return this.repo.updateProjectStatus(id, "ATIVO", null);
  }
}
