import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CLIENT_REPOSITORY } from "./domain/client-repository.interface";
import { InMemoryClientRepository } from "./infra/in-memory-client.repository";

describe("ClientsService", () => {
  let service: ClientsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientsService,
        InMemoryClientRepository,
        { provide: CLIENT_REPOSITORY, useExisting: InMemoryClientRepository },
      ],
    }).compile();

    service = moduleRef.get(ClientsService);
  });

  it("cadastra cliente apenas com o nome (todos os outros campos opcionais)", async () => {
    const client = await service.createClient(
      "org-1",
      "João Silva",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );

    expect(client.name).toBe("João Silva");
    expect(client.cpf).toBeNull();
    expect(client.address).toBeNull();
  });

  it("cadastra cliente com todos os campos preenchidos", async () => {
    const birthDate = new Date("1985-03-20");
    const client = await service.createClient(
      "org-1",
      "Maria Oliveira",
      "maria@exemplo.com",
      "48999990000",
      "123.456.789-00",
      birthDate,
      "Casada",
      "Rua das Flores, 100 - Florianópolis/SC",
      "Rua da Obra, 200 - Florianópolis/SC",
    );

    expect(client.cpf).toBe("123.456.789-00");
    expect(client.birthDate).toEqual(birthDate);
    expect(client.maritalStatus).toBe("Casada");
    expect(client.address).toBe("Rua das Flores, 100 - Florianópolis/SC");
    expect(client.projectAddress).toBe("Rua da Obra, 200 - Florianópolis/SC");
  });

  it("lista apenas os clientes da organização correta", async () => {
    await service.createClient("org-1", "Cliente A", null, null, null, null, null, null, null);
    await service.createClient("org-2", "Cliente B", null, null, null, null, null, null, null);

    const listaOrg1 = await service.listClients("org-1");

    expect(listaOrg1).toHaveLength(1);
    expect(listaOrg1[0].name).toBe("Cliente A");
  });

  it("busca cliente por id dentro da organização correta", async () => {
    const created = await service.createClient(
      "org-1",
      "Cliente X",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );

    const found = await service.getClient(created.id, "org-1");
    expect(found.name).toBe("Cliente X");
  });

  it("rejeita buscar cliente com id de outra organização (isolamento multi-tenant)", async () => {
    const created = await service.createClient(
      "org-1",
      "Cliente Y",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    );

    await expect(service.getClient(created.id, "org-2")).rejects.toThrow(NotFoundException);
  });

  it("rejeita buscar cliente inexistente", async () => {
    await expect(service.getClient("id-que-nao-existe", "org-1")).rejects.toThrow(
      NotFoundException,
    );
  });
});
