# Home Easy — padrão visual e de interface

Referência do código local em 06/10/2026. Este documento descreve o padrão existente e separa recomendações de comportamentos implementados. Não representa uma auditoria completa de acessibilidade nem uma validação do APK em todos os aparelhos.

## Identidade

Home Easy conecta pessoas a profissionais de serviços locais. A interface deve transmitir confiança, proximidade e clareza: fundo claro levemente esverdeado, azul-petróleo nos elementos principais, verde nas seleções e bastante espaço entre informações.

Preservar a personalidade atual. A referência de aplicativos sociais se aplica à leitura de perfis, fotos e reputação; não significa transformar a experiência em um feed social genérico.

## Marca

- Símbolo oficial: `assets/brand/symbol.png`.
- Nome da marca: `assets/brand/wordmark.png`.
- Componente de aplicação: `src/components/ui/BrandLogo.tsx`.
- Ícone instalado: `assets/icon.png`; variantes Android em `assets/android-icon-*.png`.
- Abertura: `assets/splash-icon.png`.

Usar os arquivos oficiais, sem redesenhar o símbolo ou substituir o wordmark por uma fonte aproximada. Preservar proporções e área de respiro. Usar versão clara sobre fundo escuro e versão primária sobre fundo claro. O ícone do aplicativo usa o símbolo, não o nome completo. Mudanças no ícone e na abertura nativa exigem uma nova compilação.

## Cores

Fonte de verdade: `src/theme/colors.ts`. Os valores abaixo são documentação; no código, importar sempre os tokens.

| Token | Valor atual | Função |
| --- | --- | --- |
| primary | #075968 | Botões principais, ícones e destaques da marca |
| primaryStrong | #034854 | Variação escura da marca |
| accent | #18A77B | Seleção ativa, especialmente navegação inferior |
| background | #F4F7F6 | Fundo das telas |
| surface | #FFFFFF | Cards, campos e painéis |
| text | #102D2D | Títulos e conteúdo principal |
| textMuted | #687876 | Descrições e informações secundárias |
| border | #DCE6E4 | Contornos e separadores |
| primarySoft | #E9F2F3 | Superfícies suaves de destaque |
| success / successSoft | #14805E / #E6F5ED | Confirmação e verificação |
| warning | #B76E00 | Avisos e informações de atenção |
| danger | #B42318 | Erros e ações destrutivas |

Não usar cor como único indicador de estado: acompanhar com texto ou ícone significativo.

## Tipografia e ritmo

Os componentes compartilhados consultados usam a fonte padrão da plataforma, com hierarquia por tamanho e peso. Não há uma escala tipográfica centralizada nesses componentes.

| Elemento existente | Tamanho / altura de linha | Peso |
| --- | --- | --- |
| Título de tela em SectionHeader | 30 / 35 | 800 |
| Pergunta principal da home | 24 / 30 | 900 |
| Título de seção da home | 17 | 900 |
| Texto de botão | 16 | 700 |
| Descrição de tela | 15 / 22 | Padrão |
| Busca | 15 | Padrão |
| Rótulo superior de seção | 12; letras espaçadas em 1,2 | 800, maiúsculas |

Medidas são unidades de layout do React Native, não pixels de uma captura. `Screen` usa margem interna de 20 e espaçamento de 18 entre blocos. O conteúdo do painel da home usa margem horizontal de 20 e espaçamento de 14. Respeitar safe areas e espaço da navegação inferior.

## Componentes reutilizáveis

| Componente | Padrão atual |
| --- | --- |
| AppButton | Altura mínima 52, raio 16; variantes primary, secondary e danger; loading e disabled |
| FormField | Altura mínima 50, raio 14, contorno fino; multiline com altura mínima 110 |
| SearchField | Altura mínima 54, raio 16, ícone de busca e ação de limpar |
| SectionHeader | Rótulo opcional, título e descrição opcional |
| Screen | Fundo, safe area, rolagem e atualização por gesto quando fornecida |
| StateView | Estado informativo ou de falha com ação quando aplicável |
| ChoiceChips | Seleção compacta entre opções |
| UserAvatar | Identidade visual do usuário; reutilizar em vez de criar avatares por tela |
| BrandLogo | Símbolo e wordmark oficiais |

Cards seguem superfícies claras, contornos discretos e cantos arredondados. Não existe um único raio global para todos os cards: reaproveitar o componente da mesma responsabilidade. Ícones de navegação e de diversas ações usam Feather, com traço simples.

