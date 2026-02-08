'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales_agent_stats', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_sale: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('sales_agent_stats', ['device']);
    await queryInterface.addIndex('sales_agent_stats', ['browser']);
    await queryInterface.addIndex('sales_agent_stats', ['os']);
    await queryInterface.addIndex('sales_agent_stats', ['origin']);
    await queryInterface.addIndex('sales_agent_stats', ['id_sale']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sales_agent_stats');
  },
};
