const Sequelize = require('sequelize');

class Menu_items extends Sequelize.Model {
    static init(sequelize) {
        super.init({
            id: {
                type: Sequelize.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            route: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: 'menu_items',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });
        return this;
    }

    static associate(models) {
        this.belongsToMany(models.backoffice_roles, {
            through: 'menu_items_roles',
            foreignKey: 'menu_item_id',
            otherKey: 'role_id',
            as: 'roles',
        });
        this.hasMany(models.menu_actions, {
            foreignKey: 'menu_item_id',
            as: 'actions',
        });
    }
}

module.exports = Menu_items;