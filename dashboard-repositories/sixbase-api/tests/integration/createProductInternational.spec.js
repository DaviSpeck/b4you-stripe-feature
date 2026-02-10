const CreateProduct = require('../../useCases/dashboard/products/CreateProduct');
const {
  producerEnabled,
  producerBlocked,
} = require('../fixtures/auth.fixtures');

const makeProductsRepo = () => {
  class ProductsRepository {
    static async create(data) {
      return data;
    }
  }

  return ProductsRepository;
};

const makeProductAffiliateSettingsRepo = () => {
  class ProductAffiliateSettingsRepository {
    static async create(data) {
      return data;
    }
  }

  return ProductAffiliateSettingsRepository;
};

const makeClassroomsRepo = () => {
  class ClassroomsRepository {
    static async create(data) {
      return data;
    }
  }

  return ClassroomsRepository;
};

const makeUserRepo = () => {
  class UserRepository {
    static async findById() {
      return producerBlocked;
    }
  }

  return UserRepository;
};

const makeSut = () => {
  const productsRepositoryStub = makeProductsRepo();
  const productAffiliateSettingsStub = makeProductAffiliateSettingsRepo();
  const classroomsStub = makeClassroomsRepo();
  const userRepoStub = makeUserRepo();

  const sut = new CreateProduct(
    productsRepositoryStub,
    classroomsStub,
    productAffiliateSettingsStub,
    userRepoStub,
  );

  return {
    sut,
    userRepoStub,
    productsRepositoryStub,
  };
};

describe('Create Product International Governance', () => {
  it('should block international product creation when producer is not enabled (403)', async () => {
    const { sut, userRepoStub } = makeSut();
    jest.spyOn(userRepoStub, 'findById').mockResolvedValueOnce(producerBlocked);

    const promise = sut.save({
      name: 'Produto internacional bloqueado',
      category: 1,
      payment_type: 'single',
      type: 'video',
      id_user: producerBlocked.id,
      warranty: 7,
      sales_page_url: 'https://example.com',
      operation_scope: 'international',
      currency_code: 'USD',
      acquirer_key: 'stripe',
    });

    await expect(promise).rejects.toMatchObject({ code: 403 });
  });

  it('should allow international product creation when producer is enabled', async () => {
    const { sut, userRepoStub, productsRepositoryStub } = makeSut();
    jest.spyOn(userRepoStub, 'findById').mockResolvedValueOnce(producerEnabled);
    const createSpy = jest.spyOn(productsRepositoryStub, 'create');

    const product = await sut.save({
      name: 'Produto internacional permitido',
      category: 1,
      payment_type: 'single',
      type: 'video',
      id_user: producerEnabled.id,
      warranty: 7,
      sales_page_url: 'https://example.com',
      operation_scope: 'international',
      currency_code: 'USD',
      acquirer_key: 'stripe',
      conversion_context: { source: 'test' },
    });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        operation_scope: 'international',
        currency_code: 'USD',
        acquirer_key: 'stripe',
      }),
    );
    expect(product.operation_scope).toBe('international');
  });

  it('should always allow national product creation regardless of producer international status', async () => {
    const { sut, userRepoStub, productsRepositoryStub } = makeSut();
    const findSpy = jest.spyOn(userRepoStub, 'findById');
    const createSpy = jest.spyOn(productsRepositoryStub, 'create');

    const product = await sut.save({
      name: 'Produto nacional',
      category: 1,
      payment_type: 'single',
      type: 'video',
      id_user: producerBlocked.id,
      warranty: 7,
      sales_page_url: 'https://example.com',
      operation_scope: 'national',
      currency_code: 'BRL',
      acquirer_key: 'pagarme',
    });

    expect(findSpy).not.toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ operation_scope: 'national' }),
    );
    expect(product.operation_scope).toBe('national');
  });
});
