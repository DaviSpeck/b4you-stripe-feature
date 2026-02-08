const Withdrawals = require('../../database/models/Withdrawals');

module.exports = class WithdrawalsRepository {
  static async findPaginatedWithdrawals({ page = 0, size = 10, where }) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const { rows, count } = await Withdrawals.findAndCountAll({
      offset,
      limit,
      where,
      attributes: ['id', 'bank_address'],
      order: [['id', 'DESC']],
      include: [
        {
          association: 'transaction',
          attributes: [
            'psp_id',
            'id_status',
            'method',
            'withdrawal_amount',
            'withdrawal_total',
            'created_at',
            'updated_at',
            'revenue',
            'withdrawal_type',
          ],
        },
      ],
    });
    return {
      count,
      rows: rows.map((r) => r.toJSON()),
    };
  }
};
