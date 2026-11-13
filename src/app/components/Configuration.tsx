import { useState, type FormEvent } from "react";
import { Activity, Plus, Power, Search, Trash2, X, Zap } from "lucide-react";
import { defaultDevices, type EnergyDevice } from "./demoData";
import { useLocalSetting } from "./useLocalSetting";

export function Configuration() {
  const [devices, setDevices] = useLocalSetting<EnergyDevice[]>("ems-demo-devices-v1", defaultDevices);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [ratedPower, setRatedPower] = useState("50");
  const [error, setError] = useState("");
  const [threshold, setThreshold] = useLocalSetting("ems-demo-threshold-v1", 450);
  const [alertEnabled, setAlertEnabled] = useLocalSetting("ems-demo-alert-v1", true);
  const visible = devices.filter(d => (d.name + " " + d.location).toLowerCase().includes(search.toLowerCase()));
  const active = devices.filter(d => d.status === "active").length;
  const toggle = (id: string) => setDevices(prev => prev.map(d => d.id === id ? {...d, status: d.status === "active" ? "paused" : "active"} : d));
  const addDevice = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !location.trim() || !(Number(ratedPower) > 0)) { setError("Preenche o nome, localização e potência válida."); return; }
    setDevices(prev => [...prev, {id: `demo-${Date.now()}`, name: name.trim(), location: location.trim(), ratedPower: Number(ratedPower), status: "active"}]);
    setName(""); setLocation(""); setRatedPower("50"); setError(""); setAdding(false);
  };
  return <div className="ems-module">
    <div className="ems-module__heading"><div><span className="ems-eyebrow">GESTÃO DE EQUIPAMENTOS</span><h1>Configuration</h1><p>Controla os dispositivos e as preferências do ambiente de demonstração.</p></div><button className="ems-btn ems-btn--primary" onClick={() => setAdding(true)}><Plus size={17}/> Adicionar dispositivo</button></div>
    <div className="ems-stat-row"><div className="ems-stat"><span>Dispositivos registados</span><strong>{devices.length}</strong><small>Inventário local</small></div><div className="ems-stat"><span>Ativos</span><strong>{active}</strong><small>Modo de demonstração</small></div><div className="ems-stat"><span>Potência nominal total</span><strong>{devices.reduce((s,d)=>s+d.ratedPower,0)} <em>kW</em></strong><small>Valores inseridos no protótipo</small></div></div>
    <div className="ems-split-grid"><section className="ems-panel"><div className="ems-panel__header"><div><h2>Dispositivos</h2><p>Ativa, pausa ou adiciona equipamentos fictícios.</p></div><span className="ems-pill">{visible.length} resultados</span></div><label className="ems-find"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Procurar por nome ou localização..." aria-label="Procurar equipamentos" /></label><div className="ems-device-list">{visible.length ? visible.map(d=><article className="ems-device" key={d.id}><div className="ems-device__icon"><Zap size={19}/></div><div className="ems-device__info"><strong>{d.name}</strong><span>{d.location} · {d.ratedPower} kW</span></div><span className={`ems-device__status ${d.status === "active" ? "online" : "paused"}`}><i/>{d.status === "active" ? "Ativo" : "Pausado"}</span><button title={d.status === "active" ? "Pausar dispositivo" : "Ativar dispositivo"} aria-label={d.status === "active" ? `Pausar ${d.name}` : `Ativar ${d.name}`} className="ems-icon-btn" onClick={()=>toggle(d.id)}><Power size={17}/></button><button title="Eliminar dispositivo" aria-label={`Eliminar ${d.name}`} className="ems-icon-btn" onClick={()=>setDevices(prev=>prev.filter(v=>v.id!==d.id))}><Trash2 size={16}/></button></article>) : <p className="ems-empty">Nenhum dispositivo encontrado.</p>}</div></section>
      <section className="ems-panel"><div className="ems-panel__header"><div><h2>Limites e alertas</h2><p>Configurações guardadas apenas neste navegador.</p></div><Activity size={20} color="#c9ed65"/></div><label className="ems-field"><span>Limite de consumo de referência (kWh)</span><input type="number" min="1" value={threshold} onChange={e => setThreshold(Math.max(1, Number(e.target.value) || 1))}/></label><div className="ems-switch-row"><div><strong>Alertas de consumo</strong><p>Guardar a preferência de alerta localmente.</p></div><button role="switch" aria-checked={alertEnabled} aria-label="Alertas de consumo" className={`ems-toggle ${alertEnabled ? "on" : ""}`} onClick={()=>setAlertEnabled(v=>!v)}><i/></button></div><div className="ems-notice"><strong>Dados de demonstração</strong><p>As alterações desta página não controlam equipamentos reais nem enviam alertas. É necessária integração com dispositivos, APIs e serviços de notificação.</p></div></section></div>
    {adding && <div className="ems-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setAdding(false)}} role="presentation"><form className="ems-dialog" onSubmit={addDevice} role="dialog" aria-modal="true" aria-label="Adicionar dispositivo"><div className="ems-dialog__head"><div><span className="ems-eyebrow">INVENTÁRIO LOCAL</span><h2>Novo dispositivo</h2></div><button type="button" className="ems-icon-btn" aria-label="Fechar" onClick={()=>setAdding(false)}><X size={20}/></button></div><label className="ems-field"><span>Nome do equipamento</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Sensor solar" required autoFocus/></label><label className="ems-field"><span>Localização</span><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Ex.: Armazém A" required/></label><label className="ems-field"><span>Potência nominal (kW)</span><input type="number" min="0.1" step="0.1" value={ratedPower} onChange={e=>setRatedPower(e.target.value)} required/></label>{error && <p className="ems-error">{error}</p>}<div className="ems-dialog__actions"><button type="button" className="ems-btn ems-btn--outline" onClick={()=>setAdding(false)}>Cancelar</button><button className="ems-btn ems-btn--primary" type="submit">Guardar dispositivo</button></div></form></div>}
  </div>;
}
