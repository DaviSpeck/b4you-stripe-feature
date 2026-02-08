module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('panda_folders', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      external_uuid: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('panda_folders');
  },
};
