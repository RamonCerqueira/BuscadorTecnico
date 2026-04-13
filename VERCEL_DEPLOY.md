# Vercel Deploy (Monorepo)

Se a Vercel estiver exibindo versão antiga, normalmente o projeto está com Root Directory incorreto.

## 1) Ajustar projeto na Vercel

- Framework Preset: **Next.js**
- Root Directory: **apps/web**
- Build Command: `pnpm --filter @buscador/web build`
- Install Command: `pnpm install --no-frozen-lockfile`

## 2) Variáveis necessárias

- `NEXT_PUBLIC_API_URL` apontando para sua API NestJS em produção.

## 3) Forçar rebuild limpo

- Na Vercel: Deployments → `...` → **Redeploy**
- Marcar opção de limpar cache de build.

## 4) Conferir branch e output

- Branch de produção deve ser a branch principal atual.
- Verificar logs: precisa construir `apps/web` e não o legado Flask.
