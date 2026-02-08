const Sequelize = require('sequelize');

class Card_verification extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_status: {
          type: Sequelize.INTEGER,
        },
        id_student: {
          type: Sequelize.BIGINT,
        },
        transaction_id: {
          type: Sequelize.UUID,
          unique: true,
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        refund_id: {
          type: Sequelize.UUID,
          unique: true,
        },
        psp_id: {
          type: Sequelize.BIGINT,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        refunded_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'card_verification',
      },
    );

    return this;
  }
}

module.exports = Card_verification;
