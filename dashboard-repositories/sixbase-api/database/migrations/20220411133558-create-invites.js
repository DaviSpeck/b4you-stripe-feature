module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invites', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDv4,
        unique: true,
      },
      already_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('invites');
  },
};
