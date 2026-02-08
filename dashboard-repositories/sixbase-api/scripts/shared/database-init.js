require('dotenv').config();
const { bootstrapEnv } = require('../../env-loader');
const database = require('../../database/models');

let isInitialized = false;
let initPromise = null;

function printEnv(prefix) {
    console.log(`\n================== ENV (${prefix}) ==================`);
    const keys = Object.keys(process.env).sort();
    for (const k of keys) {
        const v = process.env[k];
        if (k.includes('KEY') || k.includes('SECRET') || k.includes('PASSWORD')) {
            console.log(`${k}=***`);
        } else {
            console.log(`${k}=${v}`);
        }
    }
    console.log("=====================================================\n");
}

async function initializeDatabase() {
    if (isInitialized) {
        // sempre retorna uma promise resolvida
        return Promise.resolve();
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            printEnv("ANTES DO bootstrapEnv()");
            await bootstrapEnv();
            printEnv("DEPOIS DO bootstrapEnv()");
            await database.sequelize.authenticate();
            console.log('Conexão com o banco de dados estabelecida com sucesso.');
            isInitialized = true;
        } catch (error) {
            console.error('Erro ao conectar com o banco de dados:', error.message);
            process.exit(1);
        }
    })();

    return initPromise;
}

async function closeDatabase() {
    if (isInitialized) {
        await database.close();
        isInitialized = false;
        initPromise = null;
    }
}

module.exports = {
    initializeDatabase,
    closeDatabase,
    sequelize: database.sequelize,
    models: database.sequelize.models
};