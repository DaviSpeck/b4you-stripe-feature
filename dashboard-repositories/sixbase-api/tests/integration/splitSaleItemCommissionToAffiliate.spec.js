/* eslint-disable max-classes-per-file */
const SplitSaleItemCommission = require('../../useCases/dashboard/affiliates/SplitSaleItemCommission');

const saleItemData = {
  id: 640,
  id_sale: 472,
  id_product: 24,
  price: 100.0,
  is_upsell: 0,
  created_at: '2022-10-13 13:59:55',
  updated_at: '2022-10-13 13:59:55',
  uuid: 'ab2e623a-8a43-4e51-bd6f-bbbabe127f4b',
  id_status: 2,
  type: 3,
  id_student: 20,
  id_plan: null,
  payment_method: 'card',
  id_affiliate: null,
  valid_refund_until: '2022-10-20 13:59:55',
  paid_at: '2022-10-13 13:59:55',
  payment_splited: 0,
  credit_card: {
    brand: 'master',
    last_four: '9770',
    expiration_date: '02/2025',
  },
  src: null,
  sck: null,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  transactions: [
    {
      id: 1344,
      uuid: '6c2cafb4-9eb4-42b1-8f13-c527ba8bac87',
      id_user: 3,
      id_type: 7,
      id_status: 1,
      psp_id: 62654,
      release_date: null,
      released: 0,
      id_charge: 363,
      id_role: null,
      socket_id: null,
      method: 'pix',
      withdrawal_amount: 0.0,
      withdrawal_total: 0.0,
      installments: 1,
      monthly_interest_installment: 0.0,
      card_brand: null,
      price_product: 10.0,
      price_total: 10.0,
      price_base: 10.0,
      psp_cost_variable_percentage: 1.0,
      psp_cost_variable_amount: 0.1,
      psp_cost_fixed_amount: 0.0,
      psp_cost_total: 0.1,
      revenue: 9.9,
      interest_installment_percentage: 0.0,
      interest_installment_amount: 0.0,
      fee_variable_percentage: 0.0,
      fee_variable_percentage_amount: 0.0,
      fee_fixed_amount: 0.0,
      fee_total: 0.0,
      user_gross_amount: 0.0,
      user_net_amount: 0.0,
      company_gross_profit_amount: 0.0,
      tax_fee_percentage: 0.0,
      tax_fee_total: 0.0,
      tax_interest_percentage: 0.0,
      tax_interest_total: 0.0,
      tax_total: 0.0,
      company_net_profit_amount: 0.0,
      spread_over_price_product: 0.0,
      spread_over_price_total: 0.0,
      created_at: '2022-06-28 16:57:20',
      updated_at: '2022-06-28 16:57:20',
      id_invoice: null,
      discount_percentage: 0.0,
      discount_amount: 0.0,
      original_price: 10.0,
      subscription_fee: 0.0,
      split_price: 0.0,
    },
    {
      id: 1345,
      uuid: 'b27294b3-0b08-49b0-89f3-3ba8c5c3fb44',
      id_user: 3,
      id_type: 2,
      id_status: 1,
      psp_id: 62654,
      release_date: null,
      released: 0,
      id_charge: 363,
      id_role: null,
      socket_id: null,
      method: 'pix',
      withdrawal_amount: 0.0,
      withdrawal_total: 0.0,
      installments: 1,
      monthly_interest_installment: 0.0,
      card_brand: null,
      price_product: 10.0,
      price_total: 10.0,
      price_base: 10.0,
      psp_cost_variable_percentage: 0.0,
      psp_cost_variable_amount: 0.0,
      psp_cost_fixed_amount: 0.0,
      psp_cost_total: 0.0,
      revenue: 9.9,
      interest_installment_percentage: 0.0,
      interest_installment_amount: 0.0,
      fee_variable_percentage: 6.0,
      fee_variable_percentage_amount: 0.6,
      fee_fixed_amount: 2.0,
      fee_total: 2.6,
      user_gross_amount: 10.0,
      user_net_amount: 7.4,
      company_gross_profit_amount: 2.5,
      tax_fee_percentage: 20.0,
      tax_fee_total: 0.52,
      tax_interest_percentage: 20.0,
      tax_interest_total: 0.0,
      tax_total: 0.52,
      company_net_profit_amount: 1.98,
      spread_over_price_product: 19.8,
      spread_over_price_total: 19.8,
      created_at: '2022-06-28 16:57:20',
      updated_at: '2022-06-28 16:57:20',
      id_invoice: null,
      discount_percentage: 0.0,
      discount_amount: 0.0,
      original_price: 10.0,
      subscription_fee: 0.0,
      split_price: 0.0,
    },
    {
      id: 1346,
      uuid: 'dd794450-651a-43e5-afc0-25b341a9ade1',
      id_user: 3,
      id_type: 3,
      id_status: 2,
      psp_id: 62654,
      release_date: null,
      released: 0,
      id_charge: null,
      id_role: 1,
      socket_id: null,
      method: 'pix',
      withdrawal_amount: 0.0,
      withdrawal_total: 0.0,
      installments: 1,
      monthly_interest_installment: 0.0,
      card_brand: null,
      price_product: 0.0,
      price_total: 0.0,
      price_base: 0.0,
      psp_cost_variable_percentage: 0.0,
      psp_cost_variable_amount: 0.0,
      psp_cost_fixed_amount: 0.0,
      psp_cost_total: 0.0,
      revenue: 0.0,
      interest_installment_percentage: 0.0,
      interest_installment_amount: 0.0,
      fee_variable_percentage: 0.0,
      fee_variable_percentage_amount: 0.0,
      fee_fixed_amount: 0.0,
      fee_total: 0.0,
      user_gross_amount: 7.4,
      user_net_amount: 7.4,
      company_gross_profit_amount: 0.0,
      tax_fee_percentage: 0.0,
      tax_fee_total: 0.0,
      tax_interest_percentage: 0.0,
      tax_interest_total: 0.0,
      tax_total: 0.0,
      company_net_profit_amount: 0.0,
      spread_over_price_product: 0.0,
      spread_over_price_total: 0.0,
      created_at: '2022-06-28 16:57:20',
      updated_at: '2022-06-28 16:57:20',
      id_invoice: null,
      discount_percentage: 0.0,
      discount_amount: 0.0,
      original_price: 0.0,
      subscription_fee: 0.0,
      split_price: 0.0,
    },
  ],
  product: {
    coproductions: [],
    id: 1,
    uuid: '6215317a-03d9-497b-bd46-ac837d642720',
    id_user: 3,
    name: 'Produto A - produtor paga ',
    payment_type: 'single',
    content_delivery: 'membership',
    cover: null,
    warranty: 7,
    sales_page_url: '',
    support_email: '',
    nickname: '',
    logo: null,
    hex_color: '#24292f',
    creditcard_descriptor: '',
    created_at: '2022-04-21 14:29:45',
    updated_at: '2022-04-21 18:51:42',
    support_whatsapp: '',
    visible: null,
    id_type: 1,
    category: 2,
    cover_key: null,
    logo_key: null,
    description: 'sdf',
    sidebar_picture: null,
    header_picture: null,
    thumbnail: null,
    sidebar_key: null,
    header_key: null,
    thumbnail_key: null,
    excerpt: null,
    certificate: null,
    allow_affiliate: 0,
    folder_uri: null,
    certificate_key: null,
    files_description: null,
    deleted_at: null,
    checkout_description: null,
    header_picture_mobile: null,
    header_picture_mobile_key: null,
    ebook_cover: null,
    ebook_cover_key: null,
    biography: 'sf',
    favicon: null,
    favicon_key: null,
    banner: null,
    banner_key: null,
    banner_mobile: null,
    banner_mobile_key: null,
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
};

const fakeSaleItemRepo = () => {
  class SaleItemRepo {
    static async find() {
      return new Promise((resolve) => {
        resolve(saleItemData);
      });
    }

    static async update(where, data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return SaleItemRepo;
};

const fakeTransactionsRepo = () => {
  class FakeTransactionsRepo {
    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }

    // eslint-disable-next-line no-unused-vars
    static async update(where, data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }

    static async find() {
      return new Promise((resolve) => {
        resolve({
          id: 2321,
          uuid: 'b64313a1-aff0-4d19-8155-2287c3c392e8',
          id_user: 3,
          id_type: 2,
          id_status: 2,
          psp_id: 62654,
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

const fakeAffiliateRepo = () => {
  class AffiliateRepo {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          id: 1,
          id_user: 3,
          id_product: 2,
          commission: 30.0,
          status: 2,
          created_at: '2022-05-27 13:43:11',
          updated_at: '2022-08-15 20:25:46',
          deleted_at: null,
          uuid: 'O_X-BoBnkI',
          allow_access: 0,
          subscription_fee: 0,
          subscription_fee_commission: 0.0,
          commission_all_charges: 0,
          subscription_fee_only: 0,
          user: {
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
        });
      });
    }
  }

  return AffiliateRepo;
};

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

const fakeDatabaseConfig = () => ({
  transaction: (cb) => cb(),
});

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

const fakeSubscriptionRepo = () => {
  class FakeSubscriptionRepo {
    // eslint-disable-next-line no-unused-vars
    static async update(where, data, t) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeSubscriptionRepo;
};

const makeSut = (data) => {
  const saleItemRepoStub = fakeSaleItemRepo();
  const affiliateRepoStub = fakeAffiliateRepo();
  const transactionRepoStub = fakeTransactionsRepo();
  const balanceRepoStub = fakeBalanceRepo();
  const balanceHistoryRepoStub = fakeBalanceHistoryRepo();
  const subscriptionRepoStub = fakeSubscriptionRepo();
  const databaseConfigStub = fakeDatabaseConfig();
  const salesItemsTransactionsStub = fakeSalesItemsTransactionsRepo();
  const sut = new SplitSaleItemCommission(
    data,
    saleItemRepoStub,
    affiliateRepoStub,
    transactionRepoStub,
    balanceRepoStub,
    balanceHistoryRepoStub,
    subscriptionRepoStub,
    databaseConfigStub,
    salesItemsTransactionsStub,
  );

  return {
    sut,
    saleItemRepoStub,
    affiliateRepoStub,
    transactionRepoStub,
    balanceRepoStub,
    balanceHistoryRepoStub,
    subscriptionRepoStub,
    databaseConfigStub,
  };
};

describe('testing split sale item to affiliate', () => {
  it('should return 400 if sale item is not found', async () => {
    const data = {
      affiliate_uuid: 'any_affiliate',
      id_user: 'any_user',
      sale_item_uuid: 'invalid_sale_item',
    };

    const { sut, saleItemRepoStub } = makeSut(data);
    jest.spyOn(saleItemRepoStub, 'find').mockImplementationOnce(() => null);
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Venda não encontrada');
  });

  it('should return 400 if producer id is different than id_user', async () => {
    const data = {
      affiliate_uuid: 'any_affiliate',
      id_user: 'invalid_user',
      sale_item_uuid: 'any_sale_item',
    };

    const { sut } = makeSut(data);
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Venda não encontrada');
  });

  it('should return 400 if affiliate already has commission', async () => {
    const data = {
      affiliate_uuid: 'any_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const { sut, saleItemRepoStub } = makeSut(data);
    jest.spyOn(saleItemRepoStub, 'find').mockImplementationOnce(() => ({
      ...saleItemData,
      id_affiliate: 1,
    }));
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Afiliado já tem comissão');
  });

  it('should return 400 if affiliate is not found', async () => {
    const data = {
      affiliate_uuid: 'invalid_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const { sut, affiliateRepoStub } = makeSut(data);
    jest.spyOn(affiliateRepoStub, 'find').mockImplementationOnce(() => null);
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Afiliado não encontrado');
  });

  it('should return affiliate transactions', async () => {
    const data = {
      affiliate_uuid: 'valid_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const { sut } = makeSut(data);

    const transactions = await sut.execute();
    expect(
      transactions.filter((t) => t.id_role === 3).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('should calculate affiliate commission', async () => {
    const data = {
      affiliate_uuid: 'valid_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const { sut, transactionRepoStub, affiliateRepoStub } = makeSut(data);

    const paymentTransaction = await transactionRepoStub.find();
    const affiliate = await affiliateRepoStub.find();

    const transactions = await sut.execute();
    const affiliateCommission = transactions.find((t) => t.id_role === 3);
    expect(affiliateCommission.user_net_amount).toBeCloseTo(
      (paymentTransaction.split_price * affiliate.commission) / 100,
    );
  });

  it('should update producer balance because commission is released', async () => {
    const data = {
      affiliate_uuid: 'valid_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const {
      sut,
      transactionRepoStub,
      affiliateRepoStub,
      saleItemRepoStub,
      balanceRepoStub,
    } = makeSut(data);
    const commissionTransaction = saleItemData.transactions.find(
      (t) => t.id_type === 3,
    );

    commissionTransaction.released = true;
    const otherTransactions = saleItemData.transactions.filter(
      (t) => t.id_type !== 3,
    );
    jest.spyOn(saleItemRepoStub, 'find').mockImplementationOnce(() => ({
      ...saleItemData,
      transactions: [...otherTransactions, commissionTransaction],
    }));

    let balance;

    jest
      .spyOn(balanceRepoStub, 'update')
      // eslint-disable-next-line no-unused-vars
      .mockImplementationOnce((a, b, c, d) => {
        balance = b;
        return null;
      });

    const paymentTransaction = await transactionRepoStub.find();
    const affiliate = await affiliateRepoStub.find();

    const transactions = await sut.execute();
    const affiliateCommission = transactions.find((t) => t.id_role === 3);
    expect(affiliateCommission.user_net_amount).toBeCloseTo(
      (paymentTransaction.split_price * affiliate.commission) / 100,
    );
    expect(balance).toBeCloseTo(
      commissionTransaction.user_net_amount -
        affiliateCommission.user_net_amount,
    );
  });

  it('should update sale item', async () => {
    const data = {
      affiliate_uuid: 'valid_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const { sut, saleItemRepoStub, affiliateRepoStub } = makeSut(data);

    let sale_item_data;
    jest
      .spyOn(saleItemRepoStub, 'update')
      .mockImplementationOnce((where, d) => {
        sale_item_data = d;
        return d;
      });

    const affiliate = await affiliateRepoStub.find();

    await sut.execute();
    expect(sale_item_data.id_affiliate).toBe(affiliate.id);
  });

  it('should update subscription', async () => {
    const data = {
      affiliate_uuid: 'valid_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const { sut, subscriptionRepoStub, affiliateRepoStub } = makeSut(data);

    let subscriptionData;
    jest
      .spyOn(subscriptionRepoStub, 'update')
      // eslint-disable-next-line no-unused-vars
      .mockImplementationOnce((where, d, t) => {
        subscriptionData = d;
        return d;
      });

    const affiliate = await affiliateRepoStub.find();

    await sut.execute();
    expect(subscriptionData.id_affiliate).toBe(affiliate.id);
    expect(subscriptionData.affiliate_commission).toBe(affiliate.commission);
  });

  it('should pay commission on release date', async () => {
    const data = {
      affiliate_uuid: 'valid_affiliate',
      id_user: saleItemData.product.id_user,
      sale_item_uuid: 'valid_sale_item',
    };

    const { sut, transactionRepoStub } = makeSut(data);

    let transactionData;
    jest
      .spyOn(transactionRepoStub, 'create')
      // eslint-disable-next-line no-unused-vars
      .mockImplementationOnce((d) => {
        d.release_date = new Date();
        return d;
      });

    jest
      .spyOn(transactionRepoStub, 'update')
      // eslint-disable-next-line no-unused-vars
      .mockImplementation((w, d) => {
        transactionData = d;
        return d;
      });

    await sut.execute();
    expect(transactionData.released).toBe(true);
    expect(transactionData.id_status).toBe(2);
  });
});
