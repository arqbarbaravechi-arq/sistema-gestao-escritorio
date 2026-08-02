import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  CLIENT_REPOSITORY,
  ClientRepository,
} from "./domain/client-repository.interface";

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly repo: ClientRepository,
  ) {}

  async createClient(
    organizationId: string,
    name: string,
    email: string | null,
    phone: string | null,
    cpf: string | null,
    birthDate: Date | null,
    maritalStatus: string | null,
    address: string | null,
    projectAddress: string | null,
  ) {
    return this.repo.create({
      organizationId,
      name,
      email,
      phone,
      cpf,
      birthDate,
      maritalStatus,
      address,
      projectAddress,
    });
  }

  async listClients(organizationId: string) {
    return this.repo.listByOrganization(organizationId);
  }

  async getClient(id: string, organizationId: string) {
    const client = await this.repo.findById(id, organizationId);
    if (!client) throw new NotFoundException("Cliente não encontrado");
    return client;
  }

  // Usado pelo módulo Projetos para validar, antes de criar um projeto,
  // que o cliente informado existe e pertence à mesma organização —
  // sem expor a interface interna do repositório para fora deste módulo.
  async assertClientBelongsToOrganization(id: string, organizationId: string) {
    await this.getClient(id, organizationId);
  }
}
