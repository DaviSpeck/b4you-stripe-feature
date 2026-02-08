const fs = require('fs');
const UpdateSecondHeaderMobile = require('../../useCases/dashboard/products/images/UpdateSecondHeaderMobile');
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

const makeSut = () => {
  const productsRepoStub = fakeProductsRepo();
  const sut = new UpdateSecondHeaderMobile(productsRepoStub);
  return {
    sut,
    productsRepoStub,
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

describe('upload second header mobile', () => {
  it('should throw error if file is not defined', async () => {
    const { sut } = makeSut();
    const error = await getError(() => sut.execute({}));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Arquivo não enviado');
  });

  it('should throw if products repo throws', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const data = {
      product_uuid: 'invalid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    const error = await getError(() => sut.execute(data));
    expect(error).toBeDefined();
  });

  it('should throw error if product is not found', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(null);
    const data = {
      product_uuid: 'invalid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    const error = await getError(() => sut.execute(data));
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

  it('should call image helper with correct values', async () => {
    const { sut } = makeSut();
    const data = {
      product_uuid: 'valid_uuid',
      id_user: 'valid_id',
      file: {
        path: 'valid_path',
        key: 'valid_key',
      },
    };
    const imageHelperSpy = jest.spyOn(ImageHelper, 'formatImageCover');
    filesHelper.resolveImageFromBuffer.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({ file: 'valid_file', key: 'valid_key' });
      }),
    );
    fs.unlinkSync.mockReturnValueOnce(true);
    await sut.execute(data);
    expect(imageHelperSpy).toHaveBeenCalledWith(
      data.file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_MOBILE,
    );
  });

  it('should call fs unlink with correct values', async () => {
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
    const fsSpy = jest.spyOn(fs, 'unlinkSync');
    await sut.execute(data);
    expect(fsSpy).toHaveBeenCalledWith(data.file.path);
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
