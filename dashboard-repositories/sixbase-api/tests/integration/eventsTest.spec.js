const Webhooks = require('../../useCases/dashboard/webhooks/eventsTest');
const Webhook = require('../../services/integrations/Webhooks');

jest.mock('../../services/integrations/Webhooks');

const getError = async (callFunction) => {
  try {
    const r = await callFunction();
    return r;
  } catch (error) {
    return error;
  }
};

describe('Testing webhooks methods', () => {
  it('should throw an error if url is not provided', async () => {
    const data = {
      id_event: 1,
    };
    const webhooks = new Webhooks(data);
    const error = await getError(() => webhooks.execute());
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('É necessário enviar uma url');
  });

  it('should throw an error if id_event is not provided', async () => {
    const data = {
      url: 'www.google.com.br',
    };
    const webhooks = new Webhooks(data);
    const error = await getError(() => webhooks.execute());
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('É necessário enviar id_event');
  });

  it('should throw a error if id_event is a string with letters', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 'abc',
    };
    const webhooks = new Webhooks(data);
    const error = await getError(() => webhooks.execute());
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Evento precisa ser um número');
  });

  it('should throw a error if id_event doesnt exist', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 99,
    };
    const webhooks = new Webhooks(data);
    const error = await getError(() => webhooks.execute());
    expect(error).toBeDefined();
    expect(error.code).toBe(400);
    expect(error.message).toBe('Evento não encontrado');
  });

  it('should throw invalid webhook error', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 1,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve, reject) => {
          reject(new Error());
        }),
    }));
    const webhooks = new Webhooks(data);
    const error = await getError(() => webhooks.execute());
    expect(error).toBeDefined();
  });

  it('should call webhook with correct value in approved payment', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 1,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });

  it('should call webhook with correct value in refused payment', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 2,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });

  it('should call webhook with correct value in refunded payment', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 3,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });

  it('should call webhook with correct value in abandoned cart', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 5,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });

  it('should call webhook with correct value in generated billet', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 6,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });

  it('should call webhook with correct value in generated pix', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 7,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });

  it('should call webhook with correct value in canceled subscription', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 8,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });

  it('should call webhook with correct value in renewed subscription', async () => {
    const data = {
      url: 'www.google.com.br',
      id_event: 10,
    };

    Webhook.mockImplementationOnce(() => ({
      send: async () =>
        new Promise((resolve) => {
          resolve({ status: 200, statusText: 'ok' });
        }),
    }));
    const webhooks = new Webhooks(data);
    const eventTest = await webhooks.execute();
    expect(eventTest).toBeDefined();
    expect(eventTest.status_code).toBe(200);
    expect(eventTest.status_text).toBe('ok');
  });
});
