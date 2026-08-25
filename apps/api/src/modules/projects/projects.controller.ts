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
import { PROJECT_TEMPLATES } from "./domain/project-templates";

// Controller PÚBLICO — sem @UseGuards(JwtAuthGuard). Portal do Cliente
// (CR-001, item 1): acessível por quem tiver o link/token, sem login.
@Controller("public/projects")
export class PublicProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(":token")
  async getByClientToken(@Param("token") token: string) {
    return this.projectsService.getProjectForClient(token);
  }
}

@Controller("templates")
export class TemplatesController {
  @Get()
  list() {
    return PROJECT_TEMPLATES;
  }
}

@Controller("projects")
@UseGuards(JwtAuthGuard) // todas as rotas deste controller exigem login
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @Req() req: AuthenticatedRequest) {
    const organizationId = req.user!.organizationId;
    return this.projectsService.createProject(
      organizationId,
      dto.clientId,
      dto.name,
      dto.type,
      dto.templateId,
    );
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

  // Atribuição de responsável — alimenta o painel de carga de trabalho
  // (módulo Equipe).
  @Patch(":projectId/stages/:stageId/responsible")
  async setStageResponsible(
    @Param("stageId") stageId: string,
    @Body("responsibleId") responsibleId: string,
  ) {
    return this.projectsService.setStageResponsible(stageId, responsibleId);
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

  // Verificação de etapas atrasadas. Disponível hoje apenas sob demanda
  // (chamada manual via este endpoint) — um agendador automático em
  // segundo plano (ex: a cada X minutos, sem ninguém precisar clicar)
  // depende de um serviço de "listar usuários por organização" que
  // ainda não existe entre os módulos Auth e Projects. Ver relatório
  // de entrega da Sprint 2 para este ponto em aberto.
  @Post("check-late-stages")
  async checkLateStages(@Req() req: AuthenticatedRequest) {
    return this.projectsService.checkLateStagesAndNotify(
      req.user!.organizationId,
      req.user!.sub,
    );
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
