import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  PaymentRequestRecord,
  PaymentRequestRepository,
  PaymentRequestStatus,
} from "../domain/payment-request-repository.interface";

@Injectable()
export class InMemoryPaymentRequestRepository implements PaymentRequestRepository {
  private requests: PaymentRequestRecord[] = [];

  async create(data: {
    organizationId: string;
    projectId: string;
    description: string;
    value: number;
    dueDate: Date | null;
  }): Promise<PaymentRequestRecord> {
    const request: PaymentRequestRecord = {
      id: randomUUID(),
      ...data,
      status: "PENDENTE",
      paidAt: null,
      createdAt: new Date(),
    };
    this.requests.push(request);
    return request;
  }

  async findById(id: string): Promise<PaymentRequestRecord | null> {
    return this.requests.find((r) => r.id === id) ?? null;
  }

  async listByProject(projectId: string): Promise<PaymentRequestRecord[]> {
    return this.requests
      .filter((r) => r.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateStatus(
    id: string,
    status: PaymentRequestStatus,
    paidAt: Date | null,
  ): Promise<PaymentRequestRecord> {
    const request = this.requests.find((r) => r.id === id);
    if (!request) throw new NotFoundException("Cobrança não encontrada");
    request.status = status;
    request.paidAt = paidAt;
    return request;
  }
}
