# Sistema de Gestão — Escritório de Arquitetura

Monorepo oficial do projeto. Baseline de produto em `docs/` (referências à documentação completa de Discovery, PRD, UX e Arquitetura).

> **Status:** Sprint 0 — preparação de ambiente. Nenhuma funcionalidade de produto implementada ainda.

---

## Estrutura

```
apps/
  web/          → Frontend (Next.js 14 + TypeScript + App Router)
  api/          → Backend (NestJS 10 + TypeScript)
packages/
  database/     → Schema Prisma + migrations (fonte única de verdade do modelo de dados)
docs/
  SPRINT_0.md       → Plano da sprint atual
  BASELINE.md       → Referência à documentação de produto oficial
  changes/          → Change Requests aprovados
```

---

## Requisitos de ambiente

| Ferramenta | Versão mínima | Obrigatório para |
|---|---|---|
| Node.js | 20.x | Tudo |
| npm | 10.x | Tudo (o projeto usa npm workspaces) |
| Docker + Docker Compose | qualquer versão recente | Banco de dados (Postgres) e cache (Redis) locais |
| Conta/acesso à internet | — | `npm install` e `prisma generate` baixam pacotes e binários externos |

Sistemas operacionais suportados: macOS, Linux, Windows com WSL2. Não testado em Windows nativo sem WSL2.

---

## Como instalar e rodar (passo a passo)

```bash
# 1. Instalar dependências de todos os workspaces
npm install

# 2. Copiar variáveis de ambiente e preencher os valores necessários
cp .env.example .env
# Edite o .env — no mínimo, DATABASE_URL e REDIS_URL já vêm com valores
# padrão compatíveis com o docker-compose.yml abaixo, não precisam mudar
# para rodar localmente. Os demais valores (auth, storage, e-mail, KMS,
# Microsoft Graph) só são necessários quando esses módulos forem
# implementados — deixe em branco por enquanto.

# 3. Subir banco de dados e cache local
docker compose up -d
# Verifique se os dois containers subiram: docker compose ps

# 4. Gerar o Prisma Client a partir do schema
npm run db:generate --workspace=packages/database

# 5. Rodar a primeira migration (cria as tabelas no banco local)
npm run db:migrate --workspace=packages/database

# 6. Rodar API e Web em modo desenvolvimento (em paralelo)
npm run dev
```

Depois do passo 6:
- API disponível em `http://localhost:3001` (teste com `curl http://localhost:3001/health`)
- Web disponível em `http://localhost:3000`

Se qualquer um desses passos exigir uma pergunta a outra pessoa da equipe para funcionar, isso é considerado um bug de documentação — abra uma issue.

### Comandos úteis adicionais

```bash
npm run build              # build de todos os workspaces
npm run lint                # lint de todos os workspaces
npm run test                 # testes de todos os workspaces
npm run db:studio --workspace=packages/database   # interface visual do banco (Prisma Studio)
```

---

## O que já foi validado, e como

Este projeto foi testado de forma incremental antes de ser entregue. A tabela abaixo é o registro exato do que foi confirmado, o método usado, e o que **não pôde** ser verificado no ambiente onde o projeto foi montado (uma sandbox de desenvolvimento sem Docker e com acesso de rede restrito a poucos domínios) — para que quem for rodar isso localmente saiba exatamente onde focar a primeira verificação.

