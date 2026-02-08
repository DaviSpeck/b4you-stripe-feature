module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('charges', 'id_subscription', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('charges', 'id_subscription');
  },
};
