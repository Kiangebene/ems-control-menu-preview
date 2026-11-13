import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Sparkles } from 'lucide-react';
import { destinationFor, luxMenu, routeFor, type LuxItem } from './luxgrowth-menu-data';

interface Props {
  currentPage: string;
  onPageChange: (route: string) => void;
}

/** Contextual Solvik-style tabs: one row per workspace section, without cluttering the sidebar. */
export function LuxGrowthTopNav({ currentPage, onPageChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const destination = destinationFor(currentPage);
  const section = luxMenu.find(item => item.label === destination?.section) ?? luxMenu[0];

  const isSelected = (node: LuxItem): boolean => {
    if (routeFor(section.id, node.label) === currentPage) return true;
    return !!node.children?.some(isSelected);
  };
  const parent = useMemo(() => section.items.find(item => {
    const match = (node: LuxItem): boolean => routeFor(section.id, node.label) === currentPage || !!node.children?.some(match);
    return match(item);
  }), [section, currentPage]);

  useEffect(() => {
    const active = scrollRef.current?.querySelector<HTMLElement>('[data-primary-selected="true"]');
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [section.id, currentPage]);

  // Apenas apresentar as setas quando existirem módulos fora da área visível.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const measure = () => setCanScroll(element.scrollWidth > element.clientWidth + 3);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [section.id]);

  const scroll = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: direction * 310, behavior: 'smooth' });
  };
  const rootRoute = (node: LuxItem) => routeFor(section.id, node.label);

  return <header className="lg-topnav" aria-label="Navegação de módulos">
    <div className="lg-topnav-primary">
      <div className="lg-topnav-caption" title={section.label}>
        <Layers size={16} /><span>{section.label}</span>
      </div>
      <div className="lg-topnav-tabs-wrap">
        {canScroll && <button className="lg-topnav-scroll" type="button" aria-label="Ver módulos anteriores" onClick={() => scroll(-1)}><ChevronLeft size={16} /></button>}
        <div className="lg-topnav-tabs" ref={scrollRef} role="tablist" aria-label={'Módulos de ' + section.label}>
          {section.items.map(node => {
            const selected = isSelected(node);
            const route = rootRoute(node);
            return <button key={route} type="button" role="tab" data-primary-selected={selected}
              aria-selected={selected} className={'lg-topnav-tab' + (selected ? ' is-active' : '')}
              onClick={() => onPageChange(route)} title={node.label}>
              <span>{node.label}</span>{node.soon && <span className="lg-topnav-soon">Breve</span>}
            </button>;
          })}
        </div>
        {canScroll && <button className="lg-topnav-scroll" type="button" aria-label="Ver próximos módulos" onClick={() => scroll(1)}><ChevronRight size={16} /></button>}
      </div>
      <div className="lg-topnav-brand" title="LuxGrowth Growth OS"><Sparkles size={16} /><span>Growth OS</span></div>
    </div>
    {!!parent?.children?.length && <nav className="lg-topnav-secondary" aria-label={'Submódulos de ' + parent.label}>
      <span className="lg-topnav-secondary-label">{parent.label}</span>
      <div className="lg-topnav-secondary-items">
        {parent.children.map(sub => {
          const route = routeFor(section.id, sub.label);
          return <button type="button" key={route} onClick={() => onPageChange(route)}
            className={'lg-topnav-subtab' + (currentPage === route ? ' is-active' : '')}
            aria-current={currentPage === route ? 'page' : undefined}>
            {sub.label}{sub.soon && <span className="lg-topnav-soon">Breve</span>}
          </button>;
        })}
      </div>
    </nav>}
  </header>;
}