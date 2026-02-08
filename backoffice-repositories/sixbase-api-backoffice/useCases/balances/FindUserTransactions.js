const { Op } = require('sequelize');
const database = require('../../database/models');

module.exports = class FindUserTransactions {
  constructor({ SalesItemsRepository }) {
    this.SalesItemsRepository = SalesItemsRepository;
  }

  async execute(query) {
    const transactions = await this.SalesItemsRepository.findSalesPaginated(
      query,
    );
    return transactions;
  }

  async executeWithSQL(query) {
    try {
      const { page = 0, size = 10, userUuid, ...filters } = query;
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const user = await database.sequelize.models.users.findOne({
        where: { uuid: userUuid },
        attributes: ['id'],
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const where = {};
      if (filters.input) {
        where[Op.or] = [
          { '$student.email$': { [Op.like]: `%${filters.input}%` } },
          { '$student.full_name$': { [Op.like]: `%${filters.input}%` } },
          { '$product.name$': { [Op.like]: `%${filters.input}%` } },
        ];
      }
      const result =
        await database.sequelize.models.sales_items.findAndCountAll({
          subQuery: false,
          attributes: [
            'id',
            'uuid',
            'id_status',
            'price_total',
            'created_at',
            'updated_at',
            'id_student',
            'id_product',
            'type',
            'company_net_profit_amount',
          ],
          include: [
            {
              model: database.sequelize.models.students,
              as: 'student',
              required: false,
              attributes: ['email', 'full_name'],
            },
            {
              model: database.sequelize.models.products,
              as: 'product',
              required: true,
              attributes: ['name', 'uuid'],
            },
            {
              model: database.sequelize.models.sales,
              as: 'sale',
              required: true,
              attributes: ['id', 'created_at', 'updated_at'],
            },
            {
              model: database.sequelize.models.charges,
              as: 'charges',
              required: false,
              attributes: ['payment_method'],
              through: { attributes: [] },
            },
            {
              model: database.sequelize.models.commissions,
              as: 'commissions',
              required: true,
              where: { id_user: user.id },
              attributes: ['amount', 'id_role'],
            },
          ],
          where,
          order: [['created_at', 'DESC']],
          limit,
          offset,
        });
      const formattedRows = result.rows.map((item) => {
        const row = item.get({ plain: true });
        const lastCharge =
          row.charges?.length > 0
            ? row.charges.sort((a, b) => b.id - a.id)[0]
            : null;

        const producerCommission = row.commissions?.find(
          (commission) => commission.id_role === 1,
        );
        const producerAmount =
          producerCommission?.amount || row.company_net_profit_amount || 0;

        return {
          id: row.id,
          uuid: row.uuid,
          price_total: parseFloat(producerAmount) || 0,
          id_status: row.id_status,
          created_at: row.sale?.created_at || row.created_at,
          updated_at: row.sale?.updated_at || row.updated_at,
          id_student: row.id_student,
          id_product: row.id_product,
          type: row.type,
          payment_method: lastCharge?.payment_method || 'card',
          student_email: row.student?.email || 'Email não informado',
          student_full_name: row.student?.full_name || 'Nome não informado',
          product_name: row.product?.name || 'Produto não identificado',
          product_uuid: row.product?.uuid,
          student: {
            email: row.student?.email || 'Email não informado',
            full_name: row.student?.full_name || 'Nome não informado',
          },
          product: {
            name: row.product?.name || 'Produto não identificado',
            uuid: row.product?.uuid,
          },
          commissions: row.commissions,
        };
      });

      return {
        count: result.count,
        rows: formattedRows,
      };
    } catch (error) {
      console.error(
        'Erro ao buscar transações do usuário com Sequelize:',
        error,
      );
      throw error;
    }
  }
};
