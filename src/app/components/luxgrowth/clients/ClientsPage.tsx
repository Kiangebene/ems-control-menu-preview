import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, Building2, ChevronDown, Edit3, Mail, Phone, Star, Trash2, UsersRound, X } from 'lucide-react';
import { WorkspaceToolbar, type ResourceView } from '../WorkspaceToolbar';

type Segment = 'Enterprise' | 'Mid-market' | 'SMB';
type Status = 'Ativo' | 'Potencial' | 'Inativo';
type Client = {
  id: string; name: string; company: string; email: string; phone: string;
  city: string; segment: Segment; status: Status; owner: string;
  value: number; score: number; favorite: boolean; updatedAt: string;
};
type Draft = Pick<Client, 'name' | 'company' | 'email' | 'phone' | 'city' | 'segment' | 'status' | 'owner' | 'value'>;

const STORAGE_KEY = 'luxgrowth-prototype-clients-v1';
const exampleDate = '2026-11-10T10:00:00.000Z';
const seed: Client[] = [
  {id:'demo-1',name:'Sofia Martins',company:'Aurora Design',email:'sofia@example.com',phone:'',city:'Luxemburgo',segment:'SMB',status:'Ativo',owner:'Equipa comercial',value:12400,score:82,favorite:true,updatedAt:exampleDate},
  {id:'demo-2',name:'Lucas Bernard',company:'Nord Commerce',email:'lucas@example.com',phone:'',city:'Esch-sur-Alzette',segment:'Mid-market',status:'Potencial',owner:'Equipa comercial',value:28900,score:67,favorite:false,updatedAt:exampleDate},
  {id:'demo-3',name:'Inês Carvalho',company:'Studio Alfa',email:'ines@example.com',phone:'',city:'Bertrange',segment:'SMB',status:'Ativo',owner:'Equipa comercial',value:7800,score:94,favorite:true,updatedAt:exampleDate},
  {id:'demo-4',name:'Marc Weber',company:'Green Logistics',email:'marc@example.com',phone:'',city:'Differdange',segment:'Enterprise',status:'Ativo',owner:'Equipa comercial',value:84200,score:91,favorite:false,updatedAt:exampleDate},
  {id:'demo-5',name:'Ana Ribeiro',company:'Vista Imobiliária',email:'ana@example.com',phone:'',city:'Rodange',segment:'Mid-market',status:'Inativo',owner:'Equipa comercial',value:16300,score:45,favorite:false,updatedAt:exampleDate},
  {id:'demo-6',name:'Thomas Meyer',company:'Atelier M',email:'thomas@example.com',phone:'',city:'Steinfort',segment:'SMB',status:'Potencial',owner:'Equipa comercial',value:5400,score:70,favorite:false,updatedAt:exampleDate},
  {id:'demo-7',name:'Clara Fernandes',company:'Nova Services',email:'clara@example.com',phone:'',city:'Mersch',segment:'Enterprise',status:'Ativo',owner:'Equipa comercial',value:59700,score:88,favorite:true,updatedAt:exampleDate},
  {id:'demo-8',name:'Pierre Laurent',company:'Central Office',email:'pierre@example.com',phone:'',city:'Strassen',segment:'SMB',status:'Potencial',owner:'Equipa comercial',value:11900,score:57,favorite:false,updatedAt:exampleDate}
];
const emptyDraft: Draft = {name:'',company:'',email:'',phone:'',city:'',segment:'SMB',status:'Potencial',owner:'Equipa comercial',value:0};

