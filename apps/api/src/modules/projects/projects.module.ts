import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ProjectsController, PublicProjectsController, TemplatesController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { PROJECT_REPOSITORY } from "./domain/project-repository.interface";
import { InMemoryProjectRepository } from "./infra/in-memory-project.repository";
import { NotificationsModule } from "../notifications/notifications.module";
import { ClientsModule } from "../clients/clients.module";

@Module({
  imports: [
    NotificationsModule,
    ClientsModule,
    // JwtModule precisa estar disponível aqui porque o JwtAuthGuard
    // (do módulo Auth) é usado diretamente neste controller.
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [ProjectsController, PublicProjectsController, TemplatesController],
  providers: [
    ProjectsService,
    InMemoryProjectRepository,
    // ⚠️ Mesmo padrão do AuthModule: hoje usando repositório em memória
    // porque o Postgres/Prisma não pôde ser validado neste ambiente.
    // Trocar para PrismaProjectRepository quando validado localmente.
    { provide: PROJECT_REPOSITORY, useExisting: InMemoryProjectRepository },
  ],
})
export class ProjectsModule {}
