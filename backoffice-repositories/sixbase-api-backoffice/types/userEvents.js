const userEventsTypes = [
  {
    id: 1,
    key: 'block-withdrawal',
    label: 'Bloqueou saque',
  },
  {
    id: 2,
    key: 'unblock-withdrawal',
    label: 'Desbloqueou saque',
  },
  {
    id: 3,
    key: 'approve-kyc-cpf',
    label: 'Aprovou KYC CPF',
  },
  {
    id: 4,
    key: 'repprove-kyc-cpf',
    label: 'Negou KYC CPF',
  },
  {
    id: 5,
    key: 'approve-kyc-cnpj',
    label: 'Aprovou KYC CNPJ',
  },
  {
    id: 6,
    key: 'repprove-kyc-cnpj',
    label: 'Negou KYC CNPJ',
  },
  {
    id: 7,
    key: 'approve-product-market',
    label: 'Aprovou produto ao mercado de afiliados',
  },
  {
    id: 8,
    key: 'reprove-product-market',
    label: 'Reprovou produto ao mercado de afiliados',
  },
  {
    id: 9,
    key: 'recommend-market-approve',
    label: 'Recomendou o produto para o mercado de afiliados',
  },
  {
    id: 10,
    key: 'recommend-market-remove',
    label: 'Removeu a recomendação do mercado de afiliados',
  },
  {
    id: 11,
    key: 'update-sales-settings',
    label: 'Atualizou Tarifas/Prazos',
  },
  {
    id: 12,
    key: 'alert-true',
    label: 'Marcou atenção no cadastro',
  },
  {
    id: 13,
    key: 'alert-false',
    label: 'Desmarcou atenção no cadastro',
  },
  {
    id: 14,
    key: 'market-remove',
    label: 'Removeu o produto do mercado de afiliados',
  },
  {
    id: 15,
    key: 'update-data',
    label: 'Alterou dados cadastrais',
  },
  {
    id: 16,
    key: 'producer-active-false',
    label: 'Deletou conta de usuario',
  },
  {
    id: 17,
    key: 'producer-active-true',
    label: 'Ativou conta de usuario',
  },
  {
    id: 18,
    key: 'remove-cnpj',
    label: 'Removeu CNPJ',
  },
  {
    id: 19,
    key: 'client-email',
    label: 'Alterou email de cliente',
  },
  {
    id: 20,
    key: 'remove-checkout',
    label: 'Desabilitou checkout',
  },
  {
    id: 21,
    key: 'active-checkout',
    label: 'Habilitou checkout',
  },
  {
    id: 22,
    key: 'update-number-product',
    label: 'Atualizou numero de suporte do produto',
  },
  {
    id: 23,
    key: 'blacklist-refund-sale',
    label: '(Antifraude) Reembolsou venda',
  },
  {
    id: 24,
    key: 'blackslit-trust-sale',
    label: '(Antifraude) Venda confiável',
  },
  {
    id: 25,
    key: 'update-manager',
    label: 'Atualizou gerente do usuário',
  },
  {
    id: 26,
    key: 'activate-auto-block-withdrawal',
    label: 'Ativou a automação de bloqueio/desbloqueio de saque',
  },
  {
    id: 27,
    key: 'deactivate-auto-block-withdrawal',
    label: 'Desativou a automação de bloqueio/desbloqueio de saque',
  },
  {
    id: 28,
    key: 'update-user-role',
    label: 'Atualizou role de usuário do backoffice',
  },
  {
    id: 29,
    key: 'update-user-status',
    label: 'Atualizou status de usuário do backoffice',
  },
  {
    id: 30,
    key: 'create-role',
    label: 'Criou nova role',
  },
  {
    id: 31,
    key: 'update-role',
    label: 'Atualizou role',
  },
  {
    id: 32,
    key: 'delete-role',
    label: 'Removeu role',
  },
  {
    id: 33,
    key: 'update-role-menus',
    label: 'Atualizou menus da role',
  },
  {
    id: 34,
    key: 'create-menu-item',
    label: 'Criou item de menu',
  },
  {
    id: 35,
    key: 'update-menu-item',
    label: 'Atualizou item de menu',
  },
  {
    id: 36,
    key: 'delete-menu-item',
    label: 'Removeu item de menu',
  },
  {
    id: 37,
    key: 'create-user',
    label: 'Criou novo usuário do backoffice',
  },
  {
    id: 38,
    key: 'form-create',
    label: 'Criação de Formulário',
  },
  {
    id: 39,
    key: 'form-update',
    label: 'Atualização de Formulário',
  },
  {
    id: 40,
    key: 'form-delete',
    label: 'Exclusão de Formulário',
  },
  {
    id: 41,
    key: 'form-publish',
    label: 'Publicação de Versão',
  },
  {
    id: 42,
    key: 'form-activate',
    label: 'Ativação de Formulário',
  },
  {
    id: 43,
    key: 'form-deactivate',
    label: 'Desativação de Formulário',
  },
  {
    id: 44,
    key: 'question-create',
    label: 'Criação de Pergunta',
  },
  {
    id: 45,
    key: 'question-update',
    label: 'Atualização de Pergunta',
  },
  {
    id: 46,
    key: 'question-delete',
    label: 'Exclusão de Pergunta',
  },
  {
    id: 47,
    key: 'question-reorder',
    label: 'Reordenação de Perguntas',
    key: 'create-menu-action',
    label: 'Criou ação de menu',
  },
  {
    id: 39,
    key: 'update-menu-action',
    label: 'Atualizou ação de menu',
  },
  {
    id: 40,
    key: 'delete-menu-action',
    label: 'Removeu ação de menu',
  },
  {
    id: 41,
    key: 'update-action-roles',
    label: 'Atualizou roles vinculadas à ação de menu',
  },
  {
    id: 47,
    key: 'upsell-native-enabled',
    label: 'Habilitou Upsell Nativo',
  },
  {
    id: 48,
    key: 'upsell-native-disabled',
    label: 'Desabilitou Upsell Nativo',
  },
];

const findUserEventType = (role) => {
  if (!role) throw new Error('role must be provided');
  if (typeof role !== 'string' && typeof role !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof role === 'string' ? 'label' : 'id';
  return userEventsTypes.find((s) => s[parameter] === role);
};

const findRoleTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return userEventsTypes.find((s) => s.key === key);
};

const findUserEventTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return userEventsTypes.find((s) => s.key === key);
};

module.exports = {
  findUserEventTypeByKey,
  userEventsTypes,
  findUserEventType,
  findRoleTypeByKey,
};
