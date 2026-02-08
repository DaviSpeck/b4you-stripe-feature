module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('verify_identity', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      doc_front: {
        type: Sequelize.STRING,
      },
      doc_front_key: {
        type: Sequelize.STRING,
      },
      doc_back: {
        type: Sequelize.STRING,
      },
      doc_back_key: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      address_key: {
        type: Sequelize.STRING,
      },
      selfie: {
        type: Sequelize.STRING,
      },
      selfie_key: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('verify_identity'),
};
