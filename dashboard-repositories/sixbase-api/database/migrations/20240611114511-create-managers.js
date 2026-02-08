/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('managers', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.BIGINT,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      id_status: {
        type: Sequelize.TINYINT,
      },
      id_product: {
        type: Sequelize.BIGINT,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      commission_type: {
        type: Sequelize.STRING(10),
      },
      commission_with_affiliate: {
        type: Sequelize.DECIMAL(10, 2),
      },
      commission_without_affiliate: {
        type: Sequelize.DECIMAL(10, 2),
      },
      allow_share_link: {
        type: Sequelize.BOOLEAN,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
      accepted_at: Sequelize.DATE,
      rejected_at: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('managers');
  },
};
