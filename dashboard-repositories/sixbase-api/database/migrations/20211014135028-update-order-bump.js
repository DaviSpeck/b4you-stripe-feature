module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('order_bumps', 'id_classroom', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),
      queryInterface.addColumn('order_bumps', 'label', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.addColumn('order_bumps', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('order_bumps', 'id_classroom', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
      queryInterface.removeColumn('order_bumps', 'label'),
      queryInterface.removeColumn('order_bumps', 'description'),
    ]);
  },
};
