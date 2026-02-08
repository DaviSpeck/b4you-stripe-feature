const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');
const Encrypter = require('../../utils/helpers/encrypter');

class Students extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        full_name: {
          type: Sequelize.STRING,
        },
        password: {
          type: Sequelize.STRING,
        },
        status: {
          type: Sequelize.STRING,
        },
        email: {
          type: Sequelize.STRING,
        },
        blocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        credit_card: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        address: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        document_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        document_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        whatsapp: {
          type: Sequelize.STRING,
        },
        expires_at: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        profile_picture: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        profile_picture_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        biography: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        bank_code: {
          type: Sequelize.STRING,
        },
        account_agency: {
          type: Sequelize.STRING,
        },
        account_number: {
          type: Sequelize.STRING,
        },
        account_type: {
          type: Sequelize.STRING,
        },
        no_hash: {
          type: Sequelize.VIRTUAL,
          get() {
            return this.getDataValue('no_hash');
          },
          set(value) {
            this.setDataValue('no_hash', value);
          },
        },
      },
      {
        hooks: {
          beforeCreate: async (students) => {
            students.uuid = uuid.v4();

            if (!students.no_hash) {
              students.password = await Encrypter.hash(students.password);
            }
          },
          beforeUpdate: async (students) => {
            students.password = await Encrypter.hash(students.password);
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'students',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.sales_items, {
      foreignKey: 'id_student',
      as: 'products',
    });
  }
}

module.exports = Students;
