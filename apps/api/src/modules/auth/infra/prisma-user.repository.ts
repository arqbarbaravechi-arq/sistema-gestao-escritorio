import { Injectable } from "@nestjs/common";
import { UserRecord, UserRepository } from "../domain/user-repository.interface";

// ⚠️ ATENÇÃO — LEIA ANTES DE USAR EM PRODUÇÃO
//
// Esta implementação é a que deve ser usada de fato (Postgres via Prisma),
// conforme Arquitetura Técnica v2.0. Ela foi escrita seguindo o schema em
// packages/database/prisma/schema.prisma, mas NÃO pôde ser compilada nem
// testada neste ambiente de desenvolvimento: o comando `prisma generate`
// falha aqui porque o binário do engine (binaries.prisma.sh) está fora da
// lista de domínios de rede permitidos nesta sandbox.
//
// Antes de usar esta classe:
// 1. Rode `npm run db:generate --workspace=packages/database` em um
//    ambiente com acesso normal à internet e confirme que funciona.
// 2. Descomente o import abaixo e o corpo do método.
// 3. Troque o provider em auth.module.ts de InMemoryUserRepository para
//    esta classe.
// 4. Rode a suíte de testes de novo — os testes de AuthService não devem
//    precisar de nenhuma alteração, já que dependem só da interface.

// import { PrismaClient } from "@sga/database";

@Injectable()
export class PrismaUserRepository implements UserRepository {
  // private readonly prisma = new PrismaClient();

  async findByEmail(_email: string): Promise<UserRecord | null> {
    throw new Error(
      "PrismaUserRepository não está ativo. Ver comentário no topo deste " +
        "arquivo — depende de `prisma generate` ser executado em ambiente " +
        "com acesso ao domínio binaries.prisma.sh, o que não foi possível " +
        "confirmar nesta sandbox de desenvolvimento.",
    );

    // Implementação pretendida, a descomentar após validação local:
    //
    // const user = await this.prisma.user.findUnique({ where: { email } });
    // if (!user) return null;
    // return {
    //   id: user.id,
    //   organizationId: user.organizationId,
    //   email: user.email,
    //   passwordHash: user.passwordHash,
    //   role: user.role,
    //   name: user.name,
    //   active: user.active,
    // };
  }

  async listByOrganization(_organizationId: string): Promise<UserRecord[]> {
    throw new Error(
      "PrismaUserRepository não está ativo. Ver comentário no topo deste arquivo.",
    );
    // Implementação pretendida:
    // return this.prisma.user.findMany({ where: { organizationId, active: true } });
  }
}
