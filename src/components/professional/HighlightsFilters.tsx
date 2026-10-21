import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { Service } from '../../types/api';
import { HighlightLocation } from '../../types/highlights';
import { buildHighlightsQuery } from '../../utils/highlights';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { FormField } from '../ui/FormField';
import { SelectField } from '../ui/SelectField';
import { StatePickerField } from '../ui/StatePickerField';

export function HighlightsFilters({ location, services, serviceId, onApply }: { location: HighlightLocation | null; services: Service[]; serviceId: string; onApply(location: HighlightLocation, serviceId: string): void }) {
  const [expanded, setExpanded] = useState(!location);
  const [city, setCity] = useState(location?.city || '');
  const [state, setState] = useState(location?.state || '');
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId);
  useEffect(() => { setCity(location?.city || ''); setState(location?.state || ''); setExpanded(!location); }, [location?.city, location?.state]);
  useEffect(() => { setSelectedServiceId(serviceId); }, [serviceId]);

  function apply() {
    try { buildHighlightsQuery({ city, state }, selectedServiceId); }
    catch (failure) { Alert.alert('Escolha a região', (failure as Error).message); return; }
    onApply({ city: city.trim(), state: state.toUpperCase() }, selectedServiceId); setExpanded(false);
  }
  return <View style={styles.panel}>
    <Pressable accessibilityRole="button" accessibilityLabel="Filtrar destaques por cidade e serviço" accessibilityState={{ expanded }} onPress={() => setExpanded(current => !current)} style={styles.trigger}>
      <Feather name="map-pin" size={19} color={colors.primary} /><AppText style={styles.region}>{location ? `${location.city}, ${location.state}` : 'Escolha sua cidade'}</AppText><Feather name="sliders" size={19} color={colors.primary} />
    </Pressable>
    {expanded && <View style={styles.fields}>
      <FormField label="Cidade" required value={city} onChangeText={setCity} placeholder="Ex.: Recife" maxLength={100} />
      <StatePickerField value={state} onChange={setState} required />
      <SelectField label="Serviço" value={selectedServiceId} onChange={setSelectedServiceId} options={[{ value: '', label: 'Todos os serviços' }, ...services.map(service => ({ value: service.id, label: service.name }))]} searchable />
      <AppButton label="Ver destaques" onPress={apply} />
    </View>}
  </View>;
}

const styles = StyleSheet.create({ panel: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border }, trigger: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 16, minHeight: 54 }, region: { flex: 1, fontWeight: '700', color: colors.primary, fontSize: 14 }, fields: { gap: 14, padding: 16, paddingTop: 0 } });
