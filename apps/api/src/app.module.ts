import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

// Módulo raiz. Fase 0 (Projetos + Notificações) completa nesta versão.
// Próximo módulo, conforme CR-001 (novidades inspiradas na Vobi):
// Portal do Cliente ou Templates de Projeto, a definir com a sócia.
@Module({
  imports: [AuthModule, ProjectsModule, NotificationsModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
