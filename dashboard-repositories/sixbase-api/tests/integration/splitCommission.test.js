/* eslint-disable max-classes-per-file */
const SplitCommission = require('../../useCases/common/splits/SplitCommission');

const fakeBalanceRepo = () => {
  class FakeBalanceRepo {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          id: 3,
          id_user: 3,
          amount: 0,
          created_at: 1650551444,
          updated_at: null,
        });
      });
    }

    static async update(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeBalanceRepo;
};

const fakeBalanceHistoryRepo = () => {
  class FakeBalanceHistoryRepo {
    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeBalanceHistoryRepo;
};

const fakeSalesItemsTransactionsRepo = () => {
  class FakeSalesItemsTransactionsRepo {
    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeSalesItemsTransactionsRepo;
};

const fakeTransactionsRepo = () => {
  class FakeTransactionsRepo {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          id: 2321,
          uuid: 'b64313a1-aff0-4d19-8155-2287c3c392e8',
          id_user: 3,
          id_type: 2,
          id_status: 2,
          psp_id: 64875,
          release_date: null,
          released: 0,
          id_charge: 627,
          id_role: null,
          socket_id: null,
          method: 'card',
          withdrawal_amount: 0.0,
          withdrawal_total: 0.0,
          installments: 1,
          monthly_interest_installment: 0.0,
          card_brand: 'master',
          price_product: 100.0,
          price_total: 80.0,
          price_base: 80.0,
          psp_cost_variable_percentage: 0.0,
          psp_cost_variable_amount: 0.0,
          psp_cost_fixed_amount: 0.0,
          psp_cost_total: 0.0,
          revenue: 78.04,
          interest_installment_percentage: 0.0,
          interest_installment_amount: 0.0,
          fee_variable_percentage: 6.0,
          fee_variable_percentage_amount: 4.8,
          fee_fixed_amount: 2.0,
          fee_total: 6.8,
          user_gross_amount: 80.0,
          user_net_amount: 73.2,
          company_gross_profit_amount: 4.84,
          tax_fee_percentage: 20.0,
          tax_fee_total: 1.36,
          tax_interest_percentage: 20.0,
          tax_interest_total: 0.0,
          tax_total: 1.36,
          company_net_profit_amount: 3.48,
          spread_over_price_product: 3.48,
          spread_over_price_total: 4.35,
          created_at: '2022-10-13 13:59:55',
          updated_at: '2022-10-13 13:59:55',
          id_invoice: null,
          discount_percentage: 20.0,
          discount_amount: 20.0,
          original_price: 100.0,
          subscription_fee: 0.0,
          split_price: 80.0,
        });
      });
    }

    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeTransactionsRepo;
};

const fakeDatabaseConfig = () => ({
  transaction: (cb) => cb({ afterCommit: (c) => c() }),
});

const fakeSaleItemRepo = () => {
  class FakeSalesItemsRepo {
    static async findToSplit() {
      return new Promise((resolve) => {
        resolve({
          id: 571,
          id_sale: 419,
          id_product: 63,
          price: 100.0,
          is_upsell: 0,
          created_at: '2022-10-04 13:29:30',
          updated_at: '2022-10-04 13:29:54',
          uuid: 'f8cc4f21-160d-4888-8639-8b40b88c11e5',
          id_status: 2,
          type: 1,
          id_student: 3,
          id_plan: null,
          payment_method: 'pix',
          id_affiliate: null,
          valid_refund_until: '2022-10-11 13:29:54',
          paid_at: '2022-10-04 13:29:54',
          payment_splited: 0,
          credit_card: null,
          src: null,
          sck: null,
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
          utm_content: null,
          utm_term: null,
          product: {
            coproductions: [],
            id: 2,
            uuid: 'a54779e1-b167-4ef4-9f96-d745b807ec7a',
            id_user: 3,
            name: 'Produto A',
            payment_type: 'single',
            content_delivery: 'membership',
            created_at: '2022-04-21 14:30:59',
            updated_at: '2022-10-04 18:33:25',
            support_whatsapp: '',
            visible: null,
            id_type: 2,
            category: 1,
            producer: {
              id: 3,
              email: 'vinixp.vp@gmail.com',
              uuid: '4cebe240-9bc0-46ca-b7e8-99bf7888e13f',
              user_sale_settings: {
                id: 3,
                id_user: 3,
                fee_fixed_billet: 2.0,
                fee_fixed_card: 0.0,
                fee_fixed_pix: 2.0,
                release_billet: 1,
                release_credit_card: 14,
                release_pix: 0,
                created_at: '2022-04-21 14:30:44',
                updated_at: '2022-04-21 14:30:44',
                fee_variable_pix: 0.0,
                fee_variable_billet: 0.0,
                fee_variable_percentage_service: 6.0,
                fee_fixed_amount_service: 2.0,
                fee_fixed_refund_card: 0.0,
                fee_fixed_refund_billet: 5.0,
                fee_fixed_refund_pix: 2.0,
              },
            },
          },
        });
      });
    }
  }

  return FakeSalesItemsRepo;
};

const makeSut = (data) => {
  const transactionRepoStub = fakeTransactionsRepo();
  const balanceRepoStub = fakeBalanceRepo();
  const balanceHistoryRepoStub = fakeBalanceHistoryRepo();
  const databaseConfigStub = fakeDatabaseConfig();
  const salesItemsTransactionsStub = fakeSalesItemsTransactionsRepo();
  const saleItemRepoStub = fakeSaleItemRepo();
  const sut = new SplitCommission(
    data,
    transactionRepoStub,
    balanceHistoryRepoStub,
    balanceRepoStub,
    saleItemRepoStub,
    salesItemsTransactionsStub,
    databaseConfigStub,
  );

  return {
    sut,
    transactionRepoStub,
    balanceHistoryRepoStub,
    balanceRepoStub,
    saleItemRepoStub,
    salesItemsTransactionsStub,
    databaseConfigStub,
  };
};
describe('Split Commission', () => {
  it('should return transactions', async () => {
    const { sut } = makeSut({
      sale_id: 'any_id ',
      transaction_id: 'any_transaction',
    });
    const transactions = await sut.execute();
    expect(transactions.length).toBeGreaterThanOrEqual(1);
  });
  it('should throw error', async () => {
    const message = 'Erro ao criar transaction';
    const { sut, transactionRepoStub } = makeSut({
      sale_id: 'any_id ',
      transaction_id: 'any_transaction',
    });

    jest.spyOn(transactionRepoStub, 'create').mockImplementationOnce(() => {
      throw new Error(message);
    });

    const error = await sut.execute();
    expect(error).toBeDefined();
    expect(error.message).toBe(message);
  });
});
