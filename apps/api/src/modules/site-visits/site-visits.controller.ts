import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { SiteVisitsService } from "./site-visits.service";
import { CreateSiteVisitDto } from "./dto/create-site-visit.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("projects/:projectId/site-visits")
@UseGuards(JwtAuthGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Post()
  async create(
    @Param("projectId") projectId: string,
    @Body() dto: CreateSiteVisitDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.siteVisitsService.registerVisit(
      req.user!.organizationId,
      projectId,
      dto.observation,
      dto.communicateToClient ?? false,
      req.user!.sub,
      dto.visitDate ? new Date(dto.visitDate) : undefined,
    );
  }

  @Get()
  async list(@Param("projectId") projectId: string) {
    return this.siteVisitsService.listForProject(projectId);
  }
}
