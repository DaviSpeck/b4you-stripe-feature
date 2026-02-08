module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('product_gallery', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      uri: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      upload_link: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      video_status: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        defaultValue: 0,
      },
      video_uploaded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('product_gallery'),
};
