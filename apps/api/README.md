# API — Backend

Monólito modular (NestJS + TypeScript), conforme Arquitetura Técnica v2.0 §1.

## Estrutura de módulos

```
src/modules/
  auth/           → Autenticação e RBAC (Sprint 0 — E4)
  projects/       → Módulo Projetos (Fase 0 — Sprint 1-3, ainda vazio)
  notifications/  → Módulo Notificações (Fase 0 — Sprint 1-3, ainda vazio)
```

Cada pasta representa uma fronteira de domínio, conforme decisão arquitetural de "monólito modular" — não microsserviços. Novos módulos (CRM, Obra, Fornecedores, Financeiro) só são adicionados quando a fase correspondente da PRD v2.0 for priorizada.

## Status

Nesta Sprint 0, estas pastas existem apenas como esqueleto estrutural (`.gitkeep`). Nenhuma lógica de negócio é implementada até a Sprint 1, conforme escopo definido em `docs/SPRINT_0.md`.
