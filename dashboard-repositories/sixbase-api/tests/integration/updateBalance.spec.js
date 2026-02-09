/* eslint-disable max-classes-per-file */
const UpdateBalance = require('../../useCases/common/balances/UpdateBalance');

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

    static async update() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }

  return FakeBalanceRepo;
};

const makeSut = (data) => {
  const balanceRepoStub = fakeBalanceRepo();
  const sut = new UpdateBalance(data, balanceRepoStub);
  return { sut, balanceRepoStub };
};

describe('testing update balance', () => {
  it('should return 400 if operation is not allowed', async () => {
    const { sut } = makeSut({ operation: 'invalid_operation ' });
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Operação não permitida');
  });

  it('should return 400 if balance is not found', async () => {
    const { sut, balanceRepoStub } = makeSut({
      operation: 'increment',
    });
    jest.spyOn(balanceRepoStub, 'find').mockImplementationOnce(() => null);
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Carteira não encontrada');
  });

  it('should increment balance', async () => {
    const amount = 100;
    const { sut, balanceRepoStub } = makeSut({
      operation: 'increment',
      id_user: 3,
      amount,
    });
    const balance = await balanceRepoStub.find();
    const newAMount = await sut.execute();
    expect(newAMount).toBeCloseTo(balance.amount + amount);
  });

  it('should decrement balance', async () => {
    const amount = 100;
    const { sut, balanceRepoStub } = makeSut({
      operation: 'decrement',
      id_user: 3,
      amount,
    });
    const balance = await balanceRepoStub.find();
    const newAMount = await sut.execute();
    expect(newAMount).toBeCloseTo(balance.amount - amount);
  });
});
