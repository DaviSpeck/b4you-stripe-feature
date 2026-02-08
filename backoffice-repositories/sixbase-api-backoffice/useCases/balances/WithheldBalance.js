module.exports = class WithheldBalance {
  #CommissionsRepository;

  constructor(CommissionsRepository) {
    this.#CommissionsRepository = CommissionsRepository;
  }

  async calculate(id_user, withheld_balance_percentage, use_highest_sale) {
    const result =
      await this.#CommissionsRepository.sum30DaysTotalAndHighestSale(id_user);

    const lastThirdDaysCommissions = result.total;
    if (lastThirdDaysCommissions === 0) return 0;

    const ticket =
      (lastThirdDaysCommissions * withheld_balance_percentage) / 100;

    if (!use_highest_sale) return Number(ticket.toFixed(3));

    const highestSale = result.highest_sale;
    if (ticket > highestSale) return Number(ticket.toFixed(2));

    return Number(highestSale.toFixed(2));
  }
};
