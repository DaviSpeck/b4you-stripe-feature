const express = require('express');
const request = require('supertest');

const validateDto = require('../../middlewares/validate-dto');
const createProductDto = require('../../dto/products/createProduct');
const CreateProduct = require('../../useCases/dashboard/products/CreateProduct');
const ApiError = require('../../error/ApiError');
const {
  producerEnabled,
  producerBlocked,
} = require('../fixtures/auth.fixtures');

const makeApp = ({ producer }) => {
  const app = express();
  app.use(express.json());

  class ProductsRepository {
    static async create(data) {
      return { id: 123, ...data };
    }
  }

  class ProductAffiliateSettingsRepository {
    static async create(data) {
      return data;
    }
  }

  class ClassroomsRepository {
    static async create(data) {
      return data;
    }
  }

  class UserRepository {
    static async findById() {
      return producer;
    }
  }

  app.post('/products', validateDto(createProductDto), async (req, res) => {
    try {
      const useCase = new CreateProduct(
        ProductsRepository,
        ClassroomsRepository,
        ProductAffiliateSettingsRepository,
        UserRepository,
      );

      const product = await useCase.save({ ...req.body, id_user: producer.id });
      return res.status(200).send(product);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).send(error);
      }
      return res.status(500).send({ code: 500, message: 'unexpected error' });
    }
  });

  return app;
};

describe('Create Product HTTP integration (international governance)', () => {
  it('should return 403 for international product when producer is blocked', async () => {
    const response = await request(makeApp({ producer: producerBlocked }))
      .post('/products')
      .send({
        name: 'Produto internacional bloqueado',
        category: 1,
        payment_type: 'single',
        type: 'video',
        warranty: 7,
        sales_page_url: 'https://example.com',
        operation_scope: 'international',
        currency_code: 'USD',
        acquirer_key: 'stripe',
      });

    expect(response.status).toBe(403);
  });

  it('should return 200 for international product when producer is enabled', async () => {
    const response = await request(makeApp({ producer: producerEnabled }))
      .post('/products')
      .send({
        name: 'Produto internacional permitido',
        category: 1,
        payment_type: 'single',
        type: 'video',
        warranty: 7,
        sales_page_url: 'https://example.com',
        operation_scope: 'international',
        currency_code: 'USD',
        acquirer_key: 'stripe',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        operation_scope: 'international',
        currency_code: 'USD',
        acquirer_key: 'stripe',
      }),
    );
  });

  it('should return 200 for national product regardless of producer governance', async () => {
    const response = await request(makeApp({ producer: producerBlocked }))
      .post('/products')
      .send({
        name: 'Produto nacional permitido',
        category: 1,
        payment_type: 'single',
        type: 'video',
        warranty: 7,
        sales_page_url: 'https://example.com',
        operation_scope: 'national',
        currency_code: 'BRL',
        acquirer_key: 'pagarme',
      });

    expect(response.status).toBe(200);
    expect(response.body.operation_scope).toBe('national');
  });

  it('should preserve defaults (national, BRL, pagarme) when omitted', async () => {
    const response = await request(makeApp({ producer: producerBlocked }))
      .post('/products')
      .send({
        name: 'Produto default',
        category: 1,
        payment_type: 'single',
        type: 'video',
        warranty: 7,
        sales_page_url: 'https://example.com',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        operation_scope: 'national',
        currency_code: 'BRL',
        acquirer_key: 'pagarme',
      }),
    );
  });
});
