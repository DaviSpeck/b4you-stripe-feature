/**
 * Script de teste para modo sandbox
 * Execute: SANDBOX_MODE=true node test-sandbox.mjs
 */
import { handler } from './index.refactored.mjs';

// Configura ambiente para sandbox
process.env.SANDBOX_MODE = 'true';
process.env.MYSQL_HOST = 'localhost';
process.env.MYSQL_PORT = '3306';
process.env.MYSQL_DATABASE = 'test_db';
process.env.MYSQL_USERNAME = 'test_user';
process.env.MYSQL_PASSWORD = 'test_password';

// Valores fictícios - não serão usados em sandbox
process.env.PAGARME_URL = 'http://localhost';
process.env.PAGARME_PASSWORD_2 = 'sandbox_key';
process.env.PAGARME_PASSWORD_3 = 'sandbox_key';
process.env.API_PAY42_URL = 'http://localhost';
process.env.API_PAY42_KEY = 'sandbox_key';
process.env.URL_WITHDRAWAL_CALLBACK = 'http://localhost/callback';

const testWithdrawal = async () => {
  console.log('='.repeat(60));
  console.log('🧪 TESTE EM MODO SANDBOX');
  console.log('='.repeat(60));
  console.log();

  const event = {
    Records: [
      {
        body: JSON.stringify({
          id_user: 29866,
          amount: 100, // R$ 100,00
        }),
      },
    ],
  };

  try {
    console.log('📋 Solicitação de saque:');
    console.log(`   Usuário: ${JSON.parse(event.Records[0].body).id_user}`);
    console.log(`   Valor: R$ ${JSON.parse(event.Records[0].body).amount.toFixed(2)}`);
    console.log();
    console.log('⏳ Processando...');
    console.log();

    const result = await handler(event);

    console.log('='.repeat(60));
    console.log('✅ RESULTADO');
    console.log('='.repeat(60));
    console.log();
    console.log('Status:', result.statusCode);
    console.log();
    console.log('Resposta:');
    console.log(JSON.stringify(JSON.parse(result.body), null, 2));
    console.log();
    console.log('='.repeat(60));
  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ ERRO');
    console.error('='.repeat(60));
    console.error();
    console.error('Mensagem:', error.message);
    console.error();
    if (error.stack) {
      console.error('Stack Trace:');
      console.error(error.stack);
    }
    console.error('='.repeat(60));
    process.exit(1);
  }
};

// Testes de diferentes cenários
const runTestSuite = async () => {
  console.log('\n\n');
  console.log('🚀 INICIANDO SUITE DE TESTES SANDBOX');
  console.log('\n');

  // Teste 1: Saque normal
  console.log('📝 Teste 1: Saque Normal (R$ 100,00)');
  await testWithdrawal();

  // Aguarda um pouco entre testes
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('\n\n');
  console.log('✨ TESTES CONCLUÍDOS');
  process.exit(0);
};

// Verifica se deve executar um teste único ou suite completa
if (process.argv.includes('--suite')) {
  runTestSuite().catch(console.error);
} else {
  testWithdrawal().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
