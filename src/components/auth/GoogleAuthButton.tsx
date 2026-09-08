import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';

import { environment } from '../../config/environment';
import { colors } from '../../theme/colors';
import { PromiseTimeoutError, withTimeout } from '../../utils/promise-timeout';
import { AppButton } from '../ui/AppButton';

interface GoogleAuthButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onIdToken(idToken: string): void;
  onError(message: string): void;
}

export function GoogleAuthButton({
  disabled = false,
  loading = false,
  onIdToken,
  onError
}: GoogleAuthButtonProps) {
  const clientId = environment.googleWebClientId;
  const [nativeLoading, setNativeLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      void GoogleOneTapSignIn.configure({ webClientId: clientId });
    }
  }, [clientId]);

  const googleIcon = <FontAwesome6 color={colors.primary} name="google" size={18} />;

  async function signInWithGoogle() {
    if (disabled || loading || nativeLoading) return;
    setNativeLoading(true);
    onError('');
    try {
      await GoogleOneTapSignIn.checkPlayServices();
      const response = await withTimeout(GoogleOneTapSignIn.presentExplicitSignIn(), 20000);
      if (isCancelledResponse(response)) {
        onError('Login com Google cancelado.');
        return;
      }
      if (!isSuccessResponse(response) || !response.data.idToken) {
        onError('O Google não retornou uma credencial de identidade. Tente novamente.');
        return;
      }
      onIdToken(response.data.idToken);
    } catch (error) {
      onError(resolveGoogleSignInError(error));
    } finally {
      setNativeLoading(false);
    }
  }

  if (!clientId) {
    return (
      <View>
        <AppButton
          disabled
          icon={googleIcon}
          label="Continuar com Google"
          onPress={() => undefined}
          variant="secondary"
        />
        <Text style={styles.configurationMessage}>
          Login Google aguardando a configuração OAuth do aplicativo.
        </Text>
      </View>
    );
  }

  return (
    <AppButton
      disabled={disabled}
      icon={googleIcon}
      label="Continuar com Google"
      loading={loading || nativeLoading}
      onPress={() => void signInWithGoogle()}
      variant="secondary"
    />
  );
}

function resolveGoogleSignInError(error: unknown) {
  if (error instanceof PromiseTimeoutError) {
    return 'O Google demorou para responder. Verifique sua conta no dispositivo e tente novamente.';
  }
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return 'O Google Play Services não está disponível ou precisa ser atualizado.';
    }
    if (error.code === statusCodes.DEVELOPER_ERROR) {
      return 'O login Google não está configurado para esta assinatura do aplicativo.';
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return 'Já existe um login Google em andamento.';
    }
  }
  return 'Não foi possível autenticar com o Google. Tente novamente.';
}

const styles = StyleSheet.create({
  configurationMessage: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 8 }
});
