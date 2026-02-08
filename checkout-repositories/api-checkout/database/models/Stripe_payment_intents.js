const Sequelize = require('sequelize');

class Stripe_payment_intents extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        transaction_id: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
        },
        order_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        sale_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        provider: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        provider_payment_intent_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        amount: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        currency: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
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
        sequelize,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'stripe_payment_intents',
      },
    );

    return this;
  }
}

module.exports = Stripe_payment_intents;
