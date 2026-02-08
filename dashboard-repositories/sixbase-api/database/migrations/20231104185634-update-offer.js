/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'terms', {
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn('product_offer', 'url_terms', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  // eslint-disable-next-line
  async down(queryInterface, _Sequelize) {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'terms'),
      queryInterface.removeColumn('product_offer', 'url_terms'),
    ]);
  },
};
