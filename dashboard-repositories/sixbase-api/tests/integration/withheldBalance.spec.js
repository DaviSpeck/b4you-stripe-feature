/* eslint-disable max-classes-per-file */
const WithheldBalance = require('../../useCases/dashboard/withdrawals/WithheldBalance');

const commissionsRepo = () => {
  class CommissionsRepository {
    static async sum30DaysTotal() {
      return 0;
    }

    static async findHighestSale() {
      return 0;
    }
  }

  return CommissionsRepository;
};

const makeSut = () => {
  const commissionsRepoStub = commissionsRepo();
  const sut = new WithheldBalance(commissionsRepoStub);
  return {
    sut,
    commissionsRepoStub,
  };
};

describe('Withheld Balance', () => {
  it('should return 0 when last 30 days total is 0', async () => {
    const { sut } = makeSut();
    const withheldBalance = await sut.calculate('valid_id', 10, false);
    expect(withheldBalance).toBe(0);
  });

  it('should return ticket when highest sale is not required', async () => {
    const { sut, commissionsRepoStub } = makeSut();
    jest
      .spyOn(commissionsRepoStub, 'sum30DaysTotal')
      .mockResolvedValueOnce(1000);

    const withheldBalance = await sut.calculate('valid_id', 10, false);
    expect(withheldBalance).toBe(100);
  });

  it('should return highest sale when ticket is lower', async () => {
    const { sut, commissionsRepoStub } = makeSut();
    jest
      .spyOn(commissionsRepoStub, 'sum30DaysTotal')
      .mockResolvedValueOnce(1000);
    jest
      .spyOn(commissionsRepoStub, 'findHighestSale')
      .mockResolvedValueOnce(150);

    const withheldBalance = await sut.calculate('valid_id', 10, true);
    expect(withheldBalance).toBe(150);
  });

  it('should return ticket when ticket is higher than highest sale', async () => {
    const { sut, commissionsRepoStub } = makeSut();
    jest
      .spyOn(commissionsRepoStub, 'sum30DaysTotal')
      .mockResolvedValueOnce(1000);
    jest
      .spyOn(commissionsRepoStub, 'findHighestSale')
      .mockResolvedValueOnce(50);

    const withheldBalance = await sut.calculate('valid_id', 10, true);
    expect(withheldBalance).toBe(100);
  });
});
