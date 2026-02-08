

const { Model, DataTypes } = require('sequelize');

class OnesignalUserTags extends Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                },
                id_user: {
                    type: DataTypes.BIGINT,
                    allowNull: false,
                },
                tag_key: {
                    type: DataTypes.STRING(64),
                    allowNull: false,
                },
                tag_value: {
                    type: DataTypes.STRING(64),
                    allowNull: true,
                },
                created_at: {
                    type: DataTypes.DATE,
                },
                updated_at: {
                    type: DataTypes.DATE,
                },
                deleted_at: {
                    type: DataTypes.DATE,
                },
            },
            {
                sequelize,
                modelName: 'onesignal_user_tags',
                freezeTableName: true,
                timestamps: true,
                underscored: true,
                paranoid: true,
            }
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.users, {
            foreignKey: 'id_user',
            as: 'user',
        });
    }
}

module.exports = OnesignalUserTags;