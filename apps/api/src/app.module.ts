import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ProcurementModule } from "./modules/procurement/procurement.module";
import { CrmModule } from "./modules/crm/crm.module";

// Módulo raiz. Fase 0 completa. CR-001 em andamento: Portal do Cliente,
// Templates de Projeto, Clientes, Gestão de Compras, Curva ABC e CRM
// de Vendas prontos.
@Module({
  imports: [
    AuthModule,
    ClientsModule,
    ProjectsModule,
    NotificationsModule,
    ProcurementModule,
    CrmModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
