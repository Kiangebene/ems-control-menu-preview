import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, Copy, Edit3, ExternalLink, FilePenLine, Globe2, LayoutTemplate, Monitor, PanelTop, Search, Star, Trash2, X } from 'lucide-react';
import { WorkspaceToolbar, type ResourceView } from '../WorkspaceToolbar';

type WebsiteStatus = 'Publicado' | 'Rascunho' | 'Em revisão';
type WebsiteType = 'Institucional' | 'Landing page' | 'Loja' | 'Portfólio';
type Website = {
  id: string;
  name: string;
  domain: string;
  status: WebsiteStatus;
  category: WebsiteType;
  language: string;
  pages: number;
  accent: string;
  description: string;
  favorite: boolean;
  updatedAt: string;
};
type WebsiteDraft = Pick<Website, 'name' | 'domain' | 'status' | 'category' | 'language' | 'pages' | 'accent' | 'description'>;

const KEY = 'luxgrowth-websites-prototype-v1';
const DATE = '2026-11-10T09:00:00.000Z';
const DEMO: Website[] = [
  {id:'site-demo-1',name:'Aurora Design',domain:'aurora.example',status:'Publicado',category:'Institucional',language:'Português',pages:6,accent:'#bfd987',description:'Uma presença digital feita para comunicar com clareza.',favorite:true,updatedAt:DATE},
  {id:'site-demo-2',name:'Nord Commerce',domain:'nord-commerce.example',status:'Em revisão',category:'Loja',language:'Francês',pages:12,accent:'#a8cff2',description:'Uma loja preparada para uma experiência simples e fluida.',favorite:false,updatedAt:DATE},
  {id:'site-demo-3',name:'Studio Alfa',domain:'studio-alfa.example',status:'Rascunho',category:'Portfólio',language:'Inglês',pages:4,accent:'#efb7a9',description:'Portfólio com identidade marcante.',favorite:true,updatedAt:DATE},
  {id:'site-demo-4',name:'Green Logistics',domain:'green-logistics.example',status:'Publicado',category:'Institucional',language:'Francês',pages:8,accent:'#9fdec0',description:'Soluções modernas para cadeias de distribuição.',favorite:false,updatedAt:DATE},
  {id:'site-demo-5',name:'Vista Imobiliária',domain:'vista-imobiliaria.example',status:'Em revisão',category:'Landing page',language:'Português',pages:3,accent:'#f1d18c',description:'Imóveis e experiências para novos começos.',favorite:false,updatedAt:DATE},
  {id:'site-demo-6',name:'Nova Services',domain:'nova-services.example',status:'Rascunho',category:'Institucional',language:'Alemão',pages:5,accent:'#d2bce8',description:'Serviços com foco em pessoas e resultados.',favorite:false,updatedAt:DATE}
];
const EMPTY: WebsiteDraft = {name:'',domain:'',status:'Rascunho',category:'Institucional',language:'Português',pages:1,accent:'#c9f36a',description:''};

