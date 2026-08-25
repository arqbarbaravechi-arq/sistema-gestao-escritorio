import { Inject, Injectable } from "@nestjs/common";
import { ProjectsService } from "../projects/projects.service";
import { USER_REPOSITORY, UserRepository } from "../auth/domain/user-repository.interface";

// Equipe — Painel de Carga de Trabalho (PRD v2.0).
//
// Limitação honesta: a atribuição de responsável por etapa é feita
// manualmente na tela do projeto, então este painel só mostra dado
// real depois que essa atribuição for usada no dia a dia.

@Injectable()
export class TeamService {
  constructor(
    private readonly projects: ProjectsService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async getWorkload(organizationId: string) {
    const users = await this.users.listByOrganization(organizationId);
    const allProjects = await this.projects.listProjects(organizationId);

    const workloadByUser = new Map<
      string,
      { userId: string; name: string; role: string; activeStages: number; lateStages: number }
    >();

    for (const user of users) {
      workloadByUser.set(user.id, {
        userId: user.id,
        name: user.name,
        role: user.role,
        activeStages: 0,
        lateStages: 0,
      });
    }

    for (const project of allProjects) {
      const { stages } = await this.projects.getProject(project.id, organizationId);
      for (const stage of stages) {
        if (!stage.responsibleId) continue;
        if (stage.status === "APROVADO") continue;

        const entry = workloadByUser.get(stage.responsibleId);
        if (!entry) continue;

        entry.activeStages++;
        if (stage.late) entry.lateStages++;
      }
    }

    return Array.from(workloadByUser.values());
  }
}
