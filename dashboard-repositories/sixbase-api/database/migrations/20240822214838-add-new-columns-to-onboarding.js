/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('onboarding', 'user_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'nicho_other', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'business_model_other', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(
      'onboarding',
      'has_experience_as_creator_or_affiliate',
      {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },
    );

    await queryInterface.addColumn('onboarding', 'nicho', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'audience_size', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'origem', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'business_model', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'company_size', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'worked_with_affiliates', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });

    await queryInterface.addColumn('onboarding', 'invested_in_affiliates', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('onboarding', 'user_type');
    await queryInterface.removeColumn('onboarding', 'nicho_other');
    await queryInterface.removeColumn('onboarding', 'business_model_other');
    await queryInterface.removeColumn(
      'onboarding',
      'has_experience_as_creator_or_affiliate',
    );
    await queryInterface.removeColumn('onboarding', 'nicho');
    await queryInterface.removeColumn('onboarding', 'audience_size');
    await queryInterface.removeColumn('onboarding', 'origem');
    await queryInterface.removeColumn('onboarding', 'business_model');
    await queryInterface.removeColumn('onboarding', 'company_size');
    await queryInterface.removeColumn('onboarding', 'worked_with_affiliates');
    await queryInterface.removeColumn('onboarding', 'invested_in_affiliates');
  },
};
