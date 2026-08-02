import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { SuppliersController, QuotesController } from "./procurement.controller";
import { ProcurementService } from "./procurement.service";
import { PROCUREMENT_REPOSITORY } from "./domain/procurement-repository.interface";
import { InMemoryProcurementRepository } from "./infra/in-memory-procurement.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [SuppliersController, QuotesController],
  providers: [
    ProcurementService,
    InMemoryProcurementRepository,
    { provide: PROCUREMENT_REPOSITORY, useExisting: InMemoryProcurementRepository },
  ],
  exports: [ProcurementService],
})
export class ProcurementModule {}
