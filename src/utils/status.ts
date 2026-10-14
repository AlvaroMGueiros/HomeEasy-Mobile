const statusLabels: Record<string, string> = {
  requested: 'Aguardando orçamentos', proposal_received: 'Orçamentos recebidos', accepted: 'Aceito', expired: 'Prazo encerrado',
  cancelled: 'Cancelado', scheduled: 'Agendado', in_progress: 'Em andamento', completed: 'Concluído',
  cancelled_by_client: 'Cancelado pelo cliente', cancelled_by_professional: 'Cancelado pelo profissional', disputed: 'Problema em análise',
  sent: 'Enviada', rejected: 'Recusada', withdrawn: 'Retirada', pending: 'Aguardando análise', in_review: 'Em análise', approved: 'Aprovado', resolved: 'Resolvido'
};

const enumLabels: Record<string, string> = {
  flexible: 'Data a combinar', this_week: 'Esta semana', urgent: 'O quanto antes',
  identity: 'Identidade', address_proof: 'Comprovante de endereço', professional_certificate: 'Certificado profissional',
  fraud: 'Fraude', harassment: 'Assédio', inappropriate_content: 'Conteúdo impróprio', other: 'Outro',
  schedule_conflict: 'Não foi possível combinar o horário', price_disagreement: 'Não houve acordo sobre o preço',
  professional_unavailable: 'O profissional não pôde atender', client_unavailable: 'O cliente não pôde receber', service_no_longer_needed: 'O serviço não é mais necessário',
  service_not_performed: 'Serviço não realizado', service_quality: 'Qualidade do serviço', price_conflict: 'Valor diferente do combinado', property_damage: 'Dano ao imóvel', conduct: 'Comportamento inadequado'
};

export function resolveStatusLabel(status: string) { return statusLabels[status] || status; }
export function resolveEnumLabel(value: string) { return enumLabels[value] || resolveStatusLabel(value); }

export function resolveStatusTone(status: string): 'neutral' | 'active' | 'success' | 'warning' | 'danger' {
  switch (status) {
    case 'accepted':
    case 'completed':
    case 'approved':
    case 'resolved':
      return 'success';
    case 'requested':
    case 'proposal_received':
    case 'scheduled':
    case 'in_progress':
    case 'sent':
      return 'active';
    case 'pending':
    case 'disputed':
      return 'warning';
    case 'cancelled':
    case 'cancelled_by_client':
    case 'cancelled_by_professional':
    case 'rejected':
      return 'danger';
    default:
      return 'neutral';
  }
}
