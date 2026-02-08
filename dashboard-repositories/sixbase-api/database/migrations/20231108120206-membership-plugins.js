/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('membership_plugins', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      id_plugin: {
        type: Sequelize.INTEGER,
      },
      settings: {
        type: Sequelize.JSON,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    });
  },

  // eslint-disable-next-line
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('membership_plugins');
  },
};
