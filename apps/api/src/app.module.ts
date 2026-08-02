import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { ProcurementModule } from "./modules/procurement/procurement.module";
import { CrmModule } from "./modules/crm/crm.module";
import { BillingModule } from "./modules/billing/billing.module";
import { SiteVisitsModule } from "./modules/site-visits/site-visits.module";

// Módulo raiz. Fase 0 completa. CR-001: 7 de 8 itens prontos (Agentes
// de IA em standby). Obra (visitas técnicas) iniciando Fase 2.
@Module({
  imports: [
    AuthModule,
    ClientsModule,
    ProjectsModule,
    NotificationsModule,
    ProcurementModule,
    CrmModule,
    BillingModule,
    SiteVisitsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
