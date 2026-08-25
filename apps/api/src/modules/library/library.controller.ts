import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { LibraryService } from "./library.service";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("document-templates")
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  list() {
    return this.libraryService.listTemplates();
  }

  @Get(":templateId/render")
  async render(
    @Param("templateId") templateId: string,
    @Query("projectId") projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.libraryService.renderTemplate(templateId, projectId, req.user!.organizationId);
  }
}
