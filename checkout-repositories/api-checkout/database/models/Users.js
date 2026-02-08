const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');
const Encrypter = require('../../utils/helpers/encrypter');

class Users extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        first_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        last_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        full_name: {
          type: Sequelize.STRING,
        },
        company_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        trade_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        verified_id: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        verified_company: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        status_cnpj: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        document_number: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        cnpj: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        is_company: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        zipcode: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        street: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        complement: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        neighborhood: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        country: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        whatsapp: {
          type: Sequelize.STRING,
          allowNull: false,
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
        account_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        operation: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        profile_picture: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        profile_picture_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        occupation: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        cnpj_details: {
          type: Sequelize.TEXT,
        },
        pagarme_recipient_id: {
          type: Sequelize.STRING,
        },
        pagarme_recipient_id_cnpj: {
          type: Sequelize.STRING,
        },
        verified_company_pagarme: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        verified_pagarme: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        pagarme_recipient_id_3: {
          type: Sequelize.STRING,
        },
        pagarme_recipient_id_cnpj_3: {
          type: Sequelize.STRING,
        },
        verified_company_pagarme_3: {
          type: Sequelize.SMALLINT,
          defaultValue: 0,
        },
        verified_pagarme_3: {
          type: Sequelize.SMALLINT,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        deleted_at: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        annual_revenue: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        company_bank_code: {
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
        company_account_type: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
      },
      {
        hooks: {
          beforeCreate: async (user) => {
            user.password = await Encrypter.hash(user.password);
            user.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'users',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.collaborators, {
      foreignKey: 'id_user',
      as: 'collaborations',
    });
    this.hasMany(models.plugins, {
      foreignKey: 'id_user',
      as: 'plugins',
    });
    this.hasOne(models.sales_settings, {
      foreignKey: 'id_user',
      as: 'user_sale_settings',
    });
    this.hasOne(models.balances, {
      foreignKey: 'id_user',
      as: 'balance',
    });
    this.hasMany(models.verify_identity, {
      foreignKey: 'id_user',
      as: 'verify_identity',
    });
    this.hasOne(models.notifications_settings, {
      foreignKey: 'id_user',
      as: 'notifications_settings',
    });
  }
}

module.exports = Users;
