/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blocks', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_type: {
        type: Sequelize.INTEGER(),
        defaultValue: null,
      },
      email: {
        type: Sequelize.STRING(),
        defaultValue: null,
      },
      document_number: {
        type: Sequelize.STRING(),
        defaultValue: null,
      },
      phone: {
        type: Sequelize.STRING(),
        defaultValue: null,
      },
      full_name: {
        type: Sequelize.STRING(),
        defaultValue: null,
      },
      address: {
        type: Sequelize.JSON(),
        defaultValue: null,
      },
      visitorId: {
        type: Sequelize.STRING(),
        defaultValue: null,
      },
      cookies: {
        type: Sequelize.JSON(),
        defaultValue: null,
      },
      ip: {
        type: Sequelize.STRING(),
        defaultValue: null,
      },
      body: {
        type: Sequelize.JSON(),
        defaultValue: null,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('block');
  },
};
