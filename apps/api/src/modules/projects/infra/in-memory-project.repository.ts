import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  BudgetAmendmentRecord,
  DEFAULT_STAGE_ORDER,
  OpenCycleNoteRecord,
  ProjectRecord,
  ProjectRepository,
  ProjectStageRecord,
  ProjectStatus,
  RevisionRoundRecord,
  StageDeliverableRecord,
} from "../domain/project-repository.interface";

// Implementação real (não mock) da interface ProjectRepository, usada
// enquanto o Postgres/Prisma não puderem ser validados neste ambiente —
// mesmo padrão já documentado no módulo Auth (ver
// auth/infra/prisma-user.repository.ts para o motivo detalhado).
@Injectable()
export class InMemoryProjectRepository implements ProjectRepository {
  private projects: ProjectRecord[] = [];
  private stages: ProjectStageRecord[] = [];
  private deliverables: StageDeliverableRecord[] = [];
  private revisionRounds: RevisionRoundRecord[] = [];
  private budgetAmendments: BudgetAmendmentRecord[] = [];
  private openCycleNotes: OpenCycleNoteRecord[] = [];

  async createProject(data: {
    organizationId: string;
    name: string;
    type: ProjectRecord["type"];
  }): Promise<ProjectRecord> {
    const project: ProjectRecord = {
      id: randomUUID(),
      organizationId: data.organizationId,
      name: data.name,
      type: data.type,
      status: "ATIVO",
      statusReason: null,
      clientAccessToken: randomUUID().replace(/-/g, ""), // token de link do Portal do Cliente
      createdAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  async findProjectById(id: string, organizationId: string): Promise<ProjectRecord | null> {
    return (
      this.projects.find((p) => p.id === id && p.organizationId === organizationId) ?? null
    );
  }

  async findProjectByClientToken(token: string): Promise<ProjectRecord | null> {
    return this.projects.find((p) => p.clientAccessToken === token) ?? null;
  }

  async listProjects(organizationId: string): Promise<ProjectRecord[]> {
    return this.projects.filter((p) => p.organizationId === organizationId);
  }

  async updateProjectStatus(
    id: string,
    status: ProjectStatus,
    statusReason: string | null,
  ): Promise<ProjectRecord> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) throw new Error("Projeto não encontrado");
    project.status = status;
    project.statusReason = statusReason;
    return project;
  }

  async createStagesForProject(projectId: string): Promise<ProjectStageRecord[]> {
    const newStages = DEFAULT_STAGE_ORDER.map((type) => ({
      id: randomUUID(),
      projectId,
      type,
      status: "NAO_INICIADO" as const,
      mode: "PADRAO" as const,
      responsibleId: null,
      dueDate: null,
      completedAt: null,
    }));
    this.stages.push(...newStages);
    return newStages;
  }

  async findStageById(id: string): Promise<ProjectStageRecord | null> {
    return this.stages.find((s) => s.id === id) ?? null;
  }

  async listStagesByProject(projectId: string): Promise<ProjectStageRecord[]> {
    return this.stages.filter((s) => s.projectId === projectId);
  }

  async updateStage(
    id: string,
    data: Partial<ProjectStageRecord>,
  ): Promise<ProjectStageRecord> {
    const stage = this.stages.find((s) => s.id === id);
    if (!stage) throw new Error("Etapa não encontrada");
    Object.assign(stage, data);
    return stage;
  }

  async createDeliverable(data: {
    stageId: string;
    name: string;
    responsibleId: string | null;
    dueDate: Date | null;
  }): Promise<StageDeliverableRecord> {
    const deliverable: StageDeliverableRecord = {
      id: randomUUID(),
      stageId: data.stageId,
      name: data.name,
      status: "NAO_INICIADO",
      responsibleId: data.responsibleId,
      dueDate: data.dueDate,
    };
    this.deliverables.push(deliverable);
    return deliverable;
  }

  async listDeliverablesByStage(stageId: string): Promise<StageDeliverableRecord[]> {
    return this.deliverables.filter((d) => d.stageId === stageId);
  }

  async updateDeliverable(
    id: string,
    data: Partial<StageDeliverableRecord>,
  ): Promise<StageDeliverableRecord> {
    const deliverable = this.deliverables.find((d) => d.id === id);
    if (!deliverable) throw new Error("Sub-entrega não encontrada");
    Object.assign(deliverable, data);
    return deliverable;
  }

  async countRevisionRounds(projectId: string): Promise<number> {
    return this.revisionRounds.filter((r) => r.projectId === projectId).length;
  }

  async createRevisionRound(data: {
    projectId: string;
    requestedBy: string | null;
    description: string | null;
  }): Promise<RevisionRoundRecord> {
    const count = await this.countRevisionRounds(data.projectId);
    const round: RevisionRoundRecord = {
      id: randomUUID(),
      projectId: data.projectId,
      number: count + 1,
      requestedBy: data.requestedBy,
      description: data.description,
      createdAt: new Date(),
    };
    this.revisionRounds.push(round);
    return round;
  }

  async createBudgetAmendment(data: {
    projectId: string;
    reason: string;
  }): Promise<BudgetAmendmentRecord> {
    const amendment: BudgetAmendmentRecord = {
      id: randomUUID(),
      projectId: data.projectId,
      reason: data.reason,
      createdAt: new Date(),
    };
    this.budgetAmendments.push(amendment);
    return amendment;
  }

  async createOpenCycleNote(data: {
    stageId: string;
    description: string;
  }): Promise<OpenCycleNoteRecord> {
    const note: OpenCycleNoteRecord = {
      id: randomUUID(),
      stageId: data.stageId,
      description: data.description,
      createdAt: new Date(),
    };
    this.openCycleNotes.push(note);
    return note;
  }

  async listOpenCycleNotes(stageId: string): Promise<OpenCycleNoteRecord[]> {
    return this.openCycleNotes.filter((n) => n.stageId === stageId);
  }
}
