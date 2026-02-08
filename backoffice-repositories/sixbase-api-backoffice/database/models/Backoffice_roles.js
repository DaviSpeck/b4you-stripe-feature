const Sequelize = require('sequelize');

class Backoffice_roles extends Sequelize.Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
            {
                sequelize,
                modelName: 'backoffice_roles',
                tableName: 'backoffice_roles',
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            });
        return this;
    }

    static associate(models) {
        this.hasMany(models.users_backoffice, {
            foreignKey: 'id_role',
            as: 'users',
        });
        this.belongsToMany(models.menu_items, {
            through: 'menu_items_roles',
            foreignKey: 'role_id',
            otherKey: 'menu_item_id',
            as: 'menuItems',
        });
        this.belongsToMany(models.menu_actions, {
            through: 'menu_actions_roles',
            foreignKey: 'role_id',
            otherKey: 'menu_action_id',
            as: 'menuActions',
        });
    }
}

module.exports = Backoffice_roles;