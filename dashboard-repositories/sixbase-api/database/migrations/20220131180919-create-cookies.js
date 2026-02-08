module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('cookies_jar', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      sixid: {
        type: Sequelize.STRING,
      },
      id_offer: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_affiliate: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      max_age: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('cookies_jar'),
};
