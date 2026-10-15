# JR IMPORTADOS — Cloudflare Pages + Functions + D1 + R2

Esta versão substitui o servidor Express/PostgreSQL por Pages Functions (runtime Workers), D1 e R2. Não usa Railway.

## O que foi adaptado
- API `/api/*` implementada em Pages Functions.
- Estado da loja, configurações, histórico e e-mails bloqueados guardados como JSON em D1.
- Upload de fotos/vídeos para o bucket R2, com acesso pela rota `/media/*` quando não configurar domínio público R2.
- Login administrativo com token assinado; defina `ADMIN_PASSWORD` como secret.
- Interface original preservada em `public/`.

## Antes de publicar
1. Instale Node.js LTS no computador e extraia esta pasta.
2. Abra o terminal nesta pasta e rode `npm install`.
3. Entre na Cloudflare: `npx wrangler login`.
4. Crie o banco D1: `npx wrangler d1 create jr-importados-db`. Copie o `database_id` que o comando mostrar para `wrangler.jsonc`, substituindo `PREENCHA_COM_O_ID_DO_D1`.
5. Crie o bucket R2: `npx wrangler r2 bucket create jr-importados-media`.
6. Inicialize a tabela: `npm run db:init:remote`.
7. Crie o projeto Pages chamado `jr-importados` no painel Cloudflare (ou via Wrangler se preferir).
8. Defina o segredo administrativo: `npx wrangler pages secret put ADMIN_PASSWORD --project-name jr-importados` e digite uma senha forte quando solicitado.
9. Publique: `npm run deploy`.

## Importante sobre bindings
O arquivo `wrangler.jsonc` já declara D1 e R2. Se criar/configurar o projeto pelo painel, confirme que os bindings têm exatamente estes nomes:
- D1: `DB` → `jr-importados-db`
- R2: `MEDIA` → `jr-importados-media`

Se o `wrangler pages deploy` pedir que o projeto exista primeiro, crie-o no dashboard Cloudflare Pages com o nome `jr-importados` e depois repita o deploy.

## URL das mídias
Por padrão, o Worker serve os arquivos R2 por `/media/...`, no mesmo domínio da loja. Para usar um domínio público próprio do R2, configure `R2_PUBLIC_URL` como variável no ambiente de produção e publique novamente. O bucket precisa continuar vinculado como `MEDIA`.

## Testes depois de publicar
- Abra a URL `https://SEU-PROJETO.pages.dev/` — deve aparecer a loja.
- Abra `https://SEU-PROJETO.pages.dev/admin` — deve aparecer o painel.
- Faça login com `ADMIN_PASSWORD`.
- Crie uma categoria/produto de teste, atualize a página e veja se os dados persistem.
- Envie uma imagem pequena e confirme se ela aparece na loja.

## Limitações / revisão necessária
- O código de interface original foi preservado, mas a adaptação precisa ser testada com o comportamento real do painel antes de usar em produção.
- A API salva estado da loja como um único registro JSON no D1. Para uma loja pequena isso simplifica a migração; se crescer bastante, é melhor normalizar tabelas.
- A limpeza automática de arquivos R2 que ficaram sem uso no backend antigo ainda não foi portada; apagar um produto pode deixar um arquivo órfão no bucket.
- O banco D1 começa vazio com produtos de demonstração; os dados existentes no PostgreSQL/data.json não são importados automaticamente. Faça a importação dos dados antes de depender da loja em produção.
- Não coloque segredos em `public/` nem no GitHub. `ADMIN_PASSWORD` deve ser cadastrado como secret no Cloudflare.
