import { BadRequestException, Injectable } from "@nestjs/common";
import { DOCUMENT_TEMPLATES, findDocumentTemplate } from "./domain/document-templates";
import { ProjectsService } from "../projects/projects.service";
import { ClientsService } from "../clients/clients.service";

const TYPE_LABELS: Record<string, string> = {
  INTERIORES: "Interiores",
  ARQUITETONICO: "Arquitetônico",
  COMERCIAL: "Comercial",
  CONSULTORIA: "Consultoria",
};

@Injectable()
export class LibraryService {
  constructor(
    private readonly projects: ProjectsService,
    private readonly clients: ClientsService,
  ) {}

  listTemplates() {
    return DOCUMENT_TEMPLATES;
  }

  async renderTemplate(templateId: string, projectId: string, organizationId: string) {
    const template = findDocumentTemplate(templateId);
    if (!template) {
      throw new BadRequestException(`Modelo "${templateId}" não encontrado`);
    }

    const { project } = await this.projects.getProject(projectId, organizationId);
    const client = await this.clients.getClient(project.clientId, organizationId);

    const rendered = template.content
      .replaceAll("{{projeto}}", project.name)
      .replaceAll("{{cliente}}", client.name)
      .replaceAll("{{tipo}}", TYPE_LABELS[project.type] ?? project.type)
      .replaceAll("{{data}}", new Date().toLocaleDateString("pt-BR"));

    return { templateName: template.name, content: rendered };
  }
}
