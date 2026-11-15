import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  FileText,
  Globe2,
  Layers3,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import "./luxgrowth-overview.css";

type Category = "CRM & Vendas" | "Websites & Conteúdos" | "Agenda & Atividades" | "Marketing & IA" | "Inteligência & Relatórios";

interface ModuleLink {
  title: string;
  description: string;
  category: Category;
  route: string;
  icon: LucideIcon;
  preview: boolean;
}

const modules: ModuleLink[] = [
  {
    title: "Clientes",
    description: "Explora a área de clientes e os controlos disponíveis no protótipo.",
    category: "CRM & Vendas",
    route: "lg/crm-vendas/clientes",
    icon: UsersRound,
    preview: true,
  },
  {
    title: "Prospeção",
    description: "Espaço reservado para a ligação ao fluxo de prospeção do CRM.",
    category: "CRM & Vendas",
    route: "lg/crm-vendas/prospecao",
    icon: Workflow,
    preview: false,
  },
  {
    title: "Os meus websites",
    description: "Organiza e visualiza os websites de exemplo do ambiente demonstrativo.",
    category: "Websites & Conteúdos",
    route: "lg/websites-conteudos/os-meus-websites",
    icon: Globe2,
    preview: true,
  },
  {
    title: "Gestor de Conteúdos (CMS)",
    description: "Consulta páginas e conteúdos de exemplo com as ferramentas do CMS.",
    category: "Websites & Conteúdos",
    route: "lg/websites-conteudos/gestor-de-conteudos-cms",
    icon: FileText,
    preview: true,
  },
  {
    title: "Website Studio — Editor",
    description: "Edita secções e propriedades no editor visual integrado no mesmo painel.",
    category: "Websites & Conteúdos",
    route: "lg/websites-conteudos/website-studio-editor",
    icon: Layers3,
    preview: true,
  },
  {
    title: "Tarefas",
    description: "Área preparada para centralizar as atividades de trabalho.",
    category: "Agenda & Atividades",
    route: "lg/agenda-atividades/tarefas",
    icon: CalendarDays,
    preview: false,
  },
  {
    title: "Marketing",
    description: "Acesso à secção de campanhas, automações e ferramentas de IA.",
    category: "Marketing & IA",
    route: "lg/marketing-ia/marketing",
    icon: Sparkles,
    preview: false,
  },
  {
    title: "Relatórios",
    description: "Área reservada para indicadores e relatórios ligados a dados reais.",
    category: "Inteligência & Relatórios",
    route: "reports",
    icon: LayoutDashboard,
    preview: false,
  },
];

const filters = [
  "Tudo",
  "CRM & Vendas",
  "Websites & Conteúdos",
  "Agenda & Atividades",
  "Marketing & IA",
  "Inteligência & Relatórios",
] as const;

type Filter = typeof filters[number];

const path = (route: string) => "#/" + route;

