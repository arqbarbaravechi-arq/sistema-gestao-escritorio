export type ProjectType = "INTERIORES" | "ARQUITETONICO" | "COMERCIAL" | "CONSULTORIA";
export type ProjectStatus = "ATIVO" | "PAUSADO" | "CANCELADO" | "CONCLUIDO";
export type StageStatus = "NAO_INICIADO" | "EM_ANDAMENTO" | "EM_REVISAO" | "APROVADO" | "ATRASADO";
export type StageMode = "PADRAO" | "CICLO_ABERTO";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  statusReason: string | null;
  clientAccessToken: string;
  createdAt: string;
}

export interface Stage {
  id: string;
  projectId: string;
  type: string;
  status: StageStatus;
  mode: StageMode;
  responsibleId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  late?: boolean;
  deliverables?: Deliverable[];
}

export interface Deliverable {
  id: string;
  stageId: string;
  name: string;
  status: StageStatus;
  responsibleId: string | null;
}

export interface ProjectDetail {
  project: Project;
  stages: Stage[];
  revisionRoundsUsed: number;
  revisionRoundsAvailable: number;
}

export const STAGE_LABELS: Record<string, string> = {
  BRIEFING: "Briefing",
  MEDICAO: "Medição",
  ASBUILT: "As-built",
  LAYOUT: "Layout",
  EXECUTIVO: "Executivo",
  ORCAMENTO: "Orçamento",
  OBRA: "Obra",
  ENTREGA: "Entrega",
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  INTERIORES: "Interiores",
  ARQUITETONICO: "Arquitetônico",
  COMERCIAL: "Comercial",
  CONSULTORIA: "Consultoria",
};