## Home e mapa

- Mapa regional como base visual, com localização e controles flutuantes.
- Painel inferior arrastável com posições padrão, expandida e recolhida para mostrar mais mapa.
- Botão “Ver profissionais” acompanha o painel, acima de sua borda.
- Saudação, busca, categorias e profissionais recomendados dentro do painel.
- Categorias em grade; recomendações em carrossel no estado padrão e lista vertical quando expandido.
- O código atual ainda possui os chips “Mapa / Lista” e “Voltar para o mapa” quando expandido. Essa duplicidade é uma oportunidade de simplificação, não uma mudança feita por este documento.

Leaflet está incorporado no app; os tiles de OpenStreetMap continuam dependendo de internet. `RegionalMap` concentra carregamento, falha e tentativa novamente. Preservar a atribuição do mapa. A região deve refletir a localização obtida ou a escolha explícita do usuário, sem apresentar uma cidade fixa como se fosse o GPS atual.

## Perfis, conversas e acompanhamento

Perfil profissional deve ter leitura de perfil: capa, avatar, nome, especialidade, região, reputação e conteúdo organizado. Manter os componentes existentes em `src/components/professional/`. Informações de identidade verificada, avaliações e serviços concluídos devem vir dos dados reais; não simular reputação para preencher espaço.

Conversas devem identificar pessoa e serviço. Reutilizar o avatar, com alternativa legível quando não houver foto válida. Não deixar imagens quebradas como principal elemento de identificação.

Pedidos e propostas precisam diferenciar estado, ação disponível e próximo passo. Ações indisponíveis devem explicar o motivo. Disputas devem apresentar os envolvidos e contexto disponível, sem inventar dados ausentes.

## Navegação e linguagem

Navegação inferior: Início, Pedidos, Mensagens e Perfil. Item ativo em `accent`, inativos em `textMuted`. Manter ícone e rótulo; telas de detalhe devem oferecer retorno claro.

Texto em português brasileiro, direto e acolhedor. Usar verbos concretos: “Solicitar orçamento”, “Enviar proposta”, “Tentar novamente”. Mensagens de falha devem dizer o que não foi possível fazer e como continuar, sem stack trace, nomes internos de tabelas ou detalhes de infraestrutura.

## Critérios de revisão de novas telas

Recomendações para validação, não certificações do estado atual:

- Reutilizar componentes e tokens; evitar variações visuais sem necessidade.
- Priorizar uma ação principal por contexto.
- Verificar estados de carregamento, vazio, sucesso, erro e permissão negada.
- Testar nomes longos, ausência de foto, internet lenta e tamanho de fonte ampliado.
- Manter alvos de toque confortáveis; usar 48 unidades como referência para controles pequenos.
- Conferir contraste, rótulos de acessibilidade e leitura por leitor de tela.
- Garantir que teclado, painel e navegação inferior não cubram campos ou ações.
- Testar mapa, zoom e recuperação de falhas em aparelho real, além do emulador.

## Capturas existentes

As capturas abaixo são históricas, armazenadas para o vídeo. Os arquivos têm data de modificação de 26/09/2026 e podem não refletir a marca, cards e comportamentos atuais. Não são mockups novos nem evidência de validação da última compilação.

- [Home com mapa](motion/public/screens/home.png)
- [Perfil — captura histórica](motion/public/screens/profile.png)
- [Solicitações](motion/public/screens/requests.png)
- [Conversas](motion/public/screens/messages.png)
- [Chat](motion/public/screens/chat.png)
- [Painel](motion/public/screens/dashboard.png)

Outros arquivos de diagnóstico estão em `.expo/`, uma pasta temporária. `mapBundledVerified.png` registra um teste isolado do mapa, não a home inteira. `homeeasyRun.png` registrou uma tela branca durante a inicialização em 06/10/2026 e não deve ser usado como screenshot de produto pronto. Nomes de arquivos de teste nem sempre correspondem ao conteúdo capturado.

Antes de publicar material publicitário, atualizar as capturas e revisar nomes, fotos, conversas e outros dados pessoais exibidos.

## Manutenção e autocrítica

Este guia segue os tokens, componentes e medidas observados, sem alterar a interface nem criar outra arquitetura. A tipografia e alguns espaçamentos ainda são definidos localmente; portanto, o padrão não é um design system integralmente tokenizado. Atualizar este documento junto com mudanças nos componentes compartilhados e renovar as capturas antes de tratá-las como referência da versão atual.
