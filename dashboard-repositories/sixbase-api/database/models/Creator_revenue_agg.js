const Sequelize = require('sequelize');

module.exports = class Creator_revenue_agg extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id_user: {
          type: Sequelize.BIGINT,
          primaryKey: true,
        },
        period: {
          type: Sequelize.ENUM('weekly', 'monthly', 'all_time'),
          primaryKey: true,
        },
        revenue: {
          type: Sequelize.DECIMAL(20, 2),
        },
        sales_count: {
          type: Sequelize.INTEGER,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        timestamps: false,
        freezeTableName: true,
        sequelize,
        modelName: 'creator_revenue_agg',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      as: 'user',
      sourceKey: 'id_user',
      foreignKey: 'id',
    });
  }
};