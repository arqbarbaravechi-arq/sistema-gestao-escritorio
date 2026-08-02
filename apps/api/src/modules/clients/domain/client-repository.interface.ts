// Mesmo padrão de todo o resto do sistema: lógica de negócio depende
// só desta interface, nunca de Prisma diretamente.

export interface ClientRecord {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
}

export interface ClientRepository {
  create(data: {
    organizationId: string;
    name: string;
    email: string | null;
    phone: string | null;
  }): Promise<ClientRecord>;

  findById(id: string, organizationId: string): Promise<ClientRecord | null>;
  listByOrganization(organizationId: string): Promise<ClientRecord[]>;
}

export const CLIENT_REPOSITORY = Symbol("CLIENT_REPOSITORY");
