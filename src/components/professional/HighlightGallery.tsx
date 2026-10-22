import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import { resolvePublicMediaUrl } from '../../utils/media-url';
import { AppText } from '../ui/AppText';

function HighlightImage({ source, width, title }: { source: ImageSourcePropType; width: number; title: string }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ width, aspectRatio: 4 / 3 }}>
    {failed ? <View style={styles.placeholder}><AppText style={styles.placeholderText}>Foto indisponível</AppText></View> : <Image source={source} resizeMode="cover" style={styles.image} accessibilityLabel={title} onError={() => setFailed(true)} />}
  </View>;
}

export function HighlightGallery({ mediaIds, title }: { mediaIds: string[]; title: string }) {
  const [width, setWidth] = useState(300);
  const [index, setIndex] = useState(0);
  const photoKey = mediaIds.join(',');
  const images = mediaIds.map(mediaId => ({ uri: resolvePublicMediaUrl(mediaId) }));
  useEffect(() => { setIndex(0); }, [photoKey]);
  return <View style={styles.container} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <ScrollView key={photoKey} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={event => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}>
      {images.map((source, photoIndex) => <HighlightImage key={mediaIds[photoIndex] || photoIndex} source={source} width={width} title={title} />)}
    </ScrollView>
    {images.length > 1 && <View style={styles.counter}><AppText style={styles.counterText}>{Math.min(index + 1, images.length)}/{images.length}</AppText></View>}
  </View>;
}

const styles = StyleSheet.create({ container: { width: '100%', backgroundColor: colors.primarySoft, overflow: 'hidden' }, image: { width: '100%', height: '100%' }, placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' }, placeholderText: { color: colors.textMuted }, counter: { position: 'absolute', bottom: 12, right: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: colors.surface }, counterText: { color: colors.text, fontSize: 12, fontWeight: '700' } });
