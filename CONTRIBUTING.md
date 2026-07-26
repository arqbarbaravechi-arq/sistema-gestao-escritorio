# Guia de Contribuição

## Branches

- `main` — reflete produção. Protegida, só recebe merge via Pull Request aprovado.
- `staging` — ambiente de homologação. Deploy automático a cada merge.
- `feature/<nome-curto>` — uma branch por entrega, criada a partir de `staging`.

## Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona contador de rodada de revisão por projeto
fix: corrige cálculo de etapa atrasada sem tolerância de carência
docs: atualiza README com passo de migration
chore: configura eslint no workspace api
```

## Pull Requests

- Todo PR referencia a entrega ou Change Request relacionada (ex: "Sprint 0 — E3", "CR-004").
- CI (lint + build + testes) precisa passar antes de qualquer merge.
- Nenhuma funcionalidade de produto é aceita fora do escopo definido na Fase atual da PRD (ver `docs/BASELINE.md`) sem um Change Request aprovado.

## Mudança de Escopo

Se durante o desenvolvimento surgir a necessidade de mudar uma regra de negócio, uma tela ou uma decisão técnica em relação à baseline:

1. Não altere os documentos de baseline diretamente.
2. Preencha o template de Change Request em `docs/BASELINE.md`.
3. Registre o CR aprovado em `docs/changes/CR-XXX.md`.
4. Só então implemente a mudança no código.

## Testes

Toda entrega da Fase 0 (Projetos, Notificações) deve incluir testes automatizados cobrindo, no mínimo, as regras de negócio formalizadas na PRD v2.0 §3 (ex: cálculo de "atrasado", limite de rodadas de revisão por projeto).
