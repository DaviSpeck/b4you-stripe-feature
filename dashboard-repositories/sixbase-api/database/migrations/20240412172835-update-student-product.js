module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('student_products', 'has_access'),
      queryInterface.addColumn('student_products', 'id_sale_item', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn('student_products', 'is_bonus', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('student_products', 'has_access', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },
};
