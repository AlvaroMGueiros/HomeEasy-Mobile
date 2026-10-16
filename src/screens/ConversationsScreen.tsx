import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { ChoiceChips, ChoiceOption } from '../components/ui/ChoiceChips';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Conversation } from '../types/api';
import { groupConversationsByAvailability, resolveConversationMeta } from '../utils/conversations';

type ConversationsSection = 'active' | 'closed';
const sectionOptions: ChoiceOption<ConversationsSection>[] = [
  { value: 'active', label: 'Em andamento', icon: 'message-circle' },
  { value: 'closed', label: 'Encerradas', icon: 'archive' }
];

export function ConversationsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [section, setSection] = useState<ConversationsSection>('active');
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

  const { activeConversations, closedConversations } = useMemo(() => groupConversationsByAvailability(conversations), [conversations]);
  const visibleConversations = section === 'active' ? activeConversations : closedConversations;

  return <Screen>
    <SectionHeader eyebrow="Central de contato" title="Conversas" />
    <ChoiceChips value={section} onChange={setSection} options={sectionOptions} segmented />
    {loading && <StateView loading message="Carregando conversas..." />}
    {Boolean(error) && <StateView message={error} />}
    {!loading && !error && <>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{section === 'active' ? 'Conversas em andamento' : 'Conversas encerradas'}</Text><Text style={styles.count}>{visibleConversations.length}</Text></View>
    {!visibleConversations.length && <StateView icon={section === 'active' ? 'message-circle' : 'archive'} title={section === 'active' ? 'Nenhuma conversa em andamento' : 'Nenhuma conversa encerrada'} />}
    {visibleConversations.map(conversation => <Pressable
      key={conversation.id}
      accessibilityRole="button"
      accessibilityLabel={`Abrir conversa de ${conversation.service.name} com ${conversation.otherUser.name}`}
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
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  sectionTitle: { flex: 1, color: colors.text, fontSize: 20, fontWeight: '800' },
  count: { color: colors.textMuted, fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  grow: { flex: 1 },
  name: { color: colors.text, fontWeight: '800' },
  person: { color: colors.text, fontSize: 13 },
  meta: { color: colors.textMuted, fontSize: 12 },
  badge: { color: colors.white, backgroundColor: colors.accent, minWidth: 24, padding: 4, borderRadius: 12, textAlign: 'center', fontWeight: '800' }
});
