/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'email_subject', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('products', 'email_template', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'email_subject');
    await queryInterface.removeColumn('products', 'email_template');
  },
};
