module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'student_pays_interest', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.removeColumn('products', 'customcode_checkout'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'student_pays_interest'),
      queryInterface.addColumn('products', 'customcode_checkout', {
        type: Sequelize.STRING,
      }),
    ]);
  },
};
