# Home Easy Mobile

Aplicativo Android e iOS do Home Easy, criado com React Native, Expo e TypeScript. O app consome a API NestJS/PostgreSQL existente e segue a organização visual do protótipo fornecido, sem carregar seus mocks ou sua navegação simulada.

## Arquitetura

- `src/api`: cliente HTTP, renovação de token e erros da API.
- `src/auth`: sessão persistida com Expo SecureStore.
- `src/components`: componentes visuais reutilizáveis.
- `src/config`: endereço da API por ambiente.
- `src/navigation`: navegação principal, abas e rotas tipadas.
- `src/screens`: telas organizadas por responsabilidade.
- `src/theme`: tokens de cor compartilhados.
- `src/types`: contratos consumidos do backend.

## Executar

```bash
npm install
npm start
```

No emulador Android, o padrão é `http://10.0.2.2:3000/api`. Para testar em celular físico, copie `.env.example` para `.env` e substitua o IP pelo endereço IPv4 do computador na mesma rede:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api
```

Depois inicie o backend do Home Easy e leia o QR Code com o Expo Go.

## Funcionalidades conectadas

- autenticação e renovação segura de sessão;
- catálogo de serviços;
- profissionais, excluindo a própria conta;
- solicitações do cliente;
- oportunidades do profissional;
- conversas;
- notificações;
- perfil e encerramento de sessão.

Os próximos fluxos previstos são formulário completo de solicitação, proposta, chat em tempo real, upload de fotos e notificações push.
