import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors } from '../theme/colors';
import { parseRegionalMapMessage, RegionalMapMessageType } from '../utils/regional-map-message';
import { StateView } from './ui/StateView';

interface RegionalMapProps {
  html: string;
  onSelectCity(city: string, state: string): void;
  failureMessage?: string;
}

export function RegionalMap({ html, onSelectCity, failureMessage = 'Confira sua conexão e tente novamente. Você também pode continuar pela lista de profissionais.' }: RegionalMapProps) {
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const source = useMemo(() => ({ html, baseUrl: 'https://homeeasy-bd496.web.app/' }), [html]);

  function clearLoadingTimeout() {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
  }

  function failMap() {
    clearLoadingTimeout();
    setLoading(false);
    setFailed(true);
  }

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    timeout.current = setTimeout(failMap, 18000);
    return clearLoadingTimeout;
  }, [html, attempt]);

  return <View style={styles.container}>
    <WebView
      key={attempt}
      source={source}
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      overScrollMode="never"
      setBuiltInZoomControls={false}
      applicationNameForUserAgent="HomeEasy/1.0"
      onError={failMap}
      onRenderProcessGone={failMap}
      onMessage={event => {
        const message = parseRegionalMapMessage(event.nativeEvent.data);
        if (!message) return;
        if (message.type === RegionalMapMessageType.SelectCity) {
          onSelectCity(message.city, message.state);
          return;
        }
        clearLoadingTimeout();
        setLoading(false);
        setFailed(message.type === RegionalMapMessageType.Error);
      }}
      style={styles.map}
    />
    {(loading || failed) && <View style={styles.status} pointerEvents={loading ? 'none' : 'auto'}>
      <StateView loading={loading} title={failed ? 'O mapa não carregou' : undefined} message={loading ? 'Carregando mapa...' : failureMessage} onAction={failed ? () => setAttempt(currentAttempt => currentAttempt + 1) : undefined} />
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1, backgroundColor: colors.background },
  status: { position: 'absolute', top: 124, left: 12, right: 12, borderRadius: 20, backgroundColor: colors.surface }
});
