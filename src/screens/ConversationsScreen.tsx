import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Conversation } from '../types/api';

function resolveConversationMeta(conversation: Conversation) {
  if (!conversation.isWritable) return 'Serviço encerrado · somente leitura';
  if (!conversation.lastMessageAt) return 'Abrir conversa';
  return new Date(conversation.lastMessageAt).toLocaleString('pt-BR');
}

export function ConversationsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    setLoading(true);
    setError('');
    apiRequest<Conversation[]>('/conversations')
      .then(setConversations)
      .catch(currentError => setError(currentError.message))
      .finally(() => setLoading(false));
  }, []));

  return <Screen>
    <SectionHeader eyebrow="Central de contato" title="Conversas" description="Uma conversa separada para cada serviço contratado." />
    {loading && <StateView loading message="Carregando conversas..." />}
    {Boolean(error) && <StateView message={error} />}
    {!loading && !error && !conversations.length && <StateView message="Nenhuma conversa iniciada." />}
    {conversations.map(conversation => <Pressable
      key={conversation.id}
      style={styles.card}
      onPress={() => navigation.navigate('Chat', {
        conversationId: conversation.id,
        otherUserId: conversation.otherUser.id,
        otherUserName: conversation.otherUser.name,
        serviceName: conversation.service.name,
        isWritable: conversation.isWritable
      })}
    >
      <UserAvatar name={conversation.otherUser.name} mediaId={conversation.otherUser.profilePhotoMediaId} size={46} />
      <View style={styles.grow}>
        <Text style={styles.name}>{conversation.service.name}</Text>
        <Text style={styles.person}>{conversation.otherUser.name}</Text>
        <Text style={styles.meta}>{resolveConversationMeta(conversation)}</Text>
      </View>
      {conversation.unreadCount > 0 && <Text style={styles.badge}>{conversation.unreadCount}</Text>}
    </Pressable>)}
  </Screen>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  grow: { flex: 1 },
  name: { color: colors.text, fontWeight: '800' },
  person: { color: colors.text, fontSize: 13 },
  meta: { color: colors.textMuted, fontSize: 12 },
  badge: { color: colors.white, backgroundColor: colors.accent, minWidth: 24, padding: 4, borderRadius: 12, textAlign: 'center', fontWeight: '800' }
});
