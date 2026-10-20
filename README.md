# HomeEasy Mobile

Aplicativo para encontrar profissionais de serviços domésticos e reformas, pedir orçamentos e acompanhar atendimentos. A mesma conta pode contratar e oferecer serviços.

Este repositório contém o aplicativo React Native e Expo. O backend NestJS é mantido separadamente.

## Recursos

### Busca e contratação

- Catálogo e pesquisa de serviços, mapa regional, localização atual e profissionais por cidade.
- Perfis com serviços, apresentação, fotos, avaliações e opção de favoritar.
- Pedidos de orçamento abertos à região ou direcionados a um profissional, com perguntas específicas do serviço e anexos.
- Pedido rápido em três etapas: serviço e fotos, local e data, revisão antes de enviar.
- Comparação de propostas lado a lado com total, duração, materiais, pagamento, escopo e avaliações.
- Busca de profissionais com horário livre e consulta de agenda no perfil (horário de Brasília; duração consultada de uma hora).
- Verificações mostram somente documentos aprovados; telefone não é marcado como confirmado.
- Compartilhamento de perfis com link `homeeasy://professionals/:id` para abrir no aplicativo instalado.

### Meus serviços

- **Contratei:** atendimentos contratados e orçamentos pedidos pelo cliente.
- **Meu trabalho:** atendimentos a prestar, propostas enviadas e oportunidades da região.
- Resumos de serviços que precisam de atenção e serviços concluídos.
- Detalhes do atendimento com participantes, endereço, valor combinado e histórico do andamento.
- Agendamento, início, conclusão, cancelamento, registro de problemas, fotos do resultado, avaliação e recontratação, conforme o estado do serviço e o papel do usuário.

- **Contratar novamente** abre um pedido preenchido para revisão, mantendo o profissional. Data e fotos são escolhidas novamente.
- Atraso e ausência podem ser relatados no próprio atendimento; o acompanhamento fica no histórico.

### Conversas e notificações

- Conversa vinculada a cada atendimento, com texto, imagens, confirmação de leitura e indicadores de presença e digitação.
- Abas **Em andamento** e **Encerradas**; conversas encerradas mantêm o histórico e não recebem novas mensagens.
- Notificações push, lista de avisos e abertura do pedido, atendimento ou conversa correspondente.
- Leitura individual ao abrir uma notificação e botão **Marcar todas como lidas** para atualizar também as notificações fora das 50 exibidas na lista.

- Preferências de push por conta: mensagens, orçamentos, atendimentos/suporte, avaliações e novos pedidos. O histórico interno é preservado.

### Área profissional

- Cadastro de serviços, preços iniciais, apresentação, experiência e dados de contato.
- Cidade, estado e raio de atendimento, com localização necessária para definir a região profissional.
- Agenda semanal, disponibilidade e consulta de pedidos compatíveis com a região e os serviços oferecidos.
- Fotos dos trabalhos, envio de documentos para verificação e acompanhamento das avaliações.

### Conta, segurança e moderação

- Login com senha ou Google, recuperação de senha, edição do perfil e exclusão de conta.
- Bloqueio e desbloqueio pelo perfil profissional ou conversa. O bloqueio impede novas mensagens nos dois sentidos, preserva o histórico e não cancela atendimentos.
- Denúncia de usuário ou de uma mensagem recebida, mantendo a referência para análise da equipe.
- Regras de uso versionadas, com aceite por conta neste aparelho. Esse aceite local não equivale a um registro de consentimento no servidor.
- Área administrativa para consultar métricas, analisar documentos e tratar denúncias e disputas, sujeita à autorização do backend.
- Logout com revogação do refresh token e proteção contra respostas de renovação que cheguem após sair ou trocar de conta.

### Interface e primeiro acesso

- Boas-vindas com opções diretas para buscar um profissional ou cadastrar serviços; o guia completo continua disponível no perfil.
- Campos com exemplos, indicação de obrigatoriedade e seleção de estado pelo nome.
- Splash com fundo da marca e entrada curta da logo; respeita a preferência do aparelho por reduzir movimento.
- Cabeçalhos simplificados e apresentação profissional sem pedidos ou avaliações fictícias.

### Compatibilidade com a API

As funcionalidades dependem de uma versão compatível do backend. Publique os endpoints necessários antes de distribuir o aplicativo:

| Recurso | Endpoint |
| --- | --- |
| Marcar todas as notificações da conta como lidas | `PATCH /notifications/read-all` |
| Consultar bloqueio nos dois sentidos | `GET /blocks/:userId` |
| Bloquear ou desbloquear uma pessoa | `PUT /blocks/:userId` e `DELETE /blocks/:userId` |
| Denunciar uma mensagem | `POST /reports`, com `messageId` opcional |
| Revogar o refresh token ao sair | `POST /auth/logout` |

Na `master`, informar uma forma de pagamento na proposta registra o combinado com o profissional; não realiza uma cobrança automática.

## Tecnologias

Expo SDK 57, React Native 0.86, React 19, TypeScript 6 e React Navigation 7. Tokens são armazenados com Expo SecureStore. Os mapas usam Leaflet local e imagens do OpenStreetMap.

## Requisitos

- Node.js 22.13 ou superior compatível com o Expo SDK 57 e npm.
- Backend do HomeEasy configurado e acessível.
- Para Android local: Android Studio, SDK, JDK compatível e emulador ou aparelho com depuração USB.
- Para iOS local: macOS, Xcode e as ferramentas exigidas pelo Expo.

