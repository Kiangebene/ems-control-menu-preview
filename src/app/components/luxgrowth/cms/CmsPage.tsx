import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Copy, Edit3, Eye, FileText, Globe2, LayoutTemplate, Save, Trash2, X } from 'lucide-react';
import { WorkspaceToolbar, type ResourceView } from '../WorkspaceToolbar';

type ContentStatus='Rascunho'|'Em revisão'|'Publicado';
type ContentType='Página'|'Artigo'|'Bloco';
type Content={id:string; websiteId:string; title:string; slug:string; type:ContentType; status:ContentStatus; language:string; excerpt:string; body:string; favorite:boolean; updatedAt:string};
type Draft=Pick<Content,'websiteId'|'title'|'slug'|'type'|'status'|'language'|'excerpt'|'body'>;
type Website={id:string;name:string;domain:string};
const CONTENT_KEY='luxgrowth-cms-prototype-v1';
const WEBSITE_KEY='luxgrowth-websites-prototype-v1';
const SAMPLE_SITES:Website[]=[
  {id:'site-demo-1',name:'Aurora Design',domain:'aurora.example'},
  {id:'site-demo-2',name:'Nord Commerce',domain:'nord-commerce.example'},
  {id:'site-demo-3',name:'Studio Alfa',domain:'studio-alfa.example'},
  {id:'site-demo-4',name:'Green Logistics',domain:'green-logistics.example'}
];
const EXAMPLE_DATE='2026-11-11T09:00:00.000Z';
const DEMO:Content[]=[
  {id:'cms-demo-1',websiteId:'site-demo-1',title:'Página inicial',slug:'inicio',type:'Página',status:'Publicado',language:'Português',excerpt:'Descobre o nosso universo criativo.',body:'A Aurora Design cria identidades digitais e experiências pensadas para pessoas reais.\n\nExplore os nossos serviços e projetos.',favorite:true,updatedAt:EXAMPLE_DATE},
  {id:'cms-demo-2',websiteId:'site-demo-1',title:'Os nossos serviços',slug:'servicos',type:'Página',status:'Em revisão',language:'Português',excerpt:'Estratégia, identidade e design.',body:'Apresentação dos serviços e das áreas de especialização.',favorite:false,updatedAt:EXAMPLE_DATE},
  {id:'cms-demo-3',websiteId:'site-demo-2',title:'Novidades da loja',slug:'novidades',type:'Artigo',status:'Rascunho',language:'Francês',excerpt:'Uma seleção de novas coleções.',body:'Conteúdo editorial da loja (apenas demonstração).',favorite:false,updatedAt:EXAMPLE_DATE},
  {id:'cms-demo-4',websiteId:'site-demo-3',title:'Portfólio',slug:'portfolio',type:'Página',status:'Publicado',language:'Inglês',excerpt:'Trabalhos e projetos selecionados.',body:'Seleção de trabalhos e projetos em destaque.',favorite:true,updatedAt:EXAMPLE_DATE},
  {id:'cms-demo-5',websiteId:'site-demo-4',title:'Sobre nós',slug:'sobre-nos',type:'Página',status:'Em revisão',language:'Francês',excerpt:'A nossa missão e equipa.',body:'Conheça a nossa missão e os nossos valores.',favorite:false,updatedAt:EXAMPLE_DATE}
];
const empty=(websiteId:string):Draft=>({websiteId,title:'',slug:'',type:'Página',status:'Rascunho',language:'Português',excerpt:'',body:''});
function fromStorage<T>(key:string, fallback:T):T{
  try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback;}catch{return fallback;}
}
const slugify=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const formatted=(s:string)=>{try{return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s));}catch{return '—';}};
function csv(rows:Content[],siteName:(id:string)=>string){
  const cell=(input:string)=>{const safe=/^[=+@\-\t\r]/.test(input)?"'"+input:input;return '"'+safe.replace(/"/g,'""')+'"';};
  const lines=[['Título','Website','Slug','Tipo','Estado','Idioma','Descrição','Atualização'].map(cell).join(';'),...rows.map(c=>[c.title,siteName(c.websiteId),c.slug,c.type,c.status,c.language,c.excerpt,c.updatedAt].map(cell).join(';'))].join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='luxgrowth-cms-demo.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function CmsPage(){
  const [contents,setContents]=useState<Content[]>(()=>fromStorage(CONTENT_KEY,DEMO));
  const [websites,setWebsites]=useState<Website[]>(SAMPLE_SITES);
  const [search,setSearch]=useState('');
  const [siteFilter,setSiteFilter]=useState('todos');
  const [statusFilter,setStatusFilter]=useState('todos');
  const [typeFilter,setTypeFilter]=useState('todos');
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [view,setView]=useState<ResourceView>('table');
  const [editingId,setEditingId]=useState<string|null>(null);
  const [draft,setDraft]=useState<Draft>(()=>empty(SAMPLE_SITES[0].id));
  const [editorOpen,setEditorOpen]=useState(false);
  const [preview,setPreview]=useState<Content|null>(null);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    const items=fromStorage<Website[]>(WEBSITE_KEY,SAMPLE_SITES);
    setWebsites(Array.isArray(items)?items.filter(item=>item&&typeof item.id==='string'&&typeof item.name==='string'):SAMPLE_SITES);
  },[]);
  useEffect(()=>{localStorage.setItem(CONTENT_KEY,JSON.stringify(contents));},[contents]);
  const siteName=(id:string)=>websites.find(site=>site.id===id)?.name??'Website não encontrado';
  const filtered=useMemo(()=>contents.filter(c=>
    (!search.trim()||[c.title,c.slug,c.excerpt,c.body].some(value=>value.toLocaleLowerCase('pt').includes(search.toLocaleLowerCase('pt'))))&&
    (siteFilter==='todos'||c.websiteId===siteFilter)&&
    (statusFilter==='todos'||c.status===statusFilter)&&
    (typeFilter==='todos'||c.type===typeFilter)&&(!favoritesOnly||c.favorite)
  ).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),[contents,search,siteFilter,statusFilter,typeFilter,favoritesOnly]);
  const openNew=()=>{
    if(!websites.length){setMessage('Cria primeiro um website em Os meus websites.');return;}
    setEditingId(null);setDraft(empty(siteFilter==='todos'?websites[0].id:siteFilter));setError('');setEditorOpen(true);
  };
  const edit=(content:Content)=>{
    setEditingId(content.id);
    setDraft({websiteId:content.websiteId,title:content.title,slug:content.slug,type:content.type,status:content.status,language:content.language,excerpt:content.excerpt,body:content.body});
    setError('');setEditorOpen(true);
  };
  const save=(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const title=draft.title.trim();const slug=slugify(draft.slug.trim()||title);
    if(!title||!slug){setError('Preenche o título e o slug.');return;}
    if(!websites.some(site=>site.id===draft.websiteId)){setError('Seleciona um website existente.');return;}
    if(contents.some(c=>c.id!==editingId&&c.websiteId===draft.websiteId&&c.slug===slug)){setError('Este slug já está a ser usado neste website.');return;}
    const clean={...draft,title,slug,excerpt:draft.excerpt.trim(),body:draft.body.trim(),updatedAt:new Date().toISOString()};
    if(editingId)setContents(previous=>previous.map(c=>c.id===editingId?{...c,...clean}:c));
    else{const id=typeof crypto!=='undefined'&&'randomUUID' in crypto?crypto.randomUUID():'cms-'+Date.now();setContents(previous=>[{...clean,id,favorite:false},...previous]);}
    setEditorOpen(false);setMessage('Conteúdo guardado neste navegador. Nenhuma página foi publicada na Internet.');
  };
  const deleteContent=(item:Content)=>{
    if(window.confirm('Eliminar "'+item.title+'" desta demonstração local?'))setContents(previous=>previous.filter(c=>c.id!==item.id));
  };
  const clone=(item:Content)=>{
    const id=typeof crypto!=='undefined'&&'randomUUID' in crypto?crypto.randomUUID():'cms-'+Date.now();
    const slug=slugify(item.slug+'-copia-'+Date.now().toString(36));
    setContents(previous=>[{...item,id,title:item.title+' (cópia)',slug,status:'Rascunho',favorite:false,updatedAt:new Date().toISOString()},...previous]);
    setMessage('Cópia criada como rascunho local.');
  };
  const changeStatus=(item:Content,status:ContentStatus)=>{
    setContents(previous=>previous.map(c=>c.id===item.id?{...c,status,updatedAt:new Date().toISOString()}:c));
    setMessage(status==='Publicado'?'Marcado como Publicado apenas no protótipo. Não foi efetuado deploy.':'Estado atualizado localmente.');
  };
  const metrics={total:contents.length,published:contents.filter(c=>c.status==='Publicado').length,draft:contents.filter(c=>c.status==='Rascunho').length};
  return <section className="lg-workspace lg-cms-workspace" aria-labelledby="lg-cms-title">
    <div className="lg-workspace-intro"><div>
      <span className="lg-workspace-eyebrow">LUXGROWTH / WEBSITES & CONTEÚDOS</span>
      <h1 id="lg-cms-title">Gestor de Conteúdos (CMS)</h1>
      <p>Organiza páginas, artigos e conteúdos por website.</p>
    </div><span className="lg-demo-indicator">● Demonstração local</span></div>
    <div className="lg-workspace-metrics">
      <div className="lg-workspace-metric"><div><FileText size={18}/><span>Conteúdos</span></div><strong>{metrics.total}</strong><small>Em todos os websites</small></div>
      <div className="lg-workspace-metric"><div><Globe2 size={18}/><span>Marcados como publicados</span></div><strong>{metrics.published}</strong><small>Sem publicação real</small></div>
      <div className="lg-workspace-metric"><div><Edit3 size={18}/><span>Rascunhos</span></div><strong>{metrics.draft}</strong><small>Guardados localmente</small></div>
    </div>
    <WorkspaceToolbar
      search={search} onSearchChange={setSearch} searchPlaceholder="Pesquisar título, slug ou conteúdo..."
      filters={[
        {id:'website',label:'Website',value:siteFilter,options:[{value:'todos',label:'Todos os websites'},...websites.map(s=>({value:s.id,label:s.name}))]},
        {id:'status',label:'Estado',value:statusFilter,options:[{value:'todos',label:'Todos os estados'},...(['Rascunho','Em revisão','Publicado'] as const).map(s=>({value:s,label:s}))]},
        {id:'type',label:'Tipo',value:typeFilter,options:[{value:'todos',label:'Todos os tipos'},...(['Página','Artigo','Bloco'] as const).map(s=>({value:s,label:s}))]}
      ]}
      onFilterChange={(id,value)=>{if(id==='website')setSiteFilter(value);else if(id==='status')setStatusFilter(value);else setTypeFilter(value);}}
      view={view} onViewChange={setView} favoriteOnly={favoritesOnly} onFavoriteChange={setFavoritesOnly}
      onReset={()=>{setSearch('');setSiteFilter('todos');setStatusFilter('todos');setTypeFilter('todos');setFavoritesOnly(false);}}
      onExport={()=>csv(filtered,siteName)} onCreate={openNew} createLabel="Novo conteúdo"
      resultsLabel={filtered.length+' de '+contents.length+' conteúdos'}
    />
    {message&&<div className="lg-website-notice" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Fechar mensagem">×</button></div>}
    {!filtered.length?<div className="lg-workspace-empty"><BookOpen size={28}/><h2>Nenhum conteúdo encontrado</h2><p>Altera os filtros ou cria um conteúdo.</p><button onClick={()=>{setSearch('');setSiteFilter('todos');setStatusFilter('todos');setTypeFilter('todos');setFavoritesOnly(false);}}>Limpar filtros</button></div>
    :view==='grid'?<div className="lg-cms-grid">{filtered.map(c=><article className="lg-cms-card" key={c.id}>
      <div className="lg-cms-card-banner"><span><LayoutTemplate size={17}/>{c.type}</span><span className={'lg-website-status lg-website-status--'+(c.status==='Publicado'?'published':c.status==='Rascunho'?'draft':'review')}>{c.status}</span></div>
      <div className="lg-cms-card-body"><h2>{c.title}</h2><small>{siteName(c.websiteId)} · /{c.slug}</small><p>{c.excerpt||'Sem resumo.'}</p>
      <div className="lg-cms-card-meta"><CalendarDays size={14}/>{formatted(c.updatedAt)} · {c.language}</div>
      <div className="lg-cms-actions"><button onClick={()=>setPreview(c)}><Eye size={15}/> Ver</button><button onClick={()=>edit(c)}><Edit3 size={15}/> Editar</button>
      <button aria-label={'Duplicar '+c.title} onClick={()=>clone(c)}><Copy size={15}/></button>
      <button aria-label={'Eliminar '+c.title} onClick={()=>deleteContent(c)}><Trash2 size={15}/></button></div></div></article>)}</div>
    :<div className="lg-client-table-wrap"><table className="lg-client-table lg-cms-table"><thead><tr><th>Conteúdo</th><th>Website</th><th>Tipo</th><th>Estado</th><th>Idioma</th><th>Atualizado</th><th>Ações</th></tr></thead><tbody>{filtered.map(c=><tr key={c.id}>
      <td><div className="lg-cms-cell-title"><strong>{c.title}</strong><small>/{c.slug}</small></div></td><td>{siteName(c.websiteId)}</td><td>{c.type}</td>
      <td><span className={'lg-website-status lg-website-status--'+(c.status==='Publicado'?'published':c.status==='Rascunho'?'draft':'review')}>{c.status}</span></td>
      <td>{c.language}</td><td>{formatted(c.updatedAt)}</td><td><div className="lg-client-table-actions"><button aria-label="Pré-visualizar" onClick={()=>setPreview(c)}><Eye size={15}/></button><button aria-label="Editar" onClick={()=>edit(c)}><Edit3 size={15}/></button><button aria-label="Duplicar" onClick={()=>clone(c)}><Copy size={15}/></button><button aria-label="Eliminar" onClick={()=>deleteContent(c)}><Trash2 size={15}/></button></div></td>
    </tr>)}</tbody></table></div>}
    <p className="lg-workspace-note">Protótipo local: os conteúdos são fictícios e os estados de publicação não alteram websites reais, CMS de produção ou bases de dados.</p>
    {editorOpen&&<div className="lg-client-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setEditorOpen(false);}}>
      <div className="lg-client-modal lg-cms-editor-modal" role="dialog" aria-modal="true" aria-labelledby="lg-cms-form-heading">
        <header><div><span className="lg-workspace-eyebrow">CMS / EDITOR</span><h2 id="lg-cms-form-heading">{editingId?'Editar conteúdo':'Novo conteúdo'}</h2></div><button type="button" aria-label="Fechar editor" onClick={()=>setEditorOpen(false)}><X size={19}/></button></header>
        <form onSubmit={save}><div className="lg-client-form-grid">
          <label>Website <select required value={draft.websiteId} onChange={e=>setDraft({...draft,websiteId:e.target.value})}>{websites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Tipo <select value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value as ContentType})}><option>Página</option><option>Artigo</option><option>Bloco</option></select></label>
          <label>Título <input required maxLength={130} autoFocus value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value,slug:!editingId&&!draft.slug?slugify(e.target.value):draft.slug})}/></label>
          <label>Slug <input required maxLength={130} value={draft.slug} onChange={e=>setDraft({...draft,slug:slugify(e.target.value)})}/></label>
          <label>Estado <select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as ContentStatus})}><option>Rascunho</option><option>Em revisão</option><option>Publicado</option></select></label>
          <label>Idioma <select value={draft.language} onChange={e=>setDraft({...draft,language:e.target.value})}><option>Português</option><option>Francês</option><option>Inglês</option><option>Alemão</option><option>Espanhol</option></select></label>
          <label className="lg-website-full-field">Resumo <textarea rows={2} maxLength={300} value={draft.excerpt} onChange={e=>setDraft({...draft,excerpt:e.target.value})}/></label>
          <label className="lg-website-full-field">Corpo do conteúdo (texto simples) <textarea className="lg-cms-body-textarea" rows={8} value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})}/></label>
        </div>{error&&<p className="lg-client-form-error" role="alert">{error}</p>}
        <footer><button type="button" onClick={()=>setEditorOpen(false)}>Cancelar</button><button type="submit" className="lg-resource-button--primary"><Save size={15}/> Guardar localmente</button></footer></form>
      </div></div>}
    {preview&&<div className="lg-client-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPreview(null);}}>
      <div className="lg-client-modal lg-cms-preview-modal" role="dialog" aria-modal="true" aria-labelledby="lg-cms-preview-heading">
        <header><div><span className="lg-workspace-eyebrow">PRÉ-VISUALIZAÇÃO · {siteName(preview.websiteId)}</span><h2 id="lg-cms-preview-heading">{preview.title}</h2></div><button type="button" aria-label="Fechar pré-visualização" onClick={()=>setPreview(null)}><X size={19}/></button></header>
        <div className="lg-cms-preview-meta"><span>{preview.type}</span><span>{preview.language}</span><span>{preview.status}</span><span>/{preview.slug}</span></div>
        <p className="lg-cms-preview-excerpt">{preview.excerpt}</p><div className="lg-cms-preview-body">{preview.body||'Sem conteúdo.'}</div>
        <footer><button type="button" onClick={()=>{clone(preview);setPreview(null);}}><Copy size={15}/> Duplicar</button>
        <button type="button" onClick={()=>{const item=preview;setPreview(null);edit(item);}}><Edit3 size={15}/> Editar</button>
        <button type="button" className="lg-resource-button--primary" onClick={()=>{changeStatus(preview,preview.status==='Publicado'?'Rascunho':'Publicado');setPreview(null);}}>
          <Globe2 size={15}/> {preview.status==='Publicado'?'Marcar rascunho':'Marcar publicado (demo)'}
        </button></footer>
        <p className="lg-workspace-note">A pré-visualização mostra texto local, sem renderizar HTML enviado pelo utilizador e sem publicação real.</p>
      </div></div>}
  </section>;
}
