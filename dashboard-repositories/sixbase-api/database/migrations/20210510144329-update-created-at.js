module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('products', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('products', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('affiliates', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('affiliates', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('classrooms', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('classrooms', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('coproduction_invites', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('coproduction_invites', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('coproductions', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('coproductions', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('lessons_attachments', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('lessons_attachments', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('lessons', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('lessons', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('modules', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('modules', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('plugins', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('plugins', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('product_offer', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('product_offer', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('sales_items', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('sales_items', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('sales', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('sales', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('students', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('students', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('study_history', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('study_history', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('transactions', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('transactions', 'updated_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('users', 'created_at', {
        type: Sequelize.DATE,
      }),
      queryInterface.changeColumn('users', 'updated_at', {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('products', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('products', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('affiliates', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('affiliates', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('classrooms', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('classrooms', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('coproduction_invites', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('coproduction_invites', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('coproductions', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('coproductions', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('lessons_attachments', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('lessons_attachments', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('lessons', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('lessons', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('modules', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('modules', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('plugins', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('plugins', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('product_offer', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('product_offer', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('sales_items', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('sales_items', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('sales', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('sales', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('students', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('students', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('study_history', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('study_history', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('transactions', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('transactions', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('users', 'created_at', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('users', 'updated_at', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },
};
