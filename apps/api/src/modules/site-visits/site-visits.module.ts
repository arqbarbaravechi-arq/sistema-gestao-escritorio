import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { SiteVisitsController } from "./site-visits.controller";
import { SiteVisitsService } from "./site-visits.service";
import { SITE_VISIT_REPOSITORY } from "./domain/site-visit-repository.interface";
import { InMemorySiteVisitRepository } from "./infra/in-memory-site-visit.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [SiteVisitsController],
  providers: [
    SiteVisitsService,
    InMemorySiteVisitRepository,
    { provide: SITE_VISIT_REPOSITORY, useExisting: InMemorySiteVisitRepository },
  ],
})
export class SiteVisitsModule {}
