const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Verify_identity extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        doc_front: {
          type: Sequelize.STRING,
        },
        doc_front_key: {
          type: Sequelize.STRING,
        },
        doc_back: {
          type: Sequelize.STRING,
        },
        doc_back_key: {
          type: Sequelize.STRING,
        },
        address: {
          type: Sequelize.STRING,
        },
        address_key: {
          type: Sequelize.STRING,
        },
        selfie: {
          type: Sequelize.STRING,
        },
        selfie_key: {
          type: Sequelize.STRING,
        },
        status: {
          type: Sequelize.INTEGER,
        },
        details: {
          type: Sequelize.TEXT,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: async (documents) => {
            documents.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'verify_identity',
        paranoid: true,
      },
    );

    return this;
  }
}

module.exports = Verify_identity;
