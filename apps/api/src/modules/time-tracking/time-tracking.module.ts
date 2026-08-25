import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TimeTrackingController, ProjectTimersController } from "./time-tracking.controller";
import { TimeTrackingService } from "./time-tracking.service";
import { TIME_ENTRY_REPOSITORY } from "./domain/time-entry-repository.interface";
import { InMemoryTimeEntryRepository } from "./infra/in-memory-time-entry.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [TimeTrackingController, ProjectTimersController],
  providers: [
    TimeTrackingService,
    InMemoryTimeEntryRepository,
    { provide: TIME_ENTRY_REPOSITORY, useExisting: InMemoryTimeEntryRepository },
  ],
})
export class TimeTrackingModule {}
