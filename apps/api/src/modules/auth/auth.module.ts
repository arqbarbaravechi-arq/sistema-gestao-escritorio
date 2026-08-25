import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PasswordHasher } from "./security/password-hasher";
import { JwtAuthGuard } from "./security/jwt-auth.guard";
import { RolesGuard } from "./security/roles.guard";
import { USER_REPOSITORY } from "./domain/user-repository.interface";
import { InMemoryUserRepository } from "./infra/in-memory-user.repository";
// import { PrismaUserRepository } from "./infra/prisma-user.repository";
import { UserSeeder } from "./infra/user-seeder";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordHasher,
    JwtAuthGuard,
    RolesGuard,
    InMemoryUserRepository,
    UserSeeder,
    // ⚠️ Provider ativo hoje: InMemoryUserRepository — ver aviso detalhado
    // em infra/prisma-user.repository.ts sobre por que a versão real
    // (Postgres) não pôde ser validada neste ambiente de desenvolvimento.
    // Troca para produção: substituir a linha abaixo por
    // { provide: USER_REPOSITORY, useClass: PrismaUserRepository }
    { provide: USER_REPOSITORY, useExisting: InMemoryUserRepository },
  ],
  exports: [JwtAuthGuard, RolesGuard, USER_REPOSITORY],
})
export class AuthModule {}
