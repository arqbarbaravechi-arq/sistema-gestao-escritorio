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

  // ── Financeiro (visão somente-leitura) ──
  async getFinancialSummary(organizationId: string) {
    const requests = await this.repo.listByOrganization(organizationId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPending = requests
      .filter((r) => r.status === "PENDENTE")
      .reduce((sum, r) => sum + r.value, 0);

    const totalPaidThisMonth = requests
      .filter((r) => r.status === "PAGO" && r.paidAt && r.paidAt >= startOfMonth)
      .reduce((sum, r) => sum + r.value, 0);

    const totalOverdue = requests
      .filter((r) => r.status === "PENDENTE" && r.dueDate && r.dueDate.getTime() < now.getTime())
      .reduce((sum, r) => sum + r.value, 0);

    return { totalPending, totalPaidThisMonth, totalOverdue, requests };
  }
}
