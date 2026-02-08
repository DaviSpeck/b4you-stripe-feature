/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'membership_comments_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Define se o curso aceita comentários nas aulas',
    });

    await queryInterface.addColumn(
      'products',
      'membership_comments_auto_approve',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Define se os comentários são aprovados automaticamente',
      },
    );

    await queryInterface.createTable('lesson_comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      id_lesson: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'lessons', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      auto_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approved_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      approved_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('lesson_comments', ['id_lesson'], {
      name: 'lesson_comments_lesson_idx',
    });
    await queryInterface.addIndex('lesson_comments', ['id_product'], {
      name: 'lesson_comments_product_idx',
    });
    await queryInterface.addIndex('lesson_comments', ['status'], {
      name: 'lesson_comments_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'lesson_comments',
      'lesson_comments_status_idx',
    );
    await queryInterface.removeIndex(
      'lesson_comments',
      'lesson_comments_product_idx',
    );
    await queryInterface.removeIndex(
      'lesson_comments',
      'lesson_comments_lesson_idx',
    );
    await queryInterface.dropTable('lesson_comments');

    await queryInterface.removeColumn(
      'products',
      'membership_comments_auto_approve',
    );
    await queryInterface.removeColumn(
      'products',
      'membership_comments_enabled',
    );

    // Postgres enum cleanup
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_lesson_comments_status";',
      );
    }
  },
};

