import * as Sequelize from 'sequelize';

export class Students extends Sequelize.Model {
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
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'students',
      }
    );

    return this;
  }
}