| Item | Status | Como foi validado / motivo de não ter sido |
|---|---|---|
| `npm install` na raiz do monorepo | ✅ Validado | Executado do zero, instalação concluída sem erro (804 pacotes) |
| Build do backend (`apps/api`) | ✅ Validado | `npm run build --workspace=apps/api` executado com sucesso após adição dos arquivos de bootstrap (`main.ts`, `app.module.ts`, `tsconfig.json`, `nest-cli.json`) |
| Backend sobe e responde a requisição real | ✅ Validado | Servidor iniciado localmente; `curl http://localhost:3001/health` retornou `{"status":"ok","service":"api","timestamp":"..."}` |
| Build do frontend (`apps/web`) | ✅ Validado | `npm run build --workspace=apps/web` executado com sucesso, gerando páginas estáticas (`next build` completo, sem erros de tipo ou lint) |
| Sintaxe do schema Prisma (`packages/database/prisma/schema.prisma`) | ⚠️ Parcialmente validado | O schema segue a sintaxe correta da linguagem Prisma, mas o comando `prisma generate`/`prisma validate` **não pôde ser executado** no ambiente de montagem porque ele precisa baixar um binário de engine do domínio `binaries.prisma.sh`, que estava fora da lista de domínios permitidos naquele ambiente. Isso é uma restrição do ambiente de montagem, não necessariamente um problema em máquinas com acesso normal à internet — mas **precisa ser confirmado no primeiro `npm run db:generate` local**. |
| `docker-compose.yml` (Postgres + Redis) | ❌ Não validado | O ambiente onde o projeto foi montado não tinha o binário `docker` disponível. O arquivo segue a sintaxe padrão do Docker Compose e usa imagens oficiais (`postgres:16-alpine`, `redis:7-alpine`), mas **nunca foi de fato executado com `docker compose up`**. Este é o primeiro comando a rodar e confirmar em ambiente local. |
| Migration inicial do Prisma contra um banco real | ❌ Não validado | Depende dos dois itens acima (Docker rodando + Prisma Client gerado) — ainda não foi possível testar de ponta a ponta. |
| CI (`.github/workflows/ci.yml`) | ❌ Não validado | O workflow nunca rodou de fato em um repositório GitHub real (o projeto ainda não foi enviado a um repositório remoto). A sintaxe segue o padrão do GitHub Actions, mas o primeiro push é quem vai confirmar se passa. |
| Deploy em staging | ❌ Não iniciado | Nenhuma conta de hospedagem (Vercel/Railway/Render) foi criada ainda — é uma das entregas pendentes da Sprint 0 (ver `docs/SPRINT_0.md`, item E2). |

### Primeira coisa a fazer ao clonar este repositório

Nesta ordem, para isolar rapidamente qualquer problema:

1. `docker compose up -d` — se isso falhar, o problema é de ambiente Docker, não do projeto.
2. `npm run db:generate --workspace=packages/database` — se isso falhar por causa de download de binário, verifique acesso de rede ao domínio `binaries.prisma.sh` (proxy corporativo, firewall, VPN).
3. `npm run db:migrate --workspace=packages/database` — só tentar depois que os dois passos acima funcionarem.
4. `npm run dev` — só depois de tudo acima confirmado.

Se algum desses passos falhar de um jeito diferente do descrito nesta tabela, é um problema novo, não um dos já mapeados — vale abrir uma issue registrando o erro exato.

---

## Limitações conhecidas desta versão (Sprint 0)

- Nenhuma tela de produto existe ainda — a página inicial do frontend é apenas um placeholder de texto.
- Nenhum módulo de domínio (`auth`, `projects`, `notifications`) tem lógica implementada — as pastas existem como esqueleto (`.gitkeep`), conforme escopo definido em `docs/SPRINT_0.md`.
- Não há testes automatizados ainda além do necessário para o pipeline de CI rodar — a suíte de testes real começa junto com a primeira funcionalidade, na Sprint 1.
- `husky` está configurado no `package.json`, mas o hook de pre-commit só é instalado corretamente depois que o repositório for inicializado com `git init` e tiver um remoto — em um `.zip` baixado sem histórico Git, o passo `prepare` pode acusar aviso (`.git can't be found`); isso é esperado e não impede o uso do restante do projeto.
- Multi-tenant (`organizationId` em todas as tabelas) está no schema, mas **sem Row-Level Security implementado** — decisão deliberada registrada na Arquitetura Técnica v2.0 §0 e no Addendum de Decisões Confirmadas, não um esquecimento.

---

## Convenções

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branches:** `main` (produção), `staging`, `feature/<nome-curto>`
- **Change Requests:** qualquer alteração de escopo em relação à baseline de produto segue o processo descrito em `docs/BASELINE.md` — nunca edite os documentos originais diretamente.

---

## Módulos da Fase 0 (escopo desta fase de desenvolvimento)

Conforme PRD v2.0 (Fase 0 — Validação de Adoção):
- **Projetos** — etapas, sub-entregas, contador de revisão por projeto (2 rodadas por projeto, conforme CR-000 — ver `docs/changes/CR-000.md`), modo exceção, estados pausado/cancelado
- **Notificações** — alertas de atraso, sub-entrega pronta, follow-up de lead, rodada de revisão esgotada

Nenhum outro módulo entra em desenvolvimento antes do checkpoint de adoção definido na PRD v2.0 §2.1.
