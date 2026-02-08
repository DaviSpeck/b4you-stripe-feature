const Sequelize = require('sequelize');

class Taxes extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        tax_variable_percentage: {
          type: Sequelize.DECIMAL(14, 2),
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'taxes',
      },
    );

    return this;
  }
}

module.exports = Taxes;
