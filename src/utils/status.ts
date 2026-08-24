const statusLabels: Record<string, string> = {
  requested: 'Aguardando propostas', proposal_received: 'Propostas recebidas', accepted: 'Aceito', expired: 'Expirado',
  cancelled: 'Cancelado', scheduled: 'Agendado', in_progress: 'Em andamento', completed: 'Concluído',
  cancelled_by_client: 'Cancelado pelo cliente', cancelled_by_professional: 'Cancelado pelo profissional', disputed: 'Em disputa',
  sent: 'Enviada', rejected: 'Recusada', withdrawn: 'Retirada', pending: 'Pendente', approved: 'Aprovado', resolved: 'Resolvido'
};

const enumLabels: Record<string, string> = {
  flexible: 'Flexível', this_week: 'Esta semana', urgent: 'Urgente',
  identity: 'Identidade', address_proof: 'Comprovante de endereço', professional_certificate: 'Certificado profissional',
  fraud: 'Fraude', harassment: 'Assédio', inappropriate_content: 'Conteúdo impróprio', other: 'Outro',
  service_not_performed: 'Serviço não realizado', service_quality: 'Qualidade do serviço', price_conflict: 'Divergência de preço', property_damage: 'Dano ao imóvel', conduct: 'Conduta'
};

export function resolveStatusLabel(status: string) { return statusLabels[status] || status; }
export function resolveEnumLabel(value: string) { return enumLabels[value] || resolveStatusLabel(value); }
