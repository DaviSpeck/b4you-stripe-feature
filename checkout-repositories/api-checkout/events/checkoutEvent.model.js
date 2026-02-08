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
          unique: true,
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
          allowNull: false,
        },

        producer_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        checkout_type: {
          type: Sequelize.STRING,
          allowNull: true,
          validate: {
            isIn: [['standard', '3steps']],
          },
        },

        checkout_mode: {
          type: Sequelize.STRING,
          allowNull: true,
          validate: {
            isIn: [['embedded', 'transparent', 'sandbox', 'development']],
          },
        },

        step: {
          type: Sequelize.STRING,
          allowNull: true,
          validate: {
            isIn: [['identification', 'address', 'payment']],
          },
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
          validate: {
            isIn: [['credit_card', 'pix', 'boleto']],
          },
        },

        event_timestamp: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },

        execution_environment: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isIn: [['production', 'sandbox', 'development']],
          },
        },

        full_hostname: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        root_domain: {
          type: Sequelize.STRING,
          allowNull: false,
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
          allowNull: false,
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'checkout_events',
      },
    );

    return this;
  }
}

module.exports = Checkout_events;