O aplicativo usa módulos nativos, incluindo login Google. Utilize um **development build**, não o Expo Go.

## Configuração local

Instale as versões registradas no lockfile:

```bash
npm ci
```

Copie `.env.example` para `.env.local`. No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Exemplo para o emulador Android, com a API executada no computador:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

| Ambiente de desenvolvimento | Endereço da API |
| --- | --- |
| Emulador Android padrão | `http://10.0.2.2:3000/api` |
| Simulador iOS | `http://localhost:3000/api` |
| Aparelho físico | IP do computador na mesma rede local, com a porta da API acessível |

Para habilitar o login Google, configure seu próprio OAuth Client ID e os certificados e identificadores de aplicativo correspondentes. Builds em outra conta também precisam da configuração Firebase e do vínculo EAS apropriados.

**Variáveis `EXPO_PUBLIC_*` ficam acessíveis no aplicativo compilado.** Use-as apenas para configuração pública. Nunca coloque senhas, tokens privados, chaves de servidor ou segredos JWT nesses campos.

URLs e identificadores reais dos ambientes devem ser fornecidos pelos responsáveis pelo projeto, fora deste README. Arquivos `.env*` são ignorados pelo Git, com exceção de `.env.example`.

## Executar

Compile e instale o development build no Android:

```bash
npm run android
```

Para escolher um aparelho conectado:

```bash
npx expo run:android --device
```

Depois da instalação inicial, inicie o Metro:

```bash
npm start
```

Se uma atualização de dependências causar erros de resolução de módulos, encerre o Metro e reinicie com cache limpo:

```bash
npm start -- --clear
```

Mudanças em plugins, permissões e módulos nativos exigem nova compilação; recarregar o JavaScript não atualiza o aplicativo nativo instalado.

## Verificações

```bash
npx tsc --noEmit
npm run verify:forms
npm run verify:permissions
node scripts/verifySessionSecurity.cjs
node scripts/verifySecrets.cjs
npm audit
```

O workflow [Security](.github/workflows/security.yml) verifica os projetos mobile e motion com suas configurações TypeScript separadas, executa as verificações de segurança e consulta vulnerabilidades das dependências. O scanner de padrões de credenciais não substitui uma auditoria completa.

## Builds Android com EAS

Os perfis estão em [eas.json](eas.json). Antes de compilar, confira os valores efetivos no perfil e no ambiente EAS; valores definidos no perfil têm precedência sobre os mesmos nomes no ambiente.

| Perfil | Uso |
| --- | --- |
| `development` | Development build para usar com o Metro |
| `preview` | APK para testes internos |
| `production-apk` | APK assinado para instalação direta, sem depender do Metro |
| `production` | AAB para envio ao Google Play, com incremento remoto da versão de build |

Após autenticar na conta Expo autorizada e conferir o vínculo do projeto:

```bash
npx eas-cli build --platform android --profile production-apk
```

Para gerar o pacote destinado ao Google Play:

```bash
npx eas-cli build --platform android --profile production
```

Builds distribuídos exigem uma URL de API **HTTPS** explícita. O EAS envia o código para compilação remota; [.easignore](.easignore) exclui arquivos de ambiente, ferramentas locais e o projeto motion.

Gerar um APK ou AAB não publica o aplicativo. A publicação também exige validar assinatura, permissões, funcionamento em aparelhos reais, páginas legais e os requisitos do Play Console.

## Organização

```text
src/
  api/            Cliente HTTP e persistência da sessão
  auth/           Contexto de autenticação
  components/     Componentes compartilhados
  config/         Configurações, textos e regras
  navigation/     Rotas e parâmetros tipados
  notifications/  Registro e tratamento de notificações push
  screens/        Telas
  theme/          Cores do aplicativo
  types/          Contratos consumidos da API
  utils/          Validação, formatação e outras funções compartilhadas
```

As cores são centralizadas em `src/theme/colors.ts`. Antes de alterar uma tela, reutilize os componentes e padrões existentes. Autorização e validação de acesso a recursos são responsabilidade do backend, mesmo quando há restrições visuais no app.

## Permissões e dados

- **Localização:** solicitada na entrada; usada na descoberta e na região de atendimento.
- **Fotos:** selecionadas pelo seletor do sistema para perfil, documentos e anexos. Não há pedido de acesso amplo à biblioteca no Android.
- **Notificações:** dependem da autorização do sistema e do registro do aparelho na API.
- **Microfone e câmera:** bloqueados na configuração do aplicativo.
- **Consulta de endereço:** solicita autorização antes de enviar o endereço ao Photon/Komoot. Mapas carregam imagens do OpenStreetMap.

Consulte [a revisão de segurança](docs/securityHardening.md) e [as regras de moderação e permissões](docs/mobileSafetyReview.md) para limitações e requisitos operacionais. Esses documentos não certificam conformidade legal nem substituem testes do ambiente publicado.

## Mapas, marca e motion

- `npm run bundle:leaflet`: atualiza o bundle local do Leaflet, preservando sua licença.
- `npm run assets:brand`: gera arquivos da marca; veja [assets/brand/README.md](assets/brand/README.md).
- `node scripts/verifyRegionalMap.cjs`: verifica o mapa em navegador; requer as dependências de `motion`.

O projeto de vídeos fica em [motion/](motion/README.md), tem dependências próprias e não integra o build mobile. Para instalar suas dependências separadamente:

```bash
npm ci --prefix motion
```