const read = (): Website[] => {
  try {
    const saved = localStorage.getItem(KEY);
    if (!saved) return DEMO;
    const value: unknown = JSON.parse(saved);
    return Array.isArray(value) && value.every(site => site && typeof site.id === 'string' && typeof site.name === 'string') ? value as Website[] : DEMO;
  } catch { return DEMO; }
};
const formatDate = (iso: string) => {
  try { return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(iso)); }
  catch { return '—'; }
};
const csvCell = (value: string | number) => {
  const v = String(value ?? '');
  const safe = /^[=+@\-\t\r]/.test(v) ? "'" + v : v;
  return '"' + safe.replace(/"/g,'""') + '"';
};
function saveCsv(rows: Website[]) {
  const columns = ['Website','Domínio','Estado','Tipo','Idioma','Páginas','Última atualização'];
  const content = [columns.map(csvCell).join(';'), ...rows.map(site => [site.name,site.domain,site.status,site.category,site.language,site.pages,site.updatedAt].map(csvCell).join(';'))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF'+content],{type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a'); a.href=url; a.download='luxgrowth-websites-demo.csv'; a.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function cleanDomain(text: string) {
  return text.trim().replace(/^https?:\/\//i,'').replace(/\/$/,'').toLowerCase();
}
function WebsiteCover({site}:{site:Website}) {
  return <div className="lg-website-cover" style={{'--site-accent':site.accent} as React.CSSProperties} aria-hidden="true">
    <div className="lg-website-browser">
      <div className="lg-website-browser-bar"><span/><span/><span/><div>{site.domain}</div></div>
      <div className="lg-website-mock">
        <div className="lg-website-mock-nav"><span>{site.name}</span><span>Início　Sobre　Contactos</span></div>
        <div className="lg-website-mock-hero">
          <small>{site.category}</small><strong>{site.name}</strong>
          <div className="lg-website-mock-copy" />
          <div className="lg-website-mock-cta"/>
        </div>
      </div>
    </div>
  </div>;
}
export function WebsitesPage() {
  const [sites,setSites]=useState<Website[]>(read);
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('todos');
  const [category,setCategory]=useState('todos');
  const [sort,setSort]=useState('updated');
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [view,setView]=useState<ResourceView>('grid');
  const [draft,setDraft]=useState<WebsiteDraft>(EMPTY);
  const [editing,setEditing]=useState<string|null>(null);
  const [modalOpen,setModalOpen]=useState(false);
  const [preview,setPreview]=useState<Website|null>(null);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');

  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(sites));},[sites]);
  const filtered = useMemo(()=>{
    const q=query.trim().toLocaleLowerCase('pt-PT');
    return sites.filter(site=>
      (!q || [site.name,site.domain,site.description,site.category].some(s=>s.toLocaleLowerCase('pt-PT').includes(q))) &&
      (status==='todos'||site.status===status) &&
      (category==='todos'||site.category===category) &&
      (!favoritesOnly||site.favorite)
    ).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'pt'):sort==='pages'?b.pages-a.pages:b.updatedAt.localeCompare(a.updatedAt));
  },[sites,query,status,category,sort,favoritesOnly]);
  const stats=useMemo(()=>({
    count:sites.length,published:sites.filter(s=>s.status==='Publicado').length,
    pending:sites.filter(s=>s.status!=='Publicado').length,
    pages:sites.reduce((sum,s)=>sum+s.pages,0)
  }),[sites]);

  const toggleFavorite=(id:string)=>setSites(prev=>prev.map(s=>s.id===id?{...s,favorite:!s.favorite}:s));
  const create=()=>{setDraft({...EMPTY});setEditing(null);setError('');setModalOpen(true)};
  const edit=(site:Website)=>{setEditing(site.id);setDraft({name:site.name,domain:site.domain,status:site.status,category:site.category,language:site.language,pages:site.pages,accent:site.accent,description:site.description});setError('');setModalOpen(true)};
  const remove=(site:Website)=>{if(window.confirm('Eliminar '+site.name+' desta demonstração local?'))setSites(prev=>prev.filter(s=>s.id!==site.id))};
  const changeStatus=(site:Website)=>{
    const next:WebsiteStatus=site.status==='Publicado'?'Rascunho':'Publicado';
    setSites(prev=>prev.map(s=>s.id===site.id?{...s,status:next,updatedAt:new Date().toISOString()}:s));
    setNotice(next==='Publicado'?'Estado alterado para Publicado apenas nesta demonstração. Nenhum website foi colocado online.':'Website marcado como rascunho nesta demonstração.');
  };
  const save=(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const name=draft.name.trim(),domain=cleanDomain(draft.domain);
    if(!name || !domain){setError('Preenche o nome e o domínio.');return;}
    if(!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)){setError('Introduz um domínio válido, por exemplo: empresa.example');return;}
    if(sites.some(s=>s.domain===domain && s.id!==editing)){setError('Já existe um website com este domínio.');return;}
    const data:WebsiteDraft={...draft,name,domain,description:draft.description.trim(),pages:Math.max(1,Math.min(1000,Math.floor(Number(draft.pages)||1)))};
    if(editing){
      setSites(prev=>prev.map(s=>s.id===editing?{...s,...data,updatedAt:new Date().toISOString()}:s));
    } else {
      const id=typeof crypto!=='undefined' && 'randomUUID' in crypto?crypto.randomUUID():'site-local-'+Date.now();
      setSites(prev=>[{...data,id,favorite:false,updatedAt:new Date().toISOString()},...prev]);
    }
    setModalOpen(false);setNotice('Alteração guardada localmente. Não foi publicado nenhum website.');
  };
  const showPreview=(site:Website)=>{setNotice('');setPreview(site)};
  const copyDomain=async(domain:string)=>{
    try{await navigator.clipboard.writeText(domain);setNotice('Domínio copiado.');}
    catch{setNotice('Não foi possível copiar automaticamente.');}
  };

  return <section className="lg-workspace lg-websites-workspace" aria-labelledby="lg-websites-heading">
    <div className="lg-workspace-intro">
      <div><span className="lg-workspace-eyebrow">LUXGROWTH / WEBSITES & CONTEÚDOS</span>
      <h1 id="lg-websites-heading">Os meus websites</h1>
      <p>Organiza os websites, acompanha o estado e prepara a publicação.</p></div>
      <span className="lg-demo-indicator">● Demonstração local</span>
    </div>
    <div className="lg-workspace-metrics lg-websites-metrics">
      <div className="lg-workspace-metric"><div><Globe2 size={18}/><span>Websites registados</span></div><strong>{stats.count}</strong><small>No protótipo</small></div>
      <div className="lg-workspace-metric"><div><Check size={18}/><span>Marcados como publicados</span></div><strong>{stats.published}</strong><small>Estado demonstrativo</small></div>
      <div className="lg-workspace-metric"><div><FilePenLine size={18}/><span>Em preparação</span></div><strong>{stats.pending}</strong><small>Rascunho e revisão · {stats.pages} páginas registadas</small></div>
    </div>
    <WorkspaceToolbar search={query} onSearchChange={setQuery} searchPlaceholder="Pesquisar por website, domínio ou categoria..."
      filters={[
        {id:'status',label:'Estado',value:status,options:[{value:'todos',label:'Todos os estados'},{value:'Publicado',label:'Publicado'},{value:'Rascunho',label:'Rascunho'},{value:'Em revisão',label:'Em revisão'}]},
        {id:'category',label:'Tipo',value:category,options:[{value:'todos',label:'Todos os tipos'},{value:'Institucional',label:'Institucional'},{value:'Landing page',label:'Landing page'},{value:'Loja',label:'Loja'},{value:'Portfólio',label:'Portfólio'}]},
        {id:'sort',label:'Ordenar',value:sort,options:[{value:'updated',label:'Mais recentes'},{value:'name',label:'Nome A–Z'},{value:'pages',label:'Mais páginas'}]}
      ]}
      onFilterChange={(id,value)=>{if(id==='status')setStatus(value);else if(id==='category')setCategory(value);else if(id==='sort')setSort(value)}}
      view={view} onViewChange={setView} favoriteOnly={favoritesOnly} onFavoriteChange={setFavoritesOnly}
      onReset={()=>{setQuery('');setStatus('todos');setCategory('todos');setSort('updated');setFavoritesOnly(false)}}
      onExport={()=>saveCsv(filtered)} onCreate={create} createLabel="Novo website"
      resultsLabel={filtered.length+' de '+sites.length+' websites'}/>
    {notice && <div className="lg-website-notice" role="status">{notice}<button type="button" onClick={()=>setNotice('')} aria-label="Fechar mensagem">×</button></div>}
    {!filtered.length ? <div className="lg-workspace-empty"><Search size={28}/><h2>Não foram encontrados websites</h2><p>Altera os filtros ou adiciona um website.</p><button type="button" onClick={()=>{setQuery('');setStatus('todos');setCategory('todos');setFavoritesOnly(false)}}>Limpar filtros</button></div>
    :view==='grid'?<div className="lg-websites-grid">{filtered.map(site=><article className="lg-website-card" key={site.id}>
      <WebsiteCover site={site}/>
      <div className="lg-website-card-content">
        <div className="lg-website-card-title"><div><h2>{site.name}</h2><span>{site.domain}</span></div>
          <button type="button" className={'lg-client-star'+(site.favorite?' is-active':'')} onClick={()=>toggleFavorite(site.id)} aria-label={'Favorito '+site.name}><Star size={17} fill={site.favorite?'currentColor':'none'}/></button>
        </div>
        <p>{site.description||'Website sem descrição.'}</p>
        <div className="lg-website-tags"><span className={'lg-website-status lg-website-status--'+(site.status==='Publicado'?'published':site.status==='Rascunho'?'draft':'review')}>{site.status}</span><span>{site.category}</span><span>{site.pages} páginas</span></div>
        <div className="lg-website-meta"><span>{site.language}</span><span>Atualizado: {formatDate(site.updatedAt)}</span></div>
        <div className="lg-website-actions"><button type="button" onClick={()=>showPreview(site)}><Monitor size={15}/> Pré-visualizar</button>
          <button type="button" onClick={()=>edit(site)}><Edit3 size={15}/> Editar</button>
          <button type="button" className="lg-website-icon-action" onClick={()=>remove(site)} aria-label={'Eliminar '+site.name}><Trash2 size={15}/></button></div>
      </div></article>)}</div>
    :<div className="lg-client-table-wrap"><table className="lg-client-table lg-website-table"><thead><tr><th>Website</th><th>Tipo</th><th>Estado</th><th>Idioma</th><th>Páginas</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>{filtered.map(site=><tr key={site.id}>
      <td><div className="lg-website-table-name"><span className="lg-website-table-mark" style={{background:site.accent}}><Globe2 size={16}/></span><span><strong>{site.name}</strong><small>{site.domain}</small></span></div></td><td>{site.category}</td>
      <td><span className={'lg-website-status lg-website-status--'+(site.status==='Publicado'?'published':site.status==='Rascunho'?'draft':'review')}>{site.status}</span></td>
      <td>{site.language}</td><td>{site.pages}</td><td>{formatDate(site.updatedAt)}</td>
      <td><div className="lg-client-table-actions"><button type="button" onClick={()=>showPreview(site)} aria-label={'Pré-visualizar '+site.name}><Monitor size={15}/></button><button type="button" onClick={()=>edit(site)} aria-label={'Editar '+site.name}><Edit3 size={15}/></button><button type="button" onClick={()=>remove(site)} aria-label={'Eliminar '+site.name}><Trash2 size={15}/></button></div></td>
      </tr>)}</tbody></table></div>}
    <p className="lg-workspace-note">Protótipo independente: os websites e domínios são ilustrativos. Guardado neste navegador, sem ligação ao Website Studio real, Firebase ou alojamento.</p>
    {modalOpen && <div className="lg-client-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setModalOpen(false)}}>
      <div className="lg-client-modal" role="dialog" aria-modal="true" aria-labelledby="lg-website-form-title">
        <header><div><span className="lg-workspace-eyebrow">WEBSITES / GESTÃO</span><h2 id="lg-website-form-title">{editing?'Editar website':'Novo website'}</h2></div><button type="button" onClick={()=>setModalOpen(false)} aria-label="Fechar formulário"><X size={20}/></button></header>
        <form onSubmit={save}><div className="lg-client-form-grid">
          <label>Nome <input required autoFocus maxLength={90} value={draft.name} onChange={event=>setDraft({...draft,name:event.target.value})}/></label>
          <label>Domínio <input required maxLength={120} value={draft.domain} placeholder="empresa.example" onChange={event=>setDraft({...draft,domain:event.target.value})}/></label>
          <label>Categoria <select value={draft.category} onChange={event=>setDraft({...draft,category:event.target.value as WebsiteType})}><option>Institucional</option><option>Landing page</option><option>Loja</option><option>Portfólio</option></select></label>
          <label>Estado <select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as WebsiteStatus})}><option>Rascunho</option><option>Em revisão</option><option>Publicado</option></select></label>
          <label>Idioma <select value={draft.language} onChange={event=>setDraft({...draft,language:event.target.value})}><option>Português</option><option>Francês</option><option>Inglês</option><option>Alemão</option><option>Luxemburguês</option><option>Espanhol</option></select></label>
          <label>Número de páginas <input type="number" min={1} max={1000} value={draft.pages} onChange={event=>setDraft({...draft,pages:Number(event.target.value)})}/></label>
          <label>Cor da marca <input type="color" value={draft.accent} onChange={event=>setDraft({...draft,accent:event.target.value})}/></label>
          <label className="lg-website-full-field">Descrição <textarea rows={3} maxLength={240} value={draft.description} onChange={event=>setDraft({...draft,description:event.target.value})}/></label>
        </div>{error && <p className="lg-client-form-error" role="alert">{error}</p>}
        <footer><button type="button" onClick={()=>setModalOpen(false)}>Cancelar</button><button type="submit" className="lg-resource-button--primary">{editing?'Guardar alterações':'Adicionar website'} <ArrowUpRight size={15}/></button></footer>
        </form></div></div>}
    {preview && <div className="lg-client-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setPreview(null)}}>
      <div className="lg-client-modal lg-website-preview-modal" role="dialog" aria-modal="true" aria-labelledby="lg-website-preview-title">
        <header><div><span className="lg-workspace-eyebrow">PRÉ-VISUALIZAÇÃO LOCAL</span><h2 id="lg-website-preview-title">{preview.name}</h2></div><button type="button" onClick={()=>setPreview(null)} aria-label="Fechar pré-visualização"><X size={20}/></button></header>
        <WebsiteCover site={preview}/><div className="lg-website-preview-info"><p>{preview.description}</p>
          <div><span>{preview.status}</span><span>{preview.category}</span><span>{preview.pages} páginas</span></div></div>
        <footer><button type="button" onClick={()=>copyDomain(preview.domain)}><Copy size={15}/> Copiar domínio</button>
        <button type="button" className="lg-resource-button--primary" onClick={()=>{setPreview(null);edit(preview)}}><Edit3 size={15}/> Editar configuração</button></footer>
        <p className="lg-workspace-note">Esta é uma maquete, não uma pré-visualização do Website Studio real.</p>
      </div></div>}
  </section>;
}
