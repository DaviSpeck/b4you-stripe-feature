import * as Sequelize from 'sequelize';

export class Stripe_webhook_events extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        provider_event_id: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        provider: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        event_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        transaction_id: {
          type: Sequelize.UUID,
          allowNull: true,
        },
        provider_payment_intent_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        payment_intent_status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        processing_result: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        payload: {
          type: Sequelize.JSON,
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
        modelName: 'stripe_webhook_events',
      }
    );

    return this;
  }
}
