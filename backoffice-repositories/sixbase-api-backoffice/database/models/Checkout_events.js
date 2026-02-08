const Sequelize = require('sequelize');

class Checkout_events extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        event_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        event_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        event_description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        session_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        offer_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        product_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        producer_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        checkout_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        checkout_mode: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        step: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        payment_method: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        event_timestamp: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        execution_environment: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        full_hostname: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        root_domain: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        received_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        ip_address: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        sequelize,
        modelName: 'checkout_events',
        tableName: 'checkout_events',
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );

    return this;
  }
}

module.exports = Checkout_events;
