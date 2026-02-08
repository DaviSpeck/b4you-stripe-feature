export class WithheldBalance {
  #CommissionsRepository;

  constructor(CommissionsRepository) {
    this.#CommissionsRepository = CommissionsRepository;
  }

  async calculate(id_user, withheld_balance_percentage, use_highest_sale) {
    const lastThirdDaysCommissions = await this.#CommissionsRepository.sum30DaysTotal(id_user);

    if (lastThirdDaysCommissions === 0) return 0;

    const ticket = (lastThirdDaysCommissions * withheld_balance_percentage) / 100;

    if (!use_highest_sale) return Number(ticket.toFixed(2));

    const highestSale = await this.#CommissionsRepository.findHighestSale(id_user);

    if (ticket > highestSale) return Number(ticket.toFixed(2));

    return Number(highestSale.toFixed(2));
  }
}
