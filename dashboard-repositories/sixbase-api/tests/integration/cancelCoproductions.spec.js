/* eslint-disable max-classes-per-file */
const {
  findCoproductionStatusByKey,
} = require('../../status/coproductionsStatus');
const CancelCoproduction = require('../../useCases/dashboard/coproductions/CancelCoproduction');

const coproduction_data = {
  id: 1,
  id_invite: 1,
  user: {
    first_name: 'any',
    last_name: 'name',
    email: 'any_email@mail.com',
  },
  product: {
    name: 'any product',
  },
};

const fakeCoproductionsRepo = () => {
  class FakeCoproductionsRepo {
    static async find() {
      return new Promise((resolve) => {
        resolve(coproduction_data);
      });
    }

    static async update() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }

  return FakeCoproductionsRepo;
};

const fakeCoproductionsInvitesRepo = () => {
  class FakeCoproductionsInvitesRepo {
    static async update() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }

  return FakeCoproductionsInvitesRepo;
};

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

const makeSut = (data) => {
  const coproductionsRepoStub = fakeCoproductionsRepo();
  const coproductionsInvitesRepoStub = fakeCoproductionsInvitesRepo();
  const emailServiceStub = fakeEmailService();
  const sut = new CancelCoproduction(
    data,
    coproductionsRepoStub,
    coproductionsInvitesRepoStub,
    emailServiceStub,
  );

  return {
    sut,
    coproductionsInvitesRepoStub,
    coproductionsRepoStub,
  };
};

describe('Cancel coproductions', () => {
  it('should throw error if data is undefined', async () => {
    let error = null;
    try {
      makeSut();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });
  it('should return 400 if coproduction is not found', async () => {
    const data = {
      id_product: 'any_id',
      coproduction_uui: 'any_uuid',
      producer: 'any producer',
    };
    const { sut, coproductionsRepoStub } = makeSut(data);
    let error = null;
    jest
      .spyOn(coproductionsRepoStub, 'find')
      .mockImplementationOnce(() => null);

    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe(
      'Você pode somente cancelar convites pendentes ainda não aceitos pelo produtor',
    );
  });

  it('should update invite to canceled', async () => {
    const data = {
      id_product: 'any_id',
      coproduction_uui: 'any_uuid',
      producer: 'any producer',
    };
    const { sut, coproductionsInvitesRepoStub } = makeSut(data);
    let inviteData = null;
    jest
      .spyOn(coproductionsInvitesRepoStub, 'update')
      .mockImplementationOnce((where, d) => {
        inviteData = d;
        return null;
      });

    await sut.execute();
    expect(inviteData.status).toBe(findCoproductionStatusByKey('canceled').id);
  });

  it('should update coproduction to canceled', async () => {
    const data = {
      id_product: 'any_id',
      coproduction_uui: 'any_uuid',
      producer: 'any producer',
    };
    const { sut, coproductionsRepoStub } = makeSut(data);
    let coproductionData = null;
    jest
      .spyOn(coproductionsRepoStub, 'update')
      .mockImplementationOnce((where, d) => {
        coproductionData = d;
        return null;
      });

    await sut.execute();
    expect(coproductionData.status).toBe(
      findCoproductionStatusByKey('canceled').id,
    );
  });

  it('should return coproduction', async () => {
    const data = {
      id_product: 'any_id',
      coproduction_uui: 'any_uuid',
      producer: 'any producer',
    };
    const { sut, coproductionsRepoStub } = makeSut(data);
    jest.spyOn(coproductionsRepoStub, 'find').mockImplementationOnce(() => ({
      ...coproduction_data,
      status: findCoproductionStatusByKey('pending').id,
    }));

    const coproduction = await sut.execute();
    expect(coproduction).toBeDefined();
    expect(coproduction.status).toBe(findCoproductionStatusByKey('pending').id);
  });
});
