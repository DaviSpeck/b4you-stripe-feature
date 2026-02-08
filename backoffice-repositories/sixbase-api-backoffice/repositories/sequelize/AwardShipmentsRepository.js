const Sequelize = require('sequelize');
const AwardShipments = require('../../database/models/Award_shipments');
const Database = require('../../database/models');
const dateHelper = require('../../utils/helpers/date');

module.exports = class AwardShipmentsRepository {
  static EXCLUDED_PRODUCER_IDS = ['1321', '107054', '1350'];

  static async create(data) {
    const row = await AwardShipments.create(data);
    return row.toJSON();
  }

  static async updateById(id, data) {
    await AwardShipments.update(data, { where: { id } });
  }

  static async deleteById(id) {
    return AwardShipments.destroy({ where: { id } });
  }

  static async findById(id) {
    const row = await AwardShipments.findByPk(id);
    return row ? row.toJSON() : null;
  }

  static async findByProducerAndMilestone(producer_id, milestone) {
    const row = await AwardShipments.findOne({
      where: { producer_id, milestone },
    });
    return row ? row.toJSON() : null;
  }

  static async list({
    producer_id,
    milestone,
    status,
    input,
    start_date,
    end_date,
    page = 0,
    size = 20,
  }) {
    const { Op } = Sequelize;
    const where = {};
    if (producer_id) {
      where.producer_id = producer_id;
    }
    if (milestone) where.milestone = milestone;
    if (status) where.status = status;

    if (start_date && end_date) {
      const startUtc = dateHelper(start_date).startOf('day').utc().toDate();
      const endUtc = dateHelper(end_date).endOf('day').utc().toDate();

      if (status === 'pending') {
        where.achieved_date = {
          [Op.between]: [startUtc, endUtc],
        };
      } else if (status === 'sent') {
        where.sent_date = {
          [Op.between]: [startUtc, endUtc],
        };
      }
    }

    // Build a single include for users (producer) and merge filters to avoid duplicate includes
    const userIncludeWhere = {};
    if (!producer_id) {
      userIncludeWhere.award_eligible = true;
    }
    if (input && input.trim()) {
      const searchTerm = `%${input.trim()}%`;
      userIncludeWhere[Op.or] = [
        { full_name: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } },
        { whatsapp: { [Op.like]: searchTerm } },
      ];
    }

    const { rows, count } = await AwardShipments.findAndCountAll({
      where,
      include: [
        {
          model: Database.sequelize.models.users,
          as: 'producer',
          attributes: [
            'id',
            'full_name',
            'email',
            'whatsapp',
            'award_eligible',
          ],
          where: Object.keys(userIncludeWhere).length
            ? userIncludeWhere
            : undefined,
          required: true,
        },
      ],
      offset: Number(page) * Number(size),
      limit: Number(size),
      order: [['achieved_date', 'ASC']],
      distinct: true,
    });

    return { rows: rows.map((r) => r.toJSON()), count };
  }
};
