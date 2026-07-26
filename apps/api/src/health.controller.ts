import { Controller, Get } from "@nestjs/common";

// Health check — não é funcionalidade de produto, é infraestrutura
// mínima para provar que a API sobe e responde (Sprint 0 — E1).
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok", service: "api", timestamp: new Date().toISOString() };
  }
}
