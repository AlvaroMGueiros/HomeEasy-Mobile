export type NotificationAction =
  | { type: 'request'; id: string }
  | { type: 'order'; id: string }
  | { type: 'professional'; id: string }
  | { type: 'conversations' }
  | { type: 'requests' };

export function resolveNotificationAction(actionUrl?: string): NotificationAction {
  const normalizedUrl = actionUrl || '';
  const id = normalizedUrl.split('/').filter(Boolean).at(-1);

  if ((normalizedUrl.includes('solicitacoes') || normalizedUrl.includes('oportunidades')) && id) {
    return { type: 'request', id };
  }
  if (
    (normalizedUrl.includes('pedidos') ||
      normalizedUrl.includes('pedidos-feitos') ||
      normalizedUrl.includes('pedidos-recebidos')) &&
    id
  ) {
    return { type: 'order', id };
  }
  if (normalizedUrl.includes('conversas')) return { type: 'conversations' };
  if (normalizedUrl.includes('usuario') && id) return { type: 'professional', id };
  return { type: 'requests' };
}
