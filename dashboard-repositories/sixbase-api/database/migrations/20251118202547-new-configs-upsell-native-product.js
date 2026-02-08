module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'upsell_native_product',
      'step_color_background',
      {
        type: Sequelize.STRING,
        defaultValue: '#ffffffff',
      },
    );
    await queryInterface.addColumn('upsell_native_product', 'step_color', {
      type: Sequelize.STRING,
      defaultValue: '#0f1b35',
    });
    await queryInterface.addColumn(
      'upsell_native_product',
      'alert_not_close_primary_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'alert_not_close_primary_text_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#ffffffff',
      },
    );
    await queryInterface.addColumn('upsell_native_product', 'background', {
      type: Sequelize.STRING,
      defaultValue: '#f2f4f7',
    });
    await queryInterface.addColumn(
      'upsell_native_product',
      'is_message_not_close',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'upsell_native_product',
      'step_color_background',
    );
    await queryInterface.removeColumn('upsell_native_product', 'step_color');
    await queryInterface.removeColumn(
      'upsell_native_product',
      'alert_not_close_primary_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'alert_not_close_primary_text_color',
    );
    await queryInterface.removeColumn('upsell_native_product', 'background');
    await queryInterface.removeColumn(
      'upsell_native_product',
      'is_message_not_close',
    );
  },
};
