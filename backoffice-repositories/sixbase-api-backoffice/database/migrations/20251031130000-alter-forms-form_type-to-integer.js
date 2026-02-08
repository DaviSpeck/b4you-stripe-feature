'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) add temp column
    await queryInterface.addColumn('forms', 'form_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 2) try to migrate known legacy string values to numeric ids
    // Map: Creator->1, Marca->2, Ambos->0 (adjust if needed)
    await queryInterface.sequelize.query(
      "UPDATE forms SET form_type_id = CASE LOWER(form_type) WHEN 'creator' THEN 1 WHEN 'marca' THEN 2 WHEN 'ambos' THEN 0 ELSE NULL END;",
    );

    // 3) drop old index and column, then rename
    try {
      await queryInterface.removeIndex(
        'forms',
        'forms_form_type_is_active_idx',
      );
    } catch (e) {}

    await queryInterface.removeColumn('forms', 'form_type');
    await queryInterface.renameColumn('forms', 'form_type_id', 'form_type');

    // 4) set not null and add index back
    await queryInterface.changeColumn('forms', 'form_type', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addIndex('forms', ['form_type', 'is_active'], {
      name: 'forms_form_type_is_active_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to string column (best effort)
    await queryInterface.addColumn('forms', 'form_type_str', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      "UPDATE forms SET form_type_str = CASE form_type WHEN 1 THEN 'Creator' WHEN 2 THEN 'Marca' WHEN 0 THEN 'Ambos' ELSE NULL END;",
    );

    try {
      await queryInterface.removeIndex(
        'forms',
        'forms_form_type_is_active_idx',
      );
    } catch (e) {}

    await queryInterface.removeColumn('forms', 'form_type');
    await queryInterface.renameColumn('forms', 'form_type_str', 'form_type');

    await queryInterface.addIndex('forms', ['form_type', 'is_active'], {
      name: 'forms_form_type_is_active_idx',
    });
  },
};
