import { Injectable } from "@nestjs/common";
import { UserRecord, UserRepository } from "../domain/user-repository.interface";

// Implementação em memória — NÃO é um mock apenas para teste, é uma
// implementação real da interface UserRepository, usada como substituto
// temporário do PrismaUserRepository enquanto o Postgres/Prisma não
// puderem ser validados neste ambiente (ver README, seção "O que já
// foi validado"). Permite rodar a API de ponta a ponta de verdade.
//
// Troca para PrismaUserRepository é uma mudança de um único provider
// em auth.module.ts, sem tocar em AuthService ou nos testes de negócio.
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users: UserRecord[] = [];

  seed(users: UserRecord[]) {
    this.users.push(...users);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }
}
