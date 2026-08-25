import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { PAYMENT_REQUEST_REPOSITORY } from "./domain/payment-request-repository.interface";
import { InMemoryPaymentRequestRepository } from "./infra/in-memory-payment-request.repository";

describe("BillingService", () => {
  let service: BillingService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BillingService,
        InMemoryPaymentRequestRepository,
        { provide: PAYMENT_REQUEST_REPOSITORY, useExisting: InMemoryPaymentRequestRepository },
      ],
    }).compile();

    service = moduleRef.get(BillingService);
  });

  it("cria cobrança com status inicial PENDENTE", async () => {
    const request = await service.createPaymentRequest(
      "org-1",
      "project-1",
      "Parcela 1/4",
      9500,
      null,
    );

    expect(request.status).toBe("PENDENTE");
    expect(request.value).toBe(9500);
    expect(request.paidAt).toBeNull();
  });

  it("rejeita cobrança com valor zero ou negativo", async () => {
    await expect(
      service.createPaymentRequest("org-1", "project-1", "Parcela", 0, null),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.createPaymentRequest("org-1", "project-1", "Parcela", -100, null),
    ).rejects.toThrow(BadRequestException);
  });

  it("lista cobranças apenas do projeto correto", async () => {
    await service.createPaymentRequest("org-1", "project-1", "Parcela A", 1000, null);
    await service.createPaymentRequest("org-1", "project-2", "Parcela B", 2000, null);

    const list = await service.listForProject("project-1");
    expect(list).toHaveLength(1);
    expect(list[0].description).toBe("Parcela A");
  });

  it("marca cobrança como paga, registrando a data", async () => {
    const request = await service.createPaymentRequest("org-1", "project-1", "Parcela", 1000, null);

    const updated = await service.markAsPaid(request.id);

    expect(updated.status).toBe("PAGO");
    expect(updated.paidAt).not.toBeNull();
  });

  it("rejeita marcar como paga uma cobrança já cancelada", async () => {
    const request = await service.createPaymentRequest("org-1", "project-1", "Parcela", 1000, null);
    await service.cancel(request.id);

    await expect(service.markAsPaid(request.id)).rejects.toThrow(BadRequestException);
  });

  it("cancela uma cobrança pendente", async () => {
    const request = await service.createPaymentRequest("org-1", "project-1", "Parcela", 1000, null);
    const updated = await service.cancel(request.id);

    expect(updated.status).toBe("CANCELADO");
  });

  it("rejeita cancelar uma cobrança já paga", async () => {
    const request = await service.createPaymentRequest("org-1", "project-1", "Parcela", 1000, null);
    await service.markAsPaid(request.id);

    await expect(service.cancel(request.id)).rejects.toThrow(BadRequestException);
  });

  it("rejeita operar sobre cobrança inexistente", async () => {
    await expect(service.markAsPaid("id-que-nao-existe")).rejects.toThrow(NotFoundException);
    await expect(service.cancel("id-que-nao-existe")).rejects.toThrow(NotFoundException);
  });

  describe("Financeiro (resumo somente-leitura)", () => {
    it("soma corretamente pendente, pago no mês e em atraso", async () => {
      const r1 = await service.createPaymentRequest("org-1", "project-1", "Parcela 1", 5000, null);
      await service.createPaymentRequest("org-1", "project-1", "Parcela 2", 3000, null);

      await service.markAsPaid(r1.id);

      const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await service.createPaymentRequest("org-1", "project-1", "Parcela vencida", 1000, ontem);

      const summary = await service.getFinancialSummary("org-1");

      expect(summary.totalPaidThisMonth).toBe(5000);
      expect(summary.totalPending).toBe(3000 + 1000);
      expect(summary.totalOverdue).toBe(1000);
    });

    it("não mistura dados de organizações diferentes no resumo", async () => {
      await service.createPaymentRequest("org-1", "project-1", "Parcela org-1", 1000, null);
      await service.createPaymentRequest("org-2", "project-2", "Parcela org-2", 9000, null);

      const summary = await service.getFinancialSummary("org-1");

      expect(summary.totalPending).toBe(1000);
      expect(summary.requests).toHaveLength(1);
    });

    it("retorna resumo zerado quando não há nenhuma cobrança", async () => {
      const summary = await service.getFinancialSummary("org-sem-cobrancas");

      expect(summary.totalPending).toBe(0);
      expect(summary.totalPaidThisMonth).toBe(0);
      expect(summary.totalOverdue).toBe(0);
    });
  });
});
