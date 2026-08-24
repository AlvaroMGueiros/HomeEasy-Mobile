import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

export function PublicNavigation() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return <View style={styles.container}><Pressable onPress={() => navigation.navigate('HowItWorks')}><Text style={styles.link}>Como funciona</Text></Pressable><Pressable onPress={() => navigation.navigate('BecomeProfessional')}><Text style={styles.link}>Para profissionais</Text></Pressable><Pressable onPress={() => navigation.navigate('About')}><Text style={styles.link}>Sobre</Text></Pressable><Pressable onPress={() => navigation.navigate('Contact')}><Text style={styles.link}>Contato</Text></Pressable></View>;
}
const styles = StyleSheet.create({ container: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18, paddingVertical: 8 }, link: { color: colors.textMuted, fontSize: 13, fontWeight: '700' } });
