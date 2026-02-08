/* eslint-disable max-classes-per-file */
const RefundFees = require('../../useCases/refunds/RefundFees');

const settings = {
  fee_fixed_refund_card: 0,
  fee_fixed_refund_billet: 5,
  fee_fixed_refund_pix: 2,
};

const fakeTaxesRepo = () => {
  class TaxesRepository {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          tax_variable_percentage: 20,
        });
      });
    }
  }

  return TaxesRepository;
};

const fakeCostCentralRepo = () => {
  class CostCentralRepository {
    static async findByMethod() {
      return new Promise((resolve) => {
        resolve({
          psp_variable_cost: 0,
          psp_fixed_cost: 0.5,
        });
      });
    }
  }

  return CostCentralRepository;
};

const getError = async (callFunction) => {
  try {
    const r = await callFunction();
    return r;
  } catch (error) {
    return error;
  }
};

const makeSut = () => {
  const taxesRepoStub = fakeTaxesRepo();
  const costCentralRepoStub = fakeCostCentralRepo();
  const sut = new RefundFees(taxesRepoStub, costCentralRepoStub);
  return {
    sut,
    taxesRepoStub,
    costCentralRepoStub,
  };
};

describe('Refund Fees', () => {
  it('should throw if taxes throws', async () => {
    const { sut, taxesRepoStub } = makeSut();
    jest.spyOn(taxesRepoStub, 'find').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );

    const promise = sut.execute({
      amount: 100,
      method: 'PIX',
      refundSettings: settings,
    });
    await expect(promise).rejects.toThrow();
  });

  it('should throw if cost repository  throws', async () => {
    const { sut, costCentralRepoStub } = makeSut();
    jest.spyOn(costCentralRepoStub, 'findByMethod').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );

    const promise = sut.execute({
      amount: 100,
      method: 'PIX',
      refundSettings: settings,
    });
    await expect(promise).rejects.toThrow();
  });

  it('should throw if taxes is not found', async () => {
    const { sut, taxesRepoStub } = makeSut();
    jest.spyOn(taxesRepoStub, 'find').mockReturnValueOnce(null);

    const error = await getError(() =>
      sut.execute({
        amount: 100,
        method: 'PIX',
        refundSettings: settings,
      }),
    );

    expect(error).toBeDefined();
    expect(error.message).toBe('Taxes not found');
  });

  it('should throw if cost is not found', async () => {
    const { sut, costCentralRepoStub } = makeSut();
    jest.spyOn(costCentralRepoStub, 'findByMethod').mockReturnValueOnce(null);

    const error = await getError(() =>
      sut.execute({
        amount: 100,
        method: 'PIX',
        refundSettings: settings,
      }),
    );

    expect(error).toBeDefined();
    expect(error.message).toBe('Refund method not found');
  });

  it('should call cost central with correct value', async () => {
    const { sut, costCentralRepoStub } = makeSut();
    const costCentralSpy = jest.spyOn(costCentralRepoStub, 'findByMethod');

    await sut.execute({
      amount: 100,
      method: 'PIX',
      refundSettings: settings,
    });
    expect(costCentralSpy).toHaveBeenCalledWith('REFUND_PIX');
  });

  it('should calculate refund fees for pix', async () => {
    const { sut } = makeSut();
    const amount = 100;

    const refundFees = await sut.execute({
      amount,
      refundSettings: settings,
      method: 'PIX',
    });

    expect(refundFees.withdrawal_amount).toBe(0);
    expect(refundFees.withdrawal_total).toBe(0);
    expect(refundFees.price_product).toBe(0);
    expect(refundFees.price_total).toBe(0);
    expect(refundFees.price_base).toBe(0);
    expect(refundFees.psp_cost_variable_percentage).toBe(0);
    expect(refundFees.psp_cost_variable_amount).toBe(0);
    expect(refundFees.psp_cost_fixed_amount).toBe(0.5);
    expect(refundFees.psp_cost_total).toBe(0.5);
    expect(refundFees.revenue).toBe(2);
    expect(refundFees.interest_installment_percentage).toBe(0);
    expect(refundFees.interest_installment_amount).toBe(0);
    expect(refundFees.fee_variable_percentage).toBe(0);
    expect(refundFees.fee_variable_percentage_amount).toBe(0);
    expect(refundFees.fee_fixed_amount).toBe(2);
    expect(refundFees.fee_total).toBe(2);
    expect(refundFees.user_gross_amount).toBe(0);
    expect(refundFees.user_net_amount).toBe(0);
    expect(refundFees.company_gross_profit_amount).toBe(1.5);
    expect(refundFees.tax_fee_percentage).toBe(20);
    expect(refundFees.tax_fee_total).toBe(0.4);
    expect(refundFees.tax_interest_percentage).toBe(0);
    expect(refundFees.tax_interest_total).toBe(0);
    expect(refundFees.tax_total).toBe(0.4);
    expect(refundFees.company_net_profit_amount).toBe(1.1);
    expect(refundFees.spread_over_price_product).toBe(0);
    expect(refundFees.spread_over_price_total).toBe(0);
    expect(refundFees.installments).toBe(1);
    expect(refundFees.monthly_installment_interest).toBe(0);
    expect(refundFees.card_brand).toBe(null);
    expect(refundFees.type).toBe(8);
  });

  it('should calculate refund fees for billet', async () => {
    const { sut } = makeSut();
    const amount = 100;

    const refundFees = await sut.execute({
      amount,
      refundSettings: settings,
      method: 'BILLET',
    });

    expect(refundFees.withdrawal_amount).toBe(0);
    expect(refundFees.withdrawal_total).toBe(0);
    expect(refundFees.price_product).toBe(0);
    expect(refundFees.price_total).toBe(0);
    expect(refundFees.price_base).toBe(0);
    expect(refundFees.psp_cost_variable_percentage).toBe(0);
    expect(refundFees.psp_cost_variable_amount).toBe(0);
    expect(refundFees.psp_cost_fixed_amount).toBe(0.5);
    expect(refundFees.psp_cost_total).toBe(0.5);
    expect(refundFees.revenue).toBe(5);
    expect(refundFees.interest_installment_percentage).toBe(0);
    expect(refundFees.interest_installment_amount).toBe(0);
    expect(refundFees.fee_variable_percentage).toBe(0);
    expect(refundFees.fee_variable_percentage_amount).toBe(0);
    expect(refundFees.fee_fixed_amount).toBe(5);
    expect(refundFees.fee_total).toBe(5);
    expect(refundFees.user_gross_amount).toBe(0);
    expect(refundFees.user_net_amount).toBe(0);
    expect(refundFees.company_gross_profit_amount).toBe(4.5);
    expect(refundFees.tax_fee_percentage).toBe(20);
    expect(refundFees.tax_fee_total).toBeCloseTo(1);
    expect(refundFees.tax_interest_percentage).toBe(0);
    expect(refundFees.tax_interest_total).toBe(0);
    expect(refundFees.tax_total).toBeCloseTo(1);
    expect(refundFees.company_net_profit_amount).toBe(3.5);
    expect(refundFees.spread_over_price_product).toBe(0);
    expect(refundFees.spread_over_price_total).toBe(0);
    expect(refundFees.installments).toBe(1);
    expect(refundFees.monthly_installment_interest).toBe(0);
    expect(refundFees.card_brand).toBe(null);
    expect(refundFees.type).toBe(8);
  });

  it('should calculate refund fees for card', async () => {
    const { sut, costCentralRepoStub } = makeSut();
    const amount = 100;

    jest.spyOn(costCentralRepoStub, 'findByMethod').mockReturnValueOnce({
      psp_variable_cost: 0,
      psp_fixed_cost: 0,
    });

    const refundFees = await sut.execute({
      amount,
      refundSettings: settings,
      method: 'CARD',
    });

    expect(refundFees.withdrawal_amount).toBe(0);
    expect(refundFees.withdrawal_total).toBe(0);
    expect(refundFees.price_product).toBe(0);
    expect(refundFees.price_total).toBe(0);
    expect(refundFees.price_base).toBe(0);
    expect(refundFees.psp_cost_variable_percentage).toBe(0);
    expect(refundFees.psp_cost_variable_amount).toBe(0);
    expect(refundFees.psp_cost_fixed_amount).toBe(0);
    expect(refundFees.psp_cost_total).toBe(0);
    expect(refundFees.revenue).toBe(0);
    expect(refundFees.interest_installment_percentage).toBe(0);
    expect(refundFees.interest_installment_amount).toBe(0);
    expect(refundFees.fee_variable_percentage).toBe(0);
    expect(refundFees.fee_variable_percentage_amount).toBe(0);
    expect(refundFees.fee_fixed_amount).toBe(0);
    expect(refundFees.fee_total).toBe(0);
    expect(refundFees.user_gross_amount).toBe(0);
    expect(refundFees.user_net_amount).toBe(0);
    expect(refundFees.company_gross_profit_amount).toBe(0);
    expect(refundFees.tax_fee_percentage).toBe(20);
    expect(refundFees.tax_fee_total).toBe(0);
    expect(refundFees.tax_interest_percentage).toBe(0);
    expect(refundFees.tax_interest_total).toBe(0);
    expect(refundFees.tax_total).toBe(0);
    expect(refundFees.company_net_profit_amount).toBe(0);
    expect(refundFees.spread_over_price_product).toBe(0);
    expect(refundFees.spread_over_price_total).toBe(0);
    expect(refundFees.installments).toBe(1);
    expect(refundFees.monthly_installment_interest).toBe(0);
    expect(refundFees.card_brand).toBe(null);
    expect(refundFees.type).toBe(8);
  });
});
