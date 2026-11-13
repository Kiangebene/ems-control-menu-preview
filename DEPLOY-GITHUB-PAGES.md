# EMS Control V2 — original preservado

O código original de `Dashboard.tsx` e `Analytics.tsx` foi mantido sem alterações, juntamente com `globals.css` e `default_theme.css`. O menu premium está em `Sidebar.tsx` e o estilo foi separado em `src/styles/ems-premium.css` para não alterar os componentes existentes.

## Publicação no GitHub Pages

O Vite está configurado para `/ems-control-menu-preview/`. Para publicar em GitHub Pages via Actions, adicionar o projeto ao repositório (sem a pasta `node_modules`) e criar `.github/workflows/pages.yml`:

```yaml
name: Publicar EMS Control
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Nota: nas definições do repositório, mudar **Pages -> Build and deployment -> Source** para **GitHub Actions**. A versão HTML simplificada anteriormente publicada não inclui estes componentes e precisa de ser substituída por este build.

Os módulos novos Configuration, Reports, Settings usam dados fictícios e armazenamento local; não comandam equipamentos.
