/* eslint-disable max-classes-per-file */
const CreateProduct = require('../../useCases/dashboard/products/CreateProduct');

const makeProductsRepo = () => {
  class ProductsRepository {
    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return ProductsRepository;
};

const makeProductAffiliateSettingsRepo = () => {
  class ProductAffiliateSettingsRepository {
    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return ProductAffiliateSettingsRepository;
};

const makeClassroomsRepo = () => {
  class ClassroomsRepository {
    static async create(data) {
      return new Promise((resolve) => {
        resolve(data);
      });
    }
  }

  return ClassroomsRepository;
};

const makeSut = () => {
  const productsRepositoryStub = makeProductsRepo();
  const productAffiliateSettingsStub = makeProductAffiliateSettingsRepo();
  const classroomsStub = makeClassroomsRepo();
  const sut = new CreateProduct(
    productsRepositoryStub,
    classroomsStub,
    productAffiliateSettingsStub,
  );
  return {
    sut,
    productsRepositoryStub,
    productAffiliateSettingsStub,
    classroomsStub,
  };
};

describe('Create Product Use Case', () => {
  it('should throw error if payment type is subscription and product type is ebook', async () => {
    const { sut } = makeSut();
    let error = null;
    try {
      await sut.save({ payment_type: 'subscription', type: 'ebook' });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe(
      'Este tipo de produto não aceita assinatura como método de pagamento',
    );
  });

  it('should throw if productsRepository throws', async () => {
    const { sut, productsRepositoryStub } = makeSut();
    const productData = {
      name: 'valid product',
      payment_type: 'single',
      type: 'ebook',
      hex_color: '#24292f',
      sales_page_url: 'www.validUrl.com',
    };
    jest.spyOn(productsRepositoryStub, 'create').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const promise = sut.save(productData);
    await expect(promise).rejects.toThrow();
  });

  it('should throw if products affiliates settings repository throws', async () => {
    const { sut, productAffiliateSettingsStub } = makeSut();
    const productData = {
      name: 'valid product',
      payment_type: 'single',
      type: 'ebook',
      hex_color: '#24292f',
      sales_page_url: 'www.validUrl.com',
    };
    jest.spyOn(productAffiliateSettingsStub, 'create').mockReturnValueOnce(
      new Promise((resolve, reject) => {
        reject(new Error());
      }),
    );
    const promise = sut.save(productData);
    await expect(promise).rejects.toThrow();
  });

  it('should create classroom if product is video type or payment only type', async () => {
    const { sut, classroomsStub } = makeSut();
    const productData = {
      name: 'valid product',
      payment_type: 'single',
      type: 'video',
      hex_color: '#24292f',
      sales_page_url: 'www.validUrl.com',
    };
    let classroom = null;
    jest.spyOn(classroomsStub, 'create').mockImplementationOnce((data) => {
      classroom = data;
      return data;
    });
    await sut.save(productData);
    expect(classroom).toBeDefined();
    expect(classroom.label).toBe('Turma 1');
  });

  it('should create product with content delivery payment only', async () => {
    const { sut } = makeSut();
    const productData = {
      name: 'valid product',
      payment_type: 'single',
      hex_color: '#24292f',
      sales_page_url: 'www.validUrl.com',
      type: 'payment_only',
    };
    const product = await sut.save(productData);
    expect(product).toBeDefined();
    expect(product.content_delivery).toBe('payment_only');
  });
});
