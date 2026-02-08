'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users_backoffice', 'id_role', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'backoffice_roles',
                key: 'id'
            },
            onUpdate: 'RESTRICT',
            onDelete: 'SET NULL'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users_backoffice', 'id_role');
    }
};
