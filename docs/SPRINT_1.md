# Sprint 1 — Autenticação Real + Início do Módulo Projetos

**Tech Lead:** conforme definido na Sprint 0
**Baseline de referência:** PRD v2.0 (Fase 0 — Projetos + Notificações), UX v2.0, Arquitetura Técnica v2.0, Addendum de Decisões Confirmadas (CR-000)
**Pré-condição:** Sprint 0 congelada — ver `docs/SPRINT_0_STATUS_FINAL.md` para as dívidas herdadas
**Duração estimada:** 3 semanas

---

## 1. Objetivo da Sprint

Sair do estado "infraestrutura escrita, não comprovada" para o estado "autenticação real funcionando + primeira fatia vertical do módulo Projetos operando de ponta a ponta contra um banco real". Esta sprint fecha as dívidas críticas herdadas da Sprint 0 (E2, E3, E4) como pré-requisito, antes de começar a construir Projetos por cima.

---

## 2. Entregas

| # | Entrega | Depende de | Bloqueante para o resto da sprint? |
|---|---|---|---|
| S1-1 | Confirmação real de ambiente: Docker sobe, Prisma gera client, migration roda contra Postgres real | — | Sim — nada abaixo pode ser testado sem isso |
| S1-2 | Módulo de Autenticação real (login, hash de senha, JWT + refresh token, cookie httpOnly) | S1-1 | Sim |
| S1-3 | RBAC funcional: guard de rota por papel, testado com pelo menos 2 papéis (Sócia, Arquiteta Jr.) | S1-2 | Sim |
| S1-4 | CRUD de Projeto (criar, listar, ver detalhe) — API + persistência real | S1-3 | Não bloqueia S1-5, mas é pré-requisito de produto |
| S1-5 | Etapas de projeto (`ProjectStage`): criação automática das 8 etapas padrão ao criar um projeto, atualização de status | S1-4 | Sim, para S1-6 |
| S1-6 | Regra de negócio "atrasado": cálculo automático conforme PRD v2.0 §3.3 (sem tolerância de carência) | S1-5 | Não |
| S1-7 | Sub-entregas (`StageDeliverable`) dentro da etapa Executivo, com responsáveis distintos | S1-5 | Não |
| S1-8 | Rodada de revisão por projeto (CR-000): limite de 2, geração de `BudgetAmendment` ao esgotar | S1-4 | Sim, para S1-9 |
| S1-9 | Modo exceção (`ciclo_aberto`): transição de estado + registro de interações livres | S1-5 | Não |
| S1-10 | Estados pausado/cancelado do projeto, com motivo | S1-4 | Não |
| S1-11 | CI real: primeiro push ao GitHub, pipeline rodando de fato (não apenas escrito) | S1-1 | Sim, para qualquer merge subsequente |
| S1-12 | Instrumentação mínima de analytics de evento (criação de etapa, mudança de status) | S1-5 | Sim, para a métrica de adoção da Fase 0 funcionar desde o início |

**Notificações (segundo módulo da Fase 0) ficam para a Sprint 2** — decisão deliberada de reduzir o tamanho do corte desta sprint, já que a própria Sprint 0 mostrou o risco de estimar mais do que se consegue validar de verdade em um único ciclo. Construir Projetos até o ponto de gerar eventos de domínio consistentes é pré-requisito para Notificações fazerem sentido.

---

## 3. Critérios de Aceite

### S1-1 — Ambiente real confirmado
- [ ] `docker compose up -d` executado em máquina real, com `docker compose ps` mostrando os 2 containers saudáveis
- [ ] `npm run db:generate --workspace=packages/database` roda sem erro
- [ ] `npm run db:migrate --workspace=packages/database` cria as tabelas, confirmado via `npm run db:studio` ou `psql`
- [ ] Resultado registrado em `docs/SPRINT_0_STATUS_FINAL.md` (atualização permitida — é registro de status, não mudança de escopo)

### S1-2 — Autenticação real
- [ ] Endpoint `POST /auth/login` retorna JWT válido para credenciais corretas e erro 401 para incorretas
- [ ] Senha nunca armazenada em texto puro (hash com bcrypt ou equivalente)
- [ ] Refresh token funcional, cookie `httpOnly`/`secure`

### S1-3 — RBAC
- [ ] Rota de teste protegida por papel retorna 403 para papel sem permissão
- [ ] Teste automatizado cobrindo pelo menos: Sócia acessa tudo, Arquiteta Jr. é bloqueada de rota exclusiva de Sócia

### S1-4 — CRUD de Projeto
- [ ] `POST /projects` cria projeto vinculado à organização do usuário autenticado
- [ ] `GET /projects` lista apenas projetos da mesma organização (isolamento básico, sem RLS pleno — conforme decisão já registrada)
- [ ] `GET /projects/:id` retorna detalhe com etapas associadas

