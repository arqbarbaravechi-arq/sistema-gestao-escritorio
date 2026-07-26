import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { USER_REPOSITORY, UserRepository } from "./domain/user-repository.interface";
import { PasswordHasher } from "./security/password-hasher";

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    organizationId: string;
    email: string;
    name: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);

    // Mensagem de erro idêntica para "usuário não existe" e "senha errada"
    // — evita vazar para o atacante qual das duas está incorreta.
    if (!user || !user.active) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const passwordMatches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload = {
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        organizationId: user.organizationId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
