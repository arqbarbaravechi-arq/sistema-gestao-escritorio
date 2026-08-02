import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ProcurementModule } from "./modules/procurement/procurement.module";
import { CrmModule } from "./modules/crm/crm.module";
import { BillingModule } from "./modules/billing/billing.module";

// Módulo raiz. Fase 0 completa. CR-001 em andamento: Portal do Cliente,
// Templates, Clientes, Gestão de Compras, Curva ABC, CRM, App Mobile
// (PWA) e Cobranças (base de Pagamento Integrado) prontos.
@Module({
  imports: [
    AuthModule,
    ClientsModule,
    ProjectsModule,
    NotificationsModule,
    ProcurementModule,
    CrmModule,
    BillingModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
