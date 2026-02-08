

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'prize_address', {
      type: Sequelize.JSON,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'prize_address');
  },
};
