const express = require('express');
const validateSchema = require('../../middlewares/validate-dto');
const internationalGovernanceSchema = require('../../schemas/users/internationalGovernance');

jest.mock('../../database/models/Users', () => ({
  init: jest.fn(() => ({ associate: jest.fn() })),
  associate: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
}));

jest.mock('../../database/models', () => ({
  sequelize: {
    query: jest.fn(),
  },
}));

jest.mock('../../database/controllers/logs_backoffice', () => ({
  createLogBackoffice: jest.fn(),
}));

jest.mock('../../types/userEvents', () => ({
  findRoleTypeByKey: jest.fn(() => ({ id: 1 })),
  findUserEventTypeByKey: jest.fn((key) => {
    if (key === 'international-governance-enabled') return { id: 49 };
    return { id: 50 };
  }),
}));

const Users = require('../../database/models/Users');
const usersController = require('../../controllers/users');

const createApp = () => {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.user = { id: 9001 };
    next();
  });

  app.get(
    '/users/:userUuid/international-governance',
    usersController.getInternationalGovernance,
  );

  app.patch(
    '/users/:userUuid/international-governance',
    validateSchema(internationalGovernanceSchema),
    usersController.updateInternationalGovernance,
  );

  return app;
};

const requestJson = async (app, method, path, body) => {
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        'user-agent': 'jest-http',
        'x-forwarded-for': '127.0.0.1',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let parsedBody = null;
    try {
      parsedBody = text ? JSON.parse(text) : null;
    } catch (_err) {
      parsedBody = text;
    }

    return {
      status: response.status,
      body: parsedBody,
    };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

describe('International governance HTTP integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /users/:uuid/international-governance should return 200', async () => {
    Users.findOne.mockResolvedValueOnce({
      uuid: 'producer-1',
      international_status: 'enabled',
      international_stripe_enabled: true,
      international_rules: { country_allowlist: ['US'] },
      international_status_updated_at: '2026-02-10T00:00:00.000Z',
      international_status_updated_by: 9001,
    });

    const response = await requestJson(
      createApp(),
      'GET',
      '/users/producer-1/international-governance',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        international_status: 'enabled',
        international_stripe_enabled: true,
      }),
    );
  });

  it('PATCH valid payload should return 200', async () => {
    Users.findOne.mockResolvedValueOnce({
      id: 10,
      uuid: 'producer-2',
      international_status: 'blocked',
      international_stripe_enabled: false,
      international_rules: {},
    });

    const response = await requestJson(
      createApp(),
      'PATCH',
      '/users/producer-2/international-governance',
      {
        status: 'enabled',
        international_stripe_enabled: true,
        rules: { country_allowlist: ['US'] },
        reason: 'Aprovado para internacional',
      },
    );

    expect(response.status).toBe(200);
    expect(Users.update).toHaveBeenCalledWith(
      expect.objectContaining({
        international_status: 'enabled',
        international_stripe_enabled: true,
      }),
      { where: { id: 10 } },
    );
  });

  it('PATCH invalid payload should return 400', async () => {
    const response = await requestJson(
      createApp(),
      'PATCH',
      '/users/producer-3/international-governance',
      {
        status: 'invalid-status',
        international_stripe_enabled: true,
        rules: {},
        reason: 'ok',
      },
    );

    expect(response.status).toBe(400);
    expect(Users.findOne).not.toHaveBeenCalled();
  });

  it('PATCH should return business error when user does not exist', async () => {
    Users.findOne.mockResolvedValueOnce(null);

    const response = await requestJson(
      createApp(),
      'PATCH',
      '/users/producer-4/international-governance',
      {
        status: 'enabled',
        international_stripe_enabled: true,
        rules: {},
        reason: 'Aprovado',
      },
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 400,
        message: 'Usuário não encontrado',
      }),
    );
  });
});
