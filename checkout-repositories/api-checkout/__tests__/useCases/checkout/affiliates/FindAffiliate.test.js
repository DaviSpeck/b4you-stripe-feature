const FindAffiliate = require('useCases/checkout/affiliates/FindAffiliate.js');
const Affiliates = require('database/models/Affiliates.js');
const { findAllCookies } = require('database/controllers/cookies_jar.js');

// Mock dependencies
jest.mock('database/models/Affiliates.js');
jest.mock('database/controllers/cookies_jar.js');
jest.mock('utils/helpers/date.js', () => () => ({
  format: () => '2025-11-19',
}));
jest.mock('database/models/Users.js', () => ({
  findOne: jest.fn().mockResolvedValue({
    verified_id: true,
    verified_company_pagarme: true,
    verified_pagarme: true,
    verified_company_pagarme_3: true,
    verified_pagarme_3: true,
  }),
}));

describe('FindAffiliate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should find affiliate by b4f when provided and valid', async () => {
    Affiliates.findOne.mockResolvedValueOnce({ id: 1, id_user: 10 });

    const useCase = new FindAffiliate({
      b4f: 'test-b4f-uuid',
      sixid: 'test-sixid',
      id_product: 100,
      affiliate_settings: { click_attribution: 1 },
    });

    const result = await useCase.execute();

    const expectedUser = {
      verified_id: true,
      verified_company_pagarme: true,
      verified_pagarme: true,
      verified_company_pagarme_3: true,
      verified_pagarme_3: true,
    };

    expect(result).toEqual({ id: 1, id_user: 10, user: expectedUser });
    expect(Affiliates.findOne).toHaveBeenCalledWith({
      where: {
        uuid: 'test-b4f-uuid',
        id_product: 100,
        status: 2,
      },
      attributes: ['id', 'id_user'],
      raw: true,
      logging: expect.any(Function),
    });
  });

  test('should fallback to sixid when b4f is provided but not found', async () => {
    Affiliates.findOne.mockResolvedValueOnce(null);
    findAllCookies.mockResolvedValueOnce([
      { affiliate: { id: 2, id_user: 20 } },
    ]);

    const useCase = new FindAffiliate({
      b4f: 'test-b4f-uuid-not-found',
      sixid: 'test-sixid',
      id_product: 100,
      affiliate_settings: { click_attribution: 1 },
    });

    const result = await useCase.execute();

    const expectedUser = {
      verified_id: true,
      verified_company_pagarme: true,
      verified_pagarme: true,
      verified_company_pagarme_3: true,
      verified_pagarme_3: true,
    };

    expect(result).toEqual({ id: 2, id_user: 20, user: expectedUser });
    expect(Affiliates.findOne).toHaveBeenCalledWith({
      where: {
        uuid: 'test-b4f-uuid-not-found',
        id_product: 100,
        status: 2,
      },
      attributes: ['id', 'id_user'],
      raw: true,
      logging: expect.any(Function),
    });
    expect(findAllCookies).toHaveBeenCalled();
  });

  test('should find affiliate by sixid when b4f is not provided', async () => {
    findAllCookies.mockResolvedValueOnce([
      { affiliate: { id: 3, id_user: 30 } },
    ]);

    const useCase = new FindAffiliate({
      b4f: null,
      sixid: 'test-sixid',
      id_product: 100,
      affiliate_settings: { click_attribution: 1 },
    });

    const result = await useCase.execute();

    const expectedUser = {
      verified_id: true,
      verified_company_pagarme: true,
      verified_pagarme: true,
      verified_company_pagarme_3: true,
      verified_pagarme_3: true,
    };

    expect(result).toEqual({ id: 3, id_user: 30, user: expectedUser });
    expect(Affiliates.findOne).not.toHaveBeenCalled();
    expect(findAllCookies).toHaveBeenCalled();
  });

  test('should return null when neither b4f nor sixid yields an affiliate', async () => {
    Affiliates.findOne.mockResolvedValueOnce(null);
    findAllCookies.mockResolvedValueOnce([]);

    const useCase = new FindAffiliate({
      b4f: 'test-b4f-uuid-not-found',
      sixid: 'test-sixid-not-found',
      id_product: 100,
      affiliate_settings: { click_attribution: 1 },
    });

    const result = await useCase.execute();

    expect(result).toBeNull();
  });
});
