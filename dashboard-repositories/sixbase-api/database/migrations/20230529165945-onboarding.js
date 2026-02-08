/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('onboarding', {
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
      signup_reason: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
      has_sold: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      revenue: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('onboarding');
  },
};
