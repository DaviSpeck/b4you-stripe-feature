/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users','user_type',{
      type: Sequelize.TINYINT,
      allowNull: true,
      defaultValue: 0,
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('users','user_type');
  }
};