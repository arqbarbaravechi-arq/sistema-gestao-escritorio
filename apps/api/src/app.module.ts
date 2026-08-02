import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ClientsModule } from "./modules/clients/clients.module";

// Módulo raiz. Fase 0 (Projetos + Notificações) completa. CR-001 em
// andamento: Portal do Cliente e Templates de Projeto prontos; Clientes
// entrou como pré-requisito estrutural de Projetos.
@Module({
  imports: [AuthModule, ClientsModule, ProjectsModule, NotificationsModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
