module.exports = {
  /** @type {import('sequelize-cli').Migration} */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('referral_program', {
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
      percentage: {
        type: Sequelize.DECIMAL(10, 2),
      },
      id_status: {
        type: Sequelize.TINYINT.UNSIGNED,
      },
      code: {
        type: Sequelize.STRING(12),
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      canceled_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => queryInterface.dropTable('referral_program'),
};
