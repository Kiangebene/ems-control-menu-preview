import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Copy, Download, Eye, FileText, Globe2, GripVertical, ImageIcon, LayoutTemplate, Monitor, Plus, Redo2, RotateCcw, Save, Smartphone, Trash2, Type, Undo2 } from 'lucide-react';
import { previewNativeBlocks } from './nativeBlockAdapter';
import { LocalMediaLibrary, usePreviewMedia } from './LocalMediaLibrary';

type Site = { id: string; name: string; domain: string; accent?: string; description?: string };
type CmsContent = { id: string; websiteId: string; title: string; body: string; excerpt: string; type?: string; slug?: string };
type SectionKind = 'hero' | 'text' | 'features' | 'cta';
type HeroImageSettings = {opacityPct?:number;positionX?:number;positionY?:number;fit?:'cover'|'contain'};
type Section = {
  id: string; kind: SectionKind; kicker: string; title: string; body: string;
  buttonLabel: string; buttonHref?:string; items: string[]; mediaId?:string; heroImage?:HeroImageSettings; presentation?:{backgroundColor?:string;color?:string;textAlign?:'left'|'center'|'right';paddingTopPx?:number;paddingBottomPx?:number;fontFamily?:string;fontSizePx?:number;fontWeight?:number;lineHeight?:number};
};
type Device = 'desktop' | 'mobile';
const SITE_KEY = 'luxgrowth-websites-prototype-v1';
const CMS_KEY = 'luxgrowth-cms-prototype-v1';
const DRAFT_KEY = 'luxgrowth-website-studio-drafts-v1';
const FALLBACK_SITES: Site[] = [
  { id: 'site-demo-1', name: 'Aurora Design', domain: 'aurora.example', accent: '#bfd987', description: 'Uma presença digital feita para comunicar com clareza.' },
  { id: 'site-demo-2', name: 'Nord Commerce', domain: 'nord-commerce.example', accent: '#a8cff2', description: 'Uma loja feita para os seus clientes.' },
  { id: 'site-demo-3', name: 'Studio Alfa', domain: 'studio-alfa.example', accent: '#efb7a9', description: 'Portfólio criativo.' },
  { id: 'site-demo-4', name: 'Green Logistics', domain: 'green-logistics.example', accent: '#9fdec0', description: 'Logística moderna.' },
];
const FALLBACK_CONTENT: CmsContent[] = [
  { id: 'cms-demo-1', websiteId: 'site-demo-1', title: 'Página inicial', excerpt: 'Descobre o nosso universo criativo.', body: 'A Aurora Design cria identidades digitais e experiências pensadas para pessoas reais.', type: 'Página', slug: 'inicio' },
  { id: 'cms-demo-2', websiteId: 'site-demo-1', title: 'Os nossos serviços', excerpt: 'Estratégia, identidade e design.', body: 'Descobre os serviços da Aurora Design.', type: 'Página', slug: 'servicos' },
  { id: 'cms-demo-4', websiteId: 'site-demo-3', title: 'Portfólio', excerpt: 'Trabalhos selecionados.', body: 'Explore os nossos trabalhos.', type: 'Página', slug: 'portfolio' },
];
const TYPES: { kind: SectionKind; label: string; detail: string }[] = [
  { kind: 'hero', label: 'Hero', detail: 'Título, texto e botão' },
  { kind: 'text', label: 'Texto', detail: 'Conteúdo editorial' },
  { kind: 'features', label: 'Benefícios', detail: 'Três colunas de destaques' },
  { kind: 'cta', label: 'Chamada à ação', detail: 'Mensagem e botão' },
];
const blockId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'section-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
const copySections = (items: Section[]) => items.map(item => ({ ...item, items: [...item.items],heroImage:item.heroImage?{...item.heroImage}:undefined,presentation:item.presentation?{...item.presentation}:undefined }));
function fromStorage<T>(key: string, fallback: T): T {
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
function getSites(): Site[] {
  const items = fromStorage<Site[]>(SITE_KEY, FALLBACK_SITES);
  return Array.isArray(items) ? items.filter(s => s && typeof s.id === 'string' && typeof s.name === 'string') : FALLBACK_SITES;
}
function getContents(): CmsContent[] {
  const items = fromStorage<CmsContent[]>(CMS_KEY, FALLBACK_CONTENT);
  return Array.isArray(items) ? items.filter(c => c && typeof c.id === 'string' && typeof c.websiteId === 'string' && (c.type === 'Página' || !c.type)) : FALLBACK_CONTENT;
}
function makeSection(kind: SectionKind, page?: CmsContent): Section {
  const title = page?.title || 'O teu próximo projeto começa aqui';
  switch (kind) {
    case 'hero': return { id:blockId(),kind,kicker:'BEM-VINDO',title,body:page?.excerpt || 'Uma experiência digital feita para pessoas.',buttonLabel:'Descobrir mais',buttonHref:'#contacto',items:[] };
    case 'features': return { id:blockId(),kind,kicker:'O QUE FAZEMOS',title:'A nossa diferença',body:'Conhece o que nos torna únicos.',buttonLabel:'',items:['Qualidade e atenção','Soluções personalizadas','Resultados com impacto'] };
    case 'cta': return { id:blockId(),kind,kicker:'VAMOS CONVERSAR',title:'Preparado para começar?',body:'Fala connosco e descobre como podemos ajudar.',buttonLabel:'Entrar em contacto',buttonHref:'#contacto',items:[] };
    case 'text': return { id:blockId(),kind,kicker:'SOBRE NÓS',title:'A nossa história',body:page?.body || 'Conta a história da tua marca e apresenta os teus serviços.',buttonLabel:'',items:[] };
  }
}
function initialSections(page?: CmsContent) {
  return [makeSection('hero', page), makeSection('features'), makeSection('text', page), makeSection('cta')];
}
function existingDrafts(): Record<string, Section[]> {
  const value = fromStorage<Record<string, Section[]>>(DRAFT_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function safeLink(value:string):boolean {
  const href=value.trim();
  return /^#[a-zA-Z0-9_-]{1,80}$/.test(href) || /^\/(?!\/)[a-zA-Z0-9/_#?=&.%-]{0,300}$/.test(href) || /^https:\/\/[a-zA-Z0-9.-]+(?::443)?(?:\/[a-zA-Z0-9/_#?=&.%-]*)?$/.test(href);
}
function sectionLabel(kind: SectionKind) { return TYPES.find(t=>t.kind===kind)?.label || kind; }
function EditorPreview({ sections, selectedId, onSelect, site, device, mediaUrls }: {
  sections: Section[];selectedId:string|null;onSelect:(id:string)=>void;site:Site;device:Device;mediaUrls:Record<string,string>
}) {
  return <div className={'lg-studio-viewport lg-studio-viewport--'+device} style={{'--studio-accent':site.accent || '#c9f36a'} as CSSProperties}>
    <div className="lg-studio-preview-browser">
      <div className="lg-studio-browser-top"><span/><span/><span/><small>{site.domain || 'website.example'}</small></div>
      <div className="lg-studio-preview-navigation"><strong>{site.name}</strong><span>Início　 Serviços　 Contactos</span></div>
      {sections.map((section,index)=><section className={'lg-studio-render lg-studio-render--'+section.kind+(section.id===selectedId?' is-selected':'')} key={section.id} style={{backgroundColor:section.presentation?.backgroundColor||undefined,color:section.presentation?.color||undefined,textAlign:section.presentation?.textAlign||undefined,'--lg-pad-top':section.presentation?.paddingTopPx===undefined?undefined:section.presentation.paddingTopPx+'px','--lg-pad-bottom':section.presentation?.paddingBottomPx===undefined?undefined:section.presentation.paddingBottomPx+'px',
  '--lg-title-font':section.presentation?.fontFamily||undefined,
  '--lg-title-size':section.presentation?.fontSizePx===undefined?undefined:section.presentation.fontSizePx+'px',
  '--lg-title-weight':section.presentation?.fontWeight||undefined,
  '--lg-title-leading':section.presentation?.lineHeight||undefined} as CSSProperties}>
        <button type="button" className="lg-studio-render-edit" onClick={()=>onSelect(section.id)}
          aria-label={'Editar secção '+(index+1)+': '+sectionLabel(section.kind)}>Editar <span>{index+1}</span></button>
        {section.kind==='hero' && <div className="lg-studio-hero">
          {section.mediaId&&mediaUrls[section.mediaId]&&<img className="lg-studio-hero-media" src={mediaUrls[section.mediaId]} alt=""
            style={{opacity:(section.heroImage?.opacityPct??22)/100,objectPosition:(section.heroImage?.positionX??50)+'% '+(section.heroImage?.positionY??50)+'%',objectFit:section.heroImage?.fit??'cover'}} />}
          <small>{section.kicker}</small><h2>{section.title}</h2><p>{section.body}</p><span className="lg-studio-cta-button" title={section.buttonHref&&safeLink(section.buttonHref)?'Destino configurado: '+section.buttonHref:'Botão demonstrativo sem destino validado'}>{section.buttonLabel || 'Saiba mais'}</span>
          <div className="lg-studio-hero-orb" aria-hidden="true"/>
        </div>}
        {section.kind==='text' && <div className="lg-studio-text-section">
          <small>{section.kicker}</small><h2>{section.title}</h2><p>{section.body}</p>
        </div>}
        {section.kind==='features' && <div className="lg-studio-features-section">
          <small>{section.kicker}</small><h2>{section.title}</h2><p>{section.body}</p>
          <div className="lg-studio-features-grid">{section.items.map((item,i)=><div key={i}><span>0{i+1}</span><strong>{item}</strong></div>)}</div>
        </div>}
        {section.kind==='cta' && <div className="lg-studio-cta-section">
          <small>{section.kicker}</small><h2>{section.title}</h2><p>{section.body}</p><span className="lg-studio-cta-button" title={section.buttonHref&&safeLink(section.buttonHref)?'Destino configurado: '+section.buttonHref:'Botão demonstrativo sem destino validado'}>{section.buttonLabel || 'Contactar'}</span>
        </div>}
      </section>)}
      {!sections.length && <div className="lg-studio-empty-canvas">Adiciona a primeira secção no painel lateral.</div>}
      <div className="lg-studio-site-footer">© {site.name} · Demonstração local</div>
    </div>
  </div>;
}

export function WebsiteStudioPage() {
  const [sites] = useState<Site[]>(getSites);
  const [pages] = useState<CmsContent[]>(getContents);
  const [siteId,setSiteId] = useState(()=>getSites()[0]?.id || '');
  const site = sites.find(s=>s.id===siteId);
  const availablePages = useMemo(()=>{
    const entries=pages.filter(p=>p.websiteId===siteId);
    return entries.length ? entries : [{id:'virtual-home-'+siteId,websiteId:siteId,title:'Página inicial',excerpt:site?.description || '',body:'',type:'Página'}];
  },[pages,siteId,site?.description]);
  const [pageId,setPageId] = useState(()=>getContents().find(p=>p.websiteId===getSites()[0]?.id)?.id||'virtual-home-'+(getSites()[0]?.id||''));
  const effectivePageId=availablePages.some(p=>p.id===pageId)?pageId:availablePages[0]?.id||'';
  const page=availablePages.find(p=>p.id===effectivePageId);
  const draftKey=siteId+':'+effectivePageId;
  const [blocks,setBlocks]=useState<Section[]>([]);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [device,setDevice]=useState<Device>('desktop');
  const [undo,setUndo]=useState<Section[][]>([]);
  const [redo,setRedo]=useState<Section[][]>([]);
  const [dirty,setDirty]=useState(false);
  const [message,setMessage]=useState('');
  const [showHelp,setShowHelp]=useState(false);
  const [draggedId,setDraggedId]=useState<string|null>(null);
  const [mediaOpen,setMediaOpen]=useState(false);
  const media=usePreviewMedia(siteId);
  const mediaUrls=useMemo(()=>Object.fromEntries(media.items.map(item=>[item.id,item.url])),[media.items]);
  useEffect(()=>{
    const cached=existingDrafts()[draftKey];
    const next=Array.isArray(cached)&&cached.every(b=>b && typeof b.kind==='string') ? copySections(cached) : initialSections(page);
    setBlocks(next);setSelectedId(next[0]?.id||null);setUndo([]);setRedo([]);setDirty(false);setMessage('');
  },[draftKey]);
  const selected=blocks.find(b=>b.id===selectedId);
  const commit=(next: Section[],targetId=selectedId)=>{
    setUndo(prev=>[...prev.slice(-29),copySections(blocks)]);
    setRedo([]);setBlocks(next);setSelectedId(targetId);setDirty(true);setMessage('');
  };
  const change=(key: 'kicker'|'title'|'body'|'buttonLabel'|'buttonHref',value:string)=>{
    if(!selected)return;
    commit(blocks.map(b=>b.id===selected.id?{...b,[key]:value}:b),selected.id);
  };
  const changeItem=(index:number,value:string)=>{
    if(!selected)return;
    commit(blocks.map(b=>b.id===selected.id?{...b,items:b.items.map((item,i)=>i===index?value:item)}:b),selected.id);
  };
  const changePresentation=(key:'backgroundColor'|'color'|'textAlign'|'paddingTopPx'|'paddingBottomPx'|'fontFamily'|'fontSizePx'|'fontWeight'|'lineHeight',value:string|number|undefined)=>{
    if(!selected)return;
    const presentation={...selected.presentation};
    if(value===undefined)delete presentation[key];
    else Object.assign(presentation,{[key]:value});
    commit(blocks.map(b=>b.id===selected.id?{...b,presentation}:b),selected.id);
  };
  const changeMedia=(mediaId:string|undefined)=>{
    if(!selected)return;
    commit(blocks.map(b=>b.id===selected.id?{...b,mediaId}:b),selected.id);
  };
  const changeHeroImage=(key:keyof HeroImageSettings,value:number|'cover'|'contain')=>{
    if(!selected || selected.kind!=='hero')return;
    const heroImage={...selected.heroImage,[key]:value};
    commit(blocks.map(b=>b.id===selected.id?{...b,heroImage}:b),selected.id);
  };
  const resetHeroImage=()=>{
    if(!selected || selected.kind!=='hero')return;
    commit(blocks.map(b=>b.id===selected.id?{...b,heroImage:undefined}:b),selected.id);
  };
  const add=(kind:SectionKind)=>{
    const block=makeSection(kind);
    commit([...blocks,block],block.id);
  };
  const duplicate=()=>{
    if(!selected)return;
    const at=blocks.findIndex(s=>s.id===selected.id);
    const clone={...selected,id:blockId(),items:[...selected.items],presentation:selected.presentation?{...selected.presentation}:undefined,heroImage:selected.heroImage?{...selected.heroImage}:undefined};
    const next=[...blocks];next.splice(at+1,0,clone);commit(next,clone.id);
  };
  const remove=()=>{
    if(!selected)return;
    const next=blocks.filter(s=>s.id!==selected.id);
    commit(next,next[0]?.id||null);
  };
  const move=(direction:-1|1)=>{
    if(!selected)return;
    const at=blocks.findIndex(s=>s.id===selected.id),to=at+direction;
    if(to<0||to>=blocks.length)return;
    const next=[...blocks];[next[at],next[to]]=[next[to],next[at]];commit(next,selected.id);
  };
  const dropLayer=(targetId:string)=>{
    if(!draggedId || draggedId===targetId){setDraggedId(null);return;}
    const from=blocks.findIndex(b=>b.id===draggedId);
    const target=blocks.findIndex(b=>b.id===targetId);
    if(from<0 || target<0){setDraggedId(null);return;}
    const next=[...blocks];
    const [moved]=next.splice(from,1);
    next.splice(target,0,moved);
    commit(next,draggedId);
    setDraggedId(null);
  };
  const exportNativeDraft=()=>{
    const payload=previewNativeBlocks(blocks);
    const data=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(data);
    const anchor=document.createElement('a');
    anchor.href=url;
    anchor.download='luxgrowth-studio-prototype-'+siteId+'-draft.json';
    anchor.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    setMessage('Pré-exportação gerada. O JSON ainda precisa da validação do contrato real e NÃO é publicável.');
  };
  const backwards=()=>{
    if(!undo.length)return;
    setRedo(prev=>[...prev.slice(-29),copySections(blocks)]);
    const next=copySections(undo[undo.length-1]);setUndo(prev=>prev.slice(0,-1));setBlocks(next);setSelectedId(next.some(s=>s.id===selectedId)?selectedId:next[0]?.id||null);setDirty(true);
  };
  const forwards=()=>{
    if(!redo.length)return;
    setUndo(prev=>[...prev.slice(-29),copySections(blocks)]);
    const next=copySections(redo[redo.length-1]);setRedo(prev=>prev.slice(0,-1));setBlocks(next);setSelectedId(next.some(s=>s.id===selectedId)?selectedId:next[0]?.id||null);setDirty(true);
  };
  const save=()=>{
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify({...existingDrafts(),[draftKey]:copySections(blocks)}));setDirty(false);setMessage('Rascunho guardado neste navegador. Nada foi publicado online.');}
    catch{setMessage('Não foi possível guardar. Verifica o espaço disponível no navegador.');}
  };
  const reset=()=>{
    if(!window.confirm('Repor a estrutura desta página? As alterações não guardadas serão perdidas.'))return;
    commit(initialSections(page),null);
  };
  const chooseSite=(id:string)=>{
    if(dirty&&!window.confirm('Existem alterações não guardadas. Mudar de website sem guardar?'))return;
    setSiteId(id);setPageId('');setMessage('');
  };
  const choosePage=(id:string)=>{
    if(dirty&&!window.confirm('Existem alterações não guardadas. Mudar de página sem guardar?'))return;
    setPageId(id);setMessage('');
  };
  if(!site)return <div className="lg-workspace"><h1>Website Studio — Editor</h1><p>Cria primeiro um website no módulo Os meus websites.</p></div>;
  return <section className="lg-workspace lg-studio" aria-labelledby="lg-studio-title">
    <div className="lg-workspace-intro lg-studio-intro">
      <div><span className="lg-workspace-eyebrow">LUXGROWTH / WEBSITES & CONTEÚDOS</span>
        <h1 id="lg-studio-title">Website Studio — Editor</h1><p>Cria uma estrutura de página, edita secções e visualiza o resultado.</p></div>
      <span className="lg-demo-indicator">● Editor demonstrativo</span>
    </div>
    <div className="lg-studio-toolbar">
      <label>Website <select aria-label="Selecionar website" value={siteId} onChange={e=>chooseSite(e.target.value)}>
        {sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
      </select><ChevronDown size={14}/></label>
      <label>Página <select aria-label="Selecionar página" value={effectivePageId} onChange={e=>choosePage(e.target.value)}>
        {availablePages.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
      </select><ChevronDown size={14}/></label>
      <div className="lg-studio-toolbar-gap"/>
      <div className="lg-studio-tools" role="group" aria-label="Pré-visualização responsiva">
        <button type="button" className={device==='desktop'?'active':''} onClick={()=>setDevice('desktop')} aria-pressed={device==='desktop'} title="Desktop"><Monitor size={16}/></button>
        <button type="button" className={device==='mobile'?'active':''} onClick={()=>setDevice('mobile')} aria-pressed={device==='mobile'} title="Telemóvel"><Smartphone size={16}/></button>
      </div>
      <div className="lg-studio-tools" role="group" aria-label="Histórico de edição">
        <button type="button" title="Desfazer" disabled={!undo.length} onClick={backwards}><Undo2 size={16}/></button>
        <button type="button" title="Refazer" disabled={!redo.length} onClick={forwards}><Redo2 size={16}/></button>
      </div>
      <button type="button" className="lg-studio-button" onClick={()=>setMediaOpen(true)}><ImageIcon size={15}/> Media</button>
      <button type="button" className="lg-studio-button" onClick={exportNativeDraft} title="Exportar prévia dos blocos no formato do Studio original"><Download size={15}/> JSON</button>
      <button type="button" className="lg-studio-button" onClick={()=>setShowHelp(v=>!v)}><Eye size={15}/> Ajuda</button>
      <button type="button" className="lg-studio-button lg-studio-button--save" onClick={save}><Save size={16}/>{dirty?'Guardar alterações':'Guardar rascunho'}</button>
    </div>
    {showHelp&&<div className="lg-studio-notice" role="note"><strong>Como testar:</strong> escolhe um bloco na coluna esquerda, edita-o na direita e vê o resultado ao centro. Podes adicionar, duplicar, arrastar camadas para reorganizar, desfazer/refazer, guardar e exportar um JSON compatível em estrutura com os blocos originais. O JSON necessita de validação real antes da utilização. O editor não publica websites.</div>}
    {message&&<div className="lg-studio-notice" role="status">{message}</div>}
    <div className="lg-studio-columns">
      <aside className="lg-studio-panel lg-studio-layers" aria-label="Camadas e secções">
        <div className="lg-studio-panel-heading"><LayoutTemplate size={17}/><strong>Estrutura da página</strong></div>
        <p className="lg-studio-panel-subtitle">{blocks.length} secções · {page?.title || 'Página inicial'}</p>
        <div className="lg-studio-layer-list">
          {blocks.map((block,i)=><button type="button" key={block.id} draggable
            onDragStart={event=>{setDraggedId(block.id);event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',block.id)}}
            onDragOver={event=>{event.preventDefault();event.dataTransfer.dropEffect='move'}}
            onDrop={event=>{event.preventDefault();dropLayer(block.id)}}
            onDragEnd={()=>setDraggedId(null)}
            className={'lg-studio-layer'+(selectedId===block.id?' is-selected':'')+(draggedId===block.id?' is-dragging':'')}
            title="Arrastar para reorganizar" onClick={()=>setSelectedId(block.id)}>
            <GripVertical size={15}/><span><strong>{sectionLabel(block.kind)}</strong><small>{block.title||'Sem título'}</small></span><em>{i+1}</em>
          </button>)}
        </div>
        <div className="lg-studio-add-section"><strong><Plus size={14}/> Adicionar secção</strong>
          <div>{TYPES.map(t=><button type="button" key={t.kind} onClick={()=>add(t.kind)}>
            <Plus size={13}/><span>{t.label}<small>{t.detail}</small></span></button>)}</div>
        </div>
        <button type="button" className="lg-studio-reset" onClick={reset}><RotateCcw size={15}/> Repor estrutura</button>
      </aside>
      <div className="lg-studio-canvas-area" aria-label="Pré-visualização da página">
        <div className="lg-studio-canvas-header"><span><Globe2 size={15}/> {site.domain}</span><span>{device==='desktop'?'Desktop':'Mobile'} · {dirty?'Alterações não guardadas':'Rascunho local'}</span></div>
        <EditorPreview sections={blocks} selectedId={selectedId} onSelect={setSelectedId} site={site} device={device} mediaUrls={mediaUrls}/>
      </div>
      <aside className="lg-studio-panel lg-studio-inspector" aria-label="Propriedades da secção selecionada">
        <div className="lg-studio-panel-heading"><Type size={17}/><strong>Propriedades</strong></div>
        {!selected?<p className="lg-studio-panel-subtitle">Seleciona uma secção para editar o conteúdo.</p>:<>
          <p className="lg-studio-panel-subtitle">{sectionLabel(selected.kind)} · Secção selecionada</p>
          <label>Etiqueta <input value={selected.kicker} maxLength={90} onChange={e=>change('kicker',e.target.value)}/></label>
          <label>Título <textarea rows={2} value={selected.title} maxLength={180} onChange={e=>change('title',e.target.value)}/></label>
          <label>Descrição / texto <textarea rows={5} value={selected.body} maxLength={1000} onChange={e=>change('body',e.target.value)}/></label>
          {(selected.kind==='hero'||selected.kind==='cta')&&<>
            <label>Texto do botão <input value={selected.buttonLabel} maxLength={65} onChange={e=>change('buttonLabel',e.target.value)}/></label>
            <label>Destino do botão <input type="text" placeholder="#contacto ou https://..." value={selected.buttonHref??'#contacto'} maxLength={320} onChange={e=>change('buttonHref',e.target.value)}/></label>
            <p className={'lg-studio-link-note'+(safeLink(selected.buttonHref??'#contacto')?'':' is-invalid')}>
              {safeLink(selected.buttonHref??'#contacto')?'Destino válido. No protótipo, os botões não abrem páginas externas.':'Destino inválido. Usa uma âncora #id, uma rota /... ou um endereço HTTPS.'}
            </p>
          </>}
          {selected.kind==='features'&&<div className="lg-studio-feature-fields"><strong>Benefícios</strong>{selected.items.map((v,i)=><label key={i}>Benefício {i+1} <input value={v} maxLength={100} onChange={e=>changeItem(i,e.target.value)}/></label>)}</div>}
          {selected.kind==='hero'&&<div className="lg-studio-design-fields">
            <strong>Imagem de destaque</strong><button type="button" className="lg-studio-button" onClick={()=>setMediaOpen(true)}><ImageIcon size={15}/> Escolher imagem</button>
            {selected.mediaId&&(mediaUrls[selected.mediaId]?<div className="lg-studio-media-selected"><img src={mediaUrls[selected.mediaId]} alt="Imagem do Hero"/><button type="button" onClick={()=>changeMedia(undefined)}>Remover associação</button></div>:<p className="lg-studio-panel-subtitle">Imagem indisponível neste navegador.</p>)}
            {selected.mediaId&&mediaUrls[selected.mediaId]&&<div className="lg-studio-image-controls">
              <label>Visibilidade da imagem ({selected.heroImage?.opacityPct??22}%)
                <input type="range" min="0" max="100" step="5" value={selected.heroImage?.opacityPct??22}
                  onChange={e=>changeHeroImage('opacityPct',Number(e.target.value))}/>
              </label>
              <label>Enquadramento
                <select value={selected.heroImage?.fit??'cover'} onChange={e=>changeHeroImage('fit',e.target.value as 'cover'|'contain')}>
                  <option value="cover">Preencher espaço (cortar imagem)</option>
                  <option value="contain">Mostrar imagem completa</option>
                </select>
              </label>
              <label>Posição horizontal ({selected.heroImage?.positionX??50}%)
                <input type="range" min="0" max="100" step="5" value={selected.heroImage?.positionX??50}
                  onChange={e=>changeHeroImage('positionX',Number(e.target.value))}/>
              </label>
              <label>Posição vertical ({selected.heroImage?.positionY??50}%)
                <input type="range" min="0" max="100" step="5" value={selected.heroImage?.positionY??50}
                  onChange={e=>changeHeroImage('positionY',Number(e.target.value))}/>
              </label>
              <button type="button" className="lg-studio-design-clear" onClick={resetHeroImage}>Repor enquadramento original</button>
              <p className="lg-studio-panel-subtitle">Ajustes visíveis apenas no editor local. A fotografia não é enviada para servidores.</p>
            </div>}
          </div>}
          <div className="lg-studio-design-fields"><strong>Design e espaçamento</strong>
            <label>Cor de fundo <input type="color" value={selected.presentation?.backgroundColor||'#ffffff'} onChange={e=>changePresentation('backgroundColor',e.target.value)}/></label>
            <button type="button" className="lg-studio-design-clear" onClick={()=>changePresentation('backgroundColor',undefined)}>Repor fundo original</button>
            <label>Cor do texto <input type="color" value={selected.presentation?.color||'#26352a'} onChange={e=>changePresentation('color',e.target.value)}/></label>
            <button type="button" className="lg-studio-design-clear" onClick={()=>changePresentation('color',undefined)}>Repor texto original</button>
            <label>Alinhamento <select value={selected.presentation?.textAlign||'left'} onChange={e=>changePresentation('textAlign',e.target.value as 'left'|'center'|'right')}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
            <label>Espaço superior (px) <input type="number" min="0" max="320" value={selected.presentation?.paddingTopPx??46} onChange={e=>changePresentation('paddingTopPx',Math.min(320,Math.max(0,Number(e.target.value)||0)))}/></label>
            <label>Espaço inferior (px) <input type="number" min="0" max="320" value={selected.presentation?.paddingBottomPx??46} onChange={e=>changePresentation('paddingBottomPx',Math.min(320,Math.max(0,Number(e.target.value)||0)))}/></label>
          </div>
          <div className="lg-studio-design-fields"><strong>Tipografia do título</strong>
            <label>Fonte <select value={selected.presentation?.fontFamily||''} onChange={e=>changePresentation('fontFamily',e.target.value||undefined)}>
              <option value="">Original do website</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Tahoma, sans-serif">Tahoma</option>
              <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
            </select></label>
            <label>Tamanho (px) <input type="number" min="8" max="160" placeholder="Original" value={selected.presentation?.fontSizePx??''} onChange={e=>changePresentation('fontSizePx',e.target.value===''?undefined:Math.min(160,Math.max(8,Math.round(Number(e.target.value)||8))))}/></label>
            <label>Peso <select value={selected.presentation?.fontWeight??''} onChange={e=>changePresentation('fontWeight',e.target.value===''?undefined:Number(e.target.value))}>
              <option value="">Original do website</option><option value="300">Leve (300)</option>
              <option value="400">Normal (400)</option><option value="500">Médio (500)</option>
              <option value="600">Semi-negrito (600)</option><option value="700">Negrito (700)</option>
              <option value="800">Extra-negrito (800)</option>
            </select></label>
            <label>Altura da linha <select value={selected.presentation?.lineHeight??''} onChange={e=>changePresentation('lineHeight',e.target.value===''?undefined:Number(e.target.value))}>
              <option value="">Original do website</option><option value="1">Compacto (1)</option>
              <option value="1.2">Normal (1.2)</option><option value="1.5">Amplo (1.5)</option><option value="1.8">Muito amplo (1.8)</option>
            </select></label>
            <button type="button" className="lg-studio-design-clear" onClick={()=>{
              if(!selected)return;
              const presentation={...selected.presentation};
              delete presentation.fontFamily;delete presentation.fontSizePx;delete presentation.fontWeight;delete presentation.lineHeight;
              commit(blocks.map(b=>b.id===selected.id?{...b,presentation}:b),selected.id);
            }}>Repor tipografia original</button>
          </div>
          <div className="lg-studio-inspector-actions">
            <button type="button" onClick={()=>move(-1)} disabled={blocks.findIndex(b=>b.id===selected.id)===0} title="Mover para cima"><ArrowUp size={16}/></button>
            <button type="button" onClick={()=>move(1)} disabled={blocks.findIndex(b=>b.id===selected.id)===blocks.length-1} title="Mover para baixo"><ArrowDown size={16}/></button>
            <button type="button" onClick={duplicate} title="Duplicar"><Copy size={16}/></button>
            <button type="button" onClick={remove} title="Remover" className="lg-studio-danger"><Trash2 size={16}/></button>
          </div>
        </>}
      </aside>
    </div>
    <div className="lg-studio-footer-note"><FileText size={15}/> Protótipo isolado: rascunhos locais, imagens em IndexedDB e pré-exportação JSON. Imagens locais não são mediaId de produção. Sem publicação.</div>
    <LocalMediaLibrary open={mediaOpen} siteName={site.name} items={media.items} selectedId={selected?.mediaId} busy={media.busy} error={media.error} onUpload={media.upload} onRemove={media.remove} onSelect={changeMedia} onClose={()=>setMediaOpen(false)}/>
  </section>;
}
