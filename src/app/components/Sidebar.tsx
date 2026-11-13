import { useEffect, useRef, useState } from "react";
import {
  Activity, BarChart3, ChevronsLeft, ChevronsRight, CircleHelp, FileText,
  LayoutDashboard, Menu, Moon, Plus, Search, Settings2, SlidersHorizontal,
  Sun, UserRound, X, Zap
} from "lucide-react";

export const navigationItems = [
  { id: "dashboard", name: "Dashboard", description: "Visão geral de energia", icon: LayoutDashboard, shortcut: "1" },
  { id: "analytics", name: "Analytics", description: "Análise de consumo", icon: BarChart3, shortcut: "2" },
  { id: "configuration", name: "Configuration", description: "Gestão de dispositivos", icon: SlidersHorizontal, shortcut: "3" },
  { id: "reports", name: "Reports", description: "Relatórios e exportação", icon: FileText, shortcut: "4" },
  { id: "settings", name: "Settings & Profile", description: "Preferências e perfil", icon: Settings2, shortcut: "5" },
] as const;

export type PageId = (typeof navigationItems)[number]["id"];

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  userName: string;
}

export function Sidebar({ currentPage, onPageChange, isDark, onThemeToggle, userName }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function navigate(page: PageId) {
    onPageChange(page);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setQuery("");
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === "/" || (event.metaKey && event.key.toLowerCase() === "k")) &&
          !(event.target instanceof HTMLInputElement) &&
          !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.altKey && /^[1-5]$/.test(event.key)) {
        event.preventDefault();
        onPageChange(navigationItems[Number(event.key) - 1].id);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setHelpOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPageChange]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const results = navigationItems.filter(item => `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase().trim()));
  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map(name => name[0]?.toUpperCase()).join("") || "EM";

  return <>
    <aside className={`ems-sidebar ${isExpanded ? "ems-sidebar--expanded" : ""}`} aria-label="Menu principal">
      <div className="ems-sidebar__top">
        <button className="ems-sidebar__brand" onClick={() => navigate("dashboard")} title="EMS Control — Dashboard" aria-label="Ir para o Dashboard">
          <Zap size={21} strokeWidth={2.35} />
        </button>
        {isExpanded && <div className="ems-sidebar__wordmark"><strong>ems control</strong><small>Energy workspace</small></div>}
        <button className="ems-sidebar__expand" onClick={() => setIsExpanded(x => !x)} title={isExpanded ? "Recolher menu" : "Expandir menu"} aria-label={isExpanded ? "Recolher menu" : "Expandir menu"}>
          {isExpanded ? <ChevronsLeft size={17}/> : <ChevronsRight size={16}/>}
        </button>
      </div>

      <div className="ems-sidebar__divider" />
      <div className="ems-sidebar__quick">
        <button className="ems-sidebar__link" onClick={() => setSearchOpen(true)} title="Pesquisar módulos (/)" aria-label="Pesquisar módulos">
          <Search size={19}/>{isExpanded && <span>Pesquisar <kbd>/</kbd></span>}
        </button>
        <button className="ems-sidebar__link" onClick={() => navigate("configuration")} title="Gerir dispositivos" aria-label="Gerir dispositivos">
          <Plus size={20}/>{isExpanded && <span>Gerir dispositivos</span>}
        </button>
      </div>
      {isExpanded && <p className="ems-sidebar__section-title">WORKSPACE</p>}
      <nav className="ems-sidebar__nav" aria-label="Áreas da aplicação">
        {navigationItems.map(({ id, name, icon: Icon, shortcut }) => <button
          type="button" key={id} onClick={() => navigate(id)}
          className={`ems-sidebar__link ems-sidebar__nav-link ${currentPage === id ? "is-active" : ""}`}
          title={`${name} (Alt+${shortcut})`} aria-label={name} aria-current={currentPage === id ? "page" : undefined}
        >
          <Icon size={19} strokeWidth={currentPage === id ? 2.3 : 1.8}/>
          {isExpanded && <><span>{name}</span><kbd>⌥{shortcut}</kbd></>}
          {!isExpanded && currentPage === id && <i className="ems-sidebar__active-dot"/>}
        </button>)}
      </nav>
      <div className="ems-sidebar__bottom">
        <div className="ems-sidebar__divider" />
        <button className="ems-sidebar__link" onClick={() => setHelpOpen(true)} title="Atalhos e ajuda" aria-label="Atalhos e ajuda">
          <CircleHelp size={19}/>{isExpanded && <span>Ajuda e atalhos</span>}
        </button>
        <button className="ems-sidebar__link" onClick={onThemeToggle} title={isDark ? "Ativar tema claro" : "Ativar tema escuro"} aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}>
          {isDark ? <Sun size={19}/> : <Moon size={19}/>}{isExpanded && <span>{isDark ? "Tema claro" : "Tema escuro"}</span>}
        </button>
        <button className={`ems-sidebar__profile ${currentPage === "settings" ? "is-selected" : ""}`} onClick={() => navigate("settings")} title={`${userName} — Preferências`} aria-label="Abrir perfil">
          <span className="ems-sidebar__avatar">{initials}</span>
          {isExpanded && <span className="ems-sidebar__profile-name"><strong>{userName}</strong><small>Conta de demonstração</small></span>}
          {isExpanded && <UserRound size={15}/>}
        </button>
      </div>
    </aside>

    <div className="ems-mobilebar" aria-label="Navegação móvel">
      <button className="ems-mobilebar__menu" title="Mais opções" onClick={() => setMobileMenuOpen(x => !x)}><Menu size={19}/></button>
      {navigationItems.map(({ id, name, icon: Icon }) => <button key={id} className={currentPage === id ? "is-active" : ""} onClick={() => navigate(id)} title={name} aria-label={name} aria-current={currentPage === id ? "page" : undefined}><Icon size={20}/></button>)}
      <button title="Pesquisar" aria-label="Pesquisar" onClick={() => setSearchOpen(true)}><Search size={19}/></button>
    </div>
    {mobileMenuOpen && <div className="ems-mobilemenu"><button onClick={() => {onThemeToggle();setMobileMenuOpen(false);}}>{isDark ? <Sun size={18}/> : <Moon size={18}/>} Alternar tema</button><button onClick={() => {setHelpOpen(true);setMobileMenuOpen(false);}}><CircleHelp size={18}/> Ajuda e atalhos</button></div>}

    {searchOpen && <div className="ems-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSearchOpen(false); }}>
      <div className="ems-command" role="dialog" aria-modal="true" aria-label="Pesquisar módulos">
        <div className="ems-command__input"><Search size={20}/><input ref={searchRef} placeholder="Pesquisar uma área do dashboard..." value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {if (event.key === "Enter" && results[0]) navigate(results[0].id);}}/><button onClick={() => setSearchOpen(false)} aria-label="Fechar pesquisa"><X size={19}/></button></div>
        <p className="ems-command__hint">MÓDULOS DISPONÍVEIS</p>
        <div className="ems-command__results">{results.length ? results.map(({ id, name, icon: Icon, description, shortcut }) => <button key={id} onClick={() => navigate(id)} className={currentPage === id ? "is-selected" : ""}><Icon size={18}/><span><strong>{name}</strong><small>{description}</small></span><kbd>Alt+{shortcut}</kbd></button>) : <p className="ems-command__empty">Nenhum módulo encontrado.</p>}</div>
        <div className="ems-command__footer"><span>↵ para abrir</span><span>Esc para fechar</span></div>
      </div>
    </div>}
    {helpOpen && <div className="ems-overlay" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) setHelpOpen(false);}}><div className="ems-command ems-command--help" role="dialog" aria-modal="true" aria-label="Ajuda e atalhos"><div className="ems-command__input"><Activity size={19}/><strong>Ajuda e atalhos</strong><button onClick={() => setHelpOpen(false)} aria-label="Fechar"><X size={19}/></button></div><div className="ems-shortcuts"><p><span>Pesquisar páginas</span><kbd>/</kbd></p><p><span>Abrir pesquisa</span><kbd>⌘ K</kbd></p><p><span>Navegar pelos 5 módulos</span><kbd>Alt + 1–5</kbd></p><p><span>Fechar janelas</span><kbd>Esc</kbd></p></div><div className="ems-command__footer">Protótipo com dados de demonstração · sem ligação a sensores ou servidores</div></div></div>}
  </>;
}
