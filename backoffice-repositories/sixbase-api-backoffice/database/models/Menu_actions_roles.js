const Sequelize = require('sequelize');

class Menu_actions_roles extends Sequelize.Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            menu_action_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: 'menu_actions_roles',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });
        return this;
    }

    static associate(models) {
        this.belongsTo(models.menu_actions, {
            foreignKey: 'menu_action_id',
            as: 'action',
        });

        this.belongsTo(models.backoffice_roles, {
            foreignKey: 'role_id',
            as: 'role',
        });
    }
}

module.exports = Menu_actions_roles;