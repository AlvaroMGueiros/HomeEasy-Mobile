import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Notification } from '../types/api';
import { formatDate } from '../utils/date';
import { resolveNotificationAction } from '../utils/notification-action';

export function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const mutationVersion = useRef(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const version = mutationVersion.current;
      apiRequest<Notification[]>('/notifications')
        .then(notifications => { if (active && version === mutationVersion.current) { setItems(notifications); setError(''); } })
        .catch(currentError => { if (active && version === mutationVersion.current) setError(currentError.message); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [])
  );

  async function markAllRead() {
    if (markingAll || loading) return;
    setMarkingAll(true);
    mutationVersion.current += 1;
    try {
      const response = await apiRequest<{ readAt: string }>('/notifications/read-all', { method: 'PATCH' });
      setItems(current => current.map(notification => notification.readAt ? notification : { ...notification, readAt: response.readAt }));
      setError('');
    } catch (currentError) {
      Alert.alert('Não foi possível marcar as notificações', currentError instanceof Error ? currentError.message : 'Confira sua conexão e tente novamente.');
    } finally {
      setMarkingAll(false);
    }
  }

  async function open(item: Notification) {
    if (!item.readAt) {
      try {
        const updated = await apiRequest<Notification>(`/notifications/${item.id}/read`, { method: 'PATCH' });
        mutationVersion.current += 1;
        setItems(current => current.map(notification => (notification.id === item.id ? updated : notification)));
      } catch {
        // ignora erro ao marcar como lida
      }
    }

    const action = resolveNotificationAction(item.actionUrl);
    if (action.type === 'request') {
      navigation.navigate('RequestDetail', { requestId: action.id });
    } else if (action.type === 'order') {
      navigation.navigate('OrderDetail', { orderId: action.id });
    } else if (action.type === 'conversations') {
      navigation.navigate('App', { screen: 'Conversations' });
    } else if (action.type === 'professional') {
      navigation.navigate('Professional', { professionalId: action.id });
    } else {
      navigation.navigate('App', { screen: 'Requests' });
    }
  }

  return (
    <Screen>
      <SectionHeader
        title="Notificações"
      />
      {items.some(notification => !notification.readAt) && <AppButton label="Marcar todas como lidas" variant="secondary" loading={markingAll} disabled={loading} onPress={() => void markAllRead()} />}
      {loading && <StateView loading message="Carregando notificações..." />}
      {Boolean(error) && <StateView message={error} />}
      {!loading && !error && !items.length && (
        <StateView message="Você está em dia. Nenhuma notificação nova." />
      )}
      {items.map(item => (
        <Pressable
          key={item.id}
          onPress={() => open(item)}
          style={[styles.card, !item.readAt && styles.unread]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.date}>
            {formatDate(item.createdAt)}
            {!item.readAt ? ' · Nova' : ''}
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 6, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  unread: { borderColor: colors.accent, borderLeftWidth: 5 },
  title: { color: colors.text, fontWeight: '800' },
  body: { color: colors.textMuted, lineHeight: 20 },
  date: { color: colors.primary, fontSize: 11, fontWeight: '700' }
});
