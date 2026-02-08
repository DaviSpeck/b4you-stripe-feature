/* eslint-disable max-classes-per-file */
const {
  findCoproductionStatusByKey,
} = require('../../status/coproductionsStatus');
const CreateCoproductionInvite = require('../../useCases/dashboard/coproductions/CreateCoproductionInvite');
const date = require('../../utils/helpers/date');

const fakeUserRepository = () => {
  class FakeUserRepository {
    static async findByEmail() {
      return new Promise((resolve) => {
        resolve({
          id: 1,
          full_name: 'any name',
          email: 'any_email@mail.com',
        });
      });
    }
  }

  return FakeUserRepository;
};

const fakeCoproductionsRepo = () => {
  class FakeCoproductionsRepo {
    static async findAll() {
      return new Promise((resolve) => {
        resolve([]);
      });
    }

    static async create() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }

  return FakeCoproductionsRepo;
};

const fakeCoproductionsInvitesRepo = () => {
  class FakeCoproductionsInvitesRepo {
    static async find() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }

    static async create() {
      return new Promise((resolve) => {
        resolve({
          id: 1,
        });
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
  const userRepoStub = fakeUserRepository();
  const coproductionsRepoStub = fakeCoproductionsRepo();
  const coproductionsInvistesRepoStub = fakeCoproductionsInvitesRepo();
  const emailServiceStub = fakeEmailService();
  const sut = new CreateCoproductionInvite(
    data,
    userRepoStub,
    coproductionsRepoStub,
    coproductionsInvistesRepoStub,
    emailServiceStub,
  );
  return {
    sut,
    userRepoStub,
    coproductionsRepoStub,
    coproductionsInvistesRepoStub,
  };
};

describe('Coproduction Invite', () => {
  it('should throw error if coproducer and producer email are the equal', async () => {
    const email = 'any_email@mail.com';
    const data = {
      id_product: 'any product',
      id_producer: 'any producer',
      commission: 10,
      coproducer_email: email,
      days_to_expire: 1,
      producer_email: email,
      producer_first_name: 'any',
      producer_last_name: 'name',
      product_name: 'any product',
      split_invoice: false,
      allow_access: false,
    };
    const { sut } = makeSut(data);
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe(
      'Você não pode enviar uma solicitação de coprodução para si mesmo.',
    );
  });

  it('should throw error if coproducer is not found ', async () => {
    const data = {
      id_product: 'any product',
      id_producer: 'any producer',
      commission: 10,
      coproducer_email: 'coproducer_email@mail.com',
      days_to_expire: 1,
      producer_email: 'any_email@mail.com',
      producer_first_name: 'any',
      producer_last_name: 'name',
      product_name: 'any product',
      split_invoice: false,
      allow_access: false,
    };
    const { sut, userRepoStub } = makeSut(data);
    let error = null;
    jest.spyOn(userRepoStub, 'findByEmail').mockImplementationOnce(() => null);
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Coprodutor não encontrado');
  });

  it('should throw error if commissions exceess max commission ', async () => {
    const data = {
      id_product: 'any product',
      id_producer: 'any producer',
      commission: 100,
      coproducer_email: 'coproducer_email@mail.com',
      days_to_expire: 1,
      producer_email: 'any_email@mail.com',
      producer_first_name: 'any',
      producer_last_name: 'name',
      product_name: 'any product',
      split_invoice: false,
      allow_access: false,
    };
    const { sut } = makeSut(data);
    let error = null;
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message.text).toBe(
      'A comissão solicitada é maior do que a definida para este produto',
    );
    expect(error.message.available).toBe(99);
  });

  it('should throw error if already has a active coproduction', async () => {
    const data = {
      id_product: 'any product',
      id_producer: 'any producer',
      commission: 10,
      coproducer_email: 'coproducer_email@mail.com',
      days_to_expire: 1,
      producer_email: 'any_email@mail.com',
      producer_first_name: 'any',
      producer_last_name: 'name',
      product_name: 'any product',
      split_invoice: false,
      allow_access: false,
    };
    const { sut, coproductionsRepoStub, userRepoStub } = makeSut(data);
    let error = null;
    const coproducer = await userRepoStub.findByEmail();
    jest
      .spyOn(coproductionsRepoStub, 'findAll')
      .mockImplementationOnce(async () => [
        {
          id_user: coproducer.id,
          status: findCoproductionStatusByKey('active').id,
        },
      ]);
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe(
      'Este produto já possui coprodução ativa/pendente',
    );
  });

  it('should throw error if already has a unexpired pending invite', async () => {
    const data = {
      id_product: 'any product',
      id_producer: 'any producer',
      commission: 10,
      coproducer_email: 'coproducer_email@mail.com',
      days_to_expire: 1,
      producer_email: 'any_email@mail.com',
      producer_first_name: 'any',
      producer_last_name: 'name',
      product_name: 'any product',
      split_invoice: false,
      allow_access: false,
    };
    const { sut, coproductionsInvistesRepoStub } = makeSut(data);
    let error = null;
    jest
      .spyOn(coproductionsInvistesRepoStub, 'find')
      .mockImplementationOnce(() => ({
        expires_at: date().add(2, 'd'),
      }));
    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe(
      'This product already have a invite, but the invitation has not expired yet.',
    );
  });

  it('should return success', async () => {
    const data = {
      id_product: 'any product',
      id_producer: 'any producer',
      commission: 10,
      coproducer_email: 'coproducer_email@mail.com',
      days_to_expire: 1,
      producer_email: 'any_email@mail.com',
      producer_first_name: 'any',
      producer_last_name: 'name',
      product_name: 'any product',
      split_invoice: false,
      allow_access: false,
    };
    const { sut } = makeSut(data);
    const invite = await sut.execute();
    expect(invite.success).toBe(true);
    expect(invite.status.id).toBe(1);
    expect(invite.message).toBe('Coprodução criada com sucesso');
  });
});
