/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('user_activity', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
      },
      id_type: {
        type: Sequelize.INTEGER,
      },
      reason: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('user_activity'),
};
