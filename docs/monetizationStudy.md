# Monetização do HomeEasy — estudo e proposta

Pesquisa em 20/10/2026. Proposta para discussão; nenhuma cobrança foi implementada ou ativada. Preços, limites e metas sugeridos são hipóteses de produto, não valores de mercado comprovados.

A proposta mais recente, com preço menor e vitrine na home, está em [Plano acessível e vitrine local](affordablePlanStudy.md). Os valores abaixo registram a análise inicial.

## Recomendação

Começar com uma assinatura profissional opcional, mantendo a contratação básica gratuita. Validar o interesse em ferramentas adicionais antes de cobrar. Depois, oferecer publicidade identificada em regiões com procura suficiente. Considerar comissão por serviço em uma etapa posterior, quando houver pagamento integrado e operação de suporte financeiro.

A assinatura cobra por ferramentas e continua tendo valor quando o profissional atende clientes recorrentes. Sua receita não depende de conseguir impedir toda negociação fora do aplicativo. Isso não elimina a necessidade de atrair clientes e profissionais.

## O que já existe

| Evidência no projeto | Consequência para o plano |
| --- | --- |
| `src/screens/ProfessionalDashboardScreen.tsx`: painel com propostas, conversão, receita de serviços concluídos e próximos atendimentos | Manter o painel básico; vender análises adicionais |
| `src/screens/ScheduleScreen.tsx`: agenda semanal e bloqueios de datas | Manter agenda básica; acrescentar recursos profissionais |
| `src/components/professional/ProfessionalPresentationEditor.tsx`: limite de 30 fotos | Não reduzir o limite atual para criar uma cobrança |
| Backend: `src/professionals/dto/update-professional-presentation.dto.ts` e `professionals.service.ts` também limitam as fotos a 30 | Qualquer limite por plano precisa de validação no servidor |
| Backend: `verificationStatus` inclui `Featured` | Publicidade paga precisa de um campo próprio, separado da verificação |
| Branch `feature/payments-sandbox` separada nos dois repositórios | É uma experiência anterior; sua existência não confirma prontidão para produção |

O código não fornece os números reais de profissionais ativos, pedidos, retenção ou disposição a pagar. Sem essas informações, não é possível estimar receita ou conversão com segurança.

## Oferta inicial proposta

| Recurso | Gratuito | Profissional Pro — hipótese inicial |
| --- | --- | --- |
| Perfil, serviços, propostas e chat | Manter | Incluído |
| Agenda e bloqueios atuais | Manter | Incluído |
| Estatísticas atuais | Manter | Incluído |
| Fotos | Manter até 30 | Até 100, sujeito a capacidade e custo |
| Relatórios | Painel básico | Períodos comparáveis, origem dos pedidos, visualizações reais e exportação |
| Organização | Atendimento atual | Modelos de proposta e lembretes configuráveis |
| Agenda avançada | Horários e bloqueios | Recorrência e organização de clientes recorrentes, após definir consentimento e notificações |
| Verificação e avaliações | Mesmas regras para todos | Não comprar selo nem alterar nota |
| Posição na busca | Critérios orgânicos | Assinatura não garante topo nem contratação |

Testar um único plano mensal, por exemplo R$ 29,90, com um grupo pequeno de profissionais de uma região. Avaliar R$ 49,90 somente se os benefícios e a demanda sustentarem o valor. Não lançar vários planos ou anual antes de entender a renovação mensal.

O primeiro pacote implementável pode conter relatórios por período, exportação, modelos de proposta e portfólio ampliado. Recorrência de agenda fica em uma entrega posterior, pois exige regras de conflitos, alterações e cancelamentos.

## Cobrança: produto digital e serviço presencial são diferentes

