/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      id_offer: {
        type: Sequelize.STRING(36),
        allowNull: false,
      },
      sale_item_id: {
        type: Sequelize.STRING(36),
        allowNull: true,
        defaultValue: null,
        collate: 'utf8mb3_general_ci',
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: false,
        collate: 'utf8mb3_general_ci',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      url: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      session_id: {
        type: Sequelize.STRING(36),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(36),
        allowNull: false,
      },
      ip: {
        type: Sequelize.STRING(36),
        allowNull: true,
        defaultValue: null,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('events');
  },
};
