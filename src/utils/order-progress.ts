import { Order, OrderStatus, ProfessionalReview } from '../types/api';
import { formatAppointment } from './date';

const progressStages = [
  { status: OrderStatus.Accepted, label: 'Proposta aceita', icon: 'check' },
  { status: OrderStatus.Scheduled, label: 'Serviço agendado', icon: 'calendar' },
  { status: OrderStatus.InProgress, label: 'Serviço em andamento', icon: 'tool' },
  { status: OrderStatus.Completed, label: 'Serviço concluído', icon: 'check-circle' }
] as const;

export function resolveOrderProgress(order: Order, review?: Pick<ProfessionalReview, 'createdAt'> | null) {
  let currentStage = progressStages.findIndex(stage => stage.status === order.status);
  const interrupted = order.status === OrderStatus.Disputed || order.status === OrderStatus.CancelledByClient || order.status === OrderStatus.CancelledByProfessional;
  if (interrupted) {
    currentStage = 0;
    if (order.scheduleConfirmedAt) currentStage = 1;
    if (order.startedAt) currentStage = 2;
    if (order.completedAt) currentStage = 3;
  }
  if (currentStage < 0) return [];
  const recordedDates = [order.createdAt, order.scheduleConfirmedAt, order.startedAt, order.completedAt];
  const pendingDescriptions = ['Aguardando aceite da proposta', 'Combine a data e o horário do serviço', 'Aguardando o início do atendimento', 'Após a realização do serviço'];
  const stages = progressStages.map((stage, index) => {
    let completed = index < currentStage || order.status === OrderStatus.Completed || (interrupted && index <= currentStage);
    if (stage.status === OrderStatus.Scheduled && !order.scheduleConfirmedAt && !order.scheduledAt && order.status !== OrderStatus.Scheduled) completed = false;
    const current = !interrupted && index === currentStage && order.status !== OrderStatus.Completed;
    let description = pendingDescriptions[index];
    if (completed || current) description = recordedDates[index] ? formatAppointment(recordedDates[index]) : 'Etapa registrada · horário não informado';
    if (stage.status === OrderStatus.Scheduled && !recordedDates[index] && order.scheduledAt && (completed || current)) description = 'Previsto para ' + formatAppointment(order.scheduledAt);
    if (stage.status === OrderStatus.Scheduled && !completed && currentStage > index) description = 'Sem agendamento registrado';
    if (interrupted && !completed) description = 'Sem registro desta etapa';
    return { ...stage, completed, current, description };
  });
  let reviewDescription = 'Disponível após a conclusão';
  if (order.status === OrderStatus.Completed) reviewDescription = 'O cliente já pode avaliar o serviço';
  if (interrupted) reviewDescription = 'Avaliação indisponível durante o encerramento do pedido';
  if (review) reviewDescription = formatAppointment(review.createdAt);
  return [...stages, { status: 'review', label: 'Avaliação do atendimento', icon: 'star' as const, completed: Boolean(review), current: !review && order.status === OrderStatus.Completed, description: reviewDescription }];
}
