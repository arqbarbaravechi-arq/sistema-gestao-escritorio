import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";
import { ReasonDto } from "../projects/dto/reason.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("leads")
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post()
  async create(@Body() dto: CreateLeadDto, @Req() req: AuthenticatedRequest) {
    return this.crmService.createLead(
      req.user!.organizationId,
      dto.name,
      dto.contact ?? null,
      dto.origin,
      dto.projectType ?? null,
      dto.budgetRange ?? null,
      dto.desiredDeadline ?? null,
    );
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return this.crmService.listLeads(req.user!.organizationId);
  }

  @Get(":id")
  async getOne(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.crmService.getLead(id, req.user!.organizationId);
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateLeadStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.crmService.updateStatus(id, req.user!.organizationId, dto.status);
  }

  @Patch(":id/lost")
  async markAsLost(
    @Param("id") id: string,
    @Body() dto: ReasonDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.crmService.markAsLost(id, req.user!.organizationId, dto.reason);
  }

  @Patch(":id/reopen")
  async reopen(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.crmService.reopenLead(id, req.user!.organizationId);
  }

  @Post(":id/convert-to-client")
  async convert(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.crmService.convertToClient(id, req.user!.organizationId);
  }

  @Post("check-follow-ups")
  async checkFollowUps(@Req() req: AuthenticatedRequest) {
    return this.crmService.checkFollowUpsAndNotify(req.user!.organizationId, req.user!.sub);
  }
}
