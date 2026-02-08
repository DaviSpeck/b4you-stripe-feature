const CalculateCommissionsTransactions = require('../../useCases/common/splits/CalculateCommissionsTransactions');

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
  }

  return FakeTransactionsRepo;
};

const makeSut = (data) => {
  const transactionRepoStub = fakeTransactionsRepo();
  const sut = new CalculateCommissionsTransactions(data, transactionRepoStub);

  return {
    sut,
    transactionRepoStub,
  };
};

describe('testing calculate commissions transactions', () => {
  it('should return 400 if transaction is not found', async () => {
    const { sut, transactionRepoStub } = makeSut({});
    jest.spyOn(transactionRepoStub, 'find').mockImplementationOnce(() => null);
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Transação não encontrada');
  });

  it('should return 1 transaction if sale item has only producer', async () => {
    const data = {
      sale_item: {
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
      },
      first_charge: false,
      affiliate: null,
      transaction_id: 1,
    };
    const { sut } = makeSut(data);

    const transactions = await sut.execute();

    expect(transactions.length).toBe(1);
  });
});
