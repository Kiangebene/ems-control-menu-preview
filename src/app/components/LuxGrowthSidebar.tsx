import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3, CalendarDays, ChevronLeft, ChevronRight, CircleHelp,
  FolderKanban, Globe2, Home, Menu, MessageSquareText, Moon,
  Plus, Search, Settings2, Sparkles, Sun, UsersRound, Wallet,
  X, Layers3, ChevronDown, type LucideIcon
} from 'lucide-react';
import { destinations, luxMenu, routeFor, type LuxItem } from './luxgrowth-menu-data';

const ICONS: Record<string, LucideIcon> = {
  home: Home, users: UsersRound, globe: Globe2, sparkles: Sparkles,
  messages: MessageSquareText, calendar: CalendarDays, folder: FolderKanban,
  wallet: Wallet, chart: BarChart3, settings: Settings2,
  plus: Plus, help: CircleHelp
};

const LOGO = 'data:image/png;base64,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 ';

interface Props {
  currentPage: string;
  onPageChange: (page: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  userName: string;
}

/** Rail contains only product sections; module tabs belong to LuxGrowthTopNav. */
export function LuxGrowthSidebar({ currentPage, onPageChange, isDark, onThemeToggle, userName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const input = useRef<HTMLInputElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const section = useMemo(() => {
    const destination = destinations.find(d => d.route === currentPage);
    return luxMenu.find(s => s.label === destination?.section)?.id ?? 'principal';
  }, [currentPage]);

  const navigate = (route: string) => {
    onPageChange(route);
    setSearchOpen(false);
    setMobileOpen(false);
    setQuery('');
  };
  const selectSection = (sectionId: string) => {
    const entry = luxMenu.find(s => s.id === sectionId);
    const first = entry?.items[0];
    if (entry && first && section !== sectionId) {
      navigate(routeFor(entry.id, first.label));
    }
    setMobileOpen(false);
  };

  useEffect(() => { if (searchOpen) input.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault(); setSearchOpen(true);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false); }
      if (e.altKey && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const routes = ['dashboard', 'lg/crm-vendas/clientes', 'lg/agenda-atividades/tarefas', 'analytics', 'settings'];
        navigate(routes[Number(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPageChange]);

  // Optional disclosure of the same modules shown in the persistent top navigation.
  const renderModule = (node: LuxItem, sectionId: string, depth = 0) => {
    const route = routeFor(sectionId, node.label);
    const isCurrent = currentPage === route;
    const parentActive = !!node.children?.some(child =>
      currentPage === routeFor(sectionId, child.label)
    );
    const opened = expandedGroups[route] ?? (isCurrent || parentActive);
    return <div key={route} className="lg-vertical-node">
      <div className={'lg-vertical-line' + (isCurrent ? ' is-selected' : '')}>
        <button type="button" className={'lg-vertical-link' + (isCurrent ? ' is-selected' : '')}
          style={{ paddingLeft: 10 + depth * 14 }}
          onClick={() => {
            navigate(route);
            if (node.children?.length) setExpandedGroups(previous => ({...previous, [route]: !opened}));
          }}
          aria-current={isCurrent ? 'page' : undefined}
          title={node.label}>
          <span className="lg-vertical-name">{node.label}</span>
          {node.soon && <span className="lg-soon">Breve</span>}
        </button>
        {!!node.children?.length && <button type="button" className="lg-vertical-nest-toggle"
          aria-label={(opened ? 'Fechar ' : 'Abrir ') + node.label}
          aria-expanded={opened}
          onClick={() => setExpandedGroups(previous => ({...previous, [route]: !opened}))}>
          <ChevronDown size={13} className={opened ? '' : 'lg-nest-closed'} />
        </button>}
      </div>
      {!!node.children?.length && opened && <div className="lg-vertical-children">
        {node.children.map(child => renderModule(child, sectionId, depth + 1))}
      </div>}
    </div>;
  };

  const filtered = destinations.filter(d =>
    (d.label + ' ' + d.section).toLocaleLowerCase('pt-PT').includes(query.toLocaleLowerCase('pt-PT').trim())
  ).slice(0, 35);
  const initials = userName.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase()).join('') || 'LG';

  return <div className={'lg-shell' + (expanded ? ' lg-shell-expanded' : '')}>
    <aside className={'lg-sidebar lg-sidebar--rail lg-sidebar--unified' + (mobileOpen ? ' lg-sidebar-mobile-open' : '')} aria-label="Navegação principal LuxGrowth">
      <div className="lg-sidebar-top">
        <button className="lg-brand" title="LuxGrowth — Visão geral" aria-label="LuxGrowth — Visão geral" onClick={() => navigate('dashboard')}>
          <img src={LOGO.trim()} alt="" />
        </button>
        <div className="lg-when-expanded lg-wordmark"><strong>LuxGrowth</strong><small>Growth OS</small></div>
        <button className="lg-collapse" type="button" aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
          title={expanded ? 'Recolher menu' : 'Expandir menu'} onClick={() => setExpanded(v => !v)}>
          {expanded ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
        </button>
      </div>
      <div className="lg-sidebar-search">
        <button type="button" className="lg-searchbutton" onClick={() => setSearchOpen(true)} aria-label="Pesquisar módulos" title="Pesquisar módulos (/)">
          <Search size={19} /><span className="lg-when-expanded">Pesquisar módulos <kbd>/</kbd></span>
        </button>
      </div>
      <nav className="lg-nav lg-nav--sections" aria-label="Grupos de módulos">
        {luxMenu.map(s => {
          const Icon = ICONS[s.icon] ?? Layers3;
          const isOpen = openSections[s.id] ?? false;
          return <div className="lg-section-container" key={s.id}>
            <div className="lg-section-row">
              <button type="button" className={'lg-groupbtn lg-rail-item' + (section === s.id ? ' is-current' : '')}
                aria-label={s.label} title={s.label} aria-current={section === s.id ? 'page' : undefined}
                onClick={() => selectSection(s.id)}>
                <Icon size={19} strokeWidth={section === s.id ? 2.2 : 1.8} />
                <span className="lg-when-expanded lg-group-name">{s.label}</span>
                {section === s.id && <i className="lg-rail-indicator" aria-hidden="true" />}
              </button>
              {expanded && <button type="button" className="lg-section-disclosure"
                title={(isOpen ? 'Ocultar' : 'Mostrar') + ' módulos de ' + s.label}
                aria-label={(isOpen ? 'Ocultar' : 'Mostrar') + ' módulos de ' + s.label}
                aria-expanded={isOpen}
                onClick={() => setOpenSections(previous => ({ ...previous, [s.id]: !isOpen }))}>
                <ChevronDown size={15} className={isOpen ? '' : 'lg-nest-closed'}/>
              </button>}
            </div>
            {expanded && isOpen && <div className="lg-vertical-list">
              {s.items.map(node => renderModule(node, s.id))}
            </div>}
          </div>;
        })}
      </nav>
      <div className="lg-sidebar-bottom">
        <button type="button" title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={onThemeToggle}>
          <span>{isDark ? <Sun size={18} /> : <Moon size={18} />}</span><span className="lg-when-expanded">{isDark ? 'Tema claro' : 'Tema escuro'}</span>
        </button>
        <button type="button" title="Ajuda e suporte" onClick={() => selectSection('ajuda-suporte')}>
          <CircleHelp size={18} /><span className="lg-when-expanded">Ajuda e suporte</span>
        </button>
        <button type="button" title="Perfil e definições" onClick={() => navigate('settings')}>
          <span className="lg-user-avatar">{initials}</span><span className="lg-when-expanded">{userName}</span>
        </button>
      </div>
    </aside>

    <button type="button" className="lg-mobile-trigger" onClick={() => { setExpanded(true); setMobileOpen(v => !v); }} aria-label="Abrir grupos do LuxGrowth">
      <Menu size={20} /><span>LuxGrowth</span>
    </button>
    {mobileOpen && <button className="lg-mobile-overlay" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}

    {searchOpen && <div className="lg-search-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
      <div className="lg-search-dialog" role="dialog" aria-modal="true" aria-label="Pesquisar módulos">
        <div className="lg-search-head"><Search size={20} />
          <input ref={input} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) navigate(filtered[0].route); }}
            placeholder="Pesquisar no LuxGrowth..." aria-label="Nome do módulo" />
          <button aria-label="Fechar pesquisa" onClick={() => setSearchOpen(false)}><X size={18} /></button>
        </div>
        <div className="lg-search-results">{filtered.length ? filtered.map(d =>
          <button key={d.route} type="button" onClick={() => navigate(d.route)}>
            <span><strong>{d.label}</strong><small>{d.section}</small></span>
            {d.soon && <span className="lg-soon">Breve</span>}
          </button>
        ) : <p>Não foi encontrado nenhum módulo.</p>}</div>
        <div className="lg-search-foot">Enter para abrir · Esc para fechar</div>
      </div>
    </div>}
  </div>;
}