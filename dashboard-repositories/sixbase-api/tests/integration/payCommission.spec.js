/* eslint-disable max-classes-per-file */
jest.mock('../../database/models/Commissions', () => ({ update: jest.fn() }));
jest.mock('../../useCases/common/balances/UpdateBalance', () =>
  jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
);

const Commission = require('../../useCases/common/splits/Commission');
const Commissions = require('../../database/models/Commissions');
const UpdateBalance = require('../../useCases/common/balances/UpdateBalance');

const fakeBalanceRepo = () => {
  class FakeBalanceRepo {
    static async update(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return FakeBalanceRepo;
};

const fakeDatabaseConfig = () => ({
  transaction: (cb) => cb({}),
});

const makeSut = (data) => {
  const balanceRepoStub = fakeBalanceRepo();
  const databaseConfigStub = fakeDatabaseConfig();
  const sut = new Commission(data, balanceRepoStub, databaseConfigStub);

  return {
    sut,
    balanceRepoStub,
    databaseConfigStub,
  };
};

describe('testing pay commission', () => {
  it('should pay commission', async () => {
    const data = {
      id: 123,
      id_user: 1,
      amount: 100,
    };
    const { sut } = makeSut(data);
    await sut.pay();
    expect(Commissions.update).toHaveBeenCalledWith(
      { id_status: 3 },
      { where: { id: 123 } },
    );
    expect(UpdateBalance).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user: 1,
        amount: 100,
        operation: 'increment',
      }),
      expect.any(Function),
    );
  });
});
