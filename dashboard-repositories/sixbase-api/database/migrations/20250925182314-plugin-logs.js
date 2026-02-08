module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('plugins_logs', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_plugin: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      headers: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      body: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      response: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_manual_resend: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      resent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Índices do model
    await queryInterface.addIndex('plugins_logs', ['id_plugin']);
    await queryInterface.addIndex('plugins_logs', ['id_user']);
    await queryInterface.addIndex('plugins_logs', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('plugins_logs');
  },
};
