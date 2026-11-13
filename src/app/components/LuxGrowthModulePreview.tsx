import { ChevronLeft, Construction } from 'lucide-react';
import { destinationFor } from './luxgrowth-menu-data';
export function LuxGrowthModulePreview({page,onGoBack}:{page:string,onGoBack:()=>void}){
 const module=destinationFor(page);
 return <div className="lg-placeholder"><div className="lg-placeholder-eyebrow">LuxGrowth / {module?.section??'Workspace'}</div><h1>{module?.label??'Módulo'}</h1><div className="lg-placeholder-card"><Construction size={28}/><div><h2>{module?.soon?'Disponível em breve':'Área em preparação'}</h2><p>Este módulo consta do menu LuxGrowth, mas não está ligado a funcionalidades reais nesta demonstração. O dashboard original continua disponível em Visão geral.</p><button type="button" onClick={onGoBack}><ChevronLeft size={16}/> Voltar à Visão geral</button></div></div></div>
}