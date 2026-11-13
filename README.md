# EMS Control — Menu Premium V2, sem perder o design original

Esta versão é baseada no ZIP original **Energy Management System Dashboard (Community)** e mantém as páginas Dashboard e Analytics, os seus gráficos, filtros, tabelas e CSS originais.

## Alterações limitadas

- `src/app/components/Sidebar.tsx`: menu lateral premium, com pesquisa, atalhos, expansão, indicador de página e navegação móvel.
- `src/app/components/Layout.tsx`: navegação ligada às cinco páginas, preservando `Dashboard` e `Analytics` originais, sem cabeçalho adicional nem alterações aos componentes existentes.
- `src/app/components/Configuration.tsx`, `Reports.tsx`, `Settings.tsx`: módulos de demonstração adicionais, com dados fictícios e gravação local.
- `src/styles/ems-premium.css`: estilos adicionais isolados nas classes `ems-*`, sem alterar as folhas de estilo originais.

**Dashboard.tsx**, **Analytics.tsx**, **globals.css** e **default_theme.css** são idênticos aos do ZIP original.

## Teste local

```bash
npm install
npm run dev
```

## Publicar no GitHub Pages

No Linux, autentica o GitHub para executar `git push` e corre:

```bash
bash PUBLICAR.sh
```

O script atua **apenas** no repositório público de demonstração `Kiangebene/ems-control-menu-preview`, não nos projetos da WOON GROUP. Por segurança, verifica sempre o destino antes de executar.

Depois abre as definições de GitHub Pages e escolhe **GitHub Actions** como fonte (explicação em `DEPLOY-GITHUB-PAGES.md`).

O site público anterior ainda é uma demonstração HTML simplificada. Este ZIP **não foi publicado automaticamente** e precisa de compilação Vite com dependências npm.

## Dados

Não está ligado a equipamentos. Os novos módulos utilizam dados simulados e armazenamento local. Os gráficos originais conservam as condições do protótipo que enviaste.
