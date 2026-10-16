# Bloqueio, moderação e permissões

## Aplicativo

- Segurança na conversa e no perfil profissional: bloquear, desbloquear, denunciar e consultar regras.
- Pressionar uma mensagem recebida abre a denúncia com a referência da mensagem e da conversa.
- Sem confirmação do estado de bloqueio, o envio fica indisponível. O backend continua responsável por impedir mensagens nos dois sentidos.
- O histórico permanece acessível. Bloquear não cancela o atendimento nem abre uma disputa.
- Regras versionadas disponíveis no cadastro e no perfil. Cada conta precisa aceitá-las neste aparelho antes de interagir com o app; o aceite usa SecureStore e é renovado quando a versão muda. Não é um registro de aceite mantido no servidor.
- Ao escolher fotos, uma confirmação explica e solicita autorização para abrir o seletor do sistema, limitado às imagens escolhidas. Recusar não abre o seletor nem envia arquivos. Não há captura pela câmera nem pedido de acesso amplo à biblioteca.
- A localização é solicitada na entrada do app, inclusive antes do login. Pedidos concorrentes são consolidados, e a recusa não gera solicitações repetidas na mesma sessão. O botão de localização permite tentar novamente; permissões já concedidas não geram outro diálogo do sistema.
- Microfone, câmera, leitura de áudio/vídeo e permissões amplas de armazenamento são bloqueados na configuração nativa. Localização em primeiro plano e notificações permanecem disponíveis.

## Backend necessário

- `GET /api/blocks/:userId`: retorna `isBlocked` (bloqueio feito pelo solicitante) e `canMessage` (considera ambos os sentidos). Não identifica quem fez outro bloqueio.
- Os endpoints existentes `PUT /api/blocks/:userId` e `DELETE /api/blocks/:userId` persistem e removem somente o bloqueio do solicitante.
- Presença e digitação são ocultadas em conversas bloqueadas; envio de mensagens já é protegido no servidor.
- `POST /api/reports` aceita `messageId` opcional. O servidor verifica participação na conversa, autoria e correspondência da mensagem e inclui uma referência e trecho do conteúdo na denúncia para análise administrativa.
- Denúncias continuam na fila de moderação existente. Não há punição automática baseada somente no envio de uma denúncia.
- Não foi necessária migração de banco: bloqueios e denúncias reutilizam as tabelas existentes.

## Validação e publicação

TypeScript do aplicativo, testes de formulários e suíte do backend verificados. APK Android reconstruído e permissões inspecionadas no arquivo compilado.

Publicar o backend atualizado antes de distribuir esta versão mobile. Os testes automatizados não substituem a operação humana de moderação e suporte. `motion` e pagamentos ficam fora desta alteração.
