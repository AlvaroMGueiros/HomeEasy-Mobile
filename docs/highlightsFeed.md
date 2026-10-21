# Feed de Destaques

A aba Destaques fica entre Meus serviços e Mensagens. Mostra publicações aprovadas da cidade e do estado escolhidos, com filtro por serviço, fotos, avaliações reais, favoritos, perfil e pedido de orçamento. A home mostra até três publicações quando houver conteúdo aprovado na região.

## Publicação e moderação

Em Perfil → Minhas publicações, o profissional escolhe um serviço ativo e até três fotos do próprio portfólio público. Cada publicação exige título, descrição e confirmação de autorização para divulgação. Não publique dados pessoais de clientes.

O piloto permite até quatro publicações não arquivadas por profissional. Novas publicações ficam em análise. Administradores aprovam ou recusam em Administração → Aprovar publicações dos destaques. Publicações podem ser denunciadas e retiradas pela administração; o autor pode removê-las. Bloqueios entre usuários também são respeitados no feed.

## Backend necessário

Publique o backend da branch `feature/highlightsFeed` e execute a migration `1792540800000-create-professional-highlights.ts` pelo procedimento habitual do backend. Ela cria a tabela e a referência da publicação nas denúncias. Nenhuma migration de produção foi executada nesta implementação.

| Operação | Endpoint |
| --- | --- |
| Feed autenticado por cidade e estado | `GET /highlights` |
| Publicações da conta | `GET /highlights/me` |
| Enviar para análise | `POST /highlights` |
| Arquivar publicação própria | `DELETE /highlights/:id` |
| Fila administrativa | `GET /highlights/moderation` |
| Aprovar ou recusar (administrador) | `PATCH /highlights/:id/review` |
| Denunciar publicação | `POST /reports` com `highlightId` |

## Monetização

Esta etapa não vende planos nem realiza cobranças. O feed usa ordem cronológica; não há impulsionamento pago ativo. O rótulo Patrocinado só aparece quando o servidor informa uma confirmação e um período de patrocínio vigente. Esses campos não podem ser enviados pelo aplicativo. Cobrança, confirmação do provedor e distribuição dos anúncios precisam de uma próxima implementação antes da venda de destaques.

## Verificação

`node scripts/verifyHighlights.cjs` verifica localização, codificação dos filtros e deduplicação da paginação. O backend tem testes de propriedade das fotos, limite de publicações, autorização, moderação e rejeição de campos de patrocínio enviados pelo cliente.
