// shared/database-init.js
require('dotenv').config();
const { bootstrapEnv } = require('../../env-loader');

let database = null;
let initialized = false;

async function initializeDatabase() {
    if (initialized) return;

    try {
        await bootstrapEnv();

        database = require('../../database/models');

        await database.sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        initialized = true;
    } catch (err) {
        console.error('Erro ao conectar com o banco de dados:', err);
        process.exit(1);
    }
}

async function closeDatabase() {
    try {
        if (initialized && database?.sequelize) {
            await database.sequelize.close();
        }
    } finally {
        initialized = false;
    }
}

module.exports = {
    initializeDatabase,
    closeDatabase,

    get models() {
        return database?.sequelize?.models ?? {};
    },

    get sequelize() {
        return database?.sequelize;
    }
};