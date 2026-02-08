module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products_ebooks', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      id_product: {
        type: Sequelize.BIGINT,
      },
      ebook_file: {
        type: Sequelize.STRING,
      },
      ebook_key: {
        type: Sequelize.STRING,
      },
      main_product: {
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('products_ebooks');
  },
};
