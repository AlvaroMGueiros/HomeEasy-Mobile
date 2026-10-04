import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { ProfessionalService } from '../../types/api';
import { formatCurrency } from '../../utils/currency';
import { resolveServiceIcon } from '../../utils/service-icon';
import { AppButton } from '../ui/AppButton';
import { StateView } from '../ui/StateView';

export function ProfessionalServiceList({ services, onSelect, compact = false, canRequest = true }: { services: ProfessionalService[]; onSelect(service: ProfessionalService): void; compact?: boolean; canRequest?: boolean }) {
  if (!services.length) return <StateView icon="briefcase" title="Sem serviços ativos" message="Este profissional ainda não disponibilizou serviços para receber solicitações." />;
  return <View style={styles.list}>{services.map(service => {
    const price = Number(service.basePrice);
    const priceLabel = Number.isFinite(price) && price > 0 ? `A partir de ${formatCurrency(price)}` : 'Preço a combinar';
    const heading = <View style={styles.heading}><View style={styles.icon}><Feather name={resolveServiceIcon(service.name)} size={21} color={colors.primary} /></View><View style={styles.content}><Text style={styles.name}>{service.name}</Text><Text style={styles.category}>{compact ? priceLabel : service.category}</Text></View>{compact && <Feather name="chevron-right" size={18} color={colors.primary} />}</View>;
    if (compact) return <Pressable key={service.id} accessibilityRole="button" onPress={() => onSelect(service)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>{heading}</Pressable>;
    return <View key={service.id} style={styles.card}>{heading}<Text style={styles.description}>{service.description || 'Solicite um orçamento e combine os detalhes do atendimento.'}</Text><Text style={styles.price}>{priceLabel}</Text><AppButton label="Solicitar orçamento" disabled={!canRequest} onPress={() => onSelect(service)} /></View>;
  })}</View>;
}

const styles = StyleSheet.create({ list: { gap: 12 }, card: { gap: 13, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, heading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, content: { flex: 1, gap: 4 }, name: { color: colors.text, fontSize: 16, fontWeight: '800' }, category: { color: colors.textMuted, fontSize: 12 }, description: { color: colors.textMuted, fontSize: 13, lineHeight: 20 }, price: { color: colors.primary, fontSize: 15, fontWeight: '800' }, pressed: { backgroundColor: colors.background } });
