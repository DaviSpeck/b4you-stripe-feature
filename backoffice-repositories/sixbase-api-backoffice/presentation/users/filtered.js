const { capitalizeName } = require('../../utils/formatters');
const { findBank } = require('../../utils/banks');
const { formatDocument } = require('../../utils/formatters');
const { findCNPJStatus } = require('../../status/cnpjStatus');
const { kycStatus } = require('../../status/pagarmeKycStatus');
const date = require('../../utils/helpers/date');
const { FRONTEND_DATE } = require('../../types/dateTypes');

const onboardingAnswers = {
  signup_reason: [
    'Não informado',
    'Criar meu produto digital ou físico',
    'Mudar de plataforma',
    'Ser coprodutor',
    'Vender produtos de outras pessoas como afiliado',
    'Ainda não decidi',
  ],
  has_sold: [
    'Não informado',
    'Sim, como afiliado',
    'Sim, como produtor',
    'Sim, como Produtor e Afiliado',
    'Não, nunca vendi nada na internet ',
  ],
  revenue: [
    'Não faturei',
    'Até 20 mil por mês',
    'Entre 20 e 100 mil reais por mês',
    'Entre 100 mil e 1 milhão por mês',
    'Mais de 1 milhão por mês',
  ],
  user_type: {
    creator: 'Creator',
    marca: 'Marca',
  },
  audience_size: {
    0: '-',
    1: 'Até 5 mil',
    2: '5 a 20 mil',
    3: '50 a 100 mil',
    4: '100 a 200 mil',
    5: '500 a 1 milhão',
    6: '+1 milhão',
    7: 'Ainda não possuo audiência',
  },
  business_model: {
    0: '-',
    1: 'Marca',
    2: 'Ecommerce',
    3: 'Infoproduto',
    4: 'Creator',
    5: 'Outro',
  },
  has_experience_as_creator_or_affiliate: {
    0: '-',
    1: 'Sim, como Creator',
    2: 'Sim, como Afiliado',
    3: 'Não',
  },
  nicho: {
    0: '-',
    1: 'Moda',
    2: 'Saúde e Fitness',
    3: 'Beleza',
    4: 'Casa e Acessórios',
    5: 'Comida e Bebida',
    6: 'Viagem',
    7: 'Eletrodomésticos',
    8: 'Tecnologia',
    9: 'Esportes',
    10: 'Jogos',
    11: 'Pet',
    12: 'Infantil',
    13: 'Adulto',
    14: 'Outros',
  },
  company_size: {
    0: '-',
    1: '1-10',
    2: '10-50',
    3: '50-100',
    4: '10-500',
    5: 'Acima de 500',
  },
  origem: {
    0: 'Não informado',
    1: 'Por indicação',
    2: 'Pelo Matheus Mota',
    3: 'Perfil de alguém nas redes sociais',
    4: 'Anúncios',
    5: 'TikTok',
    6: 'Instagram',
    7: 'Busca no Google',
  },
  worked_with_affiliates: {
    0: 'Não informado',
    1: 'Sim, trabalho de forma recorrente',
    2: 'Sim, pontualmente',
    3: 'Nunca trabalhei',
  },
  invested_in_affiliates: {
    0: 'Não informado',
    1: 'Até 10k',
    2: 'Entre 10k-25k',
    3: 'Entre 50-100k',
    4: 'Entre 100-200k',
    5: 'Acima de 200k',
  },
};

const serializeOnboarding = (onboarding) => {
  // Dados de onboarding agora vêm de form_answers, não da tabela onboarding
  // Esta função mantida para compatibilidade retroativa
  return null;
};

