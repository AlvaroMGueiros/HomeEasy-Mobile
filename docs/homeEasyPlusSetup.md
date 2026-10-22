# HomeEasy+ — configuração e liberação

Implementação isolada em `feature/homeEasyPlus` nos repositórios mobile e backend. O fluxo usa Google Play Billing via RevenueCat; não usa o Asaas dos pagamentos por serviços presenciais. As flags começam desativadas. Nenhuma cobrança, configuração de conta externa ou migration de produção foi executada.

## O que está implementado

- Perfil → HomeEasy+: preço mensal consultado na loja, compra, restauração, estado confirmado pelo servidor, validade, renovação e gerenciamento/cancelamento na Google Play.
- Primeiro plano: 12 publicações não arquivadas e 60 fotos no portfólio. Gratuito mantém 4 publicações e 30 fotos. Não há compra de verificação, promessa de contratação ou impulsionamento de ranking.
- Janela de oferta na área profissional, apenas para perfil ativo com serviço e fotos, plano disponível na loja e conta não assinante. Frequência máxima local: uma vez a cada sete dias por conta/aparelho. Reinstalação ou outro aparelho pode reiniciar esse prazo.
- O servidor consulta o estado atual no RevenueCat em vez de confiar no SDK ou nas datas recebidas em webhook. Webhooks repetidos e atrasados reconciliam o mesmo estado atual.
- Cancelamento mantém o acesso até a expiração confirmada; reembolso e fim da validade retiram benefícios. Conteúdo acima da cota não é apagado, mas novas inclusões exigem reduzir a quantidade. A exclusão da conta não cancela cobranças na loja.

## Google Play Console

1. Criar/configurar o app Android com o mesmo applicationId do HomeEasy (`com.homeeasy.mobile`) e perfil de pagamentos da sua conta.
2. Cadastrar assinatura `homeeasy_plus_monthly`, com um plano-base de renovação automática mensal. Para o primeiro lançamento, não cadastrar teste grátis ou oferta introdutória; a integração compra o plano-base sem essas ofertas.
3. Definir preço por país. R$ 14,90/mês é uma proposta comercial; o aplicativo sempre mostra o preço retornado pela loja.
4. Publicar um AAB assinado na faixa de testes internos e cadastrar testadores de licença. Instalar pela faixa de teste para validar o fluxo real da Google Play.

## RevenueCat

1. Criar projeto e app Android. Conectar as credenciais Google Play conforme as instruções do painel. Chaves de conta de serviço são secretas: não colocar no app nem no Git.
2. Importar o produto/plano-base e associar ao entitlement `homeEasyPlus`.
3. Criar offering `homeEasyPlus`, com pacote mensal associado ao produto. Configure restauração para **manter as compras com o App User ID original**, evitando transferência automática para outra conta HomeEasy. Cada sessão usa o UUID interno do usuário; não utiliza e-mail como identificador.
4. Cadastrar webhook HTTPS para `/api/subscriptions/revenuecat/webhook`. Definir o header Authorization com um segredo aleatório de pelo menos 32 caracteres, igual a `REVENUECAT_WEBHOOK_AUTH` no servidor. Enviar todos os eventos, incluindo transferências. Não restringir apenas a compras iniciais.
5. Configurar as notificações da Google Play/RTDN para o RevenueCat conforme seu painel. Verificar acesso ao recurso de webhooks no plano contratado do RevenueCat.

## Variáveis do backend

```dotenv
HOME_EASY_PLUS_ENABLED=false
REVENUECAT_SECRET_KEY=
REVENUECAT_WEBHOOK_AUTH=
REVENUECAT_ENTITLEMENT_ID=homeEasyPlus
GOOGLE_PLAY_PLUS_PRODUCT_ID=homeeasy_plus_monthly
REVENUECAT_ALLOW_SANDBOX=false
```

Somente os IDs e as flags são valores públicos. Os dois segredos ficam exclusivamente no ambiente do servidor. Para testes isolados de compras sandbox, usar `REVENUECAT_ALLOW_SANDBOX=true`; não ativar indiscriminadamente na produção. Estados são reconciliados também após 15 minutos sem confirmação quando a conta consulta o plano.

Executar `npm run migration:run` na pasta backend, no ambiente correto, para aplicar `1792627200000-create-professional-subscriptions.ts`. Publicar a API antes do aplicativo. Não usar a flag como substituta da migration.

## Variáveis públicas do app

```dotenv
EXPO_PUBLIC_HOME_EASY_PLUS_ENABLED=false
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
EXPO_PUBLIC_PLUS_OFFERING_ID=homeEasyPlus
EXPO_PUBLIC_PLUS_PRODUCT_ID=homeeasy_plus_monthly
```

Usar a **chave pública Android** do RevenueCat (`goog_...`); nunca uma chave `sk_...`. Preservar a configuração HTTPS de API usada pelo app. Fazer um novo development build ou AAB: o SDK `react-native-purchases` é nativo e não pode ser adicionado apenas com atualização JavaScript/Metro. Não enviar atualização OTA que habilite compras a um runtime sem esse SDK.

## Testes necessários antes de vender

- Compra mensal, compra cancelada pelo usuário e pagamento pendente, sem liberar benefícios antecipadamente.
- Restaurar no mesmo usuário, reinstalar e trocar de usuário, sem compartilhar benefícios entre contas.
- Renovação, cancelamento, fim da validade, falha de cobrança, período de tolerância e reembolso.
- Webhook não autorizado, repetido, atrasado, transferências e indisponibilidade do provedor.
- Limites de 4/12 publicações e 30/60 fotos pelo backend, incluindo downgrade com conteúdo acima do limite.
- Preço da loja, renovação automática e links de gerenciamento, termos e privacidade visíveis.
- Atualizar a política de privacidade e a declaração de segurança dos dados da Play Console para refletir o RevenueCat e os dados efetivamente coletados por seus SDKs.

Somente após esses testes, habilitar as flags no servidor e no novo build distribuído. Sem as credenciais e o produto cadastrado, o app apresenta “assinaturas ainda não disponíveis”, sem checkout fictício.

## Comandos locais

- App: `npx tsc --noEmit` e `node scripts/verifyHomeEasyPlus.cjs`.
- Backend: `npx tsc --noEmit` e `npm test -- --runInBand`.

## Referências

- [Expo — compras no aplicativo](https://docs.expo.dev/guides/in-app-purchases/)
- [RevenueCat — Expo](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [RevenueCat — webhooks](https://www.revenuecat.com/docs/integrations/webhooks)
- [Google Play — regras de assinaturas](https://support.google.com/googleplay/android-developer/answer/9900533)
