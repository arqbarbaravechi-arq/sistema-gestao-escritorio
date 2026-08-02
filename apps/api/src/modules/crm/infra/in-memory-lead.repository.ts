import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { LeadRecord, LeadRepository, LeadOrigin } from "../domain/lead-repository.interface";

@Injectable()
export class InMemoryLeadRepository implements LeadRepository {
  private leads: LeadRecord[] = [];

  async create(data: {
    organizationId: string;
    name: string;
    contact: string | null;
    origin: LeadOrigin;
    projectType: string | null;
    budgetRange: string | null;
    desiredDeadline: string | null;
  }): Promise<LeadRecord> {
    const lead: LeadRecord = {
      id: randomUUID(),
      ...data,
      status: "NOVO",
      lossReason: null,
      nextFollowUpAt: null,
      clientId: null,
      createdAt: new Date(),
    };
    this.leads.push(lead);
    return lead;
  }

  async findById(id: string, organizationId: string): Promise<LeadRecord | null> {
    return this.leads.find((l) => l.id === id && l.organizationId === organizationId) ?? null;
  }

  async listByOrganization(organizationId: string): Promise<LeadRecord[]> {
    return this.leads.filter((l) => l.organizationId === organizationId);
  }

  async update(id: string, data: Partial<LeadRecord>): Promise<LeadRecord> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) throw new NotFoundException("Lead não encontrado");
    Object.assign(lead, data);
    return lead;
  }
}
