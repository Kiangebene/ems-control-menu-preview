import { Download, Grid2X2, List, Plus, RotateCcw, Search, Star } from 'lucide-react';

export type ResourceView = 'grid' | 'table';
export interface ResourceFilter {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
}

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  filters: ResourceFilter[];
  onFilterChange: (id: string, value: string) => void;
  view: ResourceView;
  onViewChange: (view: ResourceView) => void;
  favoriteOnly: boolean;
  onFavoriteChange: (value: boolean) => void;
  onReset: () => void;
  onExport: () => void;
  onCreate: () => void;
  createLabel: string;
  searchPlaceholder?: string;
  resultsLabel: string;
}

/** Shared resource toolbar: reuse for customers, contacts, companies and deals. */
export function WorkspaceToolbar(props: Props) {
  const {
    search, onSearchChange, filters, onFilterChange, view, onViewChange,
    favoriteOnly, onFavoriteChange, onReset, onExport, onCreate,
    createLabel, searchPlaceholder = 'Pesquisar...', resultsLabel
  } = props;

  return <div className="lg-resource-toolbar" aria-label="Barra de pesquisa e filtros">
    <div className="lg-resource-toolbar-main">
      <label className="lg-resource-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" value={search} onChange={event => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder} aria-label="Pesquisar registos" />
        {search && <button type="button" onClick={() => onSearchChange('')} aria-label="Limpar pesquisa">×</button>}
      </label>
      <div className="lg-resource-toolbar-actions">
        <button type="button" className="lg-resource-button lg-resource-button--primary" onClick={onCreate}>
          <Plus size={16}/> {createLabel}
        </button>
      </div>
    </div>
    <div className="lg-resource-toolbar-sub">
      <div className="lg-resource-filterbar">
        {filters.map(filter => <label key={filter.id} className="lg-resource-select-wrap">
          <span>{filter.label}</span>
          <select aria-label={'Filtrar por ' + filter.label} value={filter.value}
            onChange={event => onFilterChange(filter.id, event.target.value)}>
            {filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>)}
        <button type="button" className={'lg-resource-button lg-resource-favorite' + (favoriteOnly ? ' is-active' : '')}
          aria-pressed={favoriteOnly} onClick={() => onFavoriteChange(!favoriteOnly)}>
          <Star size={15} fill={favoriteOnly ? 'currentColor' : 'none'} /> Favoritos
        </button>
        <button type="button" className="lg-resource-button lg-resource-reset" onClick={onReset}>
          <RotateCcw size={14} /> Limpar
        </button>
      </div>
      <div className="lg-resource-right-actions">
        <span className="lg-resource-results" aria-live="polite">{resultsLabel}</span>
        <div className="lg-resource-view-switch" role="group" aria-label="Modo de visualização">
          <button type="button" aria-label="Vista em cartões" aria-pressed={view === 'grid'}
            className={view === 'grid' ? 'is-active' : ''} onClick={() => onViewChange('grid')}><Grid2X2 size={16}/></button>
          <button type="button" aria-label="Vista em tabela" aria-pressed={view === 'table'}
            className={view === 'table' ? 'is-active' : ''} onClick={() => onViewChange('table')}><List size={16}/></button>
        </div>
        <button type="button" className="lg-resource-button" onClick={onExport}><Download size={15}/> CSV</button>
      </div>
    </div>
  </div>;
}
