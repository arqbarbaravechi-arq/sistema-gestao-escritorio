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

  // ── Curva ABC de Custos (CR-001, item 4) ──
  // Classifica as cotações APROVADAS de um projeto pela técnica de
  // Pareto: itens ordenados do maior para o menor valor, acumulando
  // percentual do custo total.
  //   Classe A: itens que, somados, representam até 80% do custo total
  //             (poucos itens, maior impacto financeiro — atenção redobrada)
  //   Classe B: de 80% até 95% do custo acumulado
  //   Classe C: os 5% finais (muitos itens, baixo impacto individual)
  // Baseado apenas em cotações já APROVADAS — orçamento ainda em
  // comparação (PENDENTE) não entra na análise de custo real.
  async getABCCurve(projectId: string) {
    const allQuotes = await this.repo.listQuotesByProject(projectId);
    const approved = allQuotes
      .filter((q) => q.status === "APROVADA")
      .sort((a, b) => b.value - a.value); // maior valor primeiro

    const totalValue = approved.reduce((sum, q) => sum + q.value, 0);

    let cumulativeValue = 0;
    const items = approved.map((quote) => {
      cumulativeValue += quote.value;
      const cumulativePercentage = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0;
      const percentage = totalValue > 0 ? (quote.value / totalValue) * 100 : 0;

      let classification: "A" | "B" | "C";
      if (cumulativePercentage <= 80) classification = "A";
      else if (cumulativePercentage <= 95) classification = "B";
      else classification = "C";

      return {
        quoteId: quote.id,
        supplierId: quote.supplierId,
        category: quote.category,
        value: quote.value,
        percentage: Math.round(percentage * 100) / 100,
        cumulativePercentage: Math.round(cumulativePercentage * 100) / 100,
        classification,
      };
    });

    return {
      totalValue,
      items,
      summary: {
        countA: items.filter((i) => i.classification === "A").length,
        countB: items.filter((i) => i.classification === "B").length,
        countC: items.filter((i) => i.classification === "C").length,
      },
    };
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
