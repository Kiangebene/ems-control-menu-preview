import { useState } from "react";
import { BarChart3, Check, Download, FileText, Zap } from "lucide-react";
import { defaultDevices, downloadCsv, simulatedDaily } from "./demoData";
import { useLocalSetting } from "./useLocalSetting";

type ReportItem = { id: number; title: string; createdAt: string; device: string; period: string };
const periods: Record<string, string> = { week: "Últimos 7 dias", month: "Últimos 30 dias", quarter: "Últimos 90 dias" };
export function Reports() {
  const [device, setDevice] = useState("all");
  const [period, setPeriod] = useState("week");
  const [reports, setReports] = useLocalSetting<ReportItem[]>("ems-demo-reports-v1", []);
  const [justCreated, setJustCreated] = useState(false);
  const energy = simulatedDaily.reduce((sum, row) => sum + row.energy, 0);
  const peak = Math.max(...simulatedDaily.map(row => row.peak));
  const handleGenerate = () => {
    setReports(prev => [{id: Date.now(), title: `Relatório de energia · ${periods[period]}`, createdAt: new Date().toLocaleString("pt-PT"), device, period}, ...prev].slice(0, 20));
    setJustCreated(true);
  };
  function download(item?: ReportItem) {
    const selectedPeriod = item?.period || period;
    const selectedDevice = item?.device || device;
    downloadCsv(`ems-relatorio-demo-${selectedPeriod}.csv`, [
      ["EMS Control · DADOS DE DEMONSTRAÇÃO"],
      ["Período (seleção)", periods[selectedPeriod] ?? selectedPeriod],
      ["Dispositivo", selectedDevice === "all" ? "Todos os dispositivos" : defaultDevices.find(d=>d.id===selectedDevice)?.name || selectedDevice],
      ["Aviso", "Os dados são exemplos e não provêm de sensores reais"],
      ["Dia", "Energia simulada (kWh)", "Pico simulado (kW)"],
      ...simulatedDaily.map(row => [row.day, row.energy, row.peak])
    ]);
  }
  return <div className="ems-module"><div className="ems-module__heading"><div><span className="ems-eyebrow">ANÁLISE & EXPORTAÇÃO</span><h1>Reports</h1><p>Gera e descarrega relatórios CSV a partir dos dados de demonstração.</p></div><button className="ems-btn ems-btn--outline" onClick={()=>download()}><Download size={17}/> Exportar CSV</button></div>
    <div className="ems-stat-row"><div className="ems-stat"><span>Consumo na amostra</span><strong>{energy.toLocaleString("pt-PT")} <em>kWh</em></strong><small>7 dias simulados</small></div><div className="ems-stat"><span>Pico de referência</span><strong>{peak} <em>kW</em></strong><small>Valores de exemplo</small></div><div className="ems-stat"><span>Relatórios gerados</span><strong>{reports.length}</strong><small>Guardados neste navegador</small></div></div>
    <div className="ems-split-grid"><section className="ems-panel"><div className="ems-panel__header"><div><h2>Criar relatório</h2><p>Escolhe os parâmetros para identificar a exportação.</p></div><FileText size={20} color="#c9ed65"/></div><label className="ems-field"><span>Dispositivo</span><select value={device} onChange={e=>setDevice(e.target.value)}><option value="all">Todos os dispositivos</option>{defaultDevices.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label className="ems-field"><span>Período de referência</span><select value={period} onChange={e=>setPeriod(e.target.value)}>{Object.entries(periods).map(([id, label])=><option key={id} value={id}>{label}</option>)}</select></label><div className="ems-notice"><strong>Protótipo, sem dados ligados</strong><p>Esta seleção identifica o relatório. Os números exportados são sempre a mesma amostra de sete dias — não devem ser usados para decisões reais.</p></div><button className="ems-btn ems-btn--primary ems-btn--wide" onClick={handleGenerate}>{justCreated ? <Check size={17}/> : <BarChart3 size={17}/>} {justCreated ? "Relatório registado" : "Gerar relatório"}</button></section>
      <section className="ems-panel"><div className="ems-panel__header"><div><h2>Pré-visualização</h2><p>Energia consumida na amostra semanal</p></div><span className="ems-pill">DEMO</span></div><div className="ems-bar-visual">{simulatedDaily.map(row=><div className="ems-bar-visual__col" key={row.day}><div className="ems-bar-visual__track"><div style={{height:`${row.energy / 600 * 100}%`}}/></div><span>{row.day}</span></div>)}</div><div className="ems-panel__footer"><Zap size={16}/><span>Dados artificiais para apresentar o módulo.</span></div></section></div>
    <section className="ems-panel ems-report-history"><div className="ems-panel__header"><div><h2>Histórico de relatórios</h2><p>Registos criados localmente nesta demonstração.</p></div></div>{reports.length ? <div className="ems-history">{reports.map(report=><article key={report.id}><span className="ems-history__icon"><FileText size={19}/></span><div><strong>{report.title}</strong><small>{report.createdAt} · {report.device === "all" ? "Todos os dispositivos" : defaultDevices.find(d=>d.id === report.device)?.name || report.device}</small></div><button className="ems-btn ems-btn--outline" onClick={()=>download(report)}><Download size={16}/> CSV</button></article>)}</div> : <div className="ems-empty ems-empty--large"><FileText size={26}/><strong>Ainda não há relatórios</strong><span>Cria um relatório usando o formulário acima.</span></div>}</section>
  </div>;
}
