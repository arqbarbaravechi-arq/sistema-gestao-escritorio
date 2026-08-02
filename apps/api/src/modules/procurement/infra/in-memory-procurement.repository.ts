import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  ProcurementRepository,
  QuoteRecord,
  QuoteStatus,
  SupplierRecord,
} from "../domain/procurement-repository.interface";

@Injectable()
export class InMemoryProcurementRepository implements ProcurementRepository {
  private suppliers: SupplierRecord[] = [];
  private quotes: QuoteRecord[] = [];

  async createSupplier(data: {
    organizationId: string;
    name: string;
    category: SupplierRecord["category"];
    contact: string | null;
  }): Promise<SupplierRecord> {
    const supplier: SupplierRecord = { id: randomUUID(), ...data, createdAt: new Date() };
    this.suppliers.push(supplier);
    return supplier;
  }

  async listSuppliers(organizationId: string): Promise<SupplierRecord[]> {
    return this.suppliers.filter((s) => s.organizationId === organizationId);
  }

  async findSupplierById(id: string, organizationId: string): Promise<SupplierRecord | null> {
    return (
      this.suppliers.find((s) => s.id === id && s.organizationId === organizationId) ?? null
    );
  }

  async createQuote(data: {
    projectId: string;
    supplierId: string;
    category: SupplierRecord["category"];
    value: number;
    description: string | null;
  }): Promise<QuoteRecord> {
    const quote: QuoteRecord = {
      id: randomUUID(),
      ...data,
      status: "PENDENTE",
      createdAt: new Date(),
    };
    this.quotes.push(quote);
    return quote;
  }

  async listQuotesByProject(projectId: string): Promise<QuoteRecord[]> {
    return this.quotes.filter((q) => q.projectId === projectId);
  }

  async findQuoteById(id: string): Promise<QuoteRecord | null> {
    return this.quotes.find((q) => q.id === id) ?? null;
  }

  async updateQuoteStatus(id: string, status: QuoteStatus): Promise<QuoteRecord> {
    const quote = this.quotes.find((q) => q.id === id);
    if (!quote) throw new Error("Cotação não encontrada");
    quote.status = status;
    return quote;
  }
}
