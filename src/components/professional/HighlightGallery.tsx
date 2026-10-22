import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { resolveServiceIcon } from '../../utils/service-icon';
import { AppText } from '../ui/AppText';

function HighlightImage({ source, width, title, aspectRatio }: { source: ImageSourcePropType; width: number; title: string; aspectRatio: number }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ width, aspectRatio }}>
    {failed ? <View style={styles.placeholder}><AppText style={styles.placeholderText}>Foto indisponível</AppText></View> : <Image source={source} resizeMode="cover" style={styles.image} accessibilityLabel={title} onError={() => setFailed(true)} />}
  </View>;
}

export function HighlightGallery({ mediaIds, title, serviceName, aspectRatio = 4 / 3, showIndicators = false }: { mediaIds: string[]; title: string; serviceName?: string; aspectRatio?: number; showIndicators?: boolean }) {
  const [width, setWidth] = useState(300);
  const [index, setIndex] = useState(0);
  const photoKey = mediaIds.join(',');
  const images = mediaIds.map(mediaId => ({ uri: resolvePublicMediaUrl(mediaId) }));
  useEffect(() => { setIndex(0); }, [photoKey]);
  return <View onLayout={event => setWidth(event.nativeEvent.layout.width)}><View style={styles.container}>
    <ScrollView key={photoKey} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={event => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}>
      {images.map((source, photoIndex) => <HighlightImage key={mediaIds[photoIndex] || photoIndex} source={source} width={width} title={title} aspectRatio={aspectRatio} />)}
    </ScrollView>
    {serviceName && <View style={styles.serviceTag}><Feather name={resolveServiceIcon(serviceName)} size={16} color={colors.text} /><AppText style={styles.serviceText} numberOfLines={1}>{serviceName}</AppText></View>}
    {images.length > 1 && <View style={styles.counter}><AppText style={styles.counterText}>{Math.min(index + 1, images.length)}/{images.length}</AppText></View>}
  </View>{showIndicators && images.length > 1 && <View style={styles.dots}>{images.map((_, photoIndex) => <View key={photoIndex} style={[styles.dot, photoIndex === index && styles.activeDot]} />)}</View>}</View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', borderRadius: 16, backgroundColor: colors.primarySoft, overflow: 'hidden' }, image: { width: '100%', height: '100%' }, placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' }, placeholderText: { color: colors.textMuted },
  counter: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.photoCounterBackground }, counterText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  serviceTag: { position: 'absolute', top: 10, left: 10, maxWidth: '75%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.photoLabelBackground }, serviceText: { flexShrink: 1, color: colors.text, fontSize: 11 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingTop: 9 }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.border }, activeDot: { backgroundColor: colors.primary },
});
