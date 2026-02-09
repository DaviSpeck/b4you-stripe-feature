/* eslint-disable max-classes-per-file */
jest.mock('../../database/models/ReferralBalance', () => ({
  increment: jest.fn(),
}));

const CallbackWithdrawal = require('../../useCases/callbacks/CallbackWithdrawals');
const callbackParsers = require('../../utils/callbackParses');
const ReferralBalance = require('../../database/models/ReferralBalance');

jest.mock('../../utils/callbackParses');

const fakeEmailService = () => {
  class FakeEmailService {
    static async sendMail() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }
  return FakeEmailService;
};

const fakePaymentService = () => {
  class PaymentService {
    static async getWithdrawalByID() {
      return new Promise((resolve) => {
        resolve({ transaction_id: '1234', status: 1 });
      });
    }
  }
  return PaymentService;
};

const fakeTransactionRepo = () => {
  class TransactionRepository {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          id: 'valid_id',
          id_user: 'valid_id_user',
          uuid: 'valid_uuid',
          id_status: 1,
          withdrawal_amount: 'valid_amount',
          user: {
            email: 'valid_email',
            full_name: 'valid_name',
          },
        });
      });
    }

    static async update() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }
  return TransactionRepository;
};

const fakeDatabaseConfig = () => ({
  transaction: (cb) => cb(),
});

const fakeBalanceRepo = () => {
  class BalanceRepository {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          amount: 200,
        });
      });
    }

    static async update() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }
  return BalanceRepository;
};

const fakeBalanceHistoryRepo = () => {
  class BalanceHistoryRepository {
    static async create() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }
  return BalanceHistoryRepository;
};

const makeSut = () => {
  const paymentServiceStub = fakePaymentService();
  const transactionRepoStub = fakeTransactionRepo();
  const emailServiceStub = fakeEmailService();
  const balanceStub = fakeBalanceRepo();
  const databaseConfigStub = fakeDatabaseConfig();
  const balanceHistoryStub = fakeBalanceHistoryRepo();
  const sut = new CallbackWithdrawal({
    PaymentService: paymentServiceStub,
    TransactionsRepository: transactionRepoStub,
    EmailService: emailServiceStub,
    DatabaseConfig: databaseConfigStub,
    BalanceRepository: balanceStub,
    BalanceHistoryRepository: balanceHistoryStub,
  });
  return {
    sut,
    paymentServiceStub,
    transactionRepoStub,
    emailServiceStub,
  };
};

const getError = async (callFunction) => {
  try {
    const r = await callFunction();
    return r;
  } catch (error) {
    return error;
  }
};

describe('Testing withdrawal callback', () => {
  beforeAll(() => {
    callbackParsers.callbackWebhookParser.mockReturnValue({
      transaction_id: '1234',
      status: {
        id: 1,
        label: 'Pago',
      },
    });
  });

  beforeEach(() => {
    ReferralBalance.increment.mockResolvedValue(null);
  });

  it('should throw if payment service withdrawal not found', async () => {
    const { sut, paymentServiceStub } = makeSut();
    jest.spyOn(paymentServiceStub, 'getWithdrawalByID').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve(null);
      }),
    );
    const error = await getError(() => sut.execute('1234'));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Transação externa não encontrada');
  });

  it('should throw if callback webhook parses doesnt have status', async () => {
    const { sut } = makeSut();

    callbackParsers.callbackWebhookParser.mockImplementationOnce(() => ({
      transaction_id: '1234',
    }));
    const error = await getError(() => sut.execute('1234'));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Callback status não encontrado');
  });

  it('should throw if callback webhook doesnt have a valid status', async () => {
    const { sut, paymentServiceStub } = makeSut();
    jest.spyOn(paymentServiceStub, 'getWithdrawalByID').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ status: 1 });
      }),
    );
    callbackParsers.callbackWebhookParser.mockReturnValueOnce({
      status: {
        id: 10,
      },
    });
    const error = await getError(() => sut.execute('1234'));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Callback id inválido');
  });

  it('should throw if transaction not found', async () => {
    const { sut, transactionRepoStub } = makeSut();
    jest.spyOn(transactionRepoStub, 'find').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve(null);
      }),
    );
    const error = await getError(() => sut.execute('1234'));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Transação interna não encontrada');
  });

  it('should update a paid callback transaction', async () => {
    const { sut, transactionRepoStub } = makeSut();
    const transactionSpy = jest.spyOn(transactionRepoStub, 'update');
    await sut.execute('1234');
    expect(transactionSpy).toHaveBeenCalled();
    expect(transactionSpy).toHaveBeenCalledWith(
      { id: 'valid_id' },
      { id_status: 2 },
    );
  });

  it('should update a denied callback transaction', async () => {
    const { sut, paymentServiceStub, transactionRepoStub, DatabaseConfig } =
      makeSut();

    jest.spyOn(paymentServiceStub, 'getWithdrawalByID').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ status: 2 });
      }),
    );
    callbackParsers.callbackWebhookParser.mockReturnValue({
      status: {
        id: 2,
        label: 'Rejeitado',
      },
    });

    const transactionSpy = jest.spyOn(transactionRepoStub, 'update');
    await sut.execute('1234');
    expect(transactionSpy).toHaveBeenCalled();
    expect(transactionSpy).toHaveBeenCalledWith(
      { id: 'valid_id' },
      { id_status: 4 },
      DatabaseConfig,
    );
  });
});
