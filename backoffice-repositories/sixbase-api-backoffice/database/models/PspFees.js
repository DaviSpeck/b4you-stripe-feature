const Sequelize = require('sequelize');

class Psp_fees extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        fee_variable_withdrawal: {
          type: Sequelize.DECIMAL(14, 2),
          allowNull: false,
        },
        fee_fixed_withdrawal: {
          type: Sequelize.DECIMAL(14, 2),
          allowNull: false,
        },
        fee_variable_card: {
          type: Sequelize.JSON,
        },
        fee_fixed_card: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_pix: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed_pix: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_billet: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed_billet: {
          type: Sequelize.DECIMAL(10, 2),
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
        modelName: 'psp_fees',
      },
    );

    return this;
  }
}

module.exports = Psp_fees;
