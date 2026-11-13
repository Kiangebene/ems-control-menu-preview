# LuxGrowth — Navegação híbrida V2 (teste isolado)

## Ideia
- Sidebar: apenas grupos principais, com ícones; expandir/recolher mostra ou oculta os nomes dos grupos.
- Barra horizontal: módulos do grupo ativo; itens em excesso podem ser percorridos na horizontal.
- Segunda linha: submódulos de Conteúdos (website) e Projetos.
- Ao mudar de módulo, a página é selecionada por URL (`#/...`) e o seu grupo surge ativo no menu.
- Pesquisa (`/` ou Ctrl+K), tema escuro/claro, menu móvel e marcação "Breve".
- Dashboard e Analytics: componentes existentes, não reimplementados.
- Restantes módulos sem backend real: ecrãs demonstrativos.

## Instalação sem substituir projetos anteriores

```bash
cd ~/src
git clone --branch feat/luxgrowth-horizontal-menu-v2 --single-branch \
  https://github.com/Kiangebene/ems-control-menu-preview.git LUXGROWTH-NAV-HORIZONTAL
cd LUXGROWTH-NAV-HORIZONTAL
npm install
npm run dev -- --host 127.0.0.1
```

Abra o URL indicado pelo Vite. Os dados são de demonstração. Não é necessário utilizar `PUBLICAR.sh`.

## Casos de teste
1. Clique em Principal na barra lateral. Deve ver Visão geral / Fila de trabalho / Agenda no topo.
2. Clique em CRM & Vendas. A barra superior deve mostrar 8 módulos e permitir scroll.
3. Clique em Clientes, Pipeline, Empresas e verifique o estado selecionado.
4. Clique em Websites & Conteúdos > Conteúdos. Surge segunda linha com Biblioteca multimédia, Definições do website e Histórico e publicação.
5. Clique em Projetos & Operações > Projetos. Surge segunda linha com os submódulos.
6. Use pesquisa (`/`), expanda/recolha a barra lateral e teste a mudança do tema.
7. No telemóvel, use o botão LuxGrowth para escolher um grupo e a barra superior para escolher o módulo.

Esta branch é uma prova de conceito de navegação; não alterou `main` nem o site público atual.