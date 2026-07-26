# Sprint 0 — Registro de Estado no Congelamento

Este documento não altera `SPRINT_0.md` — é um registro complementar do estado real de cada entrega no momento em que a sócia aprovou e congelou a sprint. Existe para que a Sprint 1 comece com clareza sobre o que é fundação sólida e o que é dívida herdada, em vez de assumir que "aprovada" significa "tudo tecnicamente completo".

| # | Entrega | Estado real no congelamento |
|---|---|---|
| E1 | Repositório inicial estruturado | ✅ Completo e testado (build de API e Web validados; ver README) |
| E2 | Ambientes (dev local, staging, produção) | ⚠️ Parcial — Docker Compose escrito, não executado (sem Docker disponível no ambiente de montagem). Staging/produção: nenhuma conta de hospedagem criada ainda |
| E3 | Schema inicial do banco de dados | ⚠️ Parcial — schema Prisma escrito e sintaticamente correto, mas `prisma generate` nunca rodou com sucesso (bloqueio de rede no ambiente de montagem); nunca migrado contra um banco real |
| E4 | Autenticação + RBAC básico funcionando | ❌ Não implementado — apenas os modelos `User`/`Role` existem no schema. Nenhuma rota de login, nenhum guard de permissão foi codificado |
| E5 | Spike técnico OneDrive (Microsoft Graph) | ❌ Não realizado |
| E6 | Instrumentação de analytics de evento | ❌ Não realizado |
| E7 | Sessão de validação de telas com Vitória e Thainá | ❌ Não realizada |
| E8 | Estimativa de esforço da Fase 0 | ❌ Não realizada |
| E9 | Compromisso de disponibilidade da sócia | ❌ Não formalizado |
| E10 | Pipeline de CI/CD básico | ⚠️ Parcial — workflow escrito, nunca executado (projeto ainda não enviado a um repositório remoto) |

## Leitura honesta deste resultado

Das 10 entregas originalmente definidas como bloqueantes, **1 foi completada e testada de ponta a ponta, 3 estão parcialmente prontas (escritas, não validadas em execução real) e 6 não foram sequer iniciadas.**

A decisão de aprovar e congelar a sprint mesmo assim é prerrogativa da sócia, e este documento não a contesta — apenas garante que a diferença entre "aprovado" e "tecnicamente completo" fique registrada, em vez de se perder.

## Consequência prática para a Sprint 1

Os itens não resolvidos não desaparecem — eles são herdados como pré-condições da Sprint 1, priorizados antes de qualquer entrega nova poder ser considerada concluída com segurança:

- **E4 (Auth) entra como a primeira entrega real da Sprint 1** — o módulo Projetos depende de usuário autenticado e responsável por etapa, então não é possível avançar sem isso funcionar de verdade, não apenas existir no schema.
- **E2/E3 (ambiente e banco) precisam ser confirmados em execução real** — o primeiro passo prático de qualquer desenvolvedor entrando na Sprint 1 é `docker compose up -d` seguido de `npm run db:generate` e `npm run db:migrate`, com o resultado registrado.
- **E7/E8/E9 (validação com equipe, estimativa, disponibilidade) continuam pendentes** e são tratados como itens de processo paralelos à Sprint 1, não bloqueiam o início do trabalho técnico, mas bloqueiam a declaração de "adoção validada" mais adiante.
- **E5/E6/E10** são reagendados dentro da Sprint 1 conforme a ordem de dependência real (CI antes de qualquer deploy; analytics antes do checkpoint de adoção da Fase 0; spike de OneDrive continua não bloqueante, pois pertence à Fase 2/módulo Arquivos).

Ver `docs/SPRINT_1.md` para o plano detalhado.
