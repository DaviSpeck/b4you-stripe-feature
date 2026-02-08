const SerializeBankAccount = require('./dashboard/bankAccount');
const { serializePermissions } = require('./common');

const serializeAddress = ({
  zipcode,
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  country,
}) => ({
  zipcode,
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  country,
});

const serializeSingleUser = (user) => {
  const {
    uuid,
    full_name,
    email,
    first_name,
    last_name,
    company_name,
    trade_name,
    verified_id,
    verified_company,
    document_number,
    cnpj,
    is_company,
    active,
    whatsapp,
    profile_picture,
    occupation,
    affiliate_uuid,
    created_at,
    updated_at,
    current_account,
    birth_date,
    reward,
    pagarme_recipient_id,
    pagarme_recipient_id_cnpj,
    verified_pagarme,
    verified_company_pagarme,
    status_cnpj,
    type,
    user_type,
    verified_company_pagarme_3,
    verified_pagarme_3,
    bank_account_pending_approval,
    features,
    upsell_native_enabled,
    onboarding_completed,
    ...rest
  } = user;

  return {
    uuid,
    full_name,
    first_name,
    last_name,
    company_name,
    trade_name,
    email,
    document_number,
    cnpj,
    verified_id,
    verified_company,
    is_company,
    active,
    whatsapp,
    profile_picture,
    occupation,
    affiliate_uuid,
    created_at,
    updated_at,
    bank_account: new SerializeBankAccount(user).adapt(),
    address: serializeAddress(user),
    current_account,
    birth_date,
    reward,
    token: rest.token,
    pagarme_recipient_id,
    pagarme_recipient_id_cnpj,
    verified_pagarme,
    verified_company_pagarme,
    status_cnpj,
    type,
    user_type,
    verified_company_pagarme_3,
    verified_pagarme_3,
    bank_account_pending_approval,
    features,
    upsell_native_enabled,
    onboarding_completed
  };
};

const serializeCollaborations = (collaborations) => {
  if (!collaborations || !Array.isArray(collaborations)) return [];
  return collaborations.map((collaborator) => ({
    ...serializeSingleUser(collaborator),
    permissions: serializePermissions(collaborator.permissions),
  }));
};

const serializeUser = (user) => ({
  ...serializeSingleUser(user),
  collaborations: serializeCollaborations(user.collaborations),
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeUser);
    }
    return serializeUser(this.data);
  }
};
