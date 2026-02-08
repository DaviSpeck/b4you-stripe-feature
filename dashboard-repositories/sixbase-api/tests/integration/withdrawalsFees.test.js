/* eslint-disable max-classes-per-file */
const CalculateWithdrawalFeesAndAmounts = require('../../useCases/dashboard/fees/CalculateWithdrawalsFeesAndAmounts');

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

const makeSut = () => {
  const taxesRepoStub = fakeTaxesRepo();
  const costCentralRepoStub = fakeCostCentralRepo();
  const sut = new CalculateWithdrawalFeesAndAmounts(
    taxesRepoStub,
    costCentralRepoStub,
  );
  return {
    sut,
    taxesRepoStub,
    costCentralRepoStub,
  };
};

const getError = async (callFunction) => {
  try {
    const r = await callFunction();
    return r;
  } catch (error) {
    return error;
  }
};

describe('withdrawal fees', () => {
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
      withdrawalSettings: { fee_fixed: 5, fee_variable: 0 },
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
      withdrawalSettings: { fee_fixed: 5, fee_variable: 0 },
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
        withdrawalSettings: { fee_fixed: 5, fee_variable: 0 },
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
        withdrawalSettings: { fee_fixed: 5, fee_variable: 0 },
      }),
    );

    expect(error).toBeDefined();
    expect(error.message).toBe('Withdrawal method not found');
  });

  it('should call cost central with correct value', async () => {
    const { sut, costCentralRepoStub } = makeSut();
    const costCentralSpy = jest.spyOn(costCentralRepoStub, 'findByMethod');

    await sut.execute({
      amount: 100,
      method: 'PIX',
      withdrawalSettings: { fee_fixed: 5, fee_variable: 0 },
    });
    expect(costCentralSpy).toHaveBeenCalledWith('WITHDRAWAL_PIX');
  });

  it('should calculate withdrawal fees', async () => {
    const { sut } = makeSut();
    const amount = 100;
    const settings = {
      free_month_withdrawal: 1,
      fee_fixed: 5,
      fee_variable: 0,
    };
    const fees = await sut.execute({
      amount,
      withdrawalSettings: settings,
      method: 'PIX',
    });

    expect(fees.withdrawal_amount).toBe(100);
    expect(fees.withdrawal_total).toBe(105);
    expect(fees.price_product).toBe(0);
    expect(fees.price_total).toBe(0);
    expect(fees.price_base).toBe(0);
    expect(fees.psp_cost_variable_percentage).toBe(0);
    expect(fees.psp_cost_variable_amount).toBe(0);
    expect(fees.psp_cost_fixed_amount).toBe(0.5);
    expect(fees.psp_cost_total).toBe(0.5);
    expect(fees.revenue).toBe(5);
    expect(fees.interest_installment_percentage).toBe(0);
    expect(fees.interest_installment_amount).toBe(0);
    expect(fees.fee_variable_percentage).toBe(0);
    expect(fees.fee_variable_percentage_amount).toBe(0);
    expect(fees.fee_fixed_amount).toBe(5);
    expect(fees.fee_total).toBe(5);
    expect(fees.user_gross_amount).toBe(0);
    expect(fees.user_net_amount).toBe(0);
    expect(fees.company_gross_profit_amount).toBe(4.5);
    expect(fees.tax_fee_percentage).toBe(20);
    expect(fees.tax_fee_total).toBe(1);
    expect(fees.tax_interest_percentage).toBe(0);
    expect(fees.tax_interest_total).toBe(0);
    expect(fees.tax_total).toBe(1);
    expect(fees.company_net_profit_amount).toBe(3.5);
    expect(fees.spread_over_price_product).toBe(0);
    expect(fees.spread_over_price_total).toBe(0);
    expect(fees.installments).toBe(1);
    expect(fees.monthly_installment_interest).toBe(0);
    expect(fees.type).toBe(1);
  });
});
