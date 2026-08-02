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
});
