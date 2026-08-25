import { Test } from "@nestjs/testing";
import { TeamService } from "./team.service";
import { ProjectsService } from "../projects/projects.service";
import { PROJECT_REPOSITORY } from "../projects/domain/project-repository.interface";
import { InMemoryProjectRepository } from "../projects/infra/in-memory-project.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { NOTIFICATION_REPOSITORY } from "../notifications/domain/notification-repository.interface";
import { InMemoryNotificationRepository } from "../notifications/infra/in-memory-notification.repository";
import { ClientsService } from "../clients/clients.service";
import { CLIENT_REPOSITORY } from "../clients/domain/client-repository.interface";
import { InMemoryClientRepository } from "../clients/infra/in-memory-client.repository";
import { USER_REPOSITORY } from "../auth/domain/user-repository.interface";
import { InMemoryUserRepository } from "../auth/infra/in-memory-user.repository";
import { PasswordHasher } from "../auth/security/password-hasher";

describe("TeamService", () => {
  let service: TeamService;
  let projectsService: ProjectsService;
  let userRepository: InMemoryUserRepository;
  let clientId: string;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TeamService,
        ProjectsService,
        InMemoryProjectRepository,
        { provide: PROJECT_REPOSITORY, useExisting: InMemoryProjectRepository },
        NotificationsService,
        InMemoryNotificationRepository,
        { provide: NOTIFICATION_REPOSITORY, useExisting: InMemoryNotificationRepository },
        ClientsService,
        InMemoryClientRepository,
        { provide: CLIENT_REPOSITORY, useExisting: InMemoryClientRepository },
        InMemoryUserRepository,
        { provide: USER_REPOSITORY, useExisting: InMemoryUserRepository },
        PasswordHasher,
      ],
    }).compile();

    service = moduleRef.get(TeamService);
    projectsService = moduleRef.get(ProjectsService);
    userRepository = moduleRef.get(InMemoryUserRepository);

    const passwordHasher = moduleRef.get(PasswordHasher);
    const hash = await passwordHasher.hash("senha123");
    userRepository.seed([
      {
        id: "user-vitoria",
        organizationId: "org-1",
        email: "vitoria@escritorio.com",
        passwordHash: hash,
        role: "ARQUITETA_JR",
        name: "Vitória",
        active: true,
      },
      {
        id: "user-thaina",
        organizationId: "org-1",
        email: "thaina@escritorio.com",
        passwordHash: hash,
        role: "ESTAGIARIA",
        name: "Thainá",
        active: true,
      },
    ]);

    const clientsService = moduleRef.get(ClientsService);
    const client = await clientsService.createClient(
      "org-1",
      "Cliente Teste",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );
    clientId = client.id;
  });

  it("retorna todos os usuários da organização, mesmo com carga zero", async () => {
    const workload = await service.getWorkload("org-1");

    expect(workload).toHaveLength(2);
    expect(workload.every((w) => w.activeStages === 0)).toBe(true);
  });

  it("conta etapas ativas atribuídas a cada pessoa", async () => {
    const { stages } = await projectsService.createProject(
      "org-1",
      clientId,
      "Casa Boa Vista",
      "INTERIORES",
    );

    await projectsService.setStageResponsible(stages[0].id, "user-vitoria");
    await projectsService.setStageResponsible(stages[1].id, "user-vitoria");
    await projectsService.setStageResponsible(stages[2].id, "user-thaina");

    const workload = await service.getWorkload("org-1");

    const vitoria = workload.find((w) => w.userId === "user-vitoria")!;
    const thaina = workload.find((w) => w.userId === "user-thaina")!;

    expect(vitoria.activeStages).toBe(2);
    expect(thaina.activeStages).toBe(1);
  });

  it("NÃO conta etapa já aprovada como carga ativa", async () => {
    const { stages } = await projectsService.createProject(
      "org-1",
      clientId,
      "Casa Boa Vista",
      "INTERIORES",
    );

    await projectsService.setStageResponsible(stages[0].id, "user-vitoria");
    await projectsService.updateStageStatus(stages[0].id, "APROVADO");

    const workload = await service.getWorkload("org-1");
    const vitoria = workload.find((w) => w.userId === "user-vitoria")!;

    expect(vitoria.activeStages).toBe(0);
  });

  it("conta etapas atrasadas separadamente", async () => {
    const { stages } = await projectsService.createProject(
      "org-1",
      clientId,
      "Casa Boa Vista",
      "INTERIORES",
    );
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await projectsService.setStageResponsible(stages[0].id, "user-vitoria");
    await projectsService.updateStageStatus(stages[0].id, "EM_ANDAMENTO", ontem);

    const workload = await service.getWorkload("org-1");
    const vitoria = workload.find((w) => w.userId === "user-vitoria")!;

    expect(vitoria.activeStages).toBe(1);
    expect(vitoria.lateStages).toBe(1);
  });
});
