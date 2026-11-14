/**
 * Compatibility adapter for the existing LuxGrowth Website Studio block contract.
 * Source of truth: luxgrowth-ia/shared/website/studio.ts (hero, richText,
 * platformFeatures, cta). The prototype has no tenant credentials or backend
 * access. All exported data must be validated by websiteBlockSchema before
 * any future server-side import or publication.
 */
export type PrototypeSection = {
  id: string;
  kind: 'hero' | 'text' | 'features' | 'cta';
  kicker: string;
  title: string;
  body: string;
  buttonLabel: string;
  items: string[];
};

export type StudioNativeDraft = {
  id: string;
  type: 'hero' | 'richText' | 'platformFeatures' | 'cta';
  order: number;
  enabled: true;
  data: Record<string, unknown>;
};
type NativeMapping = {
  sectionId: string;
  sectionKind: PrototypeSection['kind'];
  draft: StudioNativeDraft;
  supported: boolean;
  caveat?: string;
};

function escapeHtml(text: string): string {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
const clean = (text: string, max = 1200) => text.trim().slice(0,max);
const content = (text: string, fallback: string) => clean(text) || fallback;

/** Note: paragraph-only HTML; must still go through the production sanitizer. */
export function toNativeDraft(section: PrototypeSection, order: number): NativeMapping {
  const common = { id: section.id, order, enabled: true as const };
  if(section.kind === 'hero') {
    return {sectionId:section.id,sectionKind:section.kind,supported:true,
      draft:{...common,type:'hero',data:{
        eyebrow:clean(section.kicker,120),
        title:content(section.title,'Sem título').slice(0,220),
        text:clean(section.body),
        ...(section.buttonLabel.trim()?{primaryCta:{label:clean(section.buttonLabel,120),href:'#contacto'}}:{})
      }}};
  }
  if(section.kind === 'features') {
    const cards = section.items.map(x=>({title:clean(x,220)})).filter(x=>x.title);
    return {sectionId:section.id,sectionKind:section.kind,supported:cards.length>0,
      caveat:cards.length?'Estrutura compatível; validar propriedades exigidas pelo cardSchema real.':'Necessário pelo menos um benefício.',
      draft:{...common,type:'platformFeatures',data:{
        title:content(section.title,'Benefícios').slice(0,220),
        text:clean(section.body),
        features:cards
      }}};
  }
  if(section.kind === 'cta') {
    return {sectionId:section.id,sectionKind:section.kind,supported:!!section.buttonLabel.trim(),
      caveat:'O destino #contacto é ilustrativo; configurar o link real antes de publicar.',
      draft:{...common,type:'cta',data:{
        title:content(section.title,'Chamada à ação').slice(0,220),
        text:clean(section.body),
        cta:{label:content(section.buttonLabel,'Contactar').slice(0,120),href:'#contacto'}
      }}};
  }
  const text=[section.title,section.body].filter(Boolean).map((value,i)=>i===0
    ?'<h2>'+escapeHtml(value)+'</h2>'
    :'<p>'+escapeHtml(value).replace(/\n/g,'</p><p>')+'</p>').join('');
  return {sectionId:section.id,sectionKind:section.kind,supported:true,
    caveat:'HTML escapado, mas ainda sujeito à validação safeRichTextSchema do SaaS.',
    draft:{...common,type:'richText',data:{html:text||'<p>Sem conteúdo</p>'}}};
}

export function previewNativeBlocks(sections: PrototypeSection[]) {
  return {
    format:'luxgrowth-studio-prototype-native-draft',
    version:1,
    source:'ems-control-menu-preview',
    productionReady:false,
    notice:'Pré-exportação local. Requer validação com websiteBlockSchema, associação a tenant/page/locale e revisão manual antes de qualquer importação.',
    blocks:sections.map((section,index)=>toNativeDraft(section,index))
  };
}
