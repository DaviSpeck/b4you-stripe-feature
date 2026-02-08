const FutureRealeses = require('../../useCases/common/balances/futureReleases');
const date = require('../../utils/helpers/date');

const transactionsData = [
  {
    id: 1,
    release_date: date().add(1, 'd'),
    user_net_amount: 100,
  },
  {
    id: 2,
    release_date: date().add(1, 'd'),
    user_net_amount: 100,
  },
  {
    id: 3,
    release_date: date().add(1, 'd'),
    user_net_amount: 100,
  },
];

const fakeTransactionsRepo = () => {
  class FakeTransactionsRepo {
    static async findAll() {
      return new Promise((resolve) => {
        resolve(transactionsData);
      });
    }
  }

  return FakeTransactionsRepo;
};

const fakeDatabaseConfig = () => ({
  OP: {
    ne: () => null,
  },
});

const makeSut = (data) => {
  const transactionsRepoStub = fakeTransactionsRepo();
  const databaseConfigStub = fakeDatabaseConfig();
  const sut = new FutureRealeses(
    data,
    transactionsRepoStub,
    databaseConfigStub,
  );
  return {
    sut,
    transactionsRepoStub,
    databaseConfigStub,
  };
};

describe('Future Releases', () => {
  it('should return future releases length 0', async () => {
    const data = { id_user: 'any_id' };
    const { sut, transactionsRepoStub } = makeSut(data);
    jest
      .spyOn(transactionsRepoStub, 'findAll')
      .mockImplementationOnce(() => []);
    const futureReleases = await sut.execute();
    expect(futureReleases.length).toBe(0);
  });

  it('should return future releases', async () => {
    const data = { id_user: 'any_id' };
    const { sut, transactionsRepoStub } = makeSut(data);
    const transactions = await transactionsRepoStub.findAll();
    const total = transactions.reduce((acc, { user_net_amount }) => {
      acc += user_net_amount;
      return acc;
    }, 0);
    const futureReleases = await sut.execute();
    const [futureRelease] = futureReleases;
    expect(futureReleases.length).toBe(1);
    expect(futureRelease.amount).toBe(total);
  });
});
