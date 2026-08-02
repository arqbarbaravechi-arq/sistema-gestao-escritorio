import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  SITE_VISIT_REPOSITORY,
  SiteVisitRepository,
} from "./domain/site-visit-repository.interface";

@Injectable()
export class SiteVisitsService {
  constructor(
    @Inject(SITE_VISIT_REPOSITORY) private readonly repo: SiteVisitRepository,
  ) {}

  async registerVisit(
    organizationId: string,
    projectId: string,
    observation: string,
    communicateToClient: boolean,
    registeredBy: string,
    visitDate?: Date,
  ) {
    if (!observation || observation.trim().length === 0) {
      throw new BadRequestException("É obrigatório registrar uma observação da visita");
    }

    return this.repo.create({
      organizationId,
      projectId,
      visitDate: visitDate ?? new Date(),
      observation,
      communicateToClient,
      registeredBy,
    });
  }

  async listForProject(projectId: string) {
    return this.repo.listByProject(projectId);
  }
}
