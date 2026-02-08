const UpdateProduct = require('../../useCases/dashboard/products/UpdateProduct');

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
  const sut = new UpdateProduct(productsRepoStub);
  return {
    sut,
    productsRepoStub,
  };
};

describe('Update Product', () => {
  it('should throw if find with producer throws', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const promise = sut.save({
      product_uuid: 'valid uuid',
      id_user: 'valid user',
      body: { name: 'valid name' },
    });
    await expect(promise).rejects.toThrow();
  });

  it('should throw error if product is not found', async () => {
    const { sut, productsRepoStub } = makeSut();
    let error = null;
    jest.spyOn(productsRepoStub, 'findWithProducer').mockReturnValueOnce(null);
    try {
      await sut.save({
        product_uuid: 'valid uuid',
        id_user: 'valid user',
        body: { name: 'valid name' },
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Produto não encontrado');
  });

  it('should throw error if body is empty', async () => {
    const { sut } = makeSut();
    let error = null;
    try {
      await sut.save({
        product_uuid: 'valid uuid',
        id_user: 'valid user',
        body: {},
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Body da requisição vazio');
  });

  it('should throw if update throws', async () => {
    const { sut, productsRepoStub } = makeSut();
    jest.spyOn(productsRepoStub, 'update').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const promise = sut.save({
      product_uuid: 'valid uuid',
      id_user: 'valid user',
      body: { name: 'valid name' },
    });
    await expect(promise).rejects.toThrow();
  });

  it('should returns product', async () => {
    const { sut, productsRepoStub } = makeSut();
    const product = await sut.save({
      product_uuid: 'valid uuid',
      id_user: 'valid user',
      body: { name: 'valid name' },
    });

    const dbProduct = await productsRepoStub.findWithProducer();

    expect(product).toBeDefined();
    expect(product.id).toBe(dbProduct.id);
  });
});
