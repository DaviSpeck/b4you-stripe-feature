/* eslint-disable max-classes-per-file */
const ApiError = require('../../error/ApiError');
const UpdateEmail = require('../../useCases/dashboard/users/UpdateEmail');

const fakeEmailService = () => {
  class FakeEmailService {
    static async sendMail() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }
  return FakeEmailService;
};

const fakeUserRepo = () => {
  class UserRepository {
    static async findById() {
      return new Promise((resolve) => {
        resolve({
          id: 'valid_id',
          email: 'valid_email',
          full_name: 'valid_full_name',
        });
      });
    }

    static async findByEmail() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }

    static async update() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }
  return UserRepository;
};

const fakeUserHistoryRepo = () => {
  class UserHistoryRepository {
    static async find() {
      return new Promise((resolve) => {
        resolve({
          id: 'valid_id',
          params: { new_email: 'teste@amc.com' },
        });
      });
    }

    static async update() {
      return new Promise((resolve) => {
        resolve({
          id: 'valid id',
          params: { new_email: 'teste@amc.com', ip_token: '192.168.0.193' },
        });
      });
    }
  }
  return UserHistoryRepository;
};

const makeSut = () => {
  const userRepoStub = fakeUserRepo();
  const userHistoryStub = fakeUserHistoryRepo();
  const emailServiceStub = fakeEmailService();
  const sut = new UpdateEmail(userHistoryStub, userRepoStub, emailServiceStub);
  return {
    sut,
    userRepoStub,
    userHistoryStub,
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

describe('Testing producer update account e-mail', () => {
  it('should throw if token not provided', async () => {
    const { sut } = makeSut();
    const error = await getError(() => sut.execute({ id_user: 'valid_id' }));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Token não informado');
  });

  it('should throw if user repository throws', async () => {
    const { sut, userRepoStub } = makeSut();
    jest.spyOn(userRepoStub, 'findById').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() =>
      sut.execute({
        id_user: 'valid_id',
        current_token: 'VALID',
        new_token: 'VALID',
      }),
    );
    expect(error).toBeDefined();
    expect(error instanceof ApiError).toBeFalsy();
  });

  it('should throw if user not found', async () => {
    const { sut, userRepoStub } = makeSut();
    jest.spyOn(userRepoStub, 'findById').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve(null);
      }),
    );
    const error = await getError(() =>
      sut.execute({
        id_user: 'invalid_id',
        current_token: 'VALID',
        new_token: 'VALID',
      }),
    );
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Usuário não informado');
  });

  it('should throw if user history not found', async () => {
    const { sut, userHistoryStub } = makeSut();
    jest.spyOn(userHistoryStub, 'find').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve(null);
        }),
    );
    const error = await getError(() =>
      sut.execute({
        id_user: 'valid_id',
        current_token: 'INVALID',
        new_token: 'INVALID',
      }),
    );
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Tokens inválidos');
  });

  it('should throw if user email already exists', async () => {
    const { sut, userRepoStub } = makeSut();
    jest.spyOn(userRepoStub, 'findByEmail').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve({ email: 'sixbase@sixbase.com' });
        }),
    );
    const error = await getError(() =>
      sut.execute({
        id_user: 'valid_id',
        current_token: 'VALID',
        new_token: 'VALID',
      }),
    );
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Já existe uma conta cadastrada neste email');
  });

  it('should update a user history', async () => {
    const { sut, userHistoryStub } = makeSut();
    const userHistorySpy = jest.spyOn(userHistoryStub, 'update');
    await sut.execute({
      id_user: 'valid_id',
      current_token: 'VALID',
      new_token: 'VALID',
    });
    expect(userHistorySpy).toHaveBeenCalledTimes(1);
    expect(userHistorySpy).toHaveBeenCalledWith(
      { id: 'valid_id' },
      {
        params: {
          new_email: 'teste@amc.com',
          ip_token: 'Não obtido',
          agent_token: 'Não obtido',
          success: true,
        },
      },
    );
  });

  it('should update a user', async () => {
    const { sut, userRepoStub } = makeSut();
    const userSpy = jest.spyOn(userRepoStub, 'update');

    await sut.execute({
      id_user: 'valid_id',
      current_token: 'VALID',
      new_token: 'VALID',
    });
    expect(userSpy).toHaveBeenCalledTimes(1);
    expect(userSpy).toHaveBeenCalledWith(
      { id: 'valid_id' },
      {
        email: 'teste@amc.com',
      },
    );
  });
});
