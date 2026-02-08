module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'hex_color_membership_text', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#ffffff',
      }),
      queryInterface.addColumn('products', 'hex_color_membership_hover', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#1d1d1d',
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'hex_color_membership_text'),
      queryInterface.removeColumn('products', 'hex_color_membership_hover'),
    ]);
  },
};
