/* eslint-disable max-classes-per-file */
const Commission = require('../../useCases/common/splits/Commission');

const fakeBalanceRepo = () => {
  class FakeBalanceRepo {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          id: 3,
          id_user: 3,
          amount: 0,
          created_at: 1650551444,
          updated_at: null,
        });
      });
    }

    static async update(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeBalanceRepo;
};

const fakeBalanceHistoryRepo = () => {
  class FakeBalanceHistoryRepo {
    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeBalanceHistoryRepo;
};

const fakeTransactionsRepo = () => {
  class FakeTransactionsRepo {
    // eslint-disable-next-line no-unused-vars
    static async update(where, data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeTransactionsRepo;
};

const fakeDatabaseConfig = () => ({
  transaction: (cb) => cb(),
});

const makeSut = (data) => {
  const transactionRepoStub = fakeTransactionsRepo();
  const balanceRepoStub = fakeBalanceRepo();
  const balanceHistoryRepoStub = fakeBalanceHistoryRepo();
  const databaseConfigStub = fakeDatabaseConfig();
  const sut = new Commission(
    data,
    balanceRepoStub,
    balanceHistoryRepoStub,
    transactionRepoStub,
    databaseConfigStub,
  );

  return {
    sut,
    balanceRepoStub,
    balanceHistoryRepoStub,
    transactionRepoStub,
    databaseConfigStub,
  };
};

describe('testing pay commission', () => {
  it('should pay commission', async () => {
    const data = {
      id_user: 1,
      amount: 100,
      transaction_id: 1,
    };
    const { sut, transactionRepoStub, balanceRepoStub } = makeSut(data);
    let transactionData;
    jest.spyOn(transactionRepoStub, 'update').mockImplementationOnce((w, d) => {
      transactionData = d;
      return null;
    });

    let balanceData;
    jest
      .spyOn(balanceRepoStub, 'update')
      // eslint-disable-next-line no-unused-vars
      .mockImplementationOnce((a, b, c, d) => {
        balanceData = {
          operation: c,
          amount: b,
        };
        return null;
      });
    await sut.pay();
    expect(transactionData.released).toBe(true);
    expect(transactionData.id_status).toBe(2);
    expect(balanceData.operation).toBe('increment');
    expect(balanceData.amount).toBe(100);
  });
});
