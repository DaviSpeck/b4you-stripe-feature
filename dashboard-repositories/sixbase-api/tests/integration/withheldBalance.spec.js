/* eslint-disable max-classes-per-file */
const WithheldBalance = require('../../useCases/dashboard/withdrawals/WithheldBalance');

const transactionsRepo = () => {
  class TransactionsRepository {
    static async findForWithheldBalance() {
      return new Promise((resolve) => {
        resolve([
          {
            user_net_amount: 300,
          },
          {
            user_net_amount: 150,
          },
        ]);
      });
    }

    static async findPendingCommissions() {
      return new Promise((resolve) => {
        resolve([
          {
            user_net_amount: 300,
          },
          {
            user_net_amount: 150,
          },
        ]);
      });
    }
  }

  return TransactionsRepository;
};

const withdrawalsSettingsRepo = () => {
  class WithdrawalsSettingsRepository {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          withheld_balance_percentage: 10,
        });
      });
    }
  }

  return WithdrawalsSettingsRepository;
};

const getError = async (callFunction) => {
  try {
    const r = await callFunction();
    return r;
  } catch (error) {
    return error;
  }
};

const makeSut = () => {
  const transactionsRepoStub = transactionsRepo();
  const withdrawalsSettingsRepoStub = withdrawalsSettingsRepo();
  const sut = new WithheldBalance(
    transactionsRepoStub,
    withdrawalsSettingsRepoStub,
  );
  return {
    sut,
    transactionsRepoStub,
    withdrawalsSettingsRepoStub,
  };
};

describe('Withheld Balance', () => {
  it('should throw if withdrawals settings throws', async () => {
    const { sut, withdrawalsSettingsRepoStub } = makeSut();
    jest.spyOn(withdrawalsSettingsRepoStub, 'find').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() => sut.calculate());
    expect(error).toBeDefined();
  });

  it('should throw if transactionsRepo throws', async () => {
    const { sut, transactionsRepoStub } = makeSut();
    jest
      .spyOn(transactionsRepoStub, 'findForWithheldBalance')
      .mockReturnValueOnce(new Error('Error on transactions'));
    const error = await getError(() => sut.calculate());
    expect(error).toBeDefined();
  });

  it('should call withdrawals settings with correct value', async () => {
    const { sut, withdrawalsSettingsRepoStub } = makeSut();
    const transactionRepoSpy = jest.spyOn(withdrawalsSettingsRepoStub, 'find');
    await sut.calculate('valid_id');
    expect(transactionRepoSpy).toHaveBeenLastCalledWith({
      id_user: 'valid_id',
    });
  });

  it('should call findPendingCommissions with correct value', async () => {
    const { sut, transactionsRepoStub } = makeSut();
    const transactionsRepoSpy = jest.spyOn(
      transactionsRepoStub,
      'findPendingCommissions',
    );
    await sut.calculate('valid_id');
    expect(transactionsRepoSpy).toHaveBeenLastCalledWith('valid_id');
  });

  it('should call findForWithheldBalance with correct value', async () => {
    const { sut, transactionsRepoStub } = makeSut();
    jest
      .spyOn(transactionsRepoStub, 'findPendingCommissions')
      .mockReturnValueOnce([]);
    const transactionsRepoSpy = jest.spyOn(
      transactionsRepoStub,
      'findForWithheldBalance',
    );
    await sut.calculate('valid_id');
    expect(transactionsRepoSpy).toHaveBeenLastCalledWith('valid_id');
  });

  it('should return 0 if transactions length is 0', async () => {
    const { sut, transactionsRepoStub } = makeSut();
    jest
      .spyOn(transactionsRepoStub, 'findForWithheldBalance')
      .mockReturnValueOnce([]);
    jest
      .spyOn(transactionsRepoStub, 'findPendingCommissions')
      .mockReturnValueOnce([]);
    const withheldBalance = await sut.calculate('valid_id');
    expect(withheldBalance).toBe(0);
  });

  it('should calculate using pending commissions', async () => {
    const { sut, transactionsRepoStub } = makeSut();
    jest
      .spyOn(transactionsRepoStub, 'findForWithheldBalance')
      .mockReturnValueOnce([]);
    const pendingCommissions =
      await transactionsRepoStub.findPendingCommissions();
    const withheldBalance = await sut.calculate('valid_id');
    expect(withheldBalance).toBe(
      pendingCommissions.sort(
        (a, b) => b.user_net_amount - a.user_net_amount,
      )[0].user_net_amount,
    );
  });

  it('should calculate using released commissions', async () => {
    const { sut, transactionsRepoStub } = makeSut();
    jest
      .spyOn(transactionsRepoStub, 'findPendingCommissions')
      .mockReturnValueOnce([]);
    const releasedCommissions =
      await transactionsRepoStub.findForWithheldBalance();
    const withheldBalance = await sut.calculate('valid_id');
    expect(withheldBalance).toBe(
      releasedCommissions.sort(
        (a, b) => b.user_net_amount - a.user_net_amo1unt,
      )[0].user_net_amount,
    );
  });

  it('should return highest sale', async () => {
    const { sut, withdrawalsSettingsRepoStub, transactionsRepoStub } =
      makeSut();
    const commissions = await transactionsRepoStub.findForWithheldBalance();
    const [highestSale] = commissions.sort(
      (a, b) => b.user_net_amount - a.user_net_amount,
    );
    jest.spyOn(withdrawalsSettingsRepoStub, 'find').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ withheld_balance_percentage: 0 });
      }),
    );
    const withheldBalance = await sut.calculate('valid_id');
    expect(withheldBalance).toBe(highestSale.user_net_amount);
  });

  it('should return ticket', async () => {
    const { sut, withdrawalsSettingsRepoStub, transactionsRepoStub } =
      makeSut();
    const commissions = await transactionsRepoStub.findForWithheldBalance();
    jest.spyOn(withdrawalsSettingsRepoStub, 'find').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ withheld_balance_percentage: 90 });
      }),
    );
    const withheldBalance = await sut.calculate('valid_id');
    expect(withheldBalance).toBe(
      commissions.reduce((acc, { user_net_amount }) => {
        acc += user_net_amount;
        return acc;
      }, 0) * 0.9,
    );
  });
});
