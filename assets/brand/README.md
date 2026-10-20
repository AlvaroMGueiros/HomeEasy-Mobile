# Identidade visual HomeEasy

A marca usa a casa com sinal de confirmação da referência aprovada, reconstruída em vetor para exportação nítida. A palavra-marca usa Plus Jakarta Sans Bold.

As cores vêm de `src/theme/colors.ts`. `scripts/prepareBrandAssets.cjs` é a fonte da geometria vetorial e gera símbolo, palavra-marca, ícones de instalação, notificações, splash e a fonte local do mapa. Execute `npm run assets:brand` após alterações.

O ícone adaptável Android mantém o símbolo colorido centralizado sobre fundo branco, dentro da área segura. O ícone monocromático e o de notificações usam a mesma silhueta em branco. Não há moldura arredondada embutida: o sistema aplica a máscara do dispositivo.

Os textos do app usam `AppText` e os campos usam `AppTextInput`, com famílias e pesos definidos em `src/theme/typography.ts`. A fonte é carregada localmente antes de exibir as telas e não depende da rede.

Mudanças nos ícones e na splash nativa exigem reconstruir o aplicativo. Os arquivos de motion são independentes e não são alterados pelo gerador.
