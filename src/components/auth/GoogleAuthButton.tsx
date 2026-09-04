import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  GoogleOneTapSignIn,
  GoogleSignInButton,
  isErrorWithCode,
  statusCodes
} from 'react-native-nitro-google-signin';

import { environment } from '../../config/environment';
import { colors } from '../../theme/colors';

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

  useEffect(() => {
    if (clientId) {
      void GoogleOneTapSignIn.configure({ webClientId: clientId });
    }
  }, [clientId]);

  if (!clientId) {
    return (
      <View>
        <GoogleSignInButton
          colorScheme="light"
          disabled
          size="wide"
          style={styles.button}
        />
        <Text style={styles.configurationMessage}>
          Login Google aguardando a configuração OAuth do aplicativo.
        </Text>
      </View>
    );
  }

  return (
    <GoogleSignInButton
      accessibilityLabel="Continuar com Google"
      colorScheme="light"
      disabled={disabled || loading}
      loading={loading}
      onSignInError={(error) => onError(resolveGoogleSignInError(error))}
      onSignInSuccess={(response) => {
        if (!response.idToken) {
          onError('O Google não retornou uma credencial de identidade. Tente novamente.');
          return;
        }
        onIdToken(response.idToken);
      }}
      signInBehavior="credentialManager"
      size="wide"
      style={styles.button}
    />
  );
}

function resolveGoogleSignInError(error: unknown) {
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
  button: { width: '100%', height: 48 },
  configurationMessage: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 8 }
});
