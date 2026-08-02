// Interfaces de domínio do módulo Projetos — a lógica de negócio depende
// apenas destas interfaces, nunca de Prisma diretamente (mesmo padrão do
// módulo Auth). Permite testar as regras de negócio sem banco real.

export type ProjectType = "INTERIORES" | "ARQUITETONICO" | "COMERCIAL" | "CONSULTORIA";
export type ProjectStatus = "ATIVO" | "PAUSADO" | "CANCELADO" | "CONCLUIDO";
export type StageType =
  | "BRIEFING"
  | "MEDICAO"
  | "ASBUILT"
  | "LAYOUT"
  | "EXECUTIVO"
  | "ORCAMENTO"
  | "OBRA"
  | "ENTREGA";
export type StageStatus = "NAO_INICIADO" | "EM_ANDAMENTO" | "EM_REVISAO" | "APROVADO" | "ATRASADO";
export type StageMode = "PADRAO" | "CICLO_ABERTO";

// Ordem oficial das etapas de um projeto (PRD v2.0 — fluxo padrão).
// Usada tanto para criação automática quanto para exibir a barra de
// progresso na futura UI.
export const DEFAULT_STAGE_ORDER: StageType[] = [
  "BRIEFING",
  "MEDICAO",
  "ASBUILT",
  "LAYOUT",
  "EXECUTIVO",
  "ORCAMENTO",
  "OBRA",
  "ENTREGA",
];

export interface ProjectRecord {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  statusReason: string | null;
  clientAccessToken: string; // Portal do Cliente (CR-001, item 1) — link de acesso somente leitura
  createdAt: Date;
}

export interface ProjectStageRecord {
  id: string;
  projectId: string;
  type: StageType;
  status: StageStatus;
  mode: StageMode;
  responsibleId: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
}

export interface StageDeliverableRecord {
  id: string;
  stageId: string;
  name: string;
  status: StageStatus;
  responsibleId: string | null;
  dueDate: Date | null;
}

export interface RevisionRoundRecord {
  id: string;
  projectId: string;
  number: number;
  requestedBy: string | null;
  description: string | null;
  createdAt: Date;
}

export interface BudgetAmendmentRecord {
  id: string;
  projectId: string;
  reason: string;
  createdAt: Date;
}

export interface OpenCycleNoteRecord {
  id: string;
  stageId: string;
  description: string;
  createdAt: Date;
}

export interface ProjectRepository {
  createProject(data: {
    organizationId: string;
    clientId: string;
    name: string;
    type: ProjectType;
  }): Promise<ProjectRecord>;
  findProjectById(id: string, organizationId: string): Promise<ProjectRecord | null>;
  findProjectByClientToken(token: string): Promise<ProjectRecord | null>;
  listProjects(organizationId: string): Promise<ProjectRecord[]>;
  updateProjectStatus(
    id: string,
    status: ProjectStatus,
    statusReason: string | null,
  ): Promise<ProjectRecord>;

  createStagesForProject(projectId: string): Promise<ProjectStageRecord[]>;
  findStageById(id: string): Promise<ProjectStageRecord | null>;
  listStagesByProject(projectId: string): Promise<ProjectStageRecord[]>;
  updateStage(id: string, data: Partial<ProjectStageRecord>): Promise<ProjectStageRecord>;

  createDeliverable(data: {
    stageId: string;
    name: string;
    responsibleId: string | null;
    dueDate: Date | null;
  }): Promise<StageDeliverableRecord>;
  listDeliverablesByStage(stageId: string): Promise<StageDeliverableRecord[]>;
  updateDeliverable(
    id: string,
    data: Partial<StageDeliverableRecord>,
  ): Promise<StageDeliverableRecord>;

  countRevisionRounds(projectId: string): Promise<number>;
  createRevisionRound(data: {
    projectId: string;
    requestedBy: string | null;
    description: string | null;
  }): Promise<RevisionRoundRecord>;

  createBudgetAmendment(data: {
    projectId: string;
    reason: string;
  }): Promise<BudgetAmendmentRecord>;

  createOpenCycleNote(data: {
    stageId: string;
    description: string;
  }): Promise<OpenCycleNoteRecord>;
  listOpenCycleNotes(stageId: string): Promise<OpenCycleNoteRecord[]>;
}

export const PROJECT_REPOSITORY = Symbol("PROJECT_REPOSITORY");
