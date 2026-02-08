const DeleteProduct = require('../../useCases/dashboard/products/DeleteProduct');

const fakeProductRepo = () => {
  class FakeProductRepo {
    static async delete() {
      return new Promise((resolve) => {
        resolve();
      });
    }

    static async findWithProducer() {
      return new Promise((resolve) => {
        resolve({
          id: 1,
        });
      });
    }
  }
  return FakeProductRepo;
};

const makeSut = ({ product_id, id_user }) => {
  const productRepoStub = fakeProductRepo();
  const sut = new DeleteProduct({
    product_id,
    id_user,
    ProductsRepository: productRepoStub,
  });
  return { sut, productRepoStub };
};

describe('Delete a product', () => {
  it('Should return 400 if product is not found', async () => {
    const { sut, productRepoStub } = makeSut({ product_id: 1, id_user: 1 });
    let error = null;
    jest
      .spyOn(productRepoStub, 'findWithProducer')
      .mockImplementationOnce(() => null);

    try {
      await sut.execute();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('product not found');
  });

  it('Should delete a product', async () => {
    const { sut } = makeSut({ product_id: 1, id_user: 1 });
    const product = await sut.execute();
    expect(product.id).toBe(1);
  });
});
