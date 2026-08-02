import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { SiteVisitRecord, SiteVisitRepository } from "../domain/site-visit-repository.interface";

@Injectable()
export class InMemorySiteVisitRepository implements SiteVisitRepository {
  private visits: SiteVisitRecord[] = [];

  async create(data: {
    organizationId: string;
    projectId: string;
    visitDate: Date;
    observation: string;
    communicateToClient: boolean;
    registeredBy: string;
  }): Promise<SiteVisitRecord> {
    const visit: SiteVisitRecord = { id: randomUUID(), ...data, createdAt: new Date() };
    this.visits.push(visit);
    return visit;
  }

  async listByProject(projectId: string): Promise<SiteVisitRecord[]> {
    // Ordena pela ordem real de inserção (mais recente primeiro), não
    // pelo valor da data — evita empate quando duas visitas são
    // registradas no mesmo milissegundo (Date só tem precisão de
    // milissegundo, e chamadas em sequência rápida podem colidir).
    return this.visits
      .filter((v) => v.projectId === projectId)
      .slice()
      .reverse();
  }
}
