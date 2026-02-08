const serializeUserFees = ({ salesSettings, withdrawalSettings }) => {
  const {
    release_billet,
    release_pix,
    release_credit_card,
    fee_variable_pix_service,
    fee_variable_card_service,
    fee_variable_billet_service,
    fee_fixed_pix_service,
    fee_fixed_card_service,
    fee_fixed_billet_service,
  } = salesSettings;

  const { fee_fixed } = withdrawalSettings;

  const variableCard = Object.keys(fee_variable_card_service).map(
    (k) => fee_variable_card_service[k],
  );

  const fixedCard = Object.keys(fee_fixed_card_service).map(
    (k) => fee_fixed_card_service[k],
  );

  const [firstVariable] = variableCard;
  const areEqualVarible = variableCard.find((v) => v !== firstVariable);

  const [firstFixed] = fixedCard;
  const areEqualFixed = fixedCard.find((v) => v !== firstFixed);

  const card = [];
  if (!areEqualFixed && !areEqualVarible) {
    card.push({ fixed: fixedCard[0], variable: variableCard[0] });
  } else {
    for (let i = 0; i < variableCard.length; i += 1) {
      card.push({ fixed: fixedCard[i], variable: variableCard[i] });
    }
  }

  return {
    fees: {
      billet: {
        variable: fee_variable_billet_service,
        fixed: fee_fixed_billet_service,
      },
      pix: {
        variable: fee_variable_pix_service,
        fixed: fee_fixed_pix_service,
      },
      card,
    },
    withdrawal: fee_fixed,
    releases: {
      card: release_credit_card,
      billet: release_billet,
      pix: release_pix,
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeUserFees);
    }
    return serializeUserFees(this.data);
  }
};
