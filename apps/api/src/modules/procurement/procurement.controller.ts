import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ProcurementService } from "./procurement.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { CreateQuoteDto } from "./dto/create-quote.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("suppliers")
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post()
  async create(@Body() dto: CreateSupplierDto, @Req() req: AuthenticatedRequest) {
    return this.procurementService.createSupplier(
      req.user!.organizationId,
      dto.name,
      dto.category,
      dto.contact ?? null,
    );
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return this.procurementService.listSuppliers(req.user!.organizationId);
  }
}

@Controller("projects/:projectId/quotes")
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post()
  async create(
    @Param("projectId") projectId: string,
    @Body() dto: CreateQuoteDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.procurementService.addQuote(
      req.user!.organizationId,
      projectId,
      dto.supplierId,
      dto.value,
      dto.description ?? null,
    );
  }

  @Get()
  async list(@Param("projectId") projectId: string) {
    return this.procurementService.listQuotesForProject(projectId);
  }

  @Patch(":quoteId/approve")
  async approve(@Param("quoteId") quoteId: string) {
    return this.procurementService.approveQuote(quoteId);
  }
}

@Controller("projects/:projectId/abc-curve")
@UseGuards(JwtAuthGuard)
export class AbcCurveController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get()
  async get(@Param("projectId") projectId: string) {
    return this.procurementService.getABCCurve(projectId);
  }
}
