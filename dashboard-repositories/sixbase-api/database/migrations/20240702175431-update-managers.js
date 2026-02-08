/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('managers', 'type', {
      type: Sequelize.STRING,
      defaultValue: 'not-all',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('managers', 'type');
  },
};
