module.exports = class MaxWithdrawalAmount {
  #is_company;

  #available_amount;

  #withheld_balance;

  #cost;

  #max_monthly_amount;

  #confirmed_amount;

  constructor({
    is_company,
    available_amount,
    withheld_balance,
    cost,
    max_monthly_amount,
    confirmed_amount,
  }) {
    this.#is_company = is_company;
    this.#available_amount = available_amount;
    this.#withheld_balance = withheld_balance;
    this.#cost = cost;
    this.#max_monthly_amount = max_monthly_amount;
    this.#confirmed_amount = confirmed_amount;
  }

  calculate() {
    if (this.#available_amount === 0) return 0;

    const amount = this.#available_amount - this.#withheld_balance - this.#cost;

    if (amount <= 0) return 0;

    if (this.#is_company) return Number(amount.toFixed(2));

    const max = this.#max_monthly_amount - this.#confirmed_amount;

    if (max <= 0) return 0;

    if (amount >= max) return Number(max.toFixed(2));

    return Number(amount.toFixed(2));
  }
};
