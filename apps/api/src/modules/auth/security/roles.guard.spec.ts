import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

function buildContext(userRole: string | undefined, requiredRoles: string[] | undefined) {
  const reflector = new Reflector();
  jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(requiredRoles);

  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: userRole ? { role: userRole } : undefined }),
    }),
  } as unknown as ExecutionContext;

  return { reflector, context };
}

describe("RolesGuard", () => {
  it("permite acesso quando a rota não exige nenhum papel específico", () => {
    const { reflector, context } = buildContext("ARQUITETA_JR", undefined);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
  });

  it("permite acesso quando o papel do usuário está na lista exigida", () => {
    const { reflector, context } = buildContext("SOCIA", ["SOCIA"]);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
  });

  it("bloqueia acesso (403) quando o papel do usuário não está na lista exigida", () => {
    const { reflector, context } = buildContext("ARQUITETA_JR", ["SOCIA"]);
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it("bloqueia acesso quando não há usuário autenticado na requisição", () => {
    const { reflector, context } = buildContext(undefined, ["SOCIA"]);
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
