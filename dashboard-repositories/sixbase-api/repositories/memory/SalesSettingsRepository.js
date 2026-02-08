const salesSettings = [
  {
    id: 1,
    id_user: 1,
    fee_fixed_billet: 2.0,
    fee_fixed_card: 0.0,
    fee_fixed_pix: 2.0,
    release_billet: 1,
    release_credit_card: 14,
    release_pix: 0,
    created_at: '2022-04-21 14:29:10',
    updated_at: '2022-04-21 14:29:10',
    fee_variable_pix: 0.0,
    fee_variable_billet: 0.0,
    fee_variable_percentage_service: 6.0,
    fee_fixed_amount_service: 2.0,
    fee_fixed_refund_card: 0.0,
    fee_fixed_refund_billet: 5.0,
    fee_fixed_refund_pix: 2.0,
  },
];

const feeInterestCard = [
  {
    id: 2,
    uuid: '76be04b2-b055-4c29-b896-a3d655366eea',
    id_user: null,
    is_default: 1,
    producer_fees: [
      { brand: 'visa', monthly_installment_interest: 2.89 },
      { brand: 'master', monthly_installment_interest: 2.89 },
      { brand: 'amex', monthly_installment_interest: 2.89 },
      { brand: 'elo', monthly_installment_interest: 2.89 },
      { brand: 'diners', monthly_installment_interest: 2.89 },
      { brand: 'hiper', monthly_installment_interest: 2.89 },
    ],
    student_fees: [
      { brand: 'visa', monthly_installment_interest: 2.89 },
      { brand: 'master', monthly_installment_interest: 2.89 },
      { brand: 'amex', monthly_installment_interest: 2.89 },
      { brand: 'elo', monthly_installment_interest: 2.89 },
      { brand: 'diners', monthly_installment_interest: 2.89 },
      { brand: 'hiper', monthly_installment_interest: 2.89 },
    ],
    created_at: '2022-05-20 11:58:15',
    updated_at: '2022-05-20 11:58:15',
  },
  {
    id: 3,
    uuid: '76be04b3-b055-4c29-b896-a3d655366eea',
    id_user: 6,
    is_default: 0,
    producer_fees: [
      { brand: 'visa', monthly_installment_interest: 2.89 },
      { brand: 'master', monthly_installment_interest: 2.89 },
      { brand: 'amex', monthly_installment_interest: 2.89 },
      { brand: 'elo', monthly_installment_interest: 2.89 },
      { brand: 'diners', monthly_installment_interest: 2.89 },
      { brand: 'hiper', monthly_installment_interest: 2.89 },
    ],
    student_fees: [
      { brand: 'visa', monthly_installment_interest: 2.89 },
      { brand: 'master', monthly_installment_interest: 2.89 },
      { brand: 'amex', monthly_installment_interest: 2.89 },
      { brand: 'elo', monthly_installment_interest: 2.89 },
      { brand: 'diners', monthly_installment_interest: 2.89 },
      { brand: 'hiper', monthly_installment_interest: 2.89 },
    ],
    created_at: '2022-05-20 11:58:15',
    updated_at: '2022-05-20 11:58:15',
  },
];

module.exports = class SalesSettingsMemoryRepository {
  // eslint-disable-next-line no-unused-vars
  static async create(id_user, t = null) {
    return new Promise((resolve) =>
      resolve({
        ...salesSettings[0],
        id_user,
        created_at: new Date(),
        updated_at: new Date(),
      }),
    );
  }

  static async find(id_user) {
    return new Promise((resolve) => {
      const userFeeInterestCard = feeInterestCard.find(
        (f) => f.id_user === id_user,
      );

      const defaultFeeInteresCard = feeInterestCard.find(
        (f) => f.is_default === 1,
      );

      const [firstSalesSettings] = salesSettings;
      firstSalesSettings.id_user = id_user;

      firstSalesSettings.fee_interest_card =
        userFeeInterestCard || defaultFeeInteresCard;

      return resolve(firstSalesSettings);
    });
  }
};
