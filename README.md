# Home Easy Mobile

Aplicativo multiplataforma do Home Easy para Android e iOS. A plataforma aproxima clientes e profissionais de serviços domésticos e reformas, reunindo descoberta, contratação, comunicação e acompanhamento do atendimento em uma única experiência.

O aplicativo foi desenvolvido com React Native, Expo e TypeScript e consome a API existente do Home Easy, construída com NestJS e PostgreSQL.

## Visão geral

O Home Easy atende três jornadas principais:

- **Clientes:** encontram profissionais, criam solicitações, analisam propostas, acompanham pedidos e avaliam o atendimento.
- **Profissionais:** publicam seus serviços, definem área de atendimento e disponibilidade, recebem oportunidades e enviam propostas.
- **Administradores:** acompanham métricas e tratam filas de moderação e verificação.

O fluxo principal vai da busca por um serviço até sua conclusão:

1. O cliente encontra um serviço e compara profissionais.
2. Cria uma solicitação aberta ou direcionada, com detalhes, orçamento e anexos.
3. Profissionais compatíveis recebem a oportunidade e enviam propostas.
4. O cliente aceita uma proposta e passa a acompanhar o pedido.
5. Cliente e profissional conversam, combinam o atendimento e atualizam seu andamento.
6. Após a conclusão, o cliente pode avaliar ou recontratar o profissional.

## Funcionalidades

### Acesso e conta

- página inicial pública e navegação pelo catálogo sem autenticação;
- cadastro e login;
- recuperação e redefinição de senha;
- sessão persistida com Expo SecureStore;
- renovação automática do token de acesso;
- edição de perfil e foto;
- dados de contato, endereço e redes profissionais;
- encerramento seguro da sessão.

### Serviços e profissionais

- catálogo de serviços por categoria;
- pesquisa textual com normalização de acentos;
- listagem de profissionais por serviço;
- filtros por nome, cidade, faixa de preço e avaliação mínima;
- perfil público com biografia, serviços, preços e métricas;
- histórico de avaliações e respostas do profissional;
- profissionais favoritos;
- busca regional baseada na localização do usuário;
- mapa com profissionais próximos usando OpenStreetMap.

### Solicitações e propostas

- criação de solicitação aberta ou direcionada a um profissional;
- formulário dinâmico conforme o serviço selecionado;
- urgência, data preferencial, endereço e faixa de orçamento;
- envio de até oito imagens como anexos;
- acompanhamento das solicitações e quantidade de propostas;
- oportunidades compatíveis com os serviços, região e raio do profissional;
- envio de proposta com preço, mensagem, duração estimada, taxa de deslocamento, materiais e forma de pagamento;
- comparação e aceite de propostas.

### Pedidos e atendimento

- acompanhamento separado de solicitações e pedidos contratados;
- confirmação de agendamento;
- início e conclusão do serviço;
- cancelamento com registro no histórico;
- chat vinculado ao pedido;
- histórico da conversa após o encerramento;
- avaliação do profissional ao concluir o serviço;
- recontratação;
- abertura de disputa para mediação.

### Conversas e notificações

- lista de conversas com mensagens não lidas;
- mensagens de texto e imagens;
- diferentes tipos de mensagem, incluindo orçamento e eventos do sistema;
- confirmação de leitura;
- presença online e indicador de digitação;
- restrição de escrita conforme o estado do pedido;
- central de notificações;
- marcação individual como lida;
- redirecionamento contextual a partir da notificação.

### Área profissional

- criação e atualização do perfil profissional;
- configuração de biografia, telefone, cidade e experiência;
- geocodificação da região atendida;
- definição do raio de atendimento;
- seleção de serviços oferecidos;
- preço-base, descrição e disponibilidade por serviço;
- agenda semanal;
- envio e acompanhamento de documentos de verificação;
- consulta de oportunidades disponíveis.

### Segurança e administração

