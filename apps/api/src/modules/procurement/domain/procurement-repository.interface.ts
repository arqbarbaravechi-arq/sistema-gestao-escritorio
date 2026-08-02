// Gestão de Compras (CR-001, item 3) — permite cadastrar fornecedores
// e registrar cotações de diferentes fornecedores para o mesmo projeto/
// categoria, comparando-as até aprovar uma (as demais da mesma
// categoria são automaticamente marcadas como recusadas ao aprovar).
//
// Mesmo padrão de todo o resto do sistema: lógica de negócio depende
// só desta interface, nunca de Prisma diretamente.

export type SupplierCategory = "MARCENARIA" | "MARMORARIA" | "OBRA_CIVIL" | "OUTRO";
export type QuoteStatus = "PENDENTE" | "APROVADA" | "RECUSADA";

export interface SupplierRecord {
  id: string;
  organizationId: string;
  name: string;
  category: SupplierCategory;
  contact: string | null;
  createdAt: Date;
}

export interface QuoteRecord {
  id: string;
  projectId: string;
  supplierId: string;
  category: SupplierCategory;
  value: number;
  description: string | null;
  status: QuoteStatus;
  createdAt: Date;
}

export interface ProcurementRepository {
  createSupplier(data: {
    organizationId: string;
    name: string;
    category: SupplierCategory;
    contact: string | null;
  }): Promise<SupplierRecord>;

  listSuppliers(organizationId: string): Promise<SupplierRecord[]>;
  findSupplierById(id: string, organizationId: string): Promise<SupplierRecord | null>;

  createQuote(data: {
    projectId: string;
    supplierId: string;
    category: SupplierCategory;
    value: number;
    description: string | null;
  }): Promise<QuoteRecord>;

  listQuotesByProject(projectId: string): Promise<QuoteRecord[]>;
  findQuoteById(id: string): Promise<QuoteRecord | null>;
  updateQuoteStatus(id: string, status: QuoteStatus): Promise<QuoteRecord>;
}

export const PROCUREMENT_REPOSITORY = Symbol("PROCUREMENT_REPOSITORY");
