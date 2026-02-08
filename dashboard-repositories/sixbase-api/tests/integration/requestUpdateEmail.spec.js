/* eslint-disable max-classes-per-file */
const RequestUpdateEmail = require('../../useCases/dashboard/users/RequestUpdateEmail');

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
        resolve();
      });
    }
  }
  return UserRepository;
};

const fakeUserHistoryRepo = () => {
  class UserHistoryRepository {
    static async find() {
      return new Promise((resolve) => {
        resolve(null);
      });
    }

    static async delete() {
      return new Promise((resolve) => {
        resolve();
      });
    }

    static async create() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }
  return UserHistoryRepository;
};

const makeSut = () => {
  const userRepoStub = fakeUserRepo();
  const userHistoryStub = fakeUserHistoryRepo();
  const emailServiceStub = fakeEmailService();
  const sut = new RequestUpdateEmail(
    userHistoryStub,
    userRepoStub,
    emailServiceStub,
  );
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

describe('Testing producer request update account e-mail', () => {
  it('should throw if user repository throws', async () => {
    const { sut, userRepoStub } = makeSut();
    jest.spyOn(userRepoStub, 'findById').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() =>
      sut.execute({ id_user: 'valid_id', new_email: 'sixbase@sixbase.com' }),
    );
    expect(error).toBeDefined();
  });

  it('should throw if user not found', async () => {
    const { sut, userRepoStub } = makeSut();
    jest.spyOn(userRepoStub, 'findById').mockReturnValueOnce(
      new Promise((resolve) => {
        resolve(null);
      }),
    );
    const error = await getError(() =>
      sut.execute({ id_user: 'invalid_id', new_email: 'sixbase@sixbase.com' }),
    );
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Usuário não informado');
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
      sut.execute({ id_user: 'valid_id', new_email: 'sixbase@sixbase.com' }),
    );
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Já existe uma conta cadastrada neste email');
  });

  it('should throw if user new email is equal using email', async () => {
    const { sut, userRepoStub } = makeSut();
    jest.spyOn(userRepoStub, 'findById').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve({ email: 'sixbase@sixbase.com' });
        }),
    );
    const error = await getError(() =>
      sut.execute({
        id_user: 'valid_id',
        new_email: 'sixbase@sixbase.com',
      }),
    );
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe(
      'Email não pode ser o mesmo utilizado atualmente',
    );
  });

  it('should throw if is a invalid new email', async () => {
    const { sut } = makeSut();
    const error = await getError(() =>
      sut.execute({
        new_email: 'isso não é um email',
      }),
    );
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Email inválido');
  });

  it('should delete a user history if find one', async () => {
    const { sut, userHistoryStub } = makeSut();
    jest.spyOn(userHistoryStub, 'find').mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolve({ id: 'valid_id' });
        }),
    );
    const userHistorySpy = jest.spyOn(userHistoryStub, 'delete');
    await sut.execute({
      id_user: 'valid_id',
      new_email: 'sixbase@sixbase.com',
    });
    expect(userHistorySpy).toHaveBeenCalledTimes(1);
    expect(userHistorySpy).toHaveBeenCalledWith({ id: 'valid_id' });
  });
});
