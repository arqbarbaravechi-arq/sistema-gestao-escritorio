import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { CreatePaymentRequestDto } from "./dto/create-payment-request.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("projects/:projectId/payment-requests")
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  async create(
    @Param("projectId") projectId: string,
    @Body() dto: CreatePaymentRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.billingService.createPaymentRequest(
      req.user!.organizationId,
      projectId,
      dto.description,
      dto.value,
      dto.dueDate ? new Date(dto.dueDate) : null,
    );
  }

  @Get()
  async list(@Param("projectId") projectId: string) {
    return this.billingService.listForProject(projectId);
  }

  @Patch(":requestId/mark-paid")
  async markAsPaid(@Param("requestId") requestId: string) {
    return this.billingService.markAsPaid(requestId);
  }

  @Patch(":requestId/cancel")
  async cancel(@Param("requestId") requestId: string) {
    return this.billingService.cancel(requestId);
  }
}
