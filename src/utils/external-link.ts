import { Linking } from 'react-native';

export async function openExternalLink(url: string) {
  if (!await Linking.canOpenURL(url)) {
    throw new Error('Este endereço não pode ser aberto neste dispositivo.');
  }
  await Linking.openURL(url);
}
