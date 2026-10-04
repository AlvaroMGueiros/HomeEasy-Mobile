import { StyleSheet, View } from 'react-native';

import { Professional } from '../../types/api';
import { StateView } from '../ui/StateView';
import { ProfessionalPortfolioPhoto } from './ProfessionalPortfolioPhoto';

export function ProfessionalProfilePhotos({ professional }: { professional: Professional }) {
  if (!professional.portfolioPhotos?.length) return <StateView icon="image" title="Nenhuma foto de serviço adicionada" message="Este profissional ainda não publicou fotos dos seus serviços." />;
  return <View style={styles.container}>{professional.portfolioPhotos.map(photo => <ProfessionalPortfolioPhoto key={photo.mediaId} photo={photo} />)}</View>;
}

const styles = StyleSheet.create({ container: { gap: 22 } });
