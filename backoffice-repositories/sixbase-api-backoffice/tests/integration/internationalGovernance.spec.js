const {
  backofficeUser,
  headers,
} = require('../fixtures/auth.fixtures');

jest.mock('../../database/models/Users', () => ({
  findOne: jest.fn(),
  update: jest.fn(),
}));

jest.mock('../../database/controllers/logs_backoffice', () => ({
  createLogBackoffice: jest.fn(),
}));

jest.mock('../../types/userEvents', () => ({
  findRoleTypeByKey: jest.fn(),
  findUserEventTypeByKey: jest.fn(),
}));

const Users = require('../../database/models/Users');
const {
  createLogBackoffice,
} = require('../../database/controllers/logs_backoffice');
const { findUserEventTypeByKey } = require('../../types/userEvents');
const usersController = require('../../controllers/users');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe('Backoffice International Governance Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findUserEventTypeByKey.mockImplementation((key) => {
      if (key === 'international-governance-enabled') return { id: 49 };
      if (key === 'international-governance-blocked') return { id: 50 };
      return { id: 0 };
    });
  });

  it('should PATCH valid governance payload, persist and create audit log', async () => {
    const req = {
      params: { userUuid: 'producer-uuid-1' },
      body: {
        status: 'enabled',
        international_stripe_enabled: true,
        rules: { country_allowlist: ['US'] },
        reason: 'Aprovado para internacional',
      },
      user: backofficeUser,
      headers: { 'x-forwarded-for': headers.forwardedFor },
      socket: { remoteAddress: headers.forwardedFor },
      get: jest.fn().mockReturnValue(headers.userAgent),
      route: { methods: { patch: true } },
      originalUrl: '/users/producer-uuid-1/international-governance',
    };
    const res = makeRes();
    const next = jest.fn();

    Users.findOne.mockResolvedValueOnce({
      id: 10,
      uuid: 'producer-uuid-1',
      international_status: 'blocked',
      international_stripe_enabled: false,
      international_rules: {},
    });

    await usersController.updateInternationalGovernance(req, res, next);

    expect(Users.update).toHaveBeenCalledWith(
      expect.objectContaining({
        international_status: 'enabled',
        international_stripe_enabled: true,
        international_rules: { country_allowlist: ['US'] },
        international_status_updated_by: backofficeUser.id,
      }),
      { where: { id: 10 } },
    );

    expect(createLogBackoffice).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user_backoffice: backofficeUser.id,
        id_user: 10,
        id_event: 49,
        params: expect.objectContaining({
          reason: 'Aprovado para internacional',
          old_state: expect.objectContaining({
            status: 'blocked',
            international_stripe_enabled: false,
          }),
          new_state: expect.objectContaining({
            status: 'enabled',
            international_stripe_enabled: true,
          }),
        }),
      }),
    );

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('should GET governance state and return current producer data', async () => {
    const req = {
      params: { userUuid: 'producer-uuid-2' },
      route: { methods: { get: true } },
      originalUrl: '/users/producer-uuid-2/international-governance',
    };
    const res = makeRes();
    const next = jest.fn();

    const governanceState = {
      uuid: 'producer-uuid-2',
      international_status: 'enabled',
      international_stripe_enabled: true,
      international_rules: { max_ticket: 999 },
      international_status_updated_at: '2026-02-10T00:00:00.000Z',
      international_status_updated_by: 9001,
    };

    Users.findOne.mockResolvedValueOnce(governanceState);

    await usersController.getInternationalGovernance(req, res, next);

    expect(Users.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        raw: true,
        where: { uuid: 'producer-uuid-2' },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(governanceState);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid PATCH payload schema (status out of enum)', async () => {
    const schema = require('../../schemas/users/internationalGovernance');

    await expect(
      schema.validate(
        {
          status: 'invalid-status',
          international_stripe_enabled: true,
          reason: 'xx',
          rules: {},
        },
        { abortEarly: false },
      ),
    ).rejects.toBeDefined();
  });
});
