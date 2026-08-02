import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "../auth/security/jwt-auth.guard";

@Controller("clients")
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() dto: CreateClientDto, @Req() req: AuthenticatedRequest) {
    return this.clientsService.createClient(
      req.user!.organizationId,
      dto.name,
      dto.email ?? null,
      dto.phone ?? null,
      dto.cpf ?? null,
      dto.birthDate ? new Date(dto.birthDate) : null,
      dto.maritalStatus ?? null,
      dto.address ?? null,
      dto.projectAddress ?? null,
    );
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return this.clientsService.listClients(req.user!.organizationId);
  }

  @Get(":id")
  async getOne(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    return this.clientsService.getClient(id, req.user!.organizationId);
  }
}