const serializeUserSettings = (
  {
    release_billet = 7,
    release_pix = 1,
    release_credit_card = 30,
    fee_variable_pix_service = 0,
    fee_variable_billet_service = 0,
    fee_variable_card_service = {},
    fee_fixed_pix_service = 0,
    fee_fixed_billet_service = 0,
    fee_fixed_card_service = {},
  } = {},
  { withheld_balance_percentage = 0, use_highest_sale = false } = {},
) => ({
  release_billet,
  release_pix,
  release_credit_card,
  withheld_balance_percentage,
  use_highest_sale,
  fee_variable_pix_service,
  fee_variable_billet_service,
  fee_variable_card_service,
  fee_fixed_pix_service,
  fee_fixed_billet_service,
  fee_fixed_card_service,
});

const userStatus = ({ balance, follow_up, withdrawal_settings }) => {
  if (withdrawal_settings && withdrawal_settings.blocked) {
    return {
      color: 'danger',
      label: 'Saldo Bloqueado',
    };
  }

  if (balance && balance.amount < 0) {
    return {
      color: 'warning',
      label: 'Saldo Negativo',
    };
  }

  if (follow_up) {
    return {
      color: 'orange',
      label: 'Atenção',
    };
  }

  return {
    color: 'success',
    label: 'Seguro',
  };
};

const serializeUsers = ({
  uuid,
  email,
  full_name,
  first_name,
  last_name,
  document_number,
  whatsapp,
  award_eligible,
  upsell_native_enabled,
  zipcode,
  street,
  number,
  neighborhood,
  city,
  state,
  bank_code,
  agency,
  account_number,
  account_type,
  operation,
  cnpj,
  verified_id,
  verified_company,
  created_at,
  status_cnpj,
  onboarding,
  instagram,
  user_sale_settings,
  follow_up,
  balance,
  withdrawal_settings,
  complement,
  active,
  birth_date,
  id_manager,
  pagarme_recipient_id,
  pagarme_recipient_id_cnpj,
  pagarme_recipient_id_3,
  pagarme_recipient_id_cnpj_3,
  pagarme_cpf_id,
  pagarme_cnpj_id,
  verified_pagarme,
  verified_company_pagarme,
  verified_pagarme_3,
  verified_company_pagarme_3,
  tiktok,
}) => ({
  uuid,
  full_name:
    full_name ||
    capitalizeName(`${first_name || ''} ${last_name || ''}`.trim()),
  email,
  document_number: formatDocument(document_number),
  whatsapp,
  cnpj: cnpj && formatDocument(cnpj),
  status_cnpj: status_cnpj && findCNPJStatus(status_cnpj),
  follow_up,
  instagram,
  birth_date,
  id_manager,
  verified_id,
  verified_company,
  created_at,
  active,
  award_eligible,
  upsell_native_enabled,
  tiktok,
  bank_account: {
    bank_code,
    agency,
    account_number,
    account_type,
    operation,
    bank: findBank(bank_code),
  },
  address: {
    zipcode,
    street,
    number,
    neighborhood,
    city,
    state,
    complement,
  },
  onboarding: serializeOnboarding(onboarding),
  sale_settings: user_sale_settings
    ? serializeUserSettings(user_sale_settings, withdrawal_settings)
    : {},
  status: userStatus({ balance, follow_up, withdrawal_settings }),
  pagarme_recipient_id,
  pagarme_recipient_id_cnpj,
  pagarme_recipient_id_3,
  pagarme_recipient_id_cnpj_3,
  pagarme_cpf_id,
  pagarme_cnpj_id,
  verified_company_pagarme: kycStatus.find(
    (e) => e.id === verified_company_pagarme,
  ) || { id: 0, label: 'Não informado', key: 'unknown', color: 'secondary' },
  verified_pagarme: kycStatus.find((e) => e.id === verified_pagarme) || { id: 0, label: 'Não informado', key: 'unknown', color: 'secondary' },
  verified_company_pagarme_3: kycStatus.find(
    (e) => e.id === verified_company_pagarme_3,
  ) || { id: 0, label: 'Não informado', key: 'unknown', color: 'secondary' },
  verified_pagarme_3: kycStatus.find((e) => e.id === verified_pagarme_3) || { id: 0, label: 'Não informado', key: 'unknown', color: 'secondary' },
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeUsers);
    }
    return serializeUsers(this.data);
  }
};
