import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InMemoryUserRepository } from "./in-memory-user.repository";
import { PasswordHasher } from "../security/password-hasher";

// Popula usuários de desenvolvimento no boot da aplicação — SOMENTE
// enquanto InMemoryUserRepository for o provider ativo (ver auth.module.ts).
// Quando a troca para PrismaUserRepository acontecer, este seeder deve
// ser removido do AuthModule (usuários reais virão de uma migration/seed
// do Prisma, não daqui).
//
// Credenciais de desenvolvimento (documentadas de propósito, não é
// segredo real): socia@escritorio.com / senha123
@Injectable()
export class UserSeeder implements OnModuleInit {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    private readonly userRepository: InMemoryUserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async onModuleInit() {
    const passwordHash = await this.passwordHasher.hash("senha123");

    this.userRepository.seed([
      {
        id: "dev-user-socia",
        organizationId: "dev-org",
        email: "socia@escritorio.com",
        passwordHash,
        role: "SOCIA",
        name: "Sócia (dev)",
        active: true,
      },
      {
        id: "dev-user-vitoria",
        organizationId: "dev-org",
        email: "vitoria@escritorio.com",
        passwordHash,
        role: "ARQUITETA_JR",
        name: "Vitória (dev)",
        active: true,
      },
    ]);

    this.logger.warn(
      "AuthModule está usando InMemoryUserRepository com usuários de " +
        "desenvolvimento. Não usar em produção — ver aviso em " +
        "infra/prisma-user.repository.ts.",
    );
  }
}
