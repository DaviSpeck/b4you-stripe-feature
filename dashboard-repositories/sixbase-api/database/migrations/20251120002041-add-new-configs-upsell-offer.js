module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'upsell_native_offer',
      'step_color_background',
      {
        type: Sequelize.STRING,
        defaultValue: '#ffffffff',
      },
    );
    await queryInterface.addColumn('upsell_native_offer', 'step_color', {
      type: Sequelize.STRING,
      defaultValue: '#0f1b35',
    });
    await queryInterface.addColumn(
      'upsell_native_offer',
      'alert_not_close_primary_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.addColumn(
      'upsell_native_offer',
      'alert_not_close_primary_text_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#ffffffff',
      },
    );
    await queryInterface.addColumn('upsell_native_offer', 'background', {
      type: Sequelize.STRING,
      defaultValue: '#f2f4f7',
    });
    await queryInterface.addColumn(
      'upsell_native_offer',
      'is_message_not_close',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'step_color_background',
    );
    await queryInterface.removeColumn('upsell_native_offer', 'step_color');
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'alert_not_close_primary_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'alert_not_close_primary_text_color',
    );
    await queryInterface.removeColumn('upsell_native_offer', 'background');
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'is_message_not_close',
    );
  },
};