function loadClients(): Client[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return seed;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string') as Client[] : seed;
  } catch {
    return seed;
  }
}
function displayCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
}
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0,2).map(word=>word[0]?.toUpperCase()??'').join('');
}
function csvCell(input: string | number) {
  const text = String(input ?? '');
  const safe = /^[=+@\-\t\r]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g,'""') + '"';
}
function exportCSV(clients: Client[]) {
  const headings = ['Nome','Empresa','E-mail','Telefone','Cidade','Segmento','Estado','Responsável','Valor EUR','Pontuação'];
  const lines = [headings.join(';'),...clients.map(client=>[
    client.name,client.company,client.email,client.phone,client.city,client.segment,
    client.status,client.owner,client.value,client.score
  ].map(csvCell).join(';'))].join('\r\n');
  const blob = new Blob(['\uFEFF'+lines],{type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'luxgrowth-clientes-demo.csv';
  document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export function ClientsPage() {
  const [clients,setClients] = useState<Client[]>(loadClients);
  const [query,setQuery] = useState('');
  const [segment,setSegment] = useState('todos');
  const [status,setStatus] = useState('todos');
  const [sort,setSort] = useState('updated');
  const [favoritesOnly,setFavoritesOnly] = useState(false);
  const [view,setView] = useState<ResourceView>('grid');
  const [editing,setEditing] = useState<string | null>(null);
  const [modalOpen,setModalOpen] = useState(false);
  const [draft,setDraft] = useState<Draft>(emptyDraft);
  const [error,setError] = useState('');

  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(clients));},[clients]);

  const filtered = useMemo(()=>{
    const search = query.trim().toLocaleLowerCase('pt-PT');
    return clients.filter(client=>{
      const matchesText = !search || [client.name,client.company,client.email,client.city,client.owner].some(value=>value.toLocaleLowerCase('pt-PT').includes(search));
      return matchesText && (segment==='todos'||client.segment===segment) && (status==='todos'||client.status===status) && (!favoritesOnly||client.favorite);
    }).sort((a,b)=>{
      if(sort==='value') return b.value-a.value;
      if(sort==='name') return a.name.localeCompare(b.name,'pt');
      if(sort==='score') return b.score-a.score;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  },[clients,query,segment,status,sort,favoritesOnly]);

  const metrics = useMemo(()=>({
    total:clients.length,
    active:clients.filter(client=>client.status==='Ativo').length,
    potential:clients.filter(client=>client.status==='Potencial').length,
    value:clients.reduce((sum,client)=>sum+client.value,0)
  }),[clients]);

  const toggleFavorite = (id:string) => setClients(current=>current.map(client=>client.id===id?{...client,favorite:!client.favorite}:client));
  const openCreate = () => {setEditing(null);setDraft({...emptyDraft});setError('');setModalOpen(true)};
  const openEdit = (client:Client) => {
    setEditing(client.id);
    setDraft({name:client.name,company:client.company,email:client.email,phone:client.phone,city:client.city,segment:client.segment,status:client.status,owner:client.owner,value:client.value});
    setError('');setModalOpen(true);
  };
  const remove = (client:Client) => {
    if(window.confirm('Eliminar "'+client.name+'" desta demonstração local?'))setClients(current=>current.filter(item=>item.id!==client.id));
  };
  const save = (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name=draft.name.trim(),company=draft.company.trim(),email=draft.email.trim();
    if(!name||!company||!email){setError('Preenche nome, empresa e e-mail.');return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError('Introduz um e-mail válido.');return;}
    const duplicate = clients.some(client=>client.email.toLowerCase()===email.toLowerCase() && client.id!==editing);
    if(duplicate){setError('Já existe um cliente com este e-mail.');return;}
    const clean: Draft={...draft,name,company,email,city:draft.city.trim(),owner:draft.owner.trim(),phone:draft.phone.trim(),value:Math.max(0,Number(draft.value)||0)};
    if(editing){
      setClients(current=>current.map(client=>client.id===editing?{...client,...clean,updatedAt:new Date().toISOString()}:client));
    } else {
      const id = typeof crypto!=='undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'local-'+Date.now();
      setClients(current=>[{...clean,id,score:50,favorite:false,updatedAt:new Date().toISOString()},...current]);
    }
    setModalOpen(false);setError('');
  };

  return <section className="lg-workspace" aria-labelledby="lg-clients-title">
    <div className="lg-workspace-intro">
      <div><span className="lg-workspace-eyebrow">LUXGROWTH / CRM & VENDAS</span>
        <h1 id="lg-clients-title">Clientes</h1>
        <p>Organiza os relacionamentos comerciais numa única área de trabalho.</p>
      </div>
      <span className="lg-demo-indicator">● Demonstração local</span>
    </div>
    <div className="lg-workspace-metrics">
      <div className="lg-workspace-metric"><div><UsersRound size={18}/><span>Total de clientes</span></div><strong>{metrics.total}</strong><small>Registos neste navegador</small></div>
      <div className="lg-workspace-metric"><div><BriefcaseBusiness size={18}/><span>Clientes ativos</span></div><strong>{metrics.active}</strong><small>{metrics.potential} potenciais</small></div>
      <div className="lg-workspace-metric"><div><Building2 size={18}/><span>Carteira potencial</span></div><strong>{displayCurrency(metrics.value)}</strong><small>Valores fictícios ou introduzidos localmente</small></div>
    </div>
    <WorkspaceToolbar
      search={query} onSearchChange={setQuery} searchPlaceholder="Pesquisar por nome, empresa, e-mail, cidade..."
      filters={[
        {id:'segment',label:'Segmento',value:segment,options:[{value:'todos',label:'Todos os segmentos'},{value:'Enterprise',label:'Enterprise'},{value:'Mid-market',label:'Mid-market'},{value:'SMB',label:'SMB'}]},
        {id:'status',label:'Estado',value:status,options:[{value:'todos',label:'Todos os estados'},{value:'Ativo',label:'Ativo'},{value:'Potencial',label:'Potencial'},{value:'Inativo',label:'Inativo'}]},
        {id:'sort',label:'Ordenar',value:sort,options:[{value:'updated',label:'Mais recentes'},{value:'name',label:'Nome A–Z'},{value:'value',label:'Maior valor'},{value:'score',label:'Melhor pontuação'}]}
      ]}
      onFilterChange={(id,value)=>{if(id==='segment')setSegment(value);else if(id==='status')setStatus(value);else if(id==='sort')setSort(value)}}
      favoriteOnly={favoritesOnly} onFavoriteChange={setFavoritesOnly}
      onReset={()=>{setQuery('');setSegment('todos');setStatus('todos');setSort('updated');setFavoritesOnly(false)}}
      view={view} onViewChange={setView} onCreate={openCreate} createLabel="Novo cliente"
      onExport={()=>exportCSV(filtered)}
      resultsLabel={filtered.length+' de '+clients.length+' clientes'}
    />
    {!filtered.length ? <div className="lg-workspace-empty">
      <Search size={28}/><h2>Nenhum cliente encontrado</h2>
      <p>Experimenta alterar os filtros ou criar um novo cliente.</p>
      <button type="button" onClick={()=>{setQuery('');setSegment('todos');setStatus('todos');setFavoritesOnly(false)}}>Limpar filtros</button>
    </div> : view==='grid' ? <div className="lg-clients-grid">
      {filtered.map(client=><article className="lg-client-card" key={client.id}>
        <div className="lg-client-card-top">
          <div className="lg-client-avatar" aria-hidden="true">{initials(client.name)}</div>
          <div className="lg-client-headline"><strong>{client.name}</strong><small>{client.company}</small></div>
          <button type="button" className={'lg-client-star'+(client.favorite?' is-active':'')}
            aria-label={(client.favorite?'Remover favorito: ':'Marcar favorito: ')+client.name}
            aria-pressed={client.favorite} onClick={()=>toggleFavorite(client.id)}><Star size={17} fill={client.favorite?'currentColor':'none'}/></button>
        </div>
        <div className="lg-client-summary"><span>Carteira</span><strong>{displayCurrency(client.value)}</strong><span>Potencial</span><strong>{client.score}/100</strong></div>
        <div className="lg-client-score" role="meter" aria-label={'Pontuação de '+client.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={client.score}><span style={{width:client.score+'%'}}/></div>
        <div className="lg-client-card-foot"><span className={'lg-client-status '+client.status.toLowerCase()}>{client.status}</span><span className="lg-client-segment">{client.segment}</span><span>{client.city||'Sem cidade'}</span></div>
        <div className="lg-client-actions">
          <a href={'mailto:'+client.email} aria-label={'Enviar e-mail a '+client.name}><Mail size={15}/> E-mail</a>
          <button type="button" onClick={()=>openEdit(client)}><Edit3 size={15}/> Editar</button>
          <button type="button" className="lg-client-delete" aria-label={'Eliminar '+client.name} onClick={()=>remove(client)}><Trash2 size={15}/></button>
        </div>
      </article>)}
    </div> : <div className="lg-client-table-wrap"><table className="lg-client-table"><thead><tr>
      <th>Cliente</th><th>Empresa</th><th>Segmento</th><th>Estado</th><th>Carteira</th><th>Pontuação</th><th>Ações</th>
    </tr></thead><tbody>{filtered.map(client=><tr key={client.id}>
      <td><div className="lg-client-table-name"><span className="lg-client-avatar">{initials(client.name)}</span><span><strong>{client.name}</strong><small>{client.email}</small></span></div></td>
      <td>{client.company}</td><td>{client.segment}</td><td><span className={'lg-client-status '+client.status.toLowerCase()}>{client.status}</span></td>
      <td>{displayCurrency(client.value)}</td><td>{client.score}/100</td>
      <td><div className="lg-client-table-actions"><button onClick={()=>toggleFavorite(client.id)} aria-label="Favorito"><Star size={15} fill={client.favorite?'currentColor':'none'}/></button><button onClick={()=>openEdit(client)} aria-label="Editar"><Edit3 size={15}/></button><button onClick={()=>remove(client)} aria-label="Eliminar"><Trash2 size={15}/></button></div></td>
    </tr>)}</tbody></table></div>}
    <p className="lg-workspace-note">Ambiente de protótipo: alterações guardadas apenas neste navegador. Não representa clientes reais nem está ligado às APIs do LuxGrowth AI.</p>
    {modalOpen && <div className="lg-client-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setModalOpen(false)}}>
      <div className="lg-client-modal" role="dialog" aria-modal="true" aria-labelledby="lg-client-modal-title">
        <header><div><span className="lg-workspace-eyebrow">CRM / CLIENTES</span><h2 id="lg-client-modal-title">{editing?'Editar cliente':'Novo cliente'}</h2></div><button type="button" aria-label="Fechar formulário" onClick={()=>setModalOpen(false)}><X size={20}/></button></header>
        <form onSubmit={save}>
          <div className="lg-client-form-grid">
            <label>Nome completo <input required autoFocus value={draft.name} maxLength={90} onChange={event=>setDraft({...draft,name:event.target.value})}/></label>
            <label>Empresa <input required maxLength={90} value={draft.company} onChange={event=>setDraft({...draft,company:event.target.value})}/></label>
            <label>E-mail <input required type="email" maxLength={120} value={draft.email} onChange={event=>setDraft({...draft,email:event.target.value})}/></label>
            <label>Telefone <input maxLength={35} value={draft.phone} onChange={event=>setDraft({...draft,phone:event.target.value})}/></label>
            <label>Cidade <input maxLength={90} value={draft.city} onChange={event=>setDraft({...draft,city:event.target.value})}/></label>
            <label>Responsável <input maxLength={90} value={draft.owner} onChange={event=>setDraft({...draft,owner:event.target.value})}/></label>
            <label>Segmento <select value={draft.segment} onChange={event=>setDraft({...draft,segment:event.target.value as Segment})}><option>SMB</option><option>Mid-market</option><option>Enterprise</option></select></label>
            <label>Estado <select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as Status})}><option>Potencial</option><option>Ativo</option><option>Inativo</option></select></label>
            <label>Valor da carteira (€) <input type="number" min="0" step="0.01" value={draft.value} onChange={event=>setDraft({...draft,value:Number(event.target.value)})}/></label>
          </div>
          {error && <p className="lg-client-form-error" role="alert">{error}</p>}
          <footer><button type="button" onClick={()=>setModalOpen(false)}>Cancelar</button><button type="submit" className="lg-resource-button--primary">{editing?'Guardar alterações':'Criar cliente'} <ArrowUpRight size={15}/></button></footer>
        </form>
      </div>
    </div>}
  </section>;
}
