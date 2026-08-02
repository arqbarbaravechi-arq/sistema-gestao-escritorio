// CRM de Vendas (CR-001, item 5) — funil de leads, conforme PRD v2.0
// Fase 1, agora construído com o "mais robusto" pedido: conversão
// direta para Cliente e alerta automático de follow-up.

export type LeadOrigin = "INSTAGRAM_ORGANICO" | "INSTAGRAM_PAGO" | "INDICACAO" | "OUTRO";
export type LeadStatus =
  | "NOVO"
  | "QUALIFICADO"
  | "REUNIAO_MARCADA"
  | "AGUARDANDO_DECISAO"
  | "FECHADO"
  | "PERDIDO";

export interface LeadRecord {
  id: string;
  organizationId: string;
  name: string;
  contact: string | null;
  origin: LeadOrigin;
  projectType: string | null;
  budgetRange: string | null;
  desiredDeadline: string | null;
  status: LeadStatus;
  lossReason: string | null;
  nextFollowUpAt: Date | null;
  clientId: string | null;
  createdAt: Date;
}

export interface LeadRepository {
  create(data: {
    organizationId: string;
    name: string;
    contact: string | null;
    origin: LeadOrigin;
    projectType: string | null;
    budgetRange: string | null;
    desiredDeadline: string | null;
  }): Promise<LeadRecord>;

  findById(id: string, organizationId: string): Promise<LeadRecord | null>;
  listByOrganization(organizationId: string): Promise<LeadRecord[]>;
  update(id: string, data: Partial<LeadRecord>): Promise<LeadRecord>;
}

export const LEAD_REPOSITORY = Symbol("LEAD_REPOSITORY");
