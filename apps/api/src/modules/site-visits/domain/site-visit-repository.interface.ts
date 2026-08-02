// Obra — Registro de Visita Técnica (PRD v2.0, prioridade ★★★★★).
//
// Decisão de escopo: sem provedor de armazenamento de arquivos
// configurado (S3/R2 — precisa de chaves de acesso que só a sócia
// pode fornecer, mesmo padrão já usado em GitHub/Railway/Vercel/
// pagamento), esta versão registra a visita em texto (observação +
// sinalização de "comunicar ao cliente"), sem upload real de foto.
// Isso ainda resolve a dor mais citada no Discovery original ("nunca
// registro a obra") — foto fica como próxima etapa quando o
// armazenamento estiver configurado.

export interface SiteVisitRecord {
  id: string;
  organizationId: string;
  projectId: string;
  visitDate: Date;
  observation: string;
  communicateToClient: boolean;
  registeredBy: string;
  createdAt: Date;
}

export interface SiteVisitRepository {
  create(data: {
    organizationId: string;
    projectId: string;
    visitDate: Date;
    observation: string;
    communicateToClient: boolean;
    registeredBy: string;
  }): Promise<SiteVisitRecord>;

  listByProject(projectId: string): Promise<SiteVisitRecord[]>;
}

export const SITE_VISIT_REPOSITORY = Symbol("SITE_VISIT_REPOSITORY");
