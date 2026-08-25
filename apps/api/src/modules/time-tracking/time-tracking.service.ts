import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  TIME_ENTRY_REPOSITORY,
  TimeEntryRepository,
} from "./domain/time-entry-repository.interface";

@Injectable()
export class TimeTrackingService {
  constructor(
    @Inject(TIME_ENTRY_REPOSITORY) private readonly repo: TimeEntryRepository,
  ) {}

  async startTimer(
    organizationId: string,
    userId: string,
    projectId: string,
    description: string | null,
  ) {
    const running = await this.repo.findRunningByUser(userId);
    if (running) {
      throw new BadRequestException({
        message: "Já existe um cronômetro em andamento. Pare-o antes de iniciar outro.",
        code: "TIMER_ALREADY_RUNNING",
        runningEntryId: running.id,
      });
    }

    return this.repo.create({
      organizationId,
      userId,
      projectId,
      description,
      startedAt: new Date(),
    });
  }

  async stopTimer(userId: string) {
    const running = await this.repo.findRunningByUser(userId);
    if (!running) {
      throw new NotFoundException("Não há nenhum cronômetro em andamento para parar");
    }
    return this.repo.stop(running.id, new Date());
  }

  async getRunningTimer(userId: string) {
    return this.repo.findRunningByUser(userId);
  }

  async listEntriesForProject(projectId: string) {
    return this.repo.listByProject(projectId);
  }

  async getProjectTotalSeconds(projectId: string) {
    const entries = await this.repo.listByProject(projectId);
    return entries
      .filter((e) => e.endedAt !== null)
      .reduce((sum, e) => sum + (e.endedAt!.getTime() - e.startedAt.getTime()) / 1000, 0);
  }
}
