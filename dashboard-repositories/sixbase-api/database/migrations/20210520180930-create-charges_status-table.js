module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('charges_status', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('charges_status');
  },
};
