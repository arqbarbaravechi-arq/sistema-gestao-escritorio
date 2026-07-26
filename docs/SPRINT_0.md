> **STATUS: CONGELADA.** Aprovada pela sócia. Nenhum conteúdo abaixo é alterado retroativamente, exceto correções críticas — ver `docs/SPRINT_0_STATUS_FINAL.md` para o registro do estado real de cada entrega no momento do congelamento e `docs/SPRINT_1.md` para o que segue a partir daqui.

# Sprint 0 — Fundação Técnica e Validações Bloqueantes

**Tech Lead:** definido nesta sessão
**Baseline de referência:** PRD v2.0, UX v2.0, Arquitetura Técnica v2.0 (+ Addendum de Decisões Confirmadas)
**Duração:** 2-3 semanas
**Objetivo único desta sprint:** preparar ambiente, validar riscos bloqueantes e confirmar os itens herdados do backlog de planejamento — **nenhuma funcionalidade de produto é construída nesta sprint.**

---

## 1. Entregas da Sprint 0

| # | Entrega | Tipo | Bloqueante para Sprint 1? |
|---|---|---|---|
| E1 | Repositório inicial estruturado (monorepo) com convenções de código, lint, CI básico | Infraestrutura | Sim |
| E2 | Ambientes configurados: desenvolvimento local (Docker Compose), staging, produção (contas criadas, não necessariamente publicadas) | Infraestrutura | Sim |
| E3 | Schema inicial do banco de dados (Prisma) refletindo as entidades da Fase 0, incluindo a correção do CR-000 (rodada de revisão por projeto) | Infraestrutura | Sim |
| E4 | Autenticação + RBAC básico funcionando (login, papéis, sem telas de produto) | Infraestrutura | Sim |
| E5 | Spike técnico de integração Microsoft Graph (OneDrive) com critério de sucesso/falha objetivo | Validação técnica | Sim (só para o módulo Arquivos, Fase 2 — não bloqueia Sprint 1) |
| E6 | Instrumentação mínima de analytics de evento (para medir adoção a partir da Fase 0) | Infraestrutura | Sim |
| E7 | Sessão de validação de telas com Vitória e Thainá | Validação de produto | Sim |
| E8 | Estimativa de esforço da Fase 0 (Projetos + Notificações), em horas/sprints | Planejamento | Sim |
| E9 | Compromisso formal de disponibilidade da sócia para checkpoints de adoção | Acordo operacional | Sim |
| E10 | Pipeline de CI/CD básico (lint + build + testes em cada PR) | Infraestrutura | Sim |

**Todos os itens são bloqueantes** — esta é uma decisão deliberada: Sprint 0 só é considerada encerrada quando as 10 entregas estiverem de fato concluídas, não apenas iniciadas. É a mesma disciplina que a Arquitetura v2.0 já havia estabelecido para o spike de OneDrive, agora estendida a toda a sprint.

---

## 2. Critérios de Aceite por Entrega

### E1 — Repositório inicial
- [ ] Monorepo criado com separação clara `apps/web`, `apps/api`, `packages/database`, `packages/config`
- [ ] Linting (ESLint) e formatação (Prettier) configurados e rodando sem erro em `main`
- [ ] `README.md` permite a qualquer novo desenvolvedor rodar o projeto localmente em menos de 15 minutos, sem perguntar nada a ninguém
- [ ] Convenção de commits e branches documentada (`CONTRIBUTING.md`)

### E2 — Ambientes
- [ ] `docker-compose.yml` sobe PostgreSQL + Redis localmente com um único comando
- [ ] Conta de staging criada (Railway/Render) e conectada ao repositório
- [ ] Variáveis de ambiente documentadas em `.env.example`, nenhum segredo real commitado

### E3 — Schema inicial
- [ ] Entidades da Fase 0 modeladas: `organization`, `user`, `role`, `project`, `project_stage`, `stage_deliverable`, `revision_round` (vinculado a `project`, conforme CR-000), `budget_amendment`, `notification`, `system_config`
- [ ] Migração inicial roda sem erro em ambiente limpo
- [ ] `organization_id` presente em toda tabela relevante, sem RLS pleno implementado (decisão já registrada na Arquitetura v2.0 §0)

### E4 — Autenticação + RBAC
- [ ] Login funcional com pelo menos 2 papéis de teste (Sócia/Admin e Arquiteta Jr.)
- [ ] Rota protegida de exemplo demonstrando bloqueio por papel
- [ ] Sessão via JWT + refresh token, cookie `httpOnly`

