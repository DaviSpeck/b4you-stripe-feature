module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('email_notifications', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_type: {
        type: Sequelize.BIGINT,
      },
      id_student: {
        type: Sequelize.BIGINT,
      },
      id_producer: {
        type: Sequelize.BIGINT,
      },
      variables: {
        type: Sequelize.JSON,
      },
      details: {
        type: Sequelize.STRING,
      },
      message_uuid: {
        type: Sequelize.STRING,
      },
      message_id: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      sent_at: Sequelize.DATE,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('email_notifications'),
};
