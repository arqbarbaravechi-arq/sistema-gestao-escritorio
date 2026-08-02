import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { LEAD_REPOSITORY } from "./domain/lead-repository.interface";
import { InMemoryLeadRepository } from "./infra/in-memory-lead.repository";
import { NotificationsModule } from "../notifications/notifications.module";
import { ClientsModule } from "../clients/clients.module";

@Module({
  imports: [
    NotificationsModule,
    ClientsModule,
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [CrmController],
  providers: [
    CrmService,
    InMemoryLeadRepository,
    { provide: LEAD_REPOSITORY, useExisting: InMemoryLeadRepository },
  ],
})
export class CrmModule {}
