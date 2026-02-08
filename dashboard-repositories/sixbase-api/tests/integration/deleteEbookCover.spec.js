/* eslint-disable max-classes-per-file */
const DeleteEbookCover = require('../../useCases/dashboard/products/images/DeleteEbookCover');

const fakeProductsRepo = () => {
  class ProductsRepository {
    static async findWithProducer() {
      return new Promise((resolve) => {
        resolve({
          id: 'valid_id',
          ebook_cover_key: 'valid_ebook_cover_key',
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

const fakeFileManager = () => {
  class FileManager {
    static async deleteFile(key) {
      return new Promise((resolve) => {
        resolve(key);
      });
    }
  }

  return FileManager;
};

const makeSut = () => {
  const productsRepoStub = fakeProductsRepo();
  const fileManagerStub = fakeFileManager();
  const sut = new DeleteEbookCover(productsRepoStub, fileManagerStub);
  return {
    sut,
    productsRepoStub,
    fileManagerStub,
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

describe('Delete ebook cover use case', () => {
  it('should throw if find product throws ', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() =>
      sut.execute({ product_uuid: 'valid_uuid', id_user: 'valid_id' }),
    );
    expect(error).toBeDefined();
  });

  it('should throw error if product is not found', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(null);
    const data = {
      product_uuid: 'invalid_uuid',
      id_user: 'valid_id',
    };
    const error = await getError(() => sut.execute(data));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Produto não encontrado');
  });

  it('should throw error if product doesnt have ebook cover', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest
      .spyOn(productsRepoStub, 'findWithProducer')
      .mockReturnValueOnce({ id: 'valid_id' });
    const data = {
      product_uuid: 'invalid_uuid',
      id_user: 'valid_id',
    };
    const error = await getError(() => sut.execute(data));
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Produto sem capa');
  });

  it('should throw if file manager throws', async () => {
    const { sut, fileManagerStub } = makeSut();
    jest.spyOn(fileManagerStub, 'deleteFile').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const error = await getError(() =>
      sut.execute({ product_uuid: 'valid_uuid', id_user: 'valid_id' }),
    );
    expect(error).toBeDefined();
  });

  it('should call file manager with correct value', async () => {
    const { sut, fileManagerStub } = makeSut();
    const fileManagerSpy = jest.spyOn(fileManagerStub, 'deleteFile');
    await sut.execute({ product_uuid: 'valid_uuid', id_user: 'valid_id' });
    expect(fileManagerSpy).toHaveBeenCalledWith('valid_ebook_cover_key');
  });
});
