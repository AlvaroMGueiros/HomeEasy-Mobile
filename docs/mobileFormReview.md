# Clareza dos formulários e primeiros passos

Revisão restrita ao aplicativo mobile. Pagamentos continuam na branch separada.

## Cobertura

| Jornada | Ajustes |
| --- | --- |
| Cadastro e entrada | Nome completo, exemplo de e-mail, nascimento com exemplo brasileiro, idade mínima e regras da senha visíveis. A conta serve para contratar e oferecer serviços. |
| Recuperação de senha | E-mail da conta, código de recuperação explicado quando necessário, nova senha e confirmação com aviso de diferença. |
| Dados pessoais | Exemplos de telefone, endereço e cidade; estado escolhido pelo nome; redes sociais identificadas como opcionais. |
| Buscar profissionais | Preços em reais, explicação de preço de referência, notas em estrelas e distância de busca com contexto. |
| Pedir orçamento | Diferença entre pedir e contratar, local obrigatório, valores opcionais, data que pode ser removida, perguntas específicas com opções e unidades. |
| Oferecer serviços | Apresentação profissional explicada, distância em quilômetros, experiência em anos, busca de serviços e preço inicial opcional. O preço digitado mantém a vírgula durante a edição. |
| Enviar orçamento | Valor do trabalho, custo da ida, tempo em minutos com exemplos, materiais incluídos e forma combinada de pagamento. |
| Agenda | Começo e fim do atendimento, pausa de almoço, folgas e remoção de datas com termos claros. |
| Documentos | Tipo de documento e instrução do que fotografar; explicação de privacidade e análise. |
| Atendimento e ajuda | Conversa, avaliação, fotos, denúncia e problema com o serviço com perguntas e instruções específicas. |

Os dados do contrato da API continuam usando os nomes e valores esperados pelo backend. O aplicativo passa a apresentar as opções pelo texto legível, como “Não”, preservando o valor “no” no envio.

## Orientação inicial

O guia aparece no primeiro acesso autenticado de cada conta neste aparelho, inclusive após o cadastro. A pessoa pode escolher entre contratar e oferecer serviços ou dispensar a orientação. A preferência fica armazenada no dispositivo por conta; não altera o papel do usuário nem limita sua atividade.

O mesmo conteúdo pode ser revisto em **Perfil → Como usar o aplicativo**. Os textos e passos são compartilhados entre a tela de ajuda e o modal para evitar divergência.

## Verificação

- `npm run verify:forms`: valores brasileiros, respostas obrigatórias, seleção de opções, respostas numéricas com zero, nomes de estados e preferência de boas-vindas por conta.
- `npx tsc --noEmit`: contratos e integração dos componentes.
- Exportação Android com Expo 57: compilação do bundle.

Não houve pesquisa com usuários nem validação visual em aparelho nesta etapa. Não havia aparelho ou emulador conectado. A próxima validação deve observar usuários completando cadastro, pedido de orçamento e perfil profissional, incluindo teclado aberto, fonte ampliada e telas pequenas.
