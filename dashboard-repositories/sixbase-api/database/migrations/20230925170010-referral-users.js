module.exports = {
  /** @type {import('sequelize-cli').Migration} */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('referral_users', {
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
      id_referral_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      valid_until: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => queryInterface.dropTable('referral_users'),
};
