# Contratação, confiança e preferências

## Fluxos disponíveis

- Pedido em três etapas, preservando os dados ao voltar: serviço/fotos, local/data e revisão. O pedido só é criado na confirmação final.
- Após uma falha de envio de fotos, a tentativa seguinte reutiliza o pedido e os arquivos já enviados enquanto a tela permanece aberta.
- Comparação horizontal das propostas, com total incluindo deslocamento, duração, materiais, pagamento, escopo e avaliações.
- Consulta de agenda no perfil e filtro por data/hora na lista de profissionais. A consulta usa horário de Brasília e uma duração de 60 minutos, considerando períodos semanais, exceções e conflitos com atendimentos agendados.
- A consulta não reserva horário. O agendamento e a duração final continuam sendo combinados no orçamento.
- Selos específicos usam os tipos de documentos aprovados. A API não publica os documentos nem identifica telefone preenchido como telefone verificado.
- Recontratação abre o formulário com serviço, profissional, descrição, respostas e endereço anteriores. Data e fotos precisam ser escolhidas novamente.
- Favoritos continuam no perfil e na lista de favoritos. Compartilhar inclui `homeeasy://professionals/:id`; o destinatário precisa ter o app instalado. Não há redirecionamento para uma loja ou universal link web.
- Preferências de push são salvas por conta no backend, em seis controles. Desativar push não remove avisos da lista interna nem altera o envio de e-mails.
- Atraso e ausência usam o suporte existente do atendimento. O relato registra o motivo específico e mantém acesso ao histórico. Abrir um relato coloca o pedido em análise e avisa o outro participante.

## Backend necessário

Publicar a versão correspondente da API antes de distribuir o aplicativo.

1. Executar a migração `1792454400000-add-notification-preferences.ts` no ambiente de destino pelo processo normal de implantação.
2. Publicar as rotas e campos abaixo.
3. Gerar novo build do app para registrar o esquema `homeeasy` no Android/iOS.

| Contrato | Uso |
| --- | --- |
| `GET /notifications/preferences` | Consultar preferências da conta autenticada |
| `PUT /notifications/preferences` | Salvar `pushEnabled`, `messages`, `quotes`, `serviceUpdates`, `reviews`, `opportunities` |
| `GET /schedules/:professionalId/availability?availableAt=ISO&durationMinutes=60` | Consultar horário; retorna apenas disponibilidade, instante, duração e fuso |
| `GET /professionals?availableAt=ISO&durationMinutes=60` | Filtrar com os critérios de região/serviço já existentes |
| `verifiedDocuments` no perfil público | Tipos aprovados: `identity`, `address_proof`, `professional_certificate` |

A API valida duração entre 30 e 480 minutos e horário futuro dentro de 90 dias, sem atravessar a meia-noite no horário de Brasília. Preferências usam o ID autenticado; o cliente não escolhe outro usuário.

## Validação

- `npm run verify:product`, verificações de formulários/permissões e TypeScript.
- Testes do backend para isolamento das preferências, categorias de push, limites de data e regressões existentes.
- Validar em homologação a migração, os conflitos de agenda em PostgreSQL, a entrega real de push e a abertura do link com um novo build nativo. Esses testes não devem usar dados de produção.
