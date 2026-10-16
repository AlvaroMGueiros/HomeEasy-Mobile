import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { AppButton } from '../components/ui/AppButton';
import { GettingStartedGuide } from '../components/ui/GettingStartedGuide';
import { Screen } from '../components/ui/Screen';
import { SectionHeader } from '../components/ui/SectionHeader';
import { GettingStartedGoal, gettingStartedGuides } from '../config/gettingStarted';
import { RootStackParamList } from '../navigation/types';

export function HowItWorksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [goal, setGoal] = useState(GettingStartedGoal.FindProfessional);

  function start() {
    if (goal === GettingStartedGoal.FindProfessional) navigation.navigate('Services');
    else if (user) navigation.navigate('ProfessionalManager');
    else navigation.navigate('Login', { mode: 'register' });
  }

  return <Screen>
    <SectionHeader eyebrow="Passo a passo" title="Como usar o aplicativo" />
    <GettingStartedGuide goal={goal} onChange={setGoal} />
    <AppButton label={gettingStartedGuides[goal].action} onPress={start} />
  </Screen>;
}