import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";

// Módulo raiz. Próximo módulo de domínio a entrar: NotificationsModule
// (Sprint 2, conforme priorização do Tech Lead).
@Module({
  imports: [AuthModule, ProjectsModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
