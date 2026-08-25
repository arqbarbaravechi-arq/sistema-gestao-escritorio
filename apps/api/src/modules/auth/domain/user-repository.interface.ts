// Interface de domínio — a lógica de autenticação depende APENAS disto,
// nunca de Prisma ou de qualquer detalhe de persistência diretamente.
// Isso permite testar o AuthService de verdade sem banco de dados real,
// e trocar a implementação (memória → Prisma) sem tocar na regra de negócio.

export interface UserRecord {
  id: string;
  organizationId: string;
  email: string;
  passwordHash: string;
  role: "SOCIA" | "ARQUITETA_JR" | "ESTAGIARIA" | "ORCAMENTARIA" | "FINANCEIRO";
  name: string;
  active: boolean;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  listByOrganization(organizationId: string): Promise<UserRecord[]>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
