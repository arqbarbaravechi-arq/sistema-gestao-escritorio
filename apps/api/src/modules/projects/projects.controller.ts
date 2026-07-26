import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateStageStatusDto } from "./dto/update-stage-status.dto";
import { ReasonDto } from "./dto/reason.dto";
import { AddRevisionRoundDto } from "./dto/add-revision-round.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("projects")
@UseGuards(JwtAuthGuard) // todas as rotas deste controller exigem login
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @Req() req: AuthenticatedRequest) {
    const organizationId = req.user!.organizationId;
    return this.projectsService.createProject(organizationId, dto.name, dto.type);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const organizationId = req.user!.organizationId;
    return this.projectsService.listProjects(organizationId);
  }

  @Get(":id")
  async getOne(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    const organizationId = req.user!.organizationId;
    return this.projectsService.getProject(id, organizationId);
  }

  @Patch(":projectId/stages/:stageId")
  async updateStage(
    @Param("stageId") stageId: string,
    @Body() dto: UpdateStageStatusDto,
  ) {
    return this.projectsService.updateStageStatus(
      stageId,
      dto.status,
      dto.dueDate ? new Date(dto.dueDate) : undefined,
    );
  }

  @Patch(":projectId/stages/:stageId/mode")
  async setStageMode(
    @Param("stageId") stageId: string,
    @Body("mode") mode: "PADRAO" | "CICLO_ABERTO",
  ) {
    return this.projectsService.setStageMode(stageId, mode);
  }

  @Post(":projectId/stages/:stageId/open-cycle-notes")
  async addOpenCycleNote(
    @Param("stageId") stageId: string,
    @Body("description") description: string,
  ) {
    return this.projectsService.addOpenCycleNote(stageId, description);
  }

  @Post(":projectId/stages/:stageId/deliverables")
  async addDeliverable(
    @Param("stageId") stageId: string,
    @Body("name") name: string,
    @Body("responsibleId") responsibleId: string | null,
  ) {
    return this.projectsService.addDeliverable(stageId, name, responsibleId ?? null, null);
  }

  @Post(":projectId/revision-rounds")
  async addRevisionRound(
    @Param("projectId") projectId: string,
    @Body() dto: AddRevisionRoundDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const requestedBy = req.user!.sub;
    return this.projectsService.addRevisionRound(projectId, requestedBy, dto.description ?? null);
  }

  @Post(":projectId/budget-amendments")
  async createBudgetAmendment(
    @Param("projectId") projectId: string,
    @Body() dto: ReasonDto,
  ) {
    return this.projectsService.createBudgetAmendment(projectId, dto.reason);
  }

  @Patch(":projectId/pause")
  async pause(
    @Param("projectId") projectId: string,
    @Body() dto: ReasonDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.pauseProject(projectId, req.user!.organizationId, dto.reason);
  }

  @Patch(":projectId/cancel")
  async cancel(
    @Param("projectId") projectId: string,
    @Body() dto: ReasonDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.projectsService.cancelProject(projectId, req.user!.organizationId, dto.reason);
  }

  @Patch(":projectId/reactivate")
  async reactivate(@Param("projectId") projectId: string, @Req() req: AuthenticatedRequest) {
    return this.projectsService.reactivateProject(projectId, req.user!.organizationId);
  }
}
