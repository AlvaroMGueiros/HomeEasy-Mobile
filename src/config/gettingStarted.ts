export enum GettingStartedGoal { FindProfessional = 'findProfessional', OfferServices = 'offerServices' }

export const gettingStartedGuides = {
  [GettingStartedGoal.FindProfessional]: {
    action: 'Buscar um profissional',
    steps: [
      { title: 'Escolha o serviço', description: 'Busque o que precisa, como limpeza, pintura ou conserto de vazamento.' },
      { title: 'Peça um orçamento', description: 'Conte o que precisa ser feito, informe o local e, se quiser, adicione fotos. Você pode pedir a um profissional ou receber propostas de outros profissionais da região.' },
      { title: 'Compare e aceite uma proposta', description: 'Confira o preço, o que está incluído e as avaliações. Ao aceitar, a contratação é confirmada e a conversa do serviço fica disponível.' },
      { title: 'Combine e acompanhe', description: 'Use Mensagens para acertar os detalhes e a forma de pagamento com o profissional. Acompanhe em Meus serviços e avalie depois do atendimento.' }
    ]
  },
  [GettingStartedGoal.OfferServices]: {
    action: 'Cadastrar meus serviços',
    steps: [
      { title: 'Apresente seu trabalho', description: 'Crie seu perfil profissional, escolha os serviços que oferece e informe sua cidade e até onde pode atender.' },
      { title: 'Complete seu perfil', description: 'Informe seus horários, adicione fotos dos seus trabalhos e envie documentos para análise, quando necessário.' },
      { title: 'Encontre clientes', description: 'Abra Trabalhos disponíveis para ver pedidos na sua região. Envie um orçamento com preço, prazo e o que está incluído.' },
      { title: 'Converse após o aceite', description: 'Quando o cliente aceitar seu orçamento, combine os detalhes em Mensagens. Acompanhe o atendimento em Meus serviços e registre a conclusão depois de realizar o trabalho.' }
    ]
  }
};
