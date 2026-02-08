

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('form_questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      id_form: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'forms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      key: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      visible_if: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      help_text: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      placeholder: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('form_questions', ['id_form', 'order'], {
      name: 'form_questions_id_form_order_idx',
    });
    await queryInterface.addIndex('form_questions', ['key'], {
      name: 'form_questions_key_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'form_questions',
      'form_questions_id_form_order_idx',
    );
    await queryInterface.removeIndex(
      'form_questions',
      'form_questions_key_idx',
    );
    await queryInterface.dropTable('form_questions');
  },
};
