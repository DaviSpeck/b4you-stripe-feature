module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('offer_plans', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_offer: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_plan: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('offer_plans'),
};