export function Dashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Tudo");

  const visibleModules = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-PT");
    return modules.filter((module) => {
      const matchesCategory = filter === "Tudo" || filter === module.category;
      const haystack = [module.title, module.description, module.category]
        .join(" ")
        .toLocaleLowerCase("pt-PT");
      return matchesCategory && (!term || haystack.includes(term));
    });
  }, [search, filter]);

  return (
    <section className="lg-overview" aria-labelledby="lg-overview-title">
      <header className="lg-overview-header">
        <div>
          <p className="lg-overview-eyebrow">LUXGROWTH / PRINCIPAL</p>
          <h1 id="lg-overview-title">Visão geral</h1>
          <p className="lg-overview-subtitle">
            O teu espaço de trabalho para clientes, websites, conteúdos e operações.
          </p>
        </div>
        <span className="lg-overview-demo-label">Protótipo público</span>
      </header>

      <div className="lg-overview-note" role="note">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>
          <strong>Ambiente de demonstração.</strong> Os ecrãs disponíveis utilizam dados de exemplo
          ou rascunhos locais. Ainda não existe ligação ao CRM de produção. Não introduzas dados
          confidenciais de clientes neste ambiente público.
        </p>
      </div>

      <div className="lg-overview-summary" aria-label="Estado do protótipo">
        <div className="lg-overview-summary-card">
          <span className="lg-overview-summary-icon"><Layers3 size={20} /></span>
          <div><strong>4 módulos</strong><span>Com ecrãs demonstrativos</span></div>
        </div>
        <div className="lg-overview-summary-card">
          <span className="lg-overview-summary-icon"><Globe2 size={20} /></span>
          <div><strong>Navegação integrada</strong><span>Sem abrir outro website</span></div>
        </div>
        <div className="lg-overview-summary-card">
          <span className="lg-overview-summary-icon"><ShieldCheck size={20} /></span>
          <div><strong>Integração pendente</strong><span>Dados e permissões de produção</span></div>
        </div>
      </div>

      <section className="lg-overview-workspaces" aria-labelledby="lg-overview-workspaces-title">
        <div className="lg-overview-section-title">
          <div>
            <p className="lg-overview-eyebrow">ESPAÇOS DE TRABALHO</p>
            <h2 id="lg-overview-workspaces-title">Aceder aos módulos</h2>
          </div>
          <span aria-live="polite">{visibleModules.length} de {modules.length} módulos</span>
        </div>
        <div className="lg-overview-toolbar">
          <label className="lg-overview-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Pesquisar módulos</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar módulos ou funcionalidades..."
              type="search"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Limpar pesquisa">
                <X size={16} />
              </button>
            )}
          </label>
          <nav className="lg-overview-filters" aria-label="Filtrar por área">
            {filters.map((entry) => (
              <button
                key={entry}
                type="button"
                aria-pressed={filter === entry}
                className={filter === entry ? "is-active" : ""}
                onClick={() => setFilter(entry)}
              >
                {entry}
              </button>
            ))}
          </nav>
        </div>

        {visibleModules.length > 0 ? (
          <div className="lg-overview-module-grid">
            {visibleModules.map((module) => {
              const Icon = module.icon;
              return (
                <a key={module.route} className="lg-overview-module" href={path(module.route)}>
                  <div className="lg-overview-module-head">
                    <span className="lg-overview-module-icon"><Icon size={21} /></span>
                    <ArrowUpRight size={18} className="lg-overview-module-arrow" aria-hidden="true" />
                  </div>
                  <small>{module.category}</small>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <div className="lg-overview-module-foot">
                    <span className={module.preview ? "lg-overview-stage is-demo" : "lg-overview-stage"}>
                      {module.preview ? "Ecrã demonstrativo" : "Em preparação"}
                    </span>
                    <ChevronRight size={17} aria-hidden="true" />
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="lg-overview-empty">
            <Search size={24} aria-hidden="true" />
            <h3>Nenhum módulo encontrado</h3>
            <p>Experimenta outra pesquisa ou escolhe o filtro Tudo.</p>
            <button type="button" onClick={() => { setSearch(""); setFilter("Tudo"); }}>
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <div className="lg-overview-bottom">
        <section className="lg-overview-flow" aria-labelledby="lg-overview-flow-title">
          <div>
            <p className="lg-overview-eyebrow">FLUXO SUGERIDO</p>
            <h2 id="lg-overview-flow-title">Do website ao conteúdo</h2>
            <p>Explora os três ecrãs já disponíveis na mesma interface.</p>
          </div>
          <div className="lg-overview-flow-links">
            <a href={path("lg/websites-conteudos/os-meus-websites")}>1. Os meus websites <ChevronRight size={16} /></a>
            <a href={path("lg/websites-conteudos/gestor-de-conteudos-cms")}>2. Gestor de Conteúdos <ChevronRight size={16} /></a>
            <a href={path("lg/websites-conteudos/website-studio-editor")}>3. Website Studio <ChevronRight size={16} /></a>
          </div>
        </section>
        <section className="lg-overview-integration" aria-labelledby="lg-overview-integration-title">
          <div className="lg-overview-summary-icon"><ShieldCheck size={21} /></div>
          <h2 id="lg-overview-integration-title">Próxima fase: CRM real</h2>
          <p>
            Manter esta interface e ligar gradualmente autenticação,
            permissões, empresas e dados reais no ambiente protegido,
            sem substituir componentes funcionais.
          </p>
          <a href={path("lg/crm-vendas/clientes")}>Ver área de clientes <ArrowUpRight size={16} /></a>
        </section>
      </div>
    </section>
  );
}
