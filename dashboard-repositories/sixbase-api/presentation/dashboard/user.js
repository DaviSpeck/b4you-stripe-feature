const { formatDocument, capitalizeName } = require('../../utils/formatters');
const { findDocumentsStatus } = require('../../status/documentsStatus');
const SerializeBankAccount = require('./bankAccount');
const SerializeBankAccountCNPJ = require('./bankAccountCNPJ');
const SerializeUserFees = require('./userFees');
const date = require('../../utils/helpers/date');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../types/dateTypes');

const serializeAddress = (user) => {
  const {
    zipcode,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    country,
    prize_address,
  } = user;
  let prize = {};
  if (prize_address && Object.keys(prize_address).length > 0) {
    prize = {
      zipcode_prize: prize_address.zipcode,
      street_prize: capitalizeName(prize_address.street),
      number_prize: prize_address.number,
      complement_prize: capitalizeName(prize_address.complement),
      neighborhood_prize: capitalizeName(prize_address.neighborhood),
      city_prize: capitalizeName(prize_address.city),
      state_prize: prize_address.state,
    };
  }
  return {
    ...prize,
    zipcode,
    street: capitalizeName(street),
    number,
    complement: capitalizeName(complement),
    neighborhood: capitalizeName(neighborhood),
    city: capitalizeName(city),
    state,
    country: capitalizeName(country),
  };
};

const serializeGeneral = (user) => {
  const {
    document_number,
    email,
    first_name,
    last_name,
    uuid,
    whatsapp,
    profile_picture,
    instagram,
    birth_date,
  } = user;

  return {
    uuid,
    email,
    first_name: capitalizeName(first_name),
    last_name: capitalizeName(last_name),
    whatsapp,
    instagram,
    document_number,
    masked_document_number: document_number
      ? formatDocument(document_number)
      : null,
    profile_picture,
    birth_date: birth_date
      ? date(birth_date).format(FRONTEND_DATE_WITHOUT_TIME)
      : null,
  };
};

const serializeCompanyData = ({ cnpj, status_cnpj, verified_cnpj }) => ({
  cnpj: cnpj ? formatDocument(cnpj) : null,
  status_cnpj: findDocumentsStatus(status_cnpj),
  verified_cnpj,
});

const serializeFees = (user) => {
  const { fees, withdrawal, releases } = new SerializeUserFees(user).adapt();
  return {
    variable: fees.variable,
    fixed: fees.fixed,
    withdrawal,
    releases,
  };
};

const serializeNotificationsSettings = ({ notificationsSettings }) => {
  const {
    created_at,
    expired_billet,
    expired_pix,
    generated_billet,
    generated_pix,
    paid_billet,
    paid_card,
    paid_pix,
    show_product_name,
    updated_at,
  } = notificationsSettings;
  return {
    created_at,
    expired_billet,
    expired_pix,
    generated_billet,
    generated_pix,
    paid_billet,
    paid_card,
    paid_pix,
    show_product_name,
    updated_at,
  };
};

const serializeUser = (user) => ({
  general: serializeGeneral(user),
  company: serializeCompanyData(user),
  address: serializeAddress(user),
  bank_account: new SerializeBankAccount(user).adapt(),
  bank_account_company: new SerializeBankAccountCNPJ(user).adapt(),
  fees: user.salesSettings ? serializeFees(user) : null,
  notifications_settings: user.notificationsSettings
    ? serializeNotificationsSettings(user)
    : null,
  bank_account_pending_approval: user.bank_account_pending_approval ?? false,
  bank_account_pending_kind: user.bank_account_pending_kind ?? null,
  bank_account_pending_at: user.bank_account_pending_at ?? null,
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
