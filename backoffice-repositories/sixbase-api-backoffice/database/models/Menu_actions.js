const Sequelize = require('sequelize');

class Menu_actions extends Sequelize.Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            menu_item_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            label: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        }, {
            sequelize,
            modelName: 'menu_actions',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });
        return this;
    }

    static associate(models) {
        this.belongsTo(models.menu_items, {
            foreignKey: 'menu_item_id',
            as: 'menuItem',
        });
        this.belongsToMany(models.backoffice_roles, {
            through: 'menu_actions_roles',
            foreignKey: 'menu_action_id',
            otherKey: 'role_id',
            as: 'roles',
        });
    }
}

module.exports = Menu_actions;