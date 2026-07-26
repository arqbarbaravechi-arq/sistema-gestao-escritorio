import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { USER_REPOSITORY } from "./domain/user-repository.interface";
import { InMemoryUserRepository } from "./infra/in-memory-user.repository";
import { PasswordHasher } from "./security/password-hasher";

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: InMemoryUserRepository;
  let passwordHasher: PasswordHasher;

  const SEED_PASSWORD = "senha-correta-123";

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        PasswordHasher,
        InMemoryUserRepository,
        { provide: USER_REPOSITORY, useExisting: InMemoryUserRepository },
        {
          provide: JwtService,
          useValue: new JwtService({ secret: "test-secret-nao-usar-em-producao" }),
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    userRepository = moduleRef.get(InMemoryUserRepository);
    passwordHasher = moduleRef.get(PasswordHasher);

    const hash = await passwordHasher.hash(SEED_PASSWORD);
    userRepository.seed([
      {
        id: "user-1",
        organizationId: "org-1",
        email: "socia@escritorio.com",
        passwordHash: hash,
        role: "SOCIA",
        name: "Sócia Teste",
        active: true,
      },
      {
        id: "user-2",
        organizationId: "org-1",
        email: "inativa@escritorio.com",
        passwordHash: hash,
        role: "ARQUITETA_JR",
        name: "Usuária Inativa",
        active: false,
      },
    ]);
  });

  it("autentica com sucesso quando e-mail e senha estão corretos", async () => {
    const result = await authService.login("socia@escritorio.com", SEED_PASSWORD);

    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe("string");
    expect(result.user.email).toBe("socia@escritorio.com");
    expect(result.user.role).toBe("SOCIA");
  });

  it("gera um token JWT decodificável com o payload esperado (id, organização, papel)", async () => {
    const result = await authService.login("socia@escritorio.com", SEED_PASSWORD);
    const jwtService = new JwtService({ secret: "test-secret-nao-usar-em-producao" });
    const decoded = jwtService.verify(result.accessToken) as {
      sub: string;
      organizationId: string;
      role: string;
    };

    expect(decoded.sub).toBe("user-1");
    expect(decoded.organizationId).toBe("org-1");
    expect(decoded.role).toBe("SOCIA");
  });

  it("rejeita login com senha incorreta", async () => {
    await expect(authService.login("socia@escritorio.com", "senha-errada")).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("rejeita login com e-mail que não existe", async () => {
    await expect(
      authService.login("nao-existe@escritorio.com", SEED_PASSWORD),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("rejeita login de usuário inativo, mesmo com senha correta", async () => {
    await expect(
      authService.login("inativa@escritorio.com", SEED_PASSWORD),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("retorna a mesma mensagem de erro para senha errada e e-mail inexistente (não vaza qual dos dois está errado)", async () => {
    let errorForWrongPassword = "";
    let errorForMissingUser = "";

    try {
      await authService.login("socia@escritorio.com", "senha-errada");
    } catch (e) {
      errorForWrongPassword = (e as UnauthorizedException).message;
    }

    try {
      await authService.login("ninguem@escritorio.com", SEED_PASSWORD);
    } catch (e) {
      errorForMissingUser = (e as UnauthorizedException).message;
    }

    expect(errorForWrongPassword).toBe(errorForMissingUser);
  });
});
