import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

import { ApiError, apiRequest } from '../api/api-client';
import { isPlusBillingConfigured, loadPlusPackage, purchasePlus, restorePlus } from '../api/subscriptions';
import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Screen } from '../components/ui/Screen';
import { StateView } from '../components/ui/StateView';
import { environment } from '../config/environment';
import { colors } from '../theme/colors';
import { HomeEasyPlusStatus } from '../types/subscription';
import { formatDate } from '../utils/date';
import { openExternalLink } from '../utils/external-link';
import { isPurchaseCancelled, resolvePlusBasePlan } from '../utils/homeEasyPlus';

export function HomeEasyPlusScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<HomeEasyPlusStatus | null>(null);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const mounted = useRef(false);
  const currentAccount = useRef(user?.id);
  currentAccount.current = user?.id;
  const monthlyPrice = monthlyPackage ? resolvePlusBasePlan(monthlyPackage)?.fullPricePhase?.price.formatted : '';

  useFocusEffect(useCallback(() => {
    mounted.current = true; let active = true;
    setLoading(true); setError(''); setMonthlyPackage(null); setStatus(null);
    void (async () => {
      try {
        const subscription = await apiRequest<HomeEasyPlusStatus>('/subscriptions/me');
        if (!active) return;
        setStatus(subscription);
        if (subscription.enabled && isPlusBillingConfigured() && user) {
          const available = await loadPlusPackage(user.id);
          if (active) setMonthlyPackage(available);
        }
      } catch (failure) {
        if (active && failure instanceof ApiError && failure.status === 404) setStatus({ enabled: false, active: false, expiresAt: null, willRenew: false, publicationLimit: 4, portfolioLimit: 30 });
        else if (active) setError(failure instanceof Error ? failure.message : 'Não foi possível consultar os planos disponíveis.');
      }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; mounted.current = false; };
  }, [user?.id]));

  async function runPurchase(restore: boolean) {
    if (!user || inFlight.current || (!restore && !monthlyPackage)) return;
    const accountId = user.id;
    inFlight.current = true; setBusy(true);
    try {
      const confirmed = restore ? await restorePlus(user.id) : await purchasePlus(user.id, monthlyPackage!);
      if (!mounted.current || currentAccount.current !== accountId) return;
      setStatus(confirmed);
      Alert.alert(confirmed.active ? 'HomeEasy+ ativo' : 'Assinatura ainda não confirmada', confirmed.active ? 'Seus benefícios já estão disponíveis.' : 'Se a compra estiver pendente na Google Play, aguarde a confirmação antes de tentar novamente.');
    } catch (failure) {
      if (mounted.current && currentAccount.current === accountId && !isPurchaseCancelled(failure)) Alert.alert('Assinatura não confirmada', failure instanceof Error ? failure.message : 'Não foi possível confirmar a compra. Use Restaurar compras para consultar novamente.');
    } finally { inFlight.current = false; if (mounted.current) setBusy(false); }
  }

  async function openLink(url: string) {
    try { await openExternalLink(url); }
    catch { Alert.alert('Link indisponível', 'Não foi possível abrir este endereço. Tente novamente.'); }
  }

  return <Screen>
    <View style={styles.hero}><View style={styles.mark}><Feather name="star" size={30} color={colors.white} /></View><AppText style={styles.title}>HomeEasy+</AppText><AppText style={styles.subtitle}>Mais espaço para mostrar seu trabalho.</AppText></View>
    <View style={styles.benefits}>
      <View style={styles.benefit}><Feather name="grid" size={21} color={colors.primary} /><View style={styles.copy}><AppText style={styles.benefitTitle}>Até 12 publicações</AppText><AppText style={styles.detail}>O plano gratuito continua com até 4.</AppText></View></View>
      <View style={styles.benefit}><Feather name="image" size={21} color={colors.primary} /><View style={styles.copy}><AppText style={styles.benefitTitle}>Até 60 fotos no portfólio</AppText><AppText style={styles.detail}>Mais exemplos dos serviços que você oferece.</AppText></View></View>
    </View>
    {loading && <StateView loading message="Consultando assinatura..." />}
    {Boolean(error) && <StateView message={error} />}
    {!loading && !error && status?.active && <View style={styles.plan}><AppText style={styles.planTitle}>Seu HomeEasy+ está ativo</AppText>{status.expiresAt && <AppText style={styles.detail}>{status.willRenew ? 'Próxima renovação' : 'Acesso até'}: {formatDate(status.expiresAt)}</AppText>}</View>}
    {!loading && !error && !status?.active && monthlyPackage && <View style={styles.plan}><AppText style={styles.price}>{monthlyPrice}<AppText style={styles.period}> / mês</AppText></AppText><AppText style={styles.detail}>Renovação automática mensal. Cancele pela Google Play. O aplicativo também pode ser usado gratuitamente.</AppText><AppButton label="Assinar pela Google Play" loading={busy} onPress={() => void runPurchase(false)} /></View>}
    {!loading && !error && !status?.active && !monthlyPackage && <AppText style={styles.notice}>As assinaturas ainda não estão disponíveis para compra.</AppText>}
    {status?.enabled && isPlusBillingConfigured() && <AppButton label="Restaurar compras" variant="secondary" disabled={busy || loading} onPress={() => void runPurchase(true)} />}
    <AppButton label="Gerenciar ou cancelar assinatura" variant="secondary" disabled={busy} onPress={() => void openLink('https://play.google.com/store/account/subscriptions')} />
    <View style={styles.links}><AppButton label="Privacidade" variant="secondary" onPress={() => void openLink(environment.privacyPolicyUrl)} /><AppButton label="Termos do plano" variant="secondary" onPress={() => void openLink(environment.plusTermsUrl)} /></View>
    <AppText style={styles.footnote}>Publicações continuam sujeitas à aprovação. O plano não garante contratações, posição no feed ou selo de identidade verificada. Ao terminar, o acesso volta aos limites gratuitos; as fotos existentes não são apagadas.</AppText>
    <AppText style={styles.footnote}>A compra usa o RevenueCat para validar a assinatura, associado ao identificador da sua conta HomeEasy. O aplicativo não recebe os dados do seu cartão.</AppText>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 20, gap: 12 }, mark: { width: 66, height: 66, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, title: { color: colors.text, fontSize: 32, fontWeight: '800' }, subtitle: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
  benefits: { padding: 20, gap: 24, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface }, benefit: { flexDirection: 'row', gap: 14 }, copy: { flex: 1, gap: 5 }, benefitTitle: { color: colors.text, fontWeight: '800', fontSize: 15 }, detail: { color: colors.textMuted, fontSize: 13, lineHeight: 21 },
  plan: { backgroundColor: colors.primarySoft, borderRadius: 20, padding: 20, gap: 15 }, price: { fontSize: 30, fontWeight: '800', color: colors.primary }, period: { fontSize: 14, fontWeight: '500', color: colors.textMuted }, planTitle: { fontWeight: '800', fontSize: 18, color: colors.primary }, notice: { textAlign: 'center', color: colors.textMuted, lineHeight: 22 }, links: { gap: 10 }, footnote: { fontSize: 11, lineHeight: 18, color: colors.textMuted },
});
