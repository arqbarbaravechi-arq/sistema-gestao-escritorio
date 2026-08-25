import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { TimeTrackingService } from "./time-tracking.service";
import { StartTimerDto } from "./dto/start-timer.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("timers")
@UseGuards(JwtAuthGuard)
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post("start")
  async start(@Body() dto: StartTimerDto, @Req() req: AuthenticatedRequest) {
    return this.timeTrackingService.startTimer(
      req.user!.organizationId,
      req.user!.sub,
      dto.projectId,
      dto.description ?? null,
    );
  }

  @Post("stop")
  async stop(@Req() req: AuthenticatedRequest) {
    return this.timeTrackingService.stopTimer(req.user!.sub);
  }

  @Get("running")
  async running(@Req() req: AuthenticatedRequest) {
    return this.timeTrackingService.getRunningTimer(req.user!.sub);
  }
}

@Controller("projects/:projectId/timers")
@UseGuards(JwtAuthGuard)
export class ProjectTimersController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Get()
  async list(@Param("projectId") projectId: string) {
    const entries = await this.timeTrackingService.listEntriesForProject(projectId);
    const totalSeconds = await this.timeTrackingService.getProjectTotalSeconds(projectId);
    return { entries, totalSeconds };
  }
}
