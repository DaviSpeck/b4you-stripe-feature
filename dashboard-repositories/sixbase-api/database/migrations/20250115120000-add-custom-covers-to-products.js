const tableName = 'products';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(tableName, 'cover_custom', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn(tableName, 'cover_custom_key', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(tableName, 'cover_custom');
    await queryInterface.removeColumn(tableName, 'cover_custom_key');
  },
};

