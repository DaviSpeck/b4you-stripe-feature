const fs = require('fs');
const UpdateBanner = require('../../useCases/dashboard/products/images/UpdateBanner');
const filesHelper = require('../../utils/files');
const ImageHelper = require('../../utils/helpers/images');

jest.mock('../../utils/helpers/images');
jest.mock('../../utils/files');
jest.mock('fs');

const fakeProductsRepo = () => {
  class ProductsRepository {
    static async findWithProducer() {
      return new Promise((resolve) => {
        resolve({
          id: 'valid_id',
        });
      });
    }

    static async update() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }

  return ProductsRepository;
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
  const productsRepoStub = fakeProductsRepo();
  const sut = new UpdateBanner(productsRepoStub);
  return {
    sut,
    productsRepoStub,
  };
};

describe('Update product banner', () => {
  it('should throw error if file is not provided', async () => {
    const { sut } = makeSut();

    const error = await getError(() =>
      sut.execute({
        product_uuid: 'valid uuid',
        id_user: 'valid user',
      }),
    );

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Um arquivo de imagem precisa ser enviado');
  });

  it('should throw if find with producer throws', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const promise = sut.execute({
      product_uuid: 'valid uuid',
      id_user: 'valid user',
      file: {
        key: 'valid_key',
        path: 'valid_path',
      },
    });
    await expect(promise).rejects.toThrow();
  });

  it('should throw error if product is not found', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(null);

    const error = await getError(() =>
      sut.execute({
        product_uuid: 'invalid uuid',
        id_user: 'valid user',
        file: {
          key: 'valid key',
          path: 'valid_path',
        },
      }),
    );

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Produto não encontrado');
  });

  it('should throw if image helper throws', async () => {
    const { sut } = makeSut();
    const data = {
      product_uuid: 'valid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    ImageHelper.formatImageCover.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() => sut.execute(data));
    expect(error).toBeDefined();
  });

  it('should throw if resolve image throws', async () => {
    const { sut } = makeSut();
    const data = {
      product_uuid: 'valid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    ImageHelper.formatImageCover.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve();
      }),
    );

    filesHelper.resolveImageFromBuffer.mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() => sut.execute(data));
    expect(error).toBeDefined();
  });

  it('should throw if fs throws', async () => {
    const { sut } = makeSut();
    const data = {
      product_uuid: 'valid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    ImageHelper.formatImageCover.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve();
      }),
    );

    filesHelper.resolveImageFromBuffer.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ file: 'valid_file', key: 'valid_key' });
      }),
    );
    fs.unlinkSync.mockReturnValueOnce(new Error());
    const error = await getError(() => sut.execute(data));
    expect(error).toBeDefined();
  });

  it('should throw if upload product throws', async () => {
    const { sut, productsRepoStub } = makeSut();
    const data = {
      product_uuid: 'valid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    ImageHelper.formatImageCover.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve();
      }),
    );

    filesHelper.resolveImageFromBuffer.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ file: 'valid_file', key: 'valid_key' });
      }),
    );
    fs.unlinkSync.mockReturnValueOnce(true);

    jest.spyOn(productsRepoStub, 'update').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() => sut.execute(data));
    expect(error).toBeDefined();
  });

  it('should get upload url', async () => {
    const { sut } = makeSut();
    const data = {
      product_uuid: 'valid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    ImageHelper.formatImageCover.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve();
      }),
    );

    filesHelper.resolveImageFromBuffer.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ file: 'valid_file', key: 'valid_key' });
      }),
    );
    fs.unlinkSync.mockReturnValueOnce(true);
    const url = await sut.execute(data);
    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
  });
});
