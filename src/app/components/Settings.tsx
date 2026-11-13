import { useState, type FormEvent } from "react";
import { Bell, Check, Moon, Save, ShieldCheck, Sun, UserRound } from "lucide-react";
import { useLocalSetting } from "./useLocalSetting";

interface Props { userName: string; onSaveUserName: (name: string) => void; isDark: boolean; onThemeToggle: () => void; }
export function Settings({ userName, onSaveUserName, isDark, onThemeToggle }: Props) {
  const [draftName, setDraftName] = useState(userName);
  const [email, setEmail] = useLocalSetting("ems-demo-email-v1", "liam@example.com");
  const [draftEmail, setDraftEmail] = useState(email);
  const [notifications, setNotifications] = useLocalSetting("ems-demo-notifications-v1", true);
  const [weeklyDigest, setWeeklyDigest] = useLocalSetting("ems-demo-weekly-v1", false);
  const [saved, setSaved] = useState(false);
  function save(event: FormEvent) {
    event.preventDefault();
    if (!draftName.trim()) return;
    onSaveUserName(draftName.trim());
    setEmail(draftEmail.trim());
    setSaved(true);
  }
  return <div className="ems-module"><div className="ems-module__heading"><div><span className="ems-eyebrow">CONTA & EXPERIÊNCIA</span><h1>Settings & Profile</h1><p>Personaliza o teu perfil e as preferências locais do dashboard.</p></div><span className="ems-pill"><ShieldCheck size={14}/> Modo de demonstração</span></div>
    <div className="ems-split-grid"><section className="ems-panel"><div className="ems-panel__header"><div><h2>Dados de perfil</h2><p>Estas informações não são enviadas para servidores.</p></div><UserRound size={20} color="#c9ed65"/></div><form onSubmit={save} className="ems-form"><label className="ems-field"><span>Nome completo</span><input value={draftName} onChange={e=>{setDraftName(e.target.value);setSaved(false)}} required maxLength={80}/></label><label className="ems-field"><span>E-mail de exemplo</span><input type="email" value={draftEmail} onChange={e=>{setDraftEmail(e.target.value);setSaved(false)}} required/></label><button className="ems-btn ems-btn--primary" type="submit">{saved ? <Check size={17}/> : <Save size={17}/>} {saved ? "Guardado no navegador" : "Guardar preferências"}</button></form></section>
      <section className="ems-panel"><div className="ems-panel__header"><div><h2>Aparência</h2><p>Escolhe o estilo visual do dashboard.</p></div>{isDark?<Moon size={20} color="#c9ed65"/>:<Sun size={20} color="#c9ed65"/>}</div><div className="ems-theme-choice"><button onClick={() => isDark && onThemeToggle()} className={!isDark ? "selected" : ""}><Sun size={20}/><span>Tema claro</span>{!isDark&&<Check size={17}/>}</button><button onClick={() => !isDark && onThemeToggle()} className={isDark ? "selected" : ""}><Moon size={20}/><span>Tema escuro</span>{isDark&&<Check size={17}/>}</button></div><div className="ems-notice"><strong>Preferência persistente</strong><p>A opção visual mantém-se depois de atualizar a página neste navegador.</p></div></section></div>
    <section className="ems-panel ems-preferences"><div className="ems-panel__header"><div><h2>Preferências de notificação</h2><p>Os interruptores funcionam; o envio real exige uma integração futura.</p></div><Bell size={20} color="#c9ed65"/></div><div className="ems-switch-row"><div><strong>Alertas no dashboard</strong><p>Guardar a preferência de notificações.</p></div><button className={`ems-toggle ${notifications ? "on" : ""}`} role="switch" aria-label="Alertas no dashboard" aria-checked={notifications} onClick={()=>setNotifications(n=>!n)}><i/></button></div><div className="ems-switch-row"><div><strong>Resumo semanal</strong><p>Preferência para um futuro envio de relatórios.</p></div><button className={`ems-toggle ${weeklyDigest ? "on" : ""}`} role="switch" aria-label="Resumo semanal" aria-checked={weeklyDigest} onClick={()=>setWeeklyDigest(n=>!n)}><i/></button></div></section>
  </div>;
}
