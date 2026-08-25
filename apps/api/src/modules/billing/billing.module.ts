import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { BillingController, FinancialSummaryController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { PAYMENT_REQUEST_REPOSITORY } from "./domain/payment-request-repository.interface";
import { InMemoryPaymentRequestRepository } from "./infra/in-memory-payment-request.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [BillingController, FinancialSummaryController],
  providers: [
    BillingService,
    InMemoryPaymentRequestRepository,
    { provide: PAYMENT_REQUEST_REPOSITORY, useExisting: InMemoryPaymentRequestRepository },
  ],
})
export class BillingModule {}
