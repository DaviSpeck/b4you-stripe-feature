module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      id_product: {
        type: Sequelize.BIGINT,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      id_type: {
        type: Sequelize.INTEGER,
      },
      file: {
        type: Sequelize.STRING,
      },
      key: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('product_images'),
};
