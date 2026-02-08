const UpdateCoproducerCommission = require('../../useCases/dashboard/coproductions/UpdateCoproducerCommission');
const CoproductionsRepository = require('../../repositories/memory/CoproductionsRepositoryMemory');
const CoproductionsInvitesRepository = require('../../repositories/memory/CoproductionsInvitesRepositoryMemory');
const ApiError = require('../../error/ApiError');

const fakeEmailService = () => {
  class FakeEmailService {
    static async sendMail() {
      return new Promise((resolve) => {
        resolve();
      });
    }
  }

  return FakeEmailService;
};

describe('testing update coproducer commission', () => {
  it('should update coproducer commission', async () => {
    const data = {
      commission: 10,
      coproducer_uuid: 'be6b5e34-2dc4-4cc5-8295-4239795c10ff',
      id_product: 21,
    };

    await new UpdateCoproducerCommission(
      data,
      CoproductionsRepository,
      CoproductionsInvitesRepository,
      fakeEmailService(),
    ).execute();

    const coproducer = await CoproductionsRepository.find({
      uuid: data.coproducer_uuid,
    });

    expect(coproducer.commission_percentage).toBe(data.commission);
    expect(coproducer.uuid).toBe(data.coproducer_uuid);
    expect(coproducer.id_product).toBe(data.id_product);
  });

  it('should not find coproducer', async () => {
    const data = {
      commission: 10,
      coproducer_uuid: '123',
      id_product: 21,
    };

    let response = null;

    try {
      await new UpdateCoproducerCommission(
        data,
        CoproductionsRepository,
        CoproductionsInvitesRepository,
        fakeEmailService(),
      ).execute();
    } catch (error) {
      response = error;
    }

    expect(response instanceof ApiError).toBe(true);
    expect(response.code).toBe(400);
  });

  it('should not update coproducer commission, commission exceeeds max commission', async () => {
    const data = {
      commission: 120,
      coproducer_uuid: 'be6b5e34-2dc4-4cc5-8295-4239795c10ff',
      id_product: 21,
    };
    let response;
    try {
      await new UpdateCoproducerCommission(
        data,
        CoproductionsRepository,
        CoproductionsInvitesRepository,
        fakeEmailService(),
      ).execute();
    } catch (error) {
      response = error;
    }

    expect(response instanceof ApiError).toBe(true);
    expect(response.code).toBe(400);
  });
});
