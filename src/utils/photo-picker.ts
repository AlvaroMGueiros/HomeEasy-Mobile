import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const cancelledSelection: ImagePicker.ImagePickerCanceledResult = { canceled: true, assets: null };

export async function choosePhotos(options: Omit<ImagePicker.ImagePickerOptions, 'mediaTypes'> = {}) {
  const allowed = await new Promise<boolean>(resolve => {
    Alert.alert('Acesso às fotos', 'Você autoriza abrir o seletor para escolher fotos? O Home Easy receberá somente as imagens que você selecionar.', [
      { text: 'Agora não', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Escolher fotos', onPress: () => resolve(true) }
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
  if (!allowed) return cancelledSelection;
  try { return await ImagePicker.launchImageLibraryAsync({ ...options, mediaTypes: ['images'] }); }
  catch {
    Alert.alert('Fotos indisponíveis', 'Não foi possível abrir o seletor de fotos. Tente novamente ou confira as permissões do Home Easy nos ajustes do aparelho.');
    return cancelledSelection;
  }
}