### S1-5 — Etapas automáticas
- [ ] Ao criar um projeto, as 8 etapas (`BRIEFING` a `ENTREGA`) são criadas automaticamente com status `NAO_INICIADO`
- [ ] Endpoint de atualização de status de etapa funcional

### S1-6 — Regra de "atrasado"
- [ ] Teste automatizado: etapa com `dueDate` no passado e status diferente de `APROVADO` é corretamente classificada como atrasada
- [ ] Teste automatizado: etapa com `dueDate` no futuro nunca é classificada como atrasada, mesmo sem conclusão

### S1-7 — Sub-entregas
- [ ] Etapa do tipo `EXECUTIVO` pode ter múltiplas `StageDeliverable` com responsáveis diferentes
- [ ] Sub-entregas **não têm contador de revisão próprio** (confirma o CR-000 no código, não só no schema)

### S1-8 — Rodada de revisão (CR-000)
- [ ] Teste automatizado: 3ª tentativa de registrar `RevisionRound` além do limite de 2 por projeto é bloqueada pela API
- [ ] Ao bloquear, a API retorna instrução clara para criar um `BudgetAmendment` em vez de permitir a rodada

### S1-9 — Modo exceção
- [ ] Endpoint permite marcar `ProjectStage.mode = CICLO_ABERTO`
- [ ] Etapa em `ciclo_aberto` não é bloqueada por falta de conclusão formal nos indicadores de atraso (regra de exceção documentada e testada)

### S1-10 — Pausado/cancelado
- [ ] Projeto pode transicionar para `PAUSADO`/`CANCELADO` com `statusReason` obrigatório
- [ ] Projeto pausado não gera alerta de atraso para suas etapas em aberto

### S1-11 — CI real
- [ ] Repositório enviado a um remoto real (GitHub)
- [ ] Primeiro Pull Request mostra o pipeline rodando (lint + build + testes) com resultado visível, sucesso ou falha real

### S1-12 — Analytics mínimo
- [ ] Evento de "etapa criada" e "status de etapa alterado" registrados de forma consultável (mesmo que em uma tabela simples de log, sem ferramenta externa ainda)

---

## 4. Riscos da Sprint 1

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| S1-1 revela problema real de ambiente (ex: Docker não sobe na máquina real por conflito de porta) | Média | Alto — bloqueia toda a sprint | Rodar S1-1 no primeiro dia, não deixar para o meio da sprint |
| Regra de "atrasado" (S1-6) parecer simples mas esconder caso de borda (ex: fuso horário, projeto pausado) | Média | Médio | Cobrir com teste automatizado antes de considerar concluída, incluindo o caso de projeto pausado (S1-10) |
| CR-000 mal implementado gera divergência entre código e regra de negócio confirmada | Baixa (já testado no schema) | Alto se acontecer | Teste automatizado específico (S1-8) como critério de aceite não negociável |
| Escopo da sprint ainda maior do que o time consegue entregar em 3 semanas, repetindo o padrão de otimismo já visto no histórico do projeto | Média | Médio | Notificações movidas deliberadamente para a Sprint 2; se S1-7 a S1-10 não couberem, são o primeiro corte, não S1-1 a S1-6 |

---

## 5. Dependências

- Toda a sprint depende de S1-1 ser resolvido no início, não no fim.
- S1-3 (RBAC) não começa sem S1-2 (Auth) funcional.
- S1-6, S1-8, S1-9 dependem de S1-5 (etapas) existirem de verdade.
- S1-11 (CI real) depende de o repositório existir em um remoto — isso deveria ter acontecido na Sprint 0 e não aconteceu; é a primeira dívida herdada a ser paga.

---

## 6. Fora de Escopo desta Sprint (lembrete deliberado)

- Módulo Notificações — Sprint 2.
- Qualquer tela de frontend além do necessário para testar manualmente os endpoints (Postman/Insomnia é suficiente por enquanto; UI real começa quando Notificações também estiver pronta, para os dois módulos da Fase 0 ficarem coerentes na mesma entrega de UI).
- Sessão de validação com Vitória e Thainá, estimativa de esforço formal e compromisso de disponibilidade da sócia — continuam como itens de processo paralelos, não bloqueiam o código desta sprint, mas bloqueiam a declaração de "Fase 0 validada" mais adiante.

---

## 7. Definição de Pronto da Sprint 1

A Sprint 1 está encerrada quando:
1. S1-1 a S1-12 têm critério de aceite marcado como concluído, com evidência real (não "deveria funcionar");
2. Existe pelo menos um projeto de teste criado via API, com etapas avançando de status, rodada de revisão sendo registrada e bloqueada corretamente no limite, e isso comprovável por quem revisar a sprint, não apenas descrito;
3. O CI está rodando de verdade em um repositório remoto real.
