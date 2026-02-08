'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('award_shipments', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      producer_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      milestone: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent'),
        allowNull: false,
        defaultValue: 'pending',
      },
      tracking_code: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tracking_link: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      achieved_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      sent_date: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('award_shipments', ['producer_id']);
    await queryInterface.addIndex('award_shipments', ['milestone']);
    await queryInterface.addConstraint('award_shipments', {
      fields: ['producer_id', 'milestone'],
      type: 'unique',
      name: 'uniq_award_shipments_producer_milestone',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('award_shipments');
  },
};
