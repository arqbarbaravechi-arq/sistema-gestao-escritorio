import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  PROCUREMENT_REPOSITORY,
  ProcurementRepository,
  SupplierCategory,
} from "./domain/procurement-repository.interface";

@Injectable()
export class ProcurementService {
  constructor(
    @Inject(PROCUREMENT_REPOSITORY) private readonly repo: ProcurementRepository,
  ) {}

  async createSupplier(
    organizationId: string,
    name: string,
    category: SupplierCategory,
    contact: string | null,
  ) {
    return this.repo.createSupplier({ organizationId, name, category, contact });
  }

  async listSuppliers(organizationId: string) {
    return this.repo.listSuppliers(organizationId);
  }

  async addQuote(
    organizationId: string,
    projectId: string,
    supplierId: string,
    value: number,
    description: string | null,
  ) {
    const supplier = await this.repo.findSupplierById(supplierId, organizationId);
    if (!supplier) throw new NotFoundException("Fornecedor não encontrado");

    if (value <= 0) {
      throw new BadRequestException("O valor da cotação precisa ser maior que zero");
    }

    return this.repo.createQuote({
      projectId,
      supplierId,
      category: supplier.category,
      value,
      description,
    });
  }

  async listQuotesForProject(projectId: string) {
    const quotes = await this.repo.listQuotesByProject(projectId);
    return quotes.sort((a, b) => a.value - b.value); // menor valor primeiro, facilita comparar
  }

  // ── Comparação de cotações (o coração da Gestão de Compras) ──
  // Ao aprovar uma cotação, todas as outras PENDENTES da mesma
  // categoria, no mesmo projeto, são automaticamente marcadas como
  // recusadas — reflete a decisão real de "escolhi este fornecedor
  // entre os que cotei".
  async approveQuote(quoteId: string) {
    const quote = await this.repo.findQuoteById(quoteId);
    if (!quote) throw new NotFoundException("Cotação não encontrada");

    const approved = await this.repo.updateQuoteStatus(quoteId, "APROVADA");

    const siblingQuotes = await this.repo.listQuotesByProject(quote.projectId);
    const toReject = siblingQuotes.filter(
      (q) => q.id !== quoteId && q.category === quote.category && q.status === "PENDENTE",
    );

    for (const sibling of toReject) {
      await this.repo.updateQuoteStatus(sibling.id, "RECUSADA");
    }

    return { approved, rejectedCount: toReject.length };
  }
}
