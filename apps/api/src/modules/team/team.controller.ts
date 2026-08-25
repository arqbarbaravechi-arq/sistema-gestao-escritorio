import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { TeamService } from "./team.service";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("team/workload")
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  async get(@Req() req: AuthenticatedRequest) {
    return this.teamService.getWorkload(req.user!.organizationId);
  }
}
