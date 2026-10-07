import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RegionalMap } from '../components/RegionalMap';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { StateView } from '../components/ui/StateView';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { buildRegionalMapHtml } from '../utils/regional-map-html';
import { formatServiceAddress, resolveServiceAddress, ServiceAddressError, ServiceAddressMatch } from '../utils/service-address';

export function ServiceAddressMapScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceAddressMap'>>();
  const [coordinate, setCoordinate] = useState<ServiceAddressMatch | null>(null);
  const [matches, setMatches] = useState<ServiceAddressMatch[]>([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setCoordinate(null);
    setMatches([]);
    setError('');
    resolveServiceAddress(params).then(resolvedMatches => {
      if (!active) return;
      setMatches(resolvedMatches);
      if (resolvedMatches.length === 1) setCoordinate(resolvedMatches[0]);
    }).catch(failure => {
      if (active) setError(failure instanceof ServiceAddressError ? failure.message : 'Não foi possível consultar o endereço do serviço. Tente novamente.');
    });
    return () => { active = false; };
  }, [params.address, params.city, params.state, attempt]);

  const mapHtml = useMemo(() => {
    if (!coordinate) return null;
    return buildRegionalMapHtml({ ...coordinate, latitudeDelta: 0.008, longitudeDelta: 0.008 }, [], true, false, 'Local do serviço');
  }, [coordinate]);

  return <Screen scroll={false}>
    <Text style={styles.title}>Local do atendimento</Text>
    <Text style={styles.address}>{formatServiceAddress(params)}</Text>
    {!mapHtml && matches.length === 0 && <StateView loading={!error} title={error ? 'Endereço não confirmado' : undefined} message={error || 'Localizando o endereço do serviço...'} onAction={error ? () => setAttempt(currentAttempt => currentAttempt + 1) : undefined} />}
    {!coordinate && matches.length > 1 && <>
      <Text style={styles.help}>Encontramos mais de um local. Escolha o endereço correspondente ao pedido.</Text>
      {matches.map(match => <AppButton key={`${match.latitude}:${match.longitude}:${match.label}`} label={match.label} variant="secondary" onPress={() => setCoordinate(match)} />)}
    </>}
    {mapHtml && <>
      <Text style={styles.address}>Encontrado: {coordinate?.label}</Text>
      <View style={styles.map}><RegionalMap html={mapHtml} onSelectCity={() => undefined} failureMessage="O endereço foi localizado, mas o mapa não carregou. Confira sua conexão e tente novamente." /></View>
      <Text style={styles.help}>Localização aproximada do endereço encontrado. Confirme o número e o ponto de referência pela conversa.</Text>
      {matches.length > 1 && <AppButton label="Escolher outro resultado" variant="secondary" onPress={() => setCoordinate(null)} />}
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  address: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  map: { flex: 1, minHeight: 240, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.background },
  help: { color: colors.textMuted, fontSize: 12, lineHeight: 18 }
});
