import { RouteProp, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { useAuth } from '../auth/AuthContext';
import { Screen } from '../components/ui/Screen';
import { StateView } from '../components/ui/StateView';
import { UserAvatar } from '../components/ui/UserAvatar';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ChatMessage, UserProfile } from '../types/api';
import { uploadMedia } from '../utils/media-upload';

function resolveMessageContent(message: ChatMessage) {
  if (message.type === 'budget') return `Orçamento: R$ ${message.budgetAmount}`;
  if (message.type === 'image') return 'Imagem anexada';
  return message.content || 'Mensagem do sistema';
}

function resolvePresenceLabel(isTyping: boolean, isOnline: boolean) {
  if (isTyping) return 'digitando...';
  return isOnline ? 'online' : 'offline';
}

export function ChatScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<Pick<UserProfile, 'name' | 'profilePhotoMediaId'> | null>(null);
  const [content, setContent] = useState('');
  const [presence, setPresence] = useState({ isOnline: false, isTyping: false });
  const [error, setError] = useState('');
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
    if (!params.isWritable) return;
    setContent(value);
    apiRequest('/presence', { method: 'PUT', body: JSON.stringify({ conversationId: params.conversationId, isTyping: Boolean(value) }) }).catch(() => undefined);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => apiRequest('/presence', { method: 'PUT', body: JSON.stringify({ conversationId: params.conversationId, isTyping: false }) }).catch(() => undefined), 1800);
  }

  function updateHeartbeat() {
    apiRequest('/presence/heartbeat', { method: 'PUT', body: JSON.stringify({}) }).catch(() => undefined);
  }

  async function send() {
    if (!params.isWritable || !content.trim()) return;
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
    if (!params.isWritable) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o acesso às fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
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

  const presenceLabel = params.isWritable
    ? resolvePresenceLabel(presence.isTyping, presence.isOnline)
    : 'serviço encerrado';

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <Screen scroll={false} header={<View style={styles.header}>
      <UserAvatar name={params.otherUserName} mediaId={otherUser?.profilePhotoMediaId} size={44} />
      <View><Text style={styles.serviceName}>{params.serviceName}</Text><Text style={styles.name}>{params.otherUserName}</Text><Text style={styles.presence}>{presenceLabel}</Text></View>
    </View>}>
      {Boolean(error) && <StateView message={error} />}
      <FlatList
        ref={messageList}
        data={messages}
        keyExtractor={message => message.id}
        renderItem={({ item: message }) => {
          const ownMessage = message.senderId === user?.id;
          return <View style={[styles.bubble, ownMessage ? styles.ownBubble : styles.otherBubble]}><View style={styles.messageContent}><Text style={[styles.messageText, ownMessage && styles.ownText]}>{resolveMessageContent(message)}</Text><Text style={[styles.time, ownMessage && styles.ownTime]}>{new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{ownMessage && message.readAt ? '  ✓✓' : ''}</Text></View></View>;
        }}
        contentContainerStyle={styles.messageListContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => messageList.current?.scrollToEnd({ animated: true })}
      />
      {params.isWritable
        ? <View style={styles.composer}><Pressable onPress={sendImage} style={styles.attachment}><Text style={styles.attachmentText}>＋</Text></Pressable><TextInput value={content} onChangeText={updateContent} multiline placeholder="Escreva uma mensagem" placeholderTextColor={colors.textMuted} style={styles.input} /><Pressable onPress={send} style={styles.send}><Text style={styles.sendText}>Enviar</Text></Pressable></View>
        : <View style={styles.closedNotice}><Text style={styles.closedNoticeText}>Serviço encerrado. A conversa está disponível somente para consulta.</Text></View>}
    </Screen>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }, serviceName: { color: colors.primary, fontSize: 12, fontWeight: '900' }, name: { color: colors.text, fontWeight: '900' }, presence: { color: colors.success, fontSize: 12 }, messageListContent: { flexGrow: 1, justifyContent: 'flex-end', gap: 8, paddingBottom: 4 }, messageContent: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 }, bubble: { maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16 }, ownBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary }, otherBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, messageText: { flexShrink: 1, color: colors.text, lineHeight: 20 }, ownText: { color: colors.white }, time: { flexShrink: 0, paddingBottom: 1, color: colors.textMuted, fontSize: 10, textAlign: 'right' }, ownTime: { color: colors.border }, composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background }, attachment: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, attachmentText: { color: colors.primary, fontSize: 24, fontWeight: '900' }, input: { flex: 1, minHeight: 48, maxHeight: 120, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, send: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.primary }, sendText: { color: colors.white, fontWeight: '900' }, closedNotice: { padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, closedNoticeText: { color: colors.textMuted, textAlign: 'center', lineHeight: 19 }
});
