jest.mock('../../database/models/Suppliers', () => ({ findAll: jest.fn() }));

const CalculateCommissionsTransactions = require('../../useCases/common/splits/CalculateCommissionsTransactions');
const Suppliers = require('../../database/models/Suppliers');

const getError = async (callFunction) => {
  try {
    const r = await callFunction();
    return r;
  } catch (error) {
    return error;
  }
};

describe('testing calculate commissions transactions', () => {
  beforeEach(() => {
    Suppliers.findAll.mockResolvedValue([]);
  });

  it('should return error when sale item is missing', async () => {
    const error = await getError(() =>
      CalculateCommissionsTransactions.execute({}),
    );
    expect(error).toBeDefined();
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
        split_price: 80.0,
        subscription_fee: 0.0,
        shipping_price: 0.0,
        fee_total: 6.8,
        id_offer: 1,
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
      shipping_type: 0,
    };
    const transactions = await CalculateCommissionsTransactions.execute(data);

    expect(transactions.length).toBe(1);
  });
});
