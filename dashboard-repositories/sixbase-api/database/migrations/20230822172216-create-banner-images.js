module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('market_images', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        references: {
          model: 'users_backoffice',
          key: 'id',
        },
      },
      url: {
        type: Sequelize.STRING,
      },
      file: {
        type: Sequelize.TEXT,
      },
      key: {
        type: Sequelize.STRING,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('market_images'),
};
