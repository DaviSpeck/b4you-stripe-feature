/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      menu_item_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'menu_items',
          key: 'id'
        },
        onUpdate: 'RESTRICT',
        onDelete: 'CASCADE'
      },
      role_id: {
        type: Sequelize.BIGINT, // <-- ajustado para BIGINT
        allowNull: false,
        references: {
          model: 'backoffice_roles',
          key: 'id'
        },
        onUpdate: 'RESTRICT',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex(
      'menu_items_roles',
      ['menu_item_id', 'role_id'],
      {
        unique: true,
        name: 'menu_items_roles_unique',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('menu_items_roles');
  },
};