- envio de denúncias por fraude, assédio, conteúdo impróprio ou outros motivos;
- abertura de disputas relacionadas a pedidos;
- painel administrativo com métricas operacionais;
- filas de moderação;
- análise de documentos e verificação de profissionais.

## Tecnologias

- React 19;
- React Native 0.86;
- Expo SDK 57;
- TypeScript 6;
- React Navigation 7;
- Expo SecureStore;
- Expo Location;
- Expo ImagePicker;
- Expo FileSystem;
- React Native WebView;
- OpenStreetMap.

## Arquitetura

```text
src/
├── api/          # Cliente HTTP, tratamento de erros e renovação de sessão
├── auth/         # Estado de autenticação e sessão persistida
├── components/   # Componentes visuais reutilizáveis
├── config/       # Configurações por ambiente
├── navigation/   # Pilhas, abas e parâmetros de rotas tipados
├── screens/      # Telas organizadas por responsabilidade
├── theme/        # Tokens de cores compartilhados
├── types/        # Contratos TypeScript consumidos da API
└── utils/        # Formatação, pesquisa, mídia, datas e mapa
```

A aplicação possui navegação pública e autenticada. Depois do login, a área principal é dividida nas abas **Início**, **Pedidos**, **Mensagens** e **Perfil**, enquanto os demais fluxos são acessados por uma pilha de rotas tipadas.

O cliente HTTP centraliza:

- URL da API por ambiente;
- envio do access token;
- renovação de sessão após respostas `401`;
- prevenção de múltiplas renovações simultâneas;
- serialização JSON e envio de formulários;
- propagação das mensagens específicas retornadas pela API.

## Permissões utilizadas

- **Localização:** encontra profissionais dentro do raio escolhido e geocodifica a região do profissional.
- **Fotos:** permite anexar imagens às solicitações e conversas, enviar documentos e alterar a foto do perfil.
- **Armazenamento seguro:** mantém tokens e dados mínimos da sessão no dispositivo.

## Configuração do ambiente

### Pré-requisitos

- Node.js compatível com o Expo SDK 57;
- npm;
- Expo Go ou um emulador Android/iOS;
- API do Home Easy em execução.

Instale as dependências:

```bash
npm install
```

Defina o endereço da API em um arquivo `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu-cliente-web.apps.googleusercontent.com
```

O login com Google usa código nativo e deve ser testado em um development build,
não no Expo Go:

```bash
npx eas-cli@latest build --profile development --platform android
```

No emulador Android, o endereço padrão é:

```text
http://10.0.2.2:3000/api
```

Em um dispositivo físico, use o endereço IPv4 do computador na mesma rede local.

Em builds distribuídos pelo EAS, configure `EXPO_PUBLIC_API_URL` no ambiente
`preview` ou `production` com a URL HTTPS pública da API. Endereços como
`localhost` e `10.0.2.2` não funcionam em um aparelho físico fora do ambiente
de desenvolvimento.

## Execução

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Ou abra diretamente uma plataforma:

```bash
npm run android
npm run ios
npm run web
```

Para testar os fluxos integrados, mantenha a API do Home Easy acessível pelo endereço configurado e leia o QR Code com o Expo Go ou execute o aplicativo em um emulador.

## Builds com EAS

O perfil `preview` gera um APK para instalação direta e testes internos. O
perfil `production` gera o artefato destinado às lojas, com incremento remoto
da versão de build.

Depois de autenticar e vincular o projeto à conta Expo, execute:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Para gerar um build de produção Android:

```bash
npx eas-cli@latest build --platform android --profile production
```

## Estado atual

O projeto possui um MVP mobile funcional com as jornadas principais de cliente, profissional e administração conectadas ao backend. A configuração está preparada para builds Android e iOS pelo EAS.

Evoluções possíveis incluem notificações push e atualização do chat por conexão em tempo real.

## Equipe

- **Álvaro Miguel
