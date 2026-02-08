import { ConfirmedWithdrawalEmail } from '../email/ConfirmedWithdrawal.mjs';
import { DeniedWithdrawalEmail } from '../email/DeniedWithdrawal.mjs';
import { UpdateBalance } from '../useCases/common/UpdateBalance.mjs';
import { findTransactionStatusByKey } from '../status/transactionStatus.mjs';
import { callbackWebhookParser } from '../utils/callbackParses.mjs';
import { findNotificationType } from '../types/notificationsTypes.mjs';

export class WithdrawalCallbackUseCase {
  #BalanceRepository;

  #BalanceHistoryRepository;

  #DatabaseConfig;

  #TransactionsRepository;

  #PaymentService;

  #EmailService;

  constructor({
    BalanceHistoryRepository,
    BalanceRepository,
    DatabaseConfig,
    EmailService,
    TransactionsRepository,
    PaymentService,
  }) {
    this.#BalanceHistoryRepository = BalanceHistoryRepository;
    this.#BalanceRepository = BalanceRepository;
    this.#DatabaseConfig = DatabaseConfig;
    this.#TransactionsRepository = TransactionsRepository;
    this.#PaymentService = PaymentService;
    this.#EmailService = EmailService;
  }

  async execute(transaction_uuid) {
    const withdrawalTransaction = await this.#PaymentService.getWithdrawalByID(
      transaction_uuid
    );
    if (!withdrawalTransaction)
      return { status: 400, message: 'Transação externa não encontrada' };

    const parsedBody = callbackWebhookParser(withdrawalTransaction);
    if (!parsedBody.status)
      return { status: 400, message: 'Callback status não encontrado' };

    if (withdrawalTransaction.status !== parsedBody.status.id)
      return { status: 400, message: 'Callback id inválido' };

    const transaction = await this.#TransactionsRepository.find({
      uuid: transaction_uuid,
    });

    if (!transaction)
      return { status: 400, message: 'Transação interna não encontrada' };

    const objNotification = {
      id_user: transaction.id_user,
      type: findNotificationType('Saques').id,
      title: 'Saque',
      key: 'withdrawals',
      params: { transaction_uuid: transaction.uuid },
      content: 'Saque',
      variant: '',
    };

    if (
      parsedBody.status.label === 'Pago' &&
      transaction.id_status === findTransactionStatusByKey('pending').id
    ) {
      await this.#TransactionsRepository.update(
        { id: transaction.id },
        { id_status: findTransactionStatusByKey('paid').id }
      );
      objNotification.content = 'Seu saque foi confirmado';
      objNotification.variant = 'success';

      await new ConfirmedWithdrawalEmail(this.#EmailService).send({
        email: transaction.user.email,
        full_name: transaction.user.full_name,
        amount: transaction.withdrawal_amount,
      });
    } else if (
      (parsedBody.status.label === 'Rejeitado' ||
        parsedBody.status.label === 'Expirado') &&
      transaction.id_status === findTransactionStatusByKey('pending').id
    ) {
      await this.#DatabaseConfig.transaction(async (t) => {
        await this.#TransactionsRepository.update(
          { id: transaction.id },
          { id_status: findTransactionStatusByKey('denied').id },
          t
        );
        await new UpdateBalance(
          {
            amount: transaction.withdrawal_total,
            id_user: transaction.id_user,
            operation: 'increment',
            id_transaction: transaction.id,
            databaseTransaction: t,
          },
          this.#BalanceRepository,
          this.#BalanceHistoryRepository
        ).execute();
      });
      objNotification.content = 'Sua solicitação de saque foi negada';
      objNotification.variant = 'error';
      await new DeniedWithdrawalEmail(this.#EmailService).send({
        email: transaction.user.email,
        full_name: transaction.user.full_name,
      });
    }
  }
}
