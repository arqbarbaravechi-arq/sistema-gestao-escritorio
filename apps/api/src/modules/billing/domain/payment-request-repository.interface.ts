// Pagamento Integrado (CR-001, item 7) — versão real hoje: controle de
// cobranças manuais, vinculadas ao projeto. Processamento de pagamento
// online de verdade (cartão, Pix automático) depende de conta em um
// provedor de pagamento (Mercado Pago, Stripe, etc.), que exige CNPJ,
// conta bancária e chaves de API que só a sócia pode fornecer — mesmo
// padrão já usado para GitHub/Railway/Vercel neste projeto.

export type PaymentRequestStatus = "PENDENTE" | "PAGO" | "CANCELADO";

export interface PaymentRequestRecord {
  id: string;
  organizationId: string;
  projectId: string;
  description: string;
  value: number;
  status: PaymentRequestStatus;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface PaymentRequestRepository {
  create(data: {
    organizationId: string;
    projectId: string;
    description: string;
    value: number;
    dueDate: Date | null;
  }): Promise<PaymentRequestRecord>;

  findById(id: string): Promise<PaymentRequestRecord | null>;
  listByProject(projectId: string): Promise<PaymentRequestRecord[]>;
  listByOrganization(organizationId: string): Promise<PaymentRequestRecord[]>;
  updateStatus(
    id: string,
    status: PaymentRequestStatus,
    paidAt: Date | null,
  ): Promise<PaymentRequestRecord>;
}

export const PAYMENT_REQUEST_REPOSITORY = Symbol("PAYMENT_REQUEST_REPOSITORY");

// Sinaliza claramente, em tempo de execução e no código, que o
// processamento real de pagamento online não está ativo — evita que
// alguém confunda "cobrança registrada" com "pagamento processado".
export const PAYMENT_PROVIDER_INTEGRATION_STATUS = "NOT_CONFIGURED" as const;
