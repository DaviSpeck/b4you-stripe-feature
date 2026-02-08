module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'hex_color_membership_primary', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#070f22',
      }),
      queryInterface.addColumn('products', 'hex_color_membership_secondary', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#4dd0bb',
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'hex_color_membership_primary'),
      queryInterface.removeColumn('products', 'hex_color_membership_secondary'),
    ]);
  },
};
