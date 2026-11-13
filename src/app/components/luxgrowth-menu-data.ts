export interface LuxItem { label: string; soon?: boolean; children?: LuxItem[] }
export interface LuxSection { id: string; label: string; icon: string; items: LuxItem[] }
const item = (label: string, soon = false, children?: LuxItem[]): LuxItem => ({ label, ...(soon ? { soon: true } : {}), ...(children ? { children } : {}) });
const section = (id: string, label: string, icon: string, items: LuxItem[]): LuxSection => ({ id, label, icon, items });

export const luxMenu: LuxSection[] = [
  section('principal', 'Principal', 'home', [item('Visão geral'), item('Fila de trabalho'), item('Agenda')]),
  section('crm-vendas', 'CRM & Vendas', 'users', [item('Clientes'), item('Contactos'), item('Empresas'), item('Prospeção'), item('Pipeline'), item('Cases / Dossiers'), item('Documentos'), item('Ordens de venda')]),
  section('websites-conteudos', 'Websites & Conteúdos', 'globe', [item('Os meus websites'), item('Gestor de Conteúdos (CMS)'), item('Website Studio — Editor'), item('Conteúdos', false, [item('Biblioteca multimédia'), item('Definições do website'), item('Histórico e publicação')])]),
  section('marketing-ia', 'Marketing & IA', 'sparkles', [item('Marketing'), item('Campanhas'), item('Automações e IA'), item('Agentes IA'), item('Editor de automações', true), item('Conteúdos com IA', true), item('Modelos de automação', true)]),
  section('comunicacao', 'Comunicação', 'messages', [item('Comunicações', true), item('Caixa de entrada', true), item('WhatsApp'), item('E-mails', true), item('Redes sociais'), item('Chamadas'), item('SMS', true), item('Google Business')]),
  section('agenda-atividades', 'Agenda & Atividades', 'calendar', [item('Tarefas'), item('Reuniões'), item('Todas as atividades'), item('Reservas'), item('Minhas solicitações')]),
  section('projetos-operacoes', 'Projetos & Operações', 'folder', [item('Projetos', true, [item('Todos os projetos', true), item('Kanban de projetos', true), item('Cronograma Gantt', true), item('Orçamentos de projeto', true)]), item('Imóveis'), item('Serviços'), item('Produtos'), item('Ordens de compra'), item('Fornecedores'), item('Viagens')]),
  section('financas', 'Finanças', 'wallet', [item('Finanças'), item('Orçamentos'), item('Livros de preços')]),
  section('inteligencia-relatorios', 'Inteligência & Relatórios', 'chart', [item('Relatórios'), item('Analítica e BI'), item('Previsões')]),
  section('administracao', 'Administração', 'settings', [item('Definições'), item('Equipa e permissões'), item('Planos e subscrições'), item('Customer Success'), item('Integrações'), item('Centro de dados'), item('API e Webhooks'), item('Modelos de e-mail', true), item('Campos personalizados', true), item('Segurança e auditoria', true)]),
  section('acesso-rapido', 'Acesso rápido', 'plus', [item('Nova oportunidade'), item('Nova empresa'), item('Nova fatura'), item('Nova tarefa')]),
  section('ajuda-suporte', 'Ajuda e suporte', 'help', [item('Ajuda e suporte', true), item('Centro de Operações')]),
];

export const slug = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export interface LuxDestination { route: string; label: string; section: string; soon: boolean }
export function routeFor(sectionId: string, label: string): string {
  if (sectionId === 'principal' && label === 'Visão geral') return 'dashboard';
  if (sectionId === 'inteligencia-relatorios' && label === 'Analítica e BI') return 'analytics';
  if (sectionId === 'inteligencia-relatorios' && label === 'Relatórios') return 'reports';
  if (sectionId === 'administracao' && label === 'Definições') return 'settings';
  if (sectionId === 'ajuda-suporte' && label === 'Centro de Operações') return 'configuration';
  return 'lg/' + sectionId + '/' + slug(label);
}
export const destinations: LuxDestination[] = luxMenu.flatMap(s => {
  const flatten = (nodes: LuxItem[], inheritedSoon = false): LuxDestination[] => nodes.flatMap(node => {
    const current = {route:routeFor(s.id, node.label), label:node.label, section:s.label, soon:inheritedSoon || !!node.soon};
    return node.children ? [current, ...flatten(node.children, current.soon)] : [current];
  });
  return flatten(s.items);
});
export function destinationFor(route: string): LuxDestination | undefined { return destinations.find(item => item.route === route); }