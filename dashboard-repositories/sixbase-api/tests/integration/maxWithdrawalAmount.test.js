const MaxWithdrawalAmount = require('../../useCases/dashboard/withdrawals/MaxWithdrawalAmount');

describe('calculate max withdrawal amount', () => {
  it('should return available_amount - cost', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 10000,
      confirmed_amount: 0,
      cost: 5,
      is_company: true,
      max_monthly_amount: 100000000,
      withheld_balance: 0,
    }).calculate();

    expect(max_amount).toBe(9995);
  });

  it('should return 0 when available_amount === blocked_amount', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 10000,
      confirmed_amount: 10000,
      cost: 5,
      is_company: true,
      max_monthly_amount: 100000000,
      withheld_balance: 10000,
    }).calculate();

    expect(max_amount).toBe(0);
  });

  it('should calculate max amount for cpf users', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 1905,
      confirmed_amount: 0,
      cost: 5,
      is_company: false,
      max_monthly_amount: 1900,
      withheld_balance: 0,
    }).calculate();

    expect(max_amount).toBe(1900);
  });

  it('should return 0 when available_amount = 0', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 0,
      confirmed_amount: 0,
      cost: 5,
      is_company: false,
      max_monthly_amount: 1900,
      withheld_balance: 0,
    }).calculate();

    expect(max_amount).toBe(0);
  });

  it('should return available_amount - confirmed_amount', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 2000,
      confirmed_amount: 1000,
      cost: 5,
      is_company: false,
      max_monthly_amount: 1900,
      withheld_balance: 0,
    }).calculate();

    expect(max_amount).toBe(900);
  });

  it('should return 0 when available_amount = 0', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 800,
      confirmed_amount: 1100,
      cost: 5,
      is_company: false,
      max_monthly_amount: 1900,
      withheld_balance: 200,
    }).calculate();

    expect(max_amount).toBe(595);
  });

  it('should return 0 when withheld is bigger than available amount', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 590,
      confirmed_amount: 0,
      cost: 5,
      is_company: false,
      max_monthly_amount: 1900,
      withheld_balance: 1000,
    }).calculate();

    expect(max_amount).toBe(0);
  });

  it('should return max monthly amount', () => {
    const max_amount = new MaxWithdrawalAmount({
      available_amount: 2405,
      confirmed_amount: 0,
      cost: 5,
      is_company: false,
      max_monthly_amount: 1900,
      withheld_balance: 500,
    }).calculate();

    expect(max_amount).toBe(1900);
  });
});
