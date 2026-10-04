import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../../api/api-client';
import { colors } from '../../theme/colors';
import { Professional } from '../../types/api';
import { StateView } from '../ui/StateView';
import { ProfessionalPhotoUpload } from './ProfessionalPhotoUpload';
import { ProfessionalPortfolioPhoto } from './ProfessionalPortfolioPhoto';

export function CompletedOrderPhotos({ orderId }: { orderId: string }) {
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPhotos() {
    setLoading(true); setError('');
    try { setProfessional(await apiRequest<Professional>('/professionals/me')); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível consultar as fotos deste atendimento.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadPhotos(); }, [orderId]);

  return <View style={styles.card}>
    <View style={styles.heading}><Feather name="check-circle" size={22} color={colors.success} /><Text style={styles.title}>Fotos do serviço concluído</Text></View>
    <Text style={styles.description}>Registre o resultado deste atendimento. As fotos serão vinculadas a este pedido e exibidas no seu portfólio.</Text>
    {!professional ? <StateView loading={loading} message={error || 'Carregando fotos...'} onAction={error ? loadPhotos : undefined} /> : <>
      <ProfessionalPhotoUpload description="Adicione uma foto do resultado do serviço." disabled={(professional.portfolioPhotos?.length || 0) >= 30} onPublish={async (mediaId, caption) => { setProfessional(await apiRequest<Professional>(`/professionals/me/orders/${orderId}/photos`, { method: 'POST', body: JSON.stringify({ mediaId, caption }) })); }} />
      {(professional.portfolioPhotos?.length || 0) >= 30 && <Text style={styles.description}>Seu portfólio atingiu 30 fotos. Remova uma foto em Editar perfil para publicar outra.</Text>}
      {professional.portfolioPhotos?.filter(photo => photo.orderId === orderId).map(photo => <ProfessionalPortfolioPhoto key={photo.mediaId} photo={photo} />)}
    </>}
  </View>;
}

const styles = StyleSheet.create({ card: { gap: 16, padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, heading: { flexDirection: 'row', gap: 10, alignItems: 'center' }, title: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '800' }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 } });
