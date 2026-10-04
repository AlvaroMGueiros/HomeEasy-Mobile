import { Order } from '../types/api';

const progressStatuses = ['accepted', 'scheduled', 'in_progress', 'completed'];
const progressLabels = ['Proposta aceita', 'Serviço agendado', 'Serviço em andamento', 'Serviço concluído'];

export function resolveOrderProgress(order: Order) {
  const currentStage = progressStatuses.indexOf(order.status);
  if (currentStage < 0) return [];
  return progressStatuses.map((status, index) => ({
    status,
    label: progressLabels[index],
    completed: index < currentStage || order.status === 'completed',
    current: index === currentStage
  }));
}
