import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { Screen } from '../components/ui/Screen';
import { PrivateMediaImage } from '../components/ui/PrivateMediaImage';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { UserBlockStatus, UserSafetyActions } from '../components/ui/UserSafetyActions';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ChatMessage, UserProfile } from '../types/api';
import { uploadMedia } from '../utils/media-upload';
import { choosePhotos } from '../utils/photo-picker';

function resolveMessageContent(message: ChatMessage) {
  if (message.type === 'budget') return `Orçamento: R$ ${message.budgetAmount}`;
  return message.content || 'Mensagem do sistema';
}

function resolvePresenceLabel(isTyping: boolean, isOnline: boolean) {
  if (isTyping) return 'digitando...';
  return isOnline ? 'online' : 'offline';
}

export function ChatScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<Pick<UserProfile, 'name' | 'profilePhotoMediaId'> | null>(null);
  const [content, setContent] = useState('');
  const [presence, setPresence] = useState({ isOnline: false, isTyping: false });
  const [error, setError] = useState('');
  const [blockStatus, setBlockStatus] = useState<UserBlockStatus | null>(null);
  const canSend = params.isWritable && Boolean(blockStatus?.canMessage);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageList = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    load();
    updateHeartbeat();
    const refreshInterval = setInterval(load, 4000);
    const heartbeatInterval = setInterval(updateHeartbeat, 60_000);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(heartbeatInterval);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      apiRequest('/presence', { method: 'PUT', body: JSON.stringify({ conversationId: params.conversationId, isTyping: false }) }).catch(() => undefined);
    };
  }, [params.conversationId]);

  async function load() {
    try {
      const [messageItems, presenceState, identity] = await Promise.all([
        apiRequest<ChatMessage[]>(`/conversations/${params.conversationId}/messages`),
        apiRequest<{ isOnline: boolean; isTyping: boolean }>(`/conversations/${params.conversationId}/presence`),
        apiRequest<UserProfile>(`/users/${params.otherUserId}/public`)
      ]);
      setMessages(messageItems);
      setPresence(presenceState);
      setOtherUser(identity);
      await apiRequest(`/conversations/${params.conversationId}/read`, { method: 'PATCH' });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Não foi possível atualizar a conversa.');
    }
  }

  function updateContent(value: string) {
    if (!canSend) return;
    setContent(value);
    apiRequest('/presence', { method: 'PUT', body: JSON.stringify({ conversationId: params.conversationId, isTyping: Boolean(value) }) }).catch(() => undefined);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => apiRequest('/presence', { method: 'PUT', body: JSON.stringify({ conversationId: params.conversationId, isTyping: false }) }).catch(() => undefined), 1800);
  }

  function updateHeartbeat() {
    apiRequest('/presence/heartbeat', { method: 'PUT', body: JSON.stringify({}) }).catch(() => undefined);
  }

  async function send() {
    if (!canSend || !content.trim()) return;
    const message = content.trim();
    setContent('');
    try {
      await apiRequest(`/conversations/${params.conversationId}/messages`, { method: 'POST', body: JSON.stringify({ type: 'text', content: message }) });
      await load();
    } catch (currentError) {
      setContent(message);
      Alert.alert('Mensagem não enviada', currentError instanceof Error ? currentError.message : 'Tente novamente.');
    }
  }

  async function sendImage() {
    if (!canSend) return;
    const result = await choosePhotos({ quality: 0.8 });
    if (result.canceled) return;
    try {
      const asset = result.assets[0];
      const mediaId = await uploadMedia(asset.uri, asset.fileName || 'imagem-chat.jpg', asset.mimeType || 'image/jpeg', 'chat_attachment');
      await apiRequest(`/conversations/${params.conversationId}/messages`, { method: 'POST', body: JSON.stringify({ type: 'image', mediaId }) });
      await load();
    } catch (currentError) {
      Alert.alert('Imagem não enviada', currentError instanceof Error ? currentError.message : 'Tente novamente.');
    }
  }

  const presenceLabel = canSend
    ? resolvePresenceLabel(presence.isTyping, presence.isOnline)
    : 'somente consulta';
  let closedNotice = 'Serviço encerrado. A conversa está disponível somente para consulta.';
  if (params.isWritable) closedNotice = 'Conferindo se o envio de mensagens está disponível...';
  if (blockStatus && !blockStatus.canMessage) closedNotice = 'Novas mensagens estão indisponíveis nesta conversa. O histórico e o atendimento são mantidos.';
  if (blockStatus?.isBlocked) closedNotice = 'Você bloqueou esta pessoa. Para desbloquear, toque em Segurança. O bloqueio não cancela o serviço.';

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={headerHeight}>
    <Screen scroll={false} header={<View style={styles.header}>
      <UserAvatar name={params.otherUserName} mediaId={otherUser?.profilePhotoMediaId} size={44} />
      <View><Text style={styles.serviceName}>{params.serviceName}</Text><Text style={styles.name}>{params.otherUserName}</Text><Text style={styles.presence}>{presenceLabel}</Text></View>
    </View>}>
      {Boolean(error) && <StateView message={error} />}
      <UserSafetyActions key={params.otherUserId} targetUserId={params.otherUserId} conversationId={params.conversationId} onStatusChange={setBlockStatus} />
      <FlatList
        ref={messageList}
        data={messages}
        keyExtractor={message => message.id}
        renderItem={({ item: message }) => {
          const ownMessage = message.senderId === user?.id;
          return <Pressable accessibilityHint={ownMessage ? undefined : 'Pressione e segure para denunciar esta mensagem'} onLongPress={ownMessage ? undefined : () => navigation.navigate('Report', { targetUserId: params.otherUserId, conversationId: params.conversationId, messageId: message.id })} style={[styles.bubble, message.type === 'image' && styles.imageBubble, ownMessage ? styles.ownBubble : styles.otherBubble]}>{message.type === 'image' && message.attachment?.mediaId ? <PrivateMediaImage mediaId={message.attachment.mediaId} accessibilityLabel={`Imagem enviada por ${ownMessage ? 'você' : params.otherUserName}`} /> : <Text style={[styles.messageText, ownMessage && styles.ownText]}>{resolveMessageContent(message)}</Text>}<Text style={[styles.time, ownMessage && styles.ownTime]}>{new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{ownMessage && message.readAt ? '  ✓✓' : ''}</Text></Pressable>;
        }}
        contentContainerStyle={styles.messageListContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => messageList.current?.scrollToEnd({ animated: true })}
      />
      {canSend
        ? <View style={styles.composer}><Pressable accessibilityRole="button" accessibilityLabel="Escolher uma foto para enviar na conversa" onPress={sendImage} style={styles.attachment}><Text style={styles.attachmentText}>＋</Text></Pressable><TextInput value={content} onChangeText={updateContent} multiline accessibilityLabel="Mensagem para a conversa do serviço" placeholder="Escreva uma mensagem" placeholderTextColor={colors.textMuted} style={styles.input} /><Pressable accessibilityRole="button" accessibilityLabel="Enviar mensagem" onPress={send} style={styles.send}><Text style={styles.sendText}>Enviar</Text></Pressable></View>
        : <View style={styles.closedNotice}><Text style={styles.closedNoticeText}>{closedNotice}</Text></View>}
    </Screen>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }, serviceName: { color: colors.primary, fontSize: 12, fontWeight: '900' }, name: { color: colors.text, fontWeight: '900' }, presence: { color: colors.success, fontSize: 12 }, messageListContent: { flexGrow: 1, justifyContent: 'flex-end', gap: 8, paddingBottom: 4 }, bubble: { maxWidth: '82%', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16 }, imageBubble: { padding: 5 }, ownBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary }, otherBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, messageText: { flexShrink: 1, color: colors.text, lineHeight: 20 }, ownText: { color: colors.white }, time: { flexShrink: 0, paddingBottom: 1, color: colors.textMuted, fontSize: 10, textAlign: 'right' }, ownTime: { color: colors.border }, composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background }, attachment: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, attachmentText: { color: colors.primary, fontSize: 24, fontWeight: '900' }, input: { flex: 1, minHeight: 48, maxHeight: 120, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, send: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.primary }, sendText: { color: colors.white, fontWeight: '900' }, closedNotice: { padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, closedNoticeText: { color: colors.textMuted, textAlign: 'center', lineHeight: 19 }
});
