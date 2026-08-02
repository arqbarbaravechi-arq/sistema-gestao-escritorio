import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  PAYMENT_REQUEST_REPOSITORY,
  PaymentRequestRepository,
} from "./domain/payment-request-repository.interface";

@Injectable()
export class BillingService {
  constructor(
    @Inject(PAYMENT_REQUEST_REPOSITORY) private readonly repo: PaymentRequestRepository,
  ) {}

  async createPaymentRequest(
    organizationId: string,
    projectId: string,
    description: string,
    value: number,
    dueDate: Date | null,
  ) {
    if (value <= 0) {
      throw new BadRequestException("O valor da cobrança precisa ser maior que zero");
    }
    return this.repo.create({ organizationId, projectId, description, value, dueDate });
  }

  async listForProject(projectId: string) {
    return this.repo.listByProject(projectId);
  }

  async markAsPaid(id: string) {
    const request = await this.repo.findById(id);
    if (!request) throw new NotFoundException("Cobrança não encontrada");
    if (request.status === "CANCELADO") {
      throw new BadRequestException("Não é possível marcar como paga uma cobrança cancelada");
    }
    return this.repo.updateStatus(id, "PAGO", new Date());
  }

  async cancel(id: string) {
    const request = await this.repo.findById(id);
    if (!request) throw new NotFoundException("Cobrança não encontrada");
    if (request.status === "PAGO") {
      throw new BadRequestException("Não é possível cancelar uma cobrança já paga");
    }
    return this.repo.updateStatus(id, "CANCELADO", null);
  }
}
