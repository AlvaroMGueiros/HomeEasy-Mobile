# Marca Home Easy

`symbol.png` e `wordmark.png` são os arquivos oficiais fornecidos pelo proprietário em 5 de outubro de 2026 (variantes azuis 7 e 8). O componente `BrandLogo` usa a transparência desses arquivos para aplicar as cores de `src/theme/colors.ts`, inclusive branco sobre fundo escuro.

`launcherSource.png` foi preparado com a ferramenta integrada de geração de imagens, usando o símbolo oficial como referência. O ícone é quadrado e opaco; o Android aplica a máscara circular ou arredondada do aparelho.

Prompt utilizado:

> Create production Android app launcher icon for Home Easy using the supplied official logo as invariant source. Exact same house/roof/chimney/central human and wrapping hand symbol silhouette, proportions and negative spaces; no redesign. Recolor symbol pure white. Center the complete symbol in middle 56% of a 1024x1024 square canvas, optical center exact. Full-bleed solid deep teal #075968 background to every edge, opaque. No rounded outer corners, no border, no exterior white area, no text or APP ICON label, no letters. Clean crisp antialiased silhouette, remove extraction speckles. Flat premium app icon, faithful to source logo. Output PNG suitable for Android applying its own circle or squircle mask.

No Android, o gerador usa diretamente o `symbol.png` oficial: remove o espaço transparente externo, aplica branco preservando o canal alfa e centraliza a silhueta em uma área de 540×540 dentro da tela de 1024×1024. A margem de 242 pixels mantém o desenho dentro da área segura do ícone adaptável. O fundo usa `colors.primary` em uma camada separada. A mesma origem é usada para o ícone monocromático, evitando diferença de alinhamento entre os modos do launcher.

Execute `npm run assets:brand` para exportar ícone 1024×1024, camadas adaptáveis, ícone monocromático, splash e favicon e copiar os arquivos oficiais para o projeto Remotion. O arquivo de origem é preservado. Não edite manualmente os derivados.

Alterações no ícone de instalação e na splash nativa exigem um novo build Android; atualizar apenas o JavaScript não altera o ícone de um APK já instalado.
