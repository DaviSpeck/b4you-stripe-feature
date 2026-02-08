'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'managers');

        await queryInterface.addColumn('users', 'managers', {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
                model: 'users_backoffice',
                key: 'id',
            },
            onUpdate: 'RESTRICT',
            onDelete: 'SET NULL',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'managers');
        await queryInterface.addColumn('users', 'managers', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
};

