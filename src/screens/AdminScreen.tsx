import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { apiRequest } from '../api/api-client';
import { AppButton } from '../components/ui/AppButton';
import { PrivateMediaImage } from '../components/ui/PrivateMediaImage';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { colors } from '../theme/colors';
import { AdminMetrics } from '../types/api';
import { resolveEnumLabel } from '../utils/status';

interface AdminDocument { id: string; type: string; mediaId: string; createdAt: string; professional: { name: string; email: string }; media: { fileName: string; contentType: string }; }
interface AdminDispute { id: string; reason: string; description: string; createdAt: string; opener: { name: string; email: string }; order: { client: { name: string }; professional: { user: { name: string } }; request: { service: { name: string } } }; }
interface AdminReport { id: string; category: string; description?: string; }
interface AdminQueue { documents: AdminDocument[]; reports: AdminReport[]; disputes: AdminDispute[]; }

export function AdminScreen() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [queue, setQueue] = useState<AdminQueue | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { void load(); }, []);

  async function load() {
    try {
      const [metricResponse, queueResponse] = await Promise.all([apiRequest<AdminMetrics>('/admin/metrics'), apiRequest<AdminQueue>('/admin/moderation')]);
      setMetrics(metricResponse); setQueue(queueResponse);
    } catch { setError('Não foi possível carregar o painel administrativo.'); }
  }

  async function review(path: string, status: string) {
    try { await apiRequest(path, { method: 'PATCH', body: JSON.stringify({ status, notes: 'Analisado pelo aplicativo Home Easy.' }) }); await load(); }
    catch { Alert.alert('Ação não concluída', 'Não foi possível atualizar esta análise. Tente novamente.'); }
  }

  async function openDocument(mediaId: string) {
    try { const response = await apiRequest<{ downloadUrl: string }>(`/media/${mediaId}/download`); await Linking.openURL(response.downloadUrl); }
    catch { Alert.alert('Documento indisponível', 'Não foi possível abrir este documento.'); }
  }

  if (error) return <Screen><StateView message={error} /></Screen>;
  return <Screen><SectionHeader eyebrow="Administração" title="Moderação e métricas" description="Analise documentos, denúncias e disputas pendentes." />
    {metrics && <View style={styles.metrics}><Metric label="Solicitações" value={metrics.totalRequests} /><Metric label="Abertas" value={metrics.openRequests} /><Metric label="Conversão" value={`${metrics.conversionRate}%`} /><Metric label="Verificações" value={metrics.pendingVerifications} /></View>}
    {!queue && <StateView loading message="Carregando fila..." />}
    {queue?.documents.map(document => <View key={document.id} style={styles.card}><Text style={styles.title}>Documento: {resolveEnumLabel(document.type)}</Text><Text style={styles.line}>Enviado por: {document.professional.name}</Text><Text style={styles.line}>Conta: {document.professional.email}</Text><Text style={styles.line}>Arquivo: {document.media.fileName}</Text><Text style={styles.line}>Enviado em: {formatDateTime(document.createdAt)}</Text>{document.media.contentType.startsWith('image/') && <PrivateMediaImage mediaId={document.mediaId} accessibilityLabel={`Documento de ${document.professional.name}`} />}<AppButton label="Abrir documento completo" variant="secondary" onPress={() => openDocument(document.mediaId)} /><View style={styles.actions}><View style={styles.grow}><AppButton label="Aprovar" onPress={() => review(`/admin/verification/documents/${document.id}`, 'approved')} /></View><View style={styles.grow}><AppButton label="Rejeitar" variant="secondary" onPress={() => review(`/admin/verification/documents/${document.id}`, 'rejected')} /></View></View></View>)}
    {queue?.reports.map(report => <ModerationCard key={report.id} title={`Denúncia: ${resolveEnumLabel(report.category)}`} description={report.description} onResolve={() => review(`/admin/reports/${report.id}`, 'resolved')} />)}
    {queue?.disputes.map(dispute => <View key={dispute.id} style={styles.card}><Text style={styles.title}>Disputa: {resolveEnumLabel(dispute.reason)}</Text><Text style={styles.line}>Aberta por: {dispute.opener.name} ({dispute.opener.email})</Text><Text style={styles.line}>Cliente: {dispute.order.client.name}</Text><Text style={styles.line}>Profissional: {dispute.order.professional.user.name}</Text><Text style={styles.line}>Serviço: {dispute.order.request.service.name}</Text><Text style={styles.line}>Aberta em: {formatDateTime(dispute.createdAt)}</Text><Text style={styles.description}>{dispute.description}</Text><AppButton label="Marcar como resolvido" onPress={() => review(`/admin/disputes/${dispute.id}`, 'resolved')} /></View>)}
  </Screen>;
}

function formatDateTime(value: string) { return new Date(value).toLocaleString('pt-BR'); }
function Metric({ label, value }: { label: string; value: string | number }) { return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
function ModerationCard({ title, description, onResolve }: { title: string; description?: string; onResolve(): void }) { return <View style={styles.card}><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text><AppButton label="Marcar como resolvido" onPress={onResolve} /></View>; }
const styles = StyleSheet.create({ metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, metric: { width: '48%', alignItems: 'center', padding: 15, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, metricValue: { color: colors.primary, fontSize: 22, fontWeight: '900' }, metricLabel: { color: colors.textMuted, fontSize: 12 }, card: { gap: 10, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontWeight: '900' }, line: { color: colors.textMuted, lineHeight: 20 }, description: { padding: 12, borderRadius: 12, color: colors.text, lineHeight: 20, backgroundColor: colors.background }, actions: { flexDirection: 'row', gap: 8 }, grow: { flex: 1 } });
