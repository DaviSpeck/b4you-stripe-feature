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
          allowNull: true,
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
        follow_up: {
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
        instagram: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        tiktok: {
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
        reactivation_status: {
          type: Sequelize.ENUM('not_contacted', 'contacting', 'success'),
          allowNull: true,
          defaultValue: null,
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
        cnpj_requested_at: {
          type: Sequelize.DATE,
        },
        birth_date: {
          type: Sequelize.DATEONLY,
          defaultValue: null,
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
        pagarme_cpf_id: {
          type: Sequelize.STRING,
        },
        pagarme_cnpj_id: {
          type: Sequelize.STRING,
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
        user_type: {
          type: Sequelize.TINYINT,
          defaultValue: 0,
        },
        prize_address: {
          type: Sequelize.JSON,
        },
        merlinInteractions: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        referral_disabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        managers: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        award_eligible: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        upsell_native_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        international_status: {
          type: Sequelize.ENUM('enabled', 'blocked'),
          allowNull: false,
          defaultValue: 'blocked',
        },
        international_stripe_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        international_rules: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: {},
        },
        international_status_updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        id_manager: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_manager_status_contact: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: 1,
          comment: 'ID de status do contato do gerente (1 = padrão)',
        },
        features: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        },
      },
      {
        hooks: {
          beforeCreate: async (user) => {
            user.password = await Encrypter.hash(user.password);
            user.uuid = uuid.v4();
            user.full_name = `${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`;
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
    this.hasMany(models.products, {
      foreignKey: 'id_user',
      as: 'products',
    });
    this.hasMany(models.coproductions, {
      foreignKey: 'id_user',
      as: 'coproductions',
    });
    this.hasMany(models.affiliates, {
      foreignKey: 'id_user',
      as: 'affiliates',
    });

    this.hasOne(models.onboarding, {
      foreignKey: 'id_user',
      as: 'onboarding',
    });
    this.hasOne(models.withdrawals_settings, {
      foreignKey: 'id_user',
      as: 'withdrawal_settings',
    });
    this.hasMany(models.commissions, {
      foreignKey: 'id_user',
      as: 'commissions',
    });
    this.hasOne(models.referral_balance, {
      foreignKey: 'id_user',
      as: 'referral_balance',
    });
    this.hasOne(models.referral_program, {
      foreignKey: 'id_user',
      as: 'referral_program',
    });
    this.hasMany(models.withdrawal_notes, {
      foreignKey: 'id_user',
      as: 'withdrawal_notes',
    });
    this.hasOne(models.users_backoffice, {
      foreignKey: 'id',
      sourceKey: 'id_manager',
      as: 'manager',
    });
    this.hasOne(models.user_bank_accounts, {
      foreignKey: 'id_user',
      as: 'user_bank_accounts',
    });
  }
}

module.exports = Users;
