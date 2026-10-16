import { Conversation } from '../types/api';

export function groupConversationsByAvailability(conversations: Conversation[]) {
  const activeConversations: Conversation[] = [];
  const closedConversations: Conversation[] = [];
  for (const conversation of conversations) {
    if (conversation.isWritable) activeConversations.push(conversation);
    else closedConversations.push(conversation);
  }
  return { activeConversations, closedConversations };
}

export function resolveConversationMeta(conversation: Conversation) {
  if (!conversation.isWritable) return 'Serviço encerrado · somente leitura';
  if (!conversation.lastMessageAt) return 'Abrir conversa';
  return new Date(conversation.lastMessageAt).toLocaleString('pt-BR');
}
