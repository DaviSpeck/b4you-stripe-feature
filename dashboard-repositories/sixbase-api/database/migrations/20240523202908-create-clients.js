/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      provider_external_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_provider: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      document_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.JSON,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('clients');
  },
};
