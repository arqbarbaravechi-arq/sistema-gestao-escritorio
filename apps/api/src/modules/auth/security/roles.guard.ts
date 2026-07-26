import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { AuthenticatedRequest } from "./jwt-auth.guard";

// Este guard SEMPRE roda depois do JwtAuthGuard (a ordem dos guards em
// @UseGuards importa) — ele assume que request.user já foi preenchido.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // rota sem restrição de papel
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Papel "${userRole ?? "desconhecido"}" não tem permissão para esta rota`,
      );
    }

    return true;
  }
}
