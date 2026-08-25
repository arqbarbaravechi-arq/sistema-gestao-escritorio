import { Body, Controller, Get, Post, UseGuards, Inject } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "./security/jwt-auth.guard";
import { RolesGuard } from "./security/roles.guard";
import { Roles } from "./security/roles.decorator";
import { Req } from "@nestjs/common";
import { USER_REPOSITORY, UserRepository } from "./domain/user-repository.interface";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(USER_REPOSITORY) private readonly usersRepository: UserRepository,
  ) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // Rota protegida simples — qualquer usuário autenticado.
  // Existe para comprovar o critério de aceite S1-3 ("rota de teste
  // protegida"). Deve ser substituída pelas rotas reais do módulo
  // Projetos assim que existirem (S1-4 em diante).
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    return { authenticated: true, user: req.user };
  }

  // Rota protegida por papel — demonstra o RolesGuard funcionando de
  // ponta a ponta. Mesma observação acima: é uma rota de demonstração
  // temporária, não uma funcionalidade de produto da Fase 0.
  @Get("admin-only")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SOCIA")
  adminOnly() {
    return { message: "Você é a sócia — acesso concedido." };
  }

  // Lista os usuários da organização — usado para atribuir responsável
  // a uma etapa e para o painel de carga de trabalho (Equipe).
  @Get("users")
  @UseGuards(JwtAuthGuard)
  async listUsers(@Req() req: AuthenticatedRequest) {
    const users = await this.usersRepository.listByOrganization(req.user!.organizationId);
    return users.map((u) => ({ id: u.id, name: u.name, role: u.role }));
  }
}
