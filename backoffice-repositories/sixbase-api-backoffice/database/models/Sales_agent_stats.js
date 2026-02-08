const Sequelize = require('sequelize');

class SalesAgentStats extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                },
                id_sale: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                },
                device: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    defaultValue: 'Indefinido',
                },
                browser: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    defaultValue: 'Indefinido',
                },
                os: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    defaultValue: 'Indefinido',
                },
                origin: {
                    type: Sequelize.STRING(150),
                    allowNull: false,
                    defaultValue: 'Indefinido',
                },
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW,
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW,
                },
            },
            {
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                sequelize,
                modelName: 'sales_agent_stats',
                indexes: [
                    { name: 'idx_sales_agent_stats_device', fields: ['device'] },
                    { name: 'idx_sales_agent_stats_browser', fields: ['browser'] },
                    { name: 'idx_sales_agent_stats_os', fields: ['os'] },
                    { name: 'idx_sales_agent_stats_origin', fields: ['origin'] },
                    { name: 'idx_sales_agent_stats_id_sale', fields: ['id_sale'] },
                ],
            },
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.sales, {
            foreignKey: 'id_sale',
            as: 'sale',
        });
    }
}

module.exports = SalesAgentStats;