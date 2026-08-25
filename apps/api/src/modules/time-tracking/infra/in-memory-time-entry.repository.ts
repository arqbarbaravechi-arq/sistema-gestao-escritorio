import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { TimeEntryRecord, TimeEntryRepository } from "../domain/time-entry-repository.interface";

@Injectable()
export class InMemoryTimeEntryRepository implements TimeEntryRepository {
  private entries: TimeEntryRecord[] = [];

  async create(data: {
    organizationId: string;
    userId: string;
    projectId: string;
    description: string | null;
    startedAt: Date;
  }): Promise<TimeEntryRecord> {
    const entry: TimeEntryRecord = {
      id: randomUUID(),
      ...data,
      endedAt: null,
      createdAt: new Date(),
    };
    this.entries.push(entry);
    return entry;
  }

  async findRunningByUser(userId: string): Promise<TimeEntryRecord | null> {
    return this.entries.find((e) => e.userId === userId && e.endedAt === null) ?? null;
  }

  async findById(id: string): Promise<TimeEntryRecord | null> {
    return this.entries.find((e) => e.id === id) ?? null;
  }

  async listByProject(projectId: string): Promise<TimeEntryRecord[]> {
    return this.entries
      .filter((e) => e.projectId === projectId)
      .slice()
      .reverse();
  }

  async stop(id: string, endedAt: Date): Promise<TimeEntryRecord> {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) throw new NotFoundException("Registro de tempo não encontrado");
    entry.endedAt = endedAt;
    return entry;
  }
}
