import { BalanceHistoryRepository } from '../database/respositories/BalanceHistoryRepository.mjs';
import { BalancesRepository } from '../database/respositories/BalancesRepository.mjs';
import { TransactionsRepository } from '../database/respositories/TransactionsRepository.mjs';
import { PaymentService } from '../services/PaymentService.mjs';
import { MailService } from '../services/MailService.mjs';
import { WithdrawalCallbackUseCase } from '../useCases/Withdrawal.mjs';
import { HttpClient } from '../services/HTTPClient.mjs';

const makeMailService = () => {
  const mailServiceInstance = new MailService({
    userName:
      process.env.MAILJET_USERNAME || '72b179b923199731eb43150a45b95bdc',
    password:
      process.env.MAILJET_PASSWORD || '5c2232e72ebc49419d856e743a6fdddf',
    emailSender: process.env.MAILJET_EMAIL_SENDER || 'contato@b4you.com.br',
    templateID: process.env.MAILJET_TEMPLATE_ID || '3501751',
  });

  return mailServiceInstance;
};

const makePaymentService = () => {
  const paymentService = new PaymentService({
    service: new HttpClient({
      baseURL: process.env.API_PAY42_URL,
    }),
    apiKey:
      process.env.API_PAY42_KEY,
  });

  return paymentService;
};

export const WithdrawalController = async ({ transaction_id }, database) => {
  try {
    await new WithdrawalCallbackUseCase({
      BalanceHistoryRepository,
      BalanceRepository: BalancesRepository,
      TransactionsRepository,
      PaymentService: makePaymentService(),
      EmailService: makeMailService(),
      DatabaseConfig: database,
    }).execute(transaction_id);
    return {
      success: true,
      status: 200,
    };
  } catch (error) {
    throw error;
  }
};
