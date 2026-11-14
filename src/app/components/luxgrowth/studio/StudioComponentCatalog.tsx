import { useMemo, useState } from 'react';
import { Plus, Search, Layers3 } from 'lucide-react';

/**
 * Read-only catalogue based on Forma Studio's registry.ts, on the reviewed
 * feat/website-studio-unified-editor-20261102 branch of luxgrowth-ia.
 *
 * This prototype intentionally does NOT embed Forma runtime or import its
 * canonical contracts. Four V6 native section kinds plus seven local-only blocks can be added.
 * Image, Divider, Heading, Button, Container, Columns and Grid are local-only, excluded from native publication export. Other entries are future integration targets.
 * No production endpoint, tenant data or publication action is used.
 */
type SectionKind = 'hero' | 'text' | 'features' | 'cta' | 'image' | 'divider' | 'heading' | 'button' | 'container' | 'columns' | 'grid';
type CatalogItem = {
  id: string;
  label: string;
  details: string;
  kind?: SectionKind;
};
type Group = { title: string; items: CatalogItem[] };
const group = (title: string, values: Array<[string, string, string, SectionKind?]>): Group => ({
  title,
  items: values.map(([id, label, details, kind]) => ({ id, label, details, kind })),
});

const GROUPS: Group[] = [
  group('Secções prontas', [
    ['luxHero', 'Hero', 'Título, texto e botão', 'hero'],
    ['luxRichText', 'Texto', 'Conteúdo editorial', 'text'],
    ['luxPlatformFeatures', 'Benefícios', 'Três colunas de destaques', 'features'],
    ['luxCta', 'Chamada à ação', 'Mensagem e botão', 'cta'],
  ]),
  group('Layout', [
    ['section', 'Secção', 'Agrupar elementos'],
    ['container', 'Contentor', 'Largura e alinhamento', 'container'],
    ['flex', 'Flex', 'Disposição flexível'],
    ['grid', 'Grid', 'Grelha responsiva', 'grid'],
    ['columns', 'Colunas', 'Distribuição horizontal', 'columns'],
    ['divider', 'Divisor', 'Separador visual', 'divider'],
    ['spacer', 'Espaçador', 'Espaço entre elementos'],
  ]),
  group('Estrutura', [
    ['header', 'Cabeçalho', 'Topo da página'],
    ['nav', 'Navegação', 'Menu de links'],
    ['footer', 'Rodapé', 'Fim da página'],
    ['card', 'Cartão', 'Conteúdo em destaque'],
  ]),
  group('Tipografia', [
    ['heading', 'Título', 'Hierarquia de títulos', 'heading'],
    ['text', 'Parágrafo', 'Texto simples'],
    ['button', 'Botão', 'Ação de interface', 'button'],
    ['link', 'Ligação', 'Navegação e âncoras'],
  ]),
  group('Multimédia', [
    ['image', 'Imagem', 'Imagem individual', 'image'],
    ['video', 'Vídeo', 'Conteúdo audiovisual'],
    ['icon', 'Ícone', 'Representação visual'],
    ['gallery', 'Galeria', 'Coleção de imagens'],
  ]),
  group('Formulários', [
    ['form', 'Formulário', 'Conjunto de campos'],
    ['input', 'Campo', 'Entrada de dados'],
    ['textarea', 'Texto longo', 'Mensagem multilinha'],
    ['select', 'Seleção', 'Lista de opções'],
    ['checkbox', 'Checkbox', 'Confirmação'],
    ['contact', 'Contacto', 'Informações de contacto'],
  ]),
  group('Interativos', [
    ['accordion', 'Acordeão', 'Conteúdo expansível'],
    ['tabs', 'Separadores', 'Alternar painéis'],
    ['modal', 'Janela modal', 'Sobreposição de conteúdo'],
  ]),
  group('Secções avançadas', [
    ['testimonials', 'Testemunhos', 'Opiniões de clientes'],
    ['pricing', 'Preços', 'Planos e ofertas'],
  ]),
  group('Blocos LuxGrowth', [
    ['luxWebsiteAnalyzer', 'Análise de website', 'Analisar presença digital'],
    ['luxServices', 'Serviços', 'Apresentar serviços'],
    ['luxProblemCards', 'Problemas', 'Desafios que resolve'],
    ['luxMethodSteps', 'Etapas', 'Passos do método'],
    ['luxBeforeAfter', 'Antes e depois', 'Comparação de resultados'],
    ['luxPricingMarketing', 'Ofertas comerciais', 'Pacotes e promoções'],
    ['luxMetrics', 'Métricas', 'Indicadores de impacto'],
    ['luxResources', 'Recursos', 'Materiais e guias'],
    ['luxNewsletter', 'Newsletter', 'Subscrição de novidades'],
    ['luxDiagnosticForm', 'Diagnóstico', 'Formulário de análise'],
    ['luxLogoStrip', 'Logótipos', 'Marcas e parceiros'],
    ['luxGallery', 'Galeria LuxGrowth', 'Galeria do contrato original'],
    ['luxImage', 'Imagem LuxGrowth', 'Imagem do contrato original'],
    ['luxContact', 'Contactos LuxGrowth', 'Dados do negócio'],
    ['luxRichText', 'Texto avançado', 'Texto do contrato original'],
    ['luxHero', 'Hero LuxGrowth', 'Bloco original de destaque'],
    ['luxCta', 'CTA LuxGrowth', 'Ação do contrato original'],
    ['luxTestimonials', 'Testemunhos LuxGrowth', 'Bloco original de testemunhos'],
    ['luxPlatformFeatures', 'Funcionalidades LuxGrowth', 'Bloco original de funcionalidades'],
  ]),
];

