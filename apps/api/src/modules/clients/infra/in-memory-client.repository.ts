import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ClientRecord, ClientRepository } from "../domain/client-repository.interface";

@Injectable()
export class InMemoryClientRepository implements ClientRepository {
  private clients: ClientRecord[] = [];

  async create(data: {
    organizationId: string;
    name: string;
    email: string | null;
    phone: string | null;
  }): Promise<ClientRecord> {
    const client: ClientRecord = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    };
    this.clients.push(client);
    return client;
  }

  async findById(id: string, organizationId: string): Promise<ClientRecord | null> {
    return this.clients.find((c) => c.id === id && c.organizationId === organizationId) ?? null;
  }

  async listByOrganization(organizationId: string): Promise<ClientRecord[]> {
    return this.clients.filter((c) => c.organizationId === organizationId);
  }
}
