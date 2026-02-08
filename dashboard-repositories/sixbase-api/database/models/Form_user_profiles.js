const Sequelize = require('sequelize');

class Form_user_profiles extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
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

                id_form: {
                    type: Sequelize.BIGINT,
                    allowNull: false,
                },

                form_type: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },

                form_version: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },

                answers: {
                    type: Sequelize.JSON,
                },

                summary: {
                    type: Sequelize.JSON,
                },

                completed_at: {
                    type: Sequelize.DATE,
                },

                updated_at: {
                    type: Sequelize.DATE,
                },
            },
            {
                sequelize,
                modelName: 'form_user_profiles',
                freezeTableName: true,
                timestamps: false,
            }
        );
    }

    static associate(models) {
        this.belongsTo(models.forms, {
            foreignKey: 'id_form',
            as: 'form',
        });

        this.belongsTo(models.users, {
            foreignKey: 'id_user',
            as: 'user',
        });
    }
}

module.exports = Form_user_profiles;