const normalize = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function StudioComponentCatalog({ onAdd }: { onAdd: (kind: SectionKind) => void }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'ready' | 'all'>('ready');
  const visible = useMemo(() => {
    const term = normalize(query.trim());
    return GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item =>
        (scope === 'all' || Boolean(item.kind)) &&
        (!term || normalize(item.label + ' ' + item.details + ' ' + item.id).includes(term))
      ),
    })).filter(group => group.items.length > 0);
  }, [query, scope]);

  const count = GROUPS.reduce((sum, group) => sum + group.items.length, 0);
  const ready = GROUPS.reduce((sum, group) => sum + group.items.filter(item => item.kind).length, 0);

  return (
    <section className="lg-studio-catalog" aria-label="Biblioteca de componentes">
      <div className="lg-studio-catalog-title">
        <strong><Layers3 size={15} /> Biblioteca de componentes</strong>
        <span title="Apenas os tipos suportados podem ser inseridos">{ready} ativos · {count} no catálogo</span>
      </div>
      <label className="lg-studio-catalog-search">
        <Search size={15} aria-hidden="true"/>
        <span className="sr-only">Pesquisar componentes</span>
        <input type="search" placeholder="Pesquisar componentes..." value={query}
          onChange={event => setQuery(event.target.value)} aria-label="Pesquisar componentes"/>
      </label>
      <div className="lg-studio-catalog-filter" role="group" aria-label="Filtrar componentes">
        <button type="button" className={scope === 'ready' ? 'is-active' : ''}
          aria-pressed={scope === 'ready'} onClick={() => setScope('ready')}>Disponíveis ({ready})</button>
        <button type="button" className={scope === 'all' ? 'is-active' : ''}
          aria-pressed={scope === 'all'} onClick={() => setScope('all')}>Todos ({count})</button>
      </div>
      {visible.length === 0 ? (
        <p className="lg-studio-catalog-empty">Nenhum componente corresponde à pesquisa.</p>
      ) : visible.map(group => (
        <div className="lg-studio-catalog-group" key={group.title}>
          <h3>{group.title}</h3>
          <div className="lg-studio-catalog-grid">
            {group.items.map(item =>
              item.kind ? (
                <button type="button" className="lg-studio-catalog-tile is-ready" key={item.id}
                  title={'Adicionar ' + item.label} onClick={() => onAdd(item.kind!)}>
                  <Plus size={13} aria-hidden="true" />
                  <span><strong>{item.label}</strong><small>{item.details}</small></span>
                </button>
              ) : (
                <div className="lg-studio-catalog-tile is-pending" key={item.id}
                  aria-label={item.label + ': em integração'}>
                  <span><strong>{item.label}</strong><small>{item.details}</small>
                    <em>Em integração</em></span>
                </div>
              )
            )}
          </div>
        </div>
      ))}
      {scope === 'all' && <p className="lg-studio-catalog-hint">
        Os componentes pendentes são referências ao Studio real. A inserção só será ativada após integrar e validar cada tipo.
      </p>}
    </section>
  );
}