Minha leitura para esse desenho: assinatura que libera funções do aplicativo é uma compra digital. O pagamento pelo trabalho de um profissional na residência é um serviço físico. A regra geral do Google exige Play Billing para recursos digitais e exclui serviços físicos; existem exceções e programas específicos. [Política de pagamentos do Google](https://support.google.com/googleplay/android-developer/answer/9858738?hl=pt-BR).

Assim, a proposta inicial é:

- Android pela Play Store: assinatura Pro com Google Play Billing.
- iOS, quando for distribuído: avaliar StoreKit e as regras aplicáveis à região. A Apple trata boosts exibidos no mesmo app como compras digitais, e separa serviços consumidos fora do aplicativo. [Regras da Apple, seções 3.1.1 e 3.1.3](https://developer.apple.com/app-store/review/guidelines/).
- Serviço presencial, no futuro: Asaas para cobrança e divisão dos recebíveis.
- Site: avaliar Asaas para assinatura contratada no navegador, com regras claras de acesso entre plataformas. Isso não autoriza automaticamente inserir um checkout ou botão externo no aplicativo.

O Brasil aparece no programa de escolha de faturamento do Google. Ele exige elegibilidade — incluindo cadastro como empresa —, adesão, integração das APIs, relatórios e taxas. Não é uma autorização geral para colocar Pix dentro de qualquer app. Para o primeiro lançamento, sugiro o faturamento padrão da loja. [Programa e requisitos](https://support.google.com/googleplay/android-developer/answer/12570971?hl=pt-BR).

## Implementação da assinatura

Opção sugerida para avaliar: `react-native-purchases` com RevenueCat, que integra as lojas e ajuda a acompanhar o ciclo da assinatura. A documentação do Expo lista essa opção e informa que compras nativas precisam de development build. Confirmar a compatibilidade da versão escolhida com Expo 57/React Native 0.86 em sandbox. [Expo](https://docs.expo.dev/guides/in-app-purchases/).

Comparação das opções:

| Opção | Benefício | Custo/complexidade |
| --- | --- | --- |
| Play Billing direto | Controle e menos dependência de plataforma intermediária | Implementar validação, notificações de ciclo, restauração e conciliação |
| RevenueCat sobre as lojas | Reduz trabalho de integração e acompanhamento | Custo adicional conforme faturamento e dependência do fornecedor |
| Asaas dentro do app para funções digitais | Possível somente em um desenho permitido pelas regras aplicáveis | Não é o caminho padrão proposto para a Play Store |

O preço publicado do RevenueCat oferece gratuidade até o limite indicado de US$ 2.500 de receita mensal rastreada e, ao atingir o patamar de cobrança, 1% da receita rastreada. Conferir condições da conta; não é 1% do lucro. [Preço](https://www.revenuecat.com/pricing), [base de cobrança](https://www.revenuecat.com/docs/welcome/set-up-revenuecat/account-management).

No NestJS, usar um módulo de cobrança coeso e o padrão existente de controllers, services, DTOs, entidades e migrations. Registros propostos: catálogo de produtos, assinatura vinculada ao usuário, eventos financeiros e permissões do plano. Guardar identificadores do provedor, produto, ambiente e validade; não dados de cartão.

Fluxo:

1. O backend informa o plano e os recursos disponíveis; o aplicativo usa o preço localizado retornado pela loja.
2. O profissional compra pelo SDK da loja e sua conta fica associada à compra validada.
3. O servidor recebe eventos autenticados e atualiza os direitos de acesso após confirmação confiável.
4. Eventos repetidos são idempotentes. Eventos fora de ordem exigem consulta ao estado atual do provedor; falhas precisam de conciliação.
5. Uploads e relatórios pagos verificam os direitos no backend. Ocultar um botão no app não protege o recurso.
6. A tela oferece restauração, situação do plano e acesso ao gerenciamento/cancelamento da assinatura.

RevenueCat oferece webhooks para sincronização no servidor e permite configurar um cabeçalho de autorização. Separar sandbox e produção. [Webhooks](https://www.revenuecat.com/docs/integrations/webhooks).

Cancelamento de renovação não deve remover acesso antes do fim do período já pago. Tratar expiração, reembolso, revogação e períodos de tolerância conforme o estado confirmado pelo provedor. Na redução do plano, preservar fotos existentes; limitar novos envios e permitir escolher quais ficam públicas, sem apagar trabalhos automaticamente. Definir também transferência de compra entre contas e prevenção de duas assinaturas simultâneas.

## Destaques pagos

Oferecer depois de comprovar procura por cidade e categoria. Começar com campanhas curtas e poucas posições, exibindo **Patrocinado**.

Regras propostas:

- Aplicar filtros de serviço, região e disponibilidade antes de considerar campanhas.
- Manter resultados orgânicos e rotacionar patrocinados elegíveis.
- Não misturar pagamento com verificação de documentos, avaliações ou reputação.
- Mostrar início, término e métricas de exposição; não prometer contratação.
- Definir critérios de impressão visível, cliques únicos, limites contra abuso e tratamento de campanha sem entrega.
- Validar a forma de cobrança digital nas lojas antes de vender esse produto.

Preço por campanha só deve ser definido após medir o tráfego real. Uma campanha barata sem clientes na região ainda pode gerar frustração.

## Comissão e Asaas: etapa posterior

O Asaas pode dividir recebíveis entre carteiras. Na modalidade percentual documentada, o cálculo é sobre `netValue`, depois das tarifas aplicáveis. Portanto, comissão sobre valor bruto e percentual do split não são automaticamente equivalentes. [Split](https://docs.asaas.com/docs/split-de-pagamentos), [FAQ](https://docs.asaas.com/docs/split-faq).

Antes de implementar comissão, definir cadastro/validação dos recebedores, quem arca com tarifas, base de cálculo, repasse, cancelamento, reembolso, contestação e conciliação. Há suporte documentado a estorno, mas isso não substitui uma política operacional do HomeEasy nem torna o split um serviço de custódia. [Estorno](https://docs.asaas.com/reference/estornar-cobranca).

Uma porcentagem futura deve ser validada junto aos profissionais e aos custos reais. Não recomendo começar com 15% sobre todos os serviços, além da mensalidade, sem demonstrar o benefício financeiro e operacional oferecido.

## Receita ilustrativa

Para assinaturas com renovação automática no mercado brasileiro, a tabela consultada do Google indica 15%. Reconfirmar condições regionais e da conta antes do lançamento. [Taxas](https://support.google.com/googleplay/android-developer/answer/112622?hl=pt-BR).

Exemplo, sem prever adesão:

| Assinantes a R$ 29,90 | Receita bruta mensal | Após apenas 15% de taxa |
| --- | ---: | ---: |
| 20 | R$ 598,00 | R$ 508,30 |
| 100 | R$ 2.990,00 | R$ 2.541,50 |
| 300 | R$ 8.970,00 | R$ 7.624,50 |

O saldo não é lucro: ainda existem tributos, ferramentas de cobrança, infraestrutura, armazenamento, suporte, reembolsos e aquisição de clientes. Para calcular o ponto de equilíbrio: custos fixos mensais divididos pela contribuição líquida média por assinante, descontados os custos variáveis.

## Sequência proposta

1. Medir pedidos e contratações por região e conversar com profissionais sobre ferramentas e preço.
2. Escolher um plano e benefícios mínimos; manter as funções atuais gratuitas.
3. Implementar direitos de acesso no backend e a integração de assinatura em branch própria, partindo do código atualizado.
4. Testar compra, restauração, troca de conta, renovação, cancelamento, falha, expiração, reembolso, eventos duplicados e redução do plano.
5. Fazer piloto e acompanhar uso dos benefícios, adesão, renovação, cancelamento e contribuição financeira.
6. Avaliar campanhas patrocinadas após haver inventário real; pagamentos por serviço e comissão vêm depois.

Não foram verificados: configuração e elegibilidade das contas nas lojas, contratação e tarifas efetivas do Asaas, compatibilidade já testada do SDK, números reais de uso e tributação do negócio. Nenhuma receita é garantida por esta proposta.
