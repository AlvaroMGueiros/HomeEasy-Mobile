const statusLabels: Record<string, string> = {
  requested: 'Aguardando propostas', proposal_received: 'Propostas recebidas', accepted: 'Aceito', expired: 'Expirado',
  cancelled: 'Cancelado', scheduled: 'Agendado', in_progress: 'Em andamento', completed: 'Concluído',
  cancelled_by_client: 'Cancelado pelo cliente', cancelled_by_professional: 'Cancelado pelo profissional', disputed: 'Em disputa',
  sent: 'Enviada', rejected: 'Recusada', withdrawn: 'Retirada'
};

export function resolveStatusLabel(status: string) { return statusLabels[status] || status; }
