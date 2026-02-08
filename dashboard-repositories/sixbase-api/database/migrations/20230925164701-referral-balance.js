module.exports = {
  /** @type {import('sequelize-cli').Migration} */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('referral_balance', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      total: {
        type: Sequelize.DECIMAL(20, 2),
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => queryInterface.dropTable('referral_balance'),
};
