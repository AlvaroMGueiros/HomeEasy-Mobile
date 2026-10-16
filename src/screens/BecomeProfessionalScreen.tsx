import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { RootStackParamList } from '../navigation/types';

export function BecomeProfessionalScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  function start() {
    if (user) navigation.navigate('ProfessionalManager');
    else navigation.navigate('Login', { mode: 'register' });
  }

  return <Screen>
    <SectionHeader title="Oferecer serviços" description="Cadastre seus serviços e envie orçamentos para pedidos da sua região." />
    <AppButton label={user ? 'Cadastrar meus serviços' : 'Criar minha conta'} onPress={start} />
    <AppButton label="Como funciona" variant="secondary" onPress={() => navigation.navigate('HowItWorks')} />
  </Screen>;
}
