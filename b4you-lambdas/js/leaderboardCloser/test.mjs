/**
 * Teste LOCAL do Lambda LeaderboardCloser
 * ---------------------------------------
 * Simula:
 *  - Fechamento semanal
 *  - Fechamento mensal
 *  - Execução via EventBridge
 */

import * as dotenv from 'dotenv';
dotenv.config();

import minimist from 'minimist';
import { handler } from './index.mjs';

const args = minimist(process.argv.slice(2));
const SCOPE = args.scope || 'weekly';

console.log('===============================================');
console.log('🏆 INICIANDO TESTE DO LEADERBOARD CLOSER');
console.log('===============================================\n');

console.log(`▶️ Scope selecionado: ${SCOPE}\n`);

if (!['weekly', 'monthly'].includes(SCOPE)) {
    console.error('❌ Scope inválido. Use --scope weekly|monthly');
    process.exit(1);
}

/* ======================================================
 * Validação das ENVs
 * ====================================================== */
const requiredEnv = [
    'MYSQL_HOST',
    'MYSQL_USERNAME',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`❌ ERRO: ENV obrigatória ausente → ${key}`);
        process.exit(1);
    }
}

/* ======================================================
 * Execução
 * ====================================================== */
(async () => {
    try {
        console.log('▶️ Simulando EventBridge...\n');

        const result = await handler({
            source: 'aws.events',
            scope: SCOPE,
        });

        console.log('===============================================');
        console.log('✅ RESULTADO DO FECHAMENTO');
        console.log('===============================================\n');

        console.log(JSON.stringify(result || {}, null, 2));
        console.log('\n🎉 Teste finalizado com sucesso!\n');
    } catch (err) {
        console.error('\n❌ ERRO DURANTE O TESTE');
        console.error(err);
        process.exit(1);
    }
})();