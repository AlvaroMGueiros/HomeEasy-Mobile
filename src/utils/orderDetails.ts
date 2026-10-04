import { Order, OrderStatus } from '../types/api';

const paymentLabels: Record<string, string> = { pix: 'Pix', cash: 'Dinheiro', card: 'Cartão', bank_transfer: 'Transferência bancária' };

export function formatOrderPaymentMethods(paymentMethods: string[]) {
  return paymentMethods.map(method => paymentLabels[method] || method).join(', ') || 'A combinar';
}

export function formatServiceDuration(durationMinutes: number) {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return 'A combinar';
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export function resolveOrderStatusDescription(status: OrderStatus, isClient: boolean, hasSchedule: boolean) {
  switch (status) {
    case OrderStatus.Accepted: return hasSchedule ? 'Proposta aceita. Confira a data prevista e combine os detalhes pela conversa.' : 'Proposta aceita. Combine a data e o horário do atendimento pela conversa.';
    case OrderStatus.Scheduled: return 'Atendimento agendado. Confira abaixo o horário e o local combinados.';
    case OrderStatus.InProgress: return 'O atendimento começou. Acompanhe as etapas e converse sobre o serviço por aqui.';
    case OrderStatus.Completed: return isClient ? 'Serviço concluído. Confira os detalhes e avalie seu atendimento.' : 'Serviço concluído. Publique as fotos do resultado na seção abaixo.';
    case OrderStatus.CancelledByClient: return 'Este pedido foi cancelado pelo cliente. Consulte o motivo nos detalhes.';
    case OrderStatus.CancelledByProfessional: return 'Este pedido foi cancelado pelo profissional. Consulte o motivo nos detalhes.';
    case OrderStatus.Disputed: return 'O serviço está em disputa. Acompanhe o relato e a resposta da moderação nesta página.';
  }
}

export function isOrderClosed(order: Order) {
  return order.status === OrderStatus.Completed || order.status === OrderStatus.CancelledByClient || order.status === OrderStatus.CancelledByProfessional;
}

export function resolveOrderAnswerDetails(order: Order) {
  if (!order.request.answers) return [];
  const fieldLabels = new Map(order.request.service?.requestForm?.map(field => [field.key, field.label]));
  return Object.entries(order.request.answers).map(([key, answer]) => {
    let value = String(answer);
    if (typeof answer === 'boolean') value = answer ? 'Sim' : 'Não';
    return { key, label: fieldLabels.get(key) || key.replace(/([a-z])([A-Z])/g, '$1 $2'), value };
  });
}
