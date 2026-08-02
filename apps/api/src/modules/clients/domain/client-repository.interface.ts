// Mesmo padrão de todo o resto do sistema: lógica de negócio depende
// só desta interface, nunca de Prisma diretamente.
//
// Nota de design: "projectAddress" (endereço da obra) fica no Cliente,
// conforme solicitado — na prática, se um mesmo cliente tiver mais de
// um projeto em endereços diferentes no futuro, pode fazer sentido
// mover esse campo para o Projeto. Mantido simples por enquanto.

export interface ClientRecord {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  birthDate: Date | null;
  maritalStatus: string | null;
  address: string | null; // endereço residencial/de correspondência
  projectAddress: string | null; // endereço da obra/imóvel do projeto
  createdAt: Date;
}

export interface ClientRepository {
  create(data: {
    organizationId: string;
    name: string;
    email: string | null;
    phone: string | null;
    cpf: string | null;
    birthDate: Date | null;
    maritalStatus: string | null;
    address: string | null;
    projectAddress: string | null;
  }): Promise<ClientRecord>;

  findById(id: string, organizationId: string): Promise<ClientRecord | null>;
  listByOrganization(organizationId: string): Promise<ClientRecord[]>;
}

export const CLIENT_REPOSITORY = Symbol("CLIENT_REPOSITORY");