### E5 — Spike OneDrive
- [ ] Critério de sucesso definido **antes** do início do spike (ex: "estrutura de 3 níveis de pasta criada e sincronizada via Microsoft Graph API em menos de 10 segundos, testado em 10 tentativas, com taxa de sucesso ≥ 90%")
- [ ] Resultado documentado (sucesso, falha, ou sucesso parcial) com decisão explícita: seguir com integração automática ou ativar plano B (link manual)

### E6 — Instrumentação de analytics
- [ ] Evento mínimo capturado: criação de etapa, mudança de status, notificação enviada/lida — suficiente para medir, a partir da Fase 0, a métrica "% de atualização feita dentro do sistema" definida na PRD v2.0 §2.1

### E7 — Validação com Vitória e Thainá
- [ ] Sessão realizada (presencial ou remota), com roteiro estruturado, não conversa livre
- [ ] Ata da sessão registrada, com qualquer ajuste de prioridade ou tela documentado como Change Request, se necessário

### E8 — Estimativa de esforço
- [ ] Estimativa em horas ou pontos por entrega da Fase 0 (módulo Projetos + Notificações), com faixa de confiança (não número único)
- [ ] Estimativa compartilhada e validada com a sócia antes do início da Sprint 1

### E9 — Compromisso de disponibilidade
- [ ] Acordo simples e explícito (pode ser um parágrafo por escrito) definindo: frequência dos checkpoints de adoção, tempo esperado da sócia por semana para feedback, canal de comunicação com o time técnico

### E10 — CI/CD básico
- [ ] Pipeline roda automaticamente em cada Pull Request: lint, build, testes (mesmo que poucos testes existam ainda)
- [ ] Deploy automático em staging a cada merge na branch principal

---

## 3. Riscos da Sprint 0

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Spike de OneDrive revela integração inviável no prazo | Média | Alto (afeta módulo Arquivos, Fase 2) | Critério de sucesso definido antes de começar; plano B já desenhado na Arquitetura v2.0 |
| Sócia não consegue tempo para E7/E8/E9 nesta sprint | Média-Alta | Alto (bloqueia início real da Sprint 1) | Agendar as 3 sessões logo no início da sprint, não no fim; tratar como prioridade de calendário, não "quando sobrar tempo" |
| Estimativa de esforço (E8) é otimista demais, repetindo padrão comum de estimativa de software | Média | Médio | Usar faixa (ex: "6 a 9 semanas"), não número único; revisar após as duas primeiras semanas reais de Sprint 1 |
| Setup de ambiente consome mais tempo que o previsto por decisões de ferramenta não testadas antes (ex: provedor de hospedagem) | Baixa-Média | Médio | Escolher provedores já validados no mercado (Vercel, Railway) em vez de configuração customizada desde o dia 1 |

---

## 4. Dependências

- **E4 (Auth) depende de E3 (schema)** — não é possível implementar RBAC sem as tabelas de `user`/`role` existirem.
- **E5 (spike OneDrive) não depende de nada acima** — pode rodar em paralelo desde o primeiro dia.
- **E7 (validação com equipe) idealmente acontece cedo**, antes de qualquer decisão de UI ser implementada de fato (ainda não há UI nesta sprint, mas o roteiro de validação deve estar pronto usando os wireframes já existentes na UX v2.0).
- **E8 (estimativa) depende de E1-E4 estarem pelo menos desenhados** — não dá para estimar esforço de forma responsável sem saber a base técnica sobre a qual se vai construir.
- **Sprint 1 não inicia até E1-E10 estarem todos concluídos.**

---

## 5. Fora de Escopo da Sprint 0 (lembrete deliberado)

- Nenhuma tela de produto (Dashboard, Página do Projeto, Notificações visuais) é implementada.
- Nenhuma lógica de negócio de Projetos ou Notificações é codificada além do schema de dados.
- Nenhuma decisão de identidade visual (cores, tipografia) é tomada nesta sprint — fica para o início da Sprint 1, com o protótipo de alta fidelidade recomendado pelo Comitê (UX Apple).

---

## 6. Definição de Pronto da Sprint 0

A Sprint 0 está oficialmente encerrada quando:
1. Todas as 10 entregas têm seus critérios de aceite marcados como concluídos;
2. O checklist do Comitê (Baseline, seção 2) está com os 6 itens confirmados — não apenas os 3 que já estavam;
3. A estimativa de esforço da Fase 0 foi aprovada pela sócia por escrito;
4. O repositório está em condição de receber a primeira feature real da Sprint 1 sem nenhum trabalho de configuração pendente.
