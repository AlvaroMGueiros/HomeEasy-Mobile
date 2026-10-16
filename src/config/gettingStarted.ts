export enum GettingStartedGoal { FindProfessional = 'findProfessional', OfferServices = 'offerServices' }

export const gettingStartedGuides = {
  [GettingStartedGoal.FindProfessional]: {
    action: 'Buscar um profissional',
    steps: [
      { title: 'Escolha o serviço', description: 'Busque o que precisa, como limpeza, pintura ou conserto de vazamento.' },
      { title: 'Peça um orçamento', description: 'Descreva o serviço e informe o endereço. Você pode escolher um profissional ou receber propostas da região.' },
      { title: 'Aceite uma proposta', description: 'Compare os valores e o que está incluído. O aceite confirma a contratação e libera a conversa.' },
      { title: 'Acompanhe o atendimento', description: 'Combine os detalhes e o pagamento em Mensagens. Veja o andamento em Meus serviços.' }
    ]
  },
  [GettingStartedGoal.OfferServices]: {
    action: 'Cadastrar meus serviços',
    steps: [
      { title: 'Cadastre seus serviços', description: 'Informe os serviços que oferece, sua cidade e a distância de atendimento.' },
      { title: 'Complete seu perfil', description: 'Adicione horários e fotos dos seus trabalhos. Envie documentos quando solicitado.' },
      { title: 'Envie orçamentos', description: 'Em Trabalhos disponíveis, escolha um pedido e informe preço, prazo e o que está incluído.' },
      { title: 'Realize o atendimento', description: 'Após o aceite, combine os detalhes em Mensagens. Registre a conclusão em Meus serviços.' }
    ]
  }
};
