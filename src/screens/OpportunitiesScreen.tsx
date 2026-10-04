import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { apiRequest } from '../api/api-client';
import { OpportunityMatch } from '../components/professional/OpportunityMatch';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { ServiceRequest } from '../types/api';

export function OpportunitiesScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [opportunities, setOpportunities] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError('');
      apiRequest<ServiceRequest[]>('/marketplace/opportunities')
        .then(setOpportunities)
        .catch(currentError => setError(currentError.message))
        .finally(() => setLoading(false));
    }, [])
  );

  return (
    <Screen>
      <SectionHeader
        eyebrow="Para profissionais"
        title="Oportunidades"
        description="Priorizadas por compatibilidade com seus serviços, localização, urgência e concorrência."
      />
      {loading && <StateView loading message="Buscando oportunidades..." />}
      {Boolean(error) && <StateView message={error} />}
      {!loading && !error && !opportunities.length && <StateView message="Nenhuma oportunidade disponível agora." />}
      {opportunities.map(opportunity => (
        <Pressable
          key={opportunity.id}
          style={styles.card}
          onPress={() => navigation.navigate('RequestDetail', { requestId: opportunity.id })}
        >
          <Text style={styles.title}>{opportunity.service?.name || 'Serviço'}</Text>
          <Text style={styles.description}>{opportunity.description}</Text>
          <OpportunityMatch score={opportunity.matchScore} reasons={opportunity.matchReasons} />
          <Text style={styles.meta}>
            {opportunity.city}, {opportunity.state} · {opportunity.proposalCount} de {opportunity.maximumProposals} propostas
          </Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 17,
    gap: 8,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  description: { color: colors.textMuted },
  meta: { color: colors.primary, fontSize: 12, fontWeight: '700' }
});
