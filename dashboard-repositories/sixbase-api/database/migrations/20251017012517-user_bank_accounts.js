'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_bank_accounts', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      is_company: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pending_approval: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      rejected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      account_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      document_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bank_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      agency: {
        type: Sequelize.STRING,
        allowNull: true
      },
      account_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bank_code_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      agency_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      account_number_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      account_type_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cnpj: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_account_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_agency: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_account_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_bank_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_account_type_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_agency_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_account_number_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      company_bank_code_old: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_bank_accounts');
  }
};
