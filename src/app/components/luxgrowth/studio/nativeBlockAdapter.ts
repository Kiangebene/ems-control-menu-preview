/**
 * Compatibility adapter for the existing LuxGrowth Website Studio block contract.
 * Source of truth: luxgrowth-ia/shared/website/studio.ts (hero, richText,
 * platformFeatures, cta). The prototype has no tenant credentials or backend
 * access. All exported data must be validated by websiteBlockSchema before
 * any future server-side import or publication.
 */
export type PrototypeSection = {
  id: string;
  kind: 'hero' | 'text' | 'features' | 'cta' | 'image' | 'divider' | 'heading' | 'button' | 'container' | 'columns' | 'grid';
  layoutColumns?:number; layoutGapPx?:number; layoutWidthPx?:number; parentId?:string; parentSlot?:number;
  kicker: string;
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref?:string;
  items: string[];
  mediaId?:string;
  presentation?:{backgroundColor?:string;color?:string;textAlign?:'left'|'center'|'right';paddingTopPx?:number;paddingBottomPx?:number;fontFamily?:string;fontSizePx?:number;fontWeight?:number;lineHeight?:number};
};

export type StudioNativeDraft = {
  id: string;
  type: 'hero' | 'richText' | 'platformFeatures' | 'cta';
  order: number;
  enabled: true;
  data: Record<string, unknown>;
  presentation?:PrototypeSection['presentation'];
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
const safeHref=(href:string)=>/^#[a-zA-Z0-9_-]{1,80}$/.test(href)||/^\/(?!\/)[a-zA-Z0-9/_#?=&.%-]{0,300}$/.test(href)||/^https:\/\/[a-zA-Z0-9.-]+(?::443)?(?:\/[a-zA-Z0-9/_#?=&.%-]*)?$/.test(href);
const ctaHref=(section:PrototypeSection)=>safeHref(section.buttonHref??'#contacto')?(section.buttonHref??'#contacto'):undefined;

/** Note: paragraph-only HTML; must still go through the production sanitizer. */
export function toNativeDraft(section: PrototypeSection, order: number): NativeMapping {
  const common = { id: section.id, order, enabled: true as const, ...(section.presentation?{presentation:section.presentation}:{}) };
  if(section.kind==='image'||section.kind==='divider'||section.kind==='heading'||section.kind==='button'||section.kind==='container'||section.kind==='columns'||section.kind==='grid') {
    return {sectionId:section.id,sectionKind:section.kind,supported:false,
      caveat:'Componente local apenas. Não existe mapeamento validado para o contrato nativo; não importar nem publicar.',
      draft:{...common,type:'richText',data:{html:'<p>Componente local não exportável: '+escapeHtml(section.kind)+'</p>'}}};
  }
  if(section.kind === 'hero') {
    return {sectionId:section.id,sectionKind:section.kind,supported:true,
      caveat:[section.mediaId?'Imagem local não exportada: atribuir mediaId real após upload autorizado no SaaS.':'',!ctaHref(section)?'Destino CTA inválido, substituído no rascunho por #contacto.':''].filter(Boolean).join(' ')||undefined,
      draft:{...common,type:'hero',data:{
        eyebrow:clean(section.kicker,120),
        title:content(section.title,'Sem título').slice(0,220),
        text:clean(section.body),
        ...(section.buttonLabel.trim()?{primaryCta:{label:clean(section.buttonLabel,120),href:ctaHref(section)??'#contacto'}}:{})
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
      caveat:ctaHref(section)?'Destino CTA deve ser verificado antes de publicar.':'Destino CTA inválido, substituído no rascunho por #contacto.',
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
    containsUnsupportedBlocks:sections.some(section=>!!section.parentId||['image','divider','heading','button','container','columns','grid'].includes(section.kind)),
    blocks:sections.filter(section=>!section.parentId).map((section,index)=>toNativeDraft(section,index)),
    nestedBlocks:sections.filter(section=>!!section.parentId).map(section=>({id:section.id,parentId:section.parentId,parentSlot:section.parentSlot,kind:section.kind,productionReady:false})),
    warning:'Os componentes aninhados não fazem parte do contrato nativo e estão excluídos dos blocos exportáveis.'
  };
}
