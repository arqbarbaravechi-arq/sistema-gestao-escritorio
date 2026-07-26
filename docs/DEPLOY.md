# Guia de Deploy — Versão de Desenvolvimento

Este guia existe porque **eu não tenho como publicar uma URL pública a partir do ambiente onde este projeto foi desenvolvido** — não há acesso a contas de hospedagem nem exposição de porta para a internet nesse ambiente. A publicação precisa acontecer na sua conta, seguindo os passos abaixo. Leva de 10 a 15 minutos.

---

## O que esta versão publicada vai (e não vai) mostrar

**Vai mostrar:** tela de login real, autenticação de verdade contra a API, redirecionamento para um dashboard mínimo confirmando o login.

**Não vai mostrar:** nenhuma tela de Projetos, Notificações ou qualquer funcionalidade de produto — elas ainda não existem (S1-4 em diante, ver `docs/SPRINT_1.md`).

**Limitação importante:** a API está rodando com `InMemoryUserRepository` (usuários de desenvolvimento, não Postgres real) — ver aviso em `apps/api/src/modules/auth/infra/prisma-user.repository.ts`. Isso significa que, na versão publicada:
- Login funciona com o usuário de teste: `socia@escritorio.com` / `senha123`
- **Se o serviço reiniciar (comum em planos gratuitos após período de inatividade), os dados voltam ao estado inicial** — não há persistência real ainda.

---

## Passo 1 — Backend (API) no Railway

1. Crie uma conta em railway.app (tem plano gratuito com limite de horas/mês).
2. `New Project` → `Deploy from GitHub repo` (ou `Empty Project` + upload manual, se o repositório ainda não estiver no GitHub).
3. Se for a partir do GitHub: primeiro suba este repositório para um repositório seu (`git init`, `git remote add origin ...`, `git push`).
4. No Railway, configure:
   - **Root Directory:** `/` (raiz do monorepo)
   - **Build:** aponte o contexto de build para usar `apps/api/Dockerfile`
   - **Start Command:** já definido no `Dockerfile` (`node apps/api/dist/main.js`)
5. Variáveis de ambiente mínimas a configurar no Railway (aba Variables):
   ```
   PORT=3001
   AUTH_SECRET=<gere um valor aleatório longo>
   NODE_ENV=production
   ```
6. Deploy. O Railway vai te dar uma URL pública, algo como `https://seu-projeto.up.railway.app`.
7. Confirme que funcionou: `curl https://seu-projeto.up.railway.app/health` deve retornar `{"status":"ok",...}`.

---

## Passo 2 — Frontend (Web) na Vercel

1. Crie uma conta em vercel.com (plano gratuito é suficiente).
2. `Add New` → `Project` → importe o mesmo repositório do GitHub.
3. Configure:
   - **Root Directory:** `apps/web`
   - **Framework Preset:** Next.js (detectado automaticamente)
4. Variável de ambiente:
   ```
   NEXT_PUBLIC_API_URL=https://seu-projeto.up.railway.app
   ```
   (a URL que o Railway te deu no Passo 1 — sem barra no final)
5. Deploy. A Vercel te dá uma URL pública, algo como `https://seu-projeto.vercel.app`.

---

## Passo 3 — Validar de verdade

1. Abra a URL da Vercel no navegador.
2. Você deve ser redirecionado para `/login`.
3. Entre com `socia@escritorio.com` / `senha123`.
4. Deve redirecionar para `/dashboard`, mostrando "Olá, Sócia (dev)".
5. Se algo der errado nesse fluxo, o mais provável é `NEXT_PUBLIC_API_URL` estar configurada errada na Vercel (erro de CORS ou "failed to fetch" no console do navegador) — confirme a URL exata do backend.

---

## Alternativa mais rápida (sem GitHub): rodar localmente e expor com túnel temporário

Se você quiser validar hoje, sem configurar contas de hospedagem:

```bash
# Rodar a API e o Web localmente (ver README.md principal para setup completo)
npm run dev

# Em outro terminal, expor a porta do frontend publicamente e temporariamente
npx localtunnel --port 3000
```

Isso gera uma URL temporária (tipo `https://algo-aleatorio.loca.lt`), válida enquanto o processo estiver rodando na sua máquina — não é uma solução permanente, mas resolve "quero acessar pelo navegador agora" sem esperar configuração de conta.

---

## O que eu não consegui validar

Nenhum dos dois caminhos acima (Railway/Vercel ou túnel local) foi executado por mim — não tenho as contas nem acesso de rede para isso neste ambiente. As instruções seguem a documentação oficial de cada serviço, mas o primeiro deploy real é quem vai confirmar se algo precisa de ajuste.
