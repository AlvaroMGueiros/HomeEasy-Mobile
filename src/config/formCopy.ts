export const formCopy = {
  name: { label: 'Seu nome completo', placeholder: 'Ex.: Maria Silva', autoComplete: 'name' },
  email: { label: 'E-mail', placeholder: 'Ex.: maria@email.com', autoComplete: 'email', autoCapitalize: 'none', keyboardType: 'email-address', autoCorrect: false },
  phone: { label: 'Telefone com código de área', placeholder: 'Ex.: (81) 99999-1234', keyboardType: 'phone-pad', hint: 'Inclua os dois números do código de área da sua cidade.' },
  city: { label: 'Cidade', placeholder: 'Ex.: Recife', autoCapitalize: 'words', maxLength: 100 },
  address: { label: 'Rua, número e bairro', placeholder: 'Ex.: Rua das Flores, 120, Centro', hint: 'Se precisar, inclua apartamento, bloco ou ponto de referência.', maxLength: 200 },
  passwordHint: 'Use pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.'
} as const;
