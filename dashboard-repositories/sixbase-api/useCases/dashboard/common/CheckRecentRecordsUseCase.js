const { Op } = require('sequelize');

class CheckRecentRecordsUseCase {
    /**
     * @param {object} deps
     * @param {Sequelize.Model} deps.model        – o model Sequelize
     * @param {string}         [deps.dateField]   – campo de data (default: 'created_at')
     * @param {object}         [deps.baseFilters] – filtros extras fixos
     */
    constructor({ model, dateField = 'created_at', baseFilters = {} }) {
        this.model = model;
        this.dateField = dateField;
        this.baseFilters = baseFilters;
    }

    /**
     * @param {object} filters – filtros dinâmicos (ex: { id_affiliate: 123, id_status: 2 })
     * @param {number} days    – quantos dias olhar pra trás
     * @returns {Promise<boolean>}
     */
    async execute(filters, days = 90) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const where = {
            ...this.baseFilters,
            ...filters,
            [this.dateField]: { [Op.gte]: cutoff }
        };

        const rec = await this.model.findOne({ where });
        return rec !== null;
    }
}

module.exports = CheckRecentRecordsUseCase;