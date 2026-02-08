const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');
const Encrypter = require('../../utils/helpers/encrypter');

class UserBankAccounts extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        is_company: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        pending_approval: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        },
        rejected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        },
        // cpf
        account_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        document_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        bank_code: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        agency: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        account_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        // cpf old
        bank_code_old: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        agency_old: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        account_number_old: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        account_type_old: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        //cnpj
        cnpj: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        company_account_type: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        company_agency: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        company_account_number: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        company_bank_code: {
          type: Sequelize.STRING,
          defaultValue: null,
        },

        //cnpj
        company_account_type_old: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        company_agency_old: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        company_account_number_old: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        company_bank_code_old: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'user_bank_accounts',
      },
    );
    return this;
  }
}

module.exports = UserBankAccounts;
