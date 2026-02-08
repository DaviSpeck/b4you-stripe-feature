const ApiError = require('../../../error/ApiError');
const Webhook = require('../../../services/integrations/Webhooks');
const { findRulesTypes } = require('../../../types/integrationRulesTypes');

module.exports = class Webhooks {
  constructor({ url, id_event, token }) {
    this.url = url;
    this.id_event = id_event;
    this.token = token;
  }

  async approvedPayment() {
    const body = {
      event_name: 'approved-payment',
      sale_id: 'dca36387-7ec5-4717-a9f0-72acbbf6b37f',
      group_id: '6dbc962a-b4f9-4ad3-8830-6ba740fba991',
      status: 'paid',
      payment_method: 'card',
      installments: 1,
      card: [{ brand: 'hiper', last_four_digits: '5131' }],
      pix: null,
      billet: null,
      created_at: '2022-09-22T17:58:24.000Z',
      updated_at: '2022-09-22T17:58:24.000Z',
      paid_at: '2022-09-22T17:58:24.000Z',
      product: {
        id: '6566823b-c078-4c00-9c32-dc96998e99fd',
        name: 'Produto de teste para webhook',
        logo: 'https://placehold.co/601x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      coupon: {
        name: 'cliente10',
        amount: 10,
        type: 'amount',
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: null,
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async refundPayment() {
    const refundBody = {
      event_name: 'refund',
      sale_id: '9754283f-9242-45a1-93bb-50d442fcb177',
      group_id: '6dbc962a-b4f9-4ad3-8830-6ba740fba991',
      status: 'refunded',
      payment_method: 'pix',
      installments: 1,
      card: [{ brand: 'hiper', last_four_digits: '5131' }],
      pix: null,
      billet: null,
      created_at: '2022-09-22T18:10:17.000Z',
      updated_at: '2022-09-22T18:13:30.000Z',
      paid_at: '2022-09-22T18:10:17.000Z',
      product: {
        id: '6566823b-c078-4c00-9c32-dc96998e99fd',
        name: 'Produto de teste para webhook',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: {
        id: '9c8751ca-ffe1-4538-a245-a78579a1dc33',
        start_date: '2022-09-19T18:30:35.000Z',
        next_charge: '2022-10-19',
        status: 'active',
        plan: {
          id: 'f52d1e12-a09a-4af9-bec9-2ced902d4ef7',
          name: 'Assinatura',
          frequency: 'month',
        },
      },
      refund: {
        reason: 'Falta conteúdo no material apresentado',
        created_at: '2022-09-22T18:10:37.000Z',
        cost: 0,
      },
    };
    const response = await new Webhook(this.url).send(refundBody);
    return { status_code: response.status, status_text: response.statusText };
  }

  async canceledSubscription() {
    const body = {
      event_name: 'canceled-subscription',
      sale_id: '7310f4fc-141e-4d4c-ae2e-d4aa0d268016',
      group_id: '6dbc962a-b4f9-4ad3-8830-6ba740fba991',
      status: 'paid',
      payment_method: 'card',
      installments: 1,
      card: [{ brand: 'hiper', last_four_digits: '5131' }],
      pix: null,
      billet: null,
      created_at: '2022-09-22T18:41:49.000Z',
      updated_at: '2022-09-22T18:41:49.000Z',
      paid_at: '2022-09-22T18:41:49.000Z',
      product: {
        id: '878e4441-4715-4445-8910-14353ff2df8e',
        name: 'Produto Assinatura',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: {
        id: '5e8a6df1-f828-411b-ba4c-77b0db34b5b9',
        start_date: '2022-09-22T18:41:49.000Z',
        next_charge: '2022-10-22',
        status: 'active',
        plan: {
          id: 'f52d1e12-a09a-4af9-bec9-2ced902d4ef7',
          name: 'Assinatura',
          frequency: 'month',
        },
      },
      charges: [
        {
          id: '287a1358-fda1-46e9-bdab-4686949b5151',
          amount: 100,
          status: 'paid',
          created_at: '2022-09-22T18:41:49.000Z',
        },
      ],
      refund: null,
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async renewedSubscription() {
    const body = {
      event_name: 'renewed-subscription',
      sale_id: '7310f4fc-141e-4d4c-ae2e-d4aa0d268016',
      group_id: '6dbc962a-b4f9-4ad3-8830-6ba740fba991',
      status: 'paid',
      payment_method: 'card',
      installments: 1,
      card: [{ brand: 'master', last_four_digits: '6344' }],
      pix: null,
      billet: null,
      created_at: '2022-09-22T18:41:49.000Z',
      updated_at: '2022-09-22T18:41:49.000Z',
      paid_at: '2022-09-22T18:41:49.000Z',
      product: {
        id: '878e4441-4715-4445-8910-14353ff2df8e',
        name: 'Produto Assinatura',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: {
        id: '5e8a6df1-f828-411b-ba4c-77b0db34b5b9',
        start_date: '2022-09-22T18:41:49.000Z',
        next_charge: '2022-10-22',
        status: 'active',
        plan: {
          id: 'f52d1e12-a09a-4af9-bec9-2ced902d4ef7',
          name: 'Assinatura',
          frequency: 'month',
        },
      },
      charges: [
        {
          id: '287a1358-fda1-46e9-bdab-4686949b5151',
          amount: 100,
          status: 'paid',
          created_at: '2022-09-22T18:41:49.000Z',
        },
      ],
      refund: null,
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async generatedPix() {
    const body = {
      event_name: 'generated-pix',
      sale_id: '4798ade0-d484-47f0-a0db-7883e6e15bc2',
      group_id: '6dbc962a-b4f9-4ad3-8830-6ba740fba991',
      status: 'paid',
      payment_method: 'pix',
      installments: 1,
      card: null,
      pix: {
        code: '00020101021226890014br.gov.bcb.pix2567brcode-h.sandbox.starkinfra.com/v2/991599f66f3844b79a45a8e3cb4283e45204000053039865802BR5925Pay42 Intermediacao De Ne6010Porto Belo62070503***6304EBAE',
      },
      billet: null,
      created_at: '2022-10-26T18:49:34.000Z',
      updated_at: '2022-10-26T18:50:21.000Z',
      paid_at: '2022-10-26T18:50:21.000Z',
      type: 'main',
      product: {
        id: '247b4a29-d1e6-46a2-b971-fb418b667ca1',
        name: 'Curso  Nodejs Express + Reactjs',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      coupon: {
        name: 'cliente10',
        amount: 10,
        type: 'amount',
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: null,
      charges: [
        {
          id: 'e8104578-b07c-4192-b549-4609f6c00900',
          amount: 15,
          status: 'paid',
          created_at: '2022-10-26T18:49:34.000Z',
        },
      ],
      refund: null,
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async generatedBillet() {
    const body = {
      event_name: 'generated-billet',
      sale_id: '007ae569-7435-4635-ad0e-f9961e2d0598',
      group_id: '6dbc962a-b4f9-4ad3-8830-6ba740fba991',
      status: 'pending',
      payment_method: 'billet',
      installments: 1,
      card: null,
      pix: null,
      billet: {
        url: 'https://sandbox.pay42.com.br/v2/boleto/pdf/6742085952602112',
        line_code: '34191.09107 40589.407309 71444.640008 3 91520000001500',
      },
      created_at: '2022-10-26T18:52:48.000Z',
      updated_at: '2022-10-26T18:52:48.000Z',
      paid_at: null,
      type: 'main',
      product: {
        id: '247b4a29-d1e6-46a2-b971-fb418b667ca1',
        name: 'Curso  Nodejs Express + Reactjs',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      coupon: {
        name: 'cliente10',
        amount: 10,
        type: 'amount',
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: null,
      charges: [
        {
          id: '37730015-0ae7-4345-bad0-5d90c2a21fe2',
          amount: 15,
          status: 'pending',
          created_at: '2022-10-26T18:52:48.000Z',
        },
      ],
      refund: null,
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async abandonedCart() {
    const body = {
      event_name: 'abandoned-cart',
      sale_id: null,
      group_id: null,
      status: null,
      payment_method: null,
      installments: null,
      card: null,
      pix: null,
      billet: null,
      created_at: '2022-10-26T09:57:04.000Z',
      updated_at: '2022-10-26T18:57:25.000Z',
      paid_at: null,
      type: null,
      product: {
        id: '247b4a29-d1e6-46a2-b971-fb418b667ca1',
        name: 'Curso  Nodejs Express + Reactjs',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      checkout: {
        url: 'https://checkout.b4you.com.br/123',
        price: 197,
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      tracking_parameters: {
        src: null,
        sck: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: null,
      charges: null,
      refund: null,
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async refusedPayment() {
    const body = {
      event_name: 'refused-payment',
      sale_id: '7aaf6788-a331-47b3-939c-49f9b4e2f919',
      group_id: '6dbc962a-b4f9-4ad3-8830-6ba740fba991',
      status: 'denied',
      payment_method: 'card',
      installments: 1,
      card: [
        {
          brand: 'master',
          last_four_digits: '2062',
        },
      ],
      card_details:
        'Transação recusada pelo banco, oriente o portador a contatar o banco/emissor',
      pix: null,
      billet: null,
      created_at: '2022-10-26T19:01:16.000Z',
      updated_at: '2022-10-26T19:01:16.000Z',
      paid_at: null,
      type: 'main',
      product: {
        id: '247b4a29-d1e6-46a2-b971-fb418b667ca1',
        name: 'Curso  Nodejs Express + Reactjs',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: 'bsjTsNX6zo',
        name: 'Upsell',
        quantity: 1,
        original_price: 197,
      },
      coupon: {
        name: 'cliente10',
        amount: 10,
        type: 'amount',
      },
      customer: {
        full_name: 'B4you plataforma',
        email: 'b4you@b4you.com.br',
        whatsapp: '47999999999',
        document_number: '00000000000',
        address: {
          city: 'Balneário Camboriú',
          state: 'SC',
          number: '1997',
          street: 'Rua 3706',
          zipcode: '88330215',
          complement: 'Casa a',
          neighborhood: 'Centro',
        },
      },
      subscription: null,
      charges: [
        {
          id: 'c19ab7fa-f205-45f7-8932-f7744c6cc74e',
          amount: 15,
          status: 'refused',
          created_at: '2022-10-26T19:01:16.000Z',
        },
      ],
      refund: null,
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async tracking() {
    const body = {
      event_name: 'tracking',
      sale_id: '************************',
      group_id: '************************',
      status: 'paid',
      payment_method: 'pix',
      installments: 1,
      card: null,
      pix: {
        code: '********************************',
        url: '********************************',
      },
      billet: null,
      created_at: '2025-02-06T16:58:36.000Z',
      updated_at: '2025-02-07T11:20:24.000Z',
      paid_at: '2025-02-06T16:59:52.000Z',
      type: 'main',
      product: {
        id: '************************',
        name: 'Pr****',
        logo: 'https://placehold.co/600x400',
        cover: 'https://placehold.co/600x400',
        offer_image: 'https://placehold.co/600x400',
        dimensions: {
          width: 10,
          height: 10,
          weight: 1,
          length: 10,
        },
      },
      offer: {
        id: '**********',
        name: 'Pr****',
        quantity: 1,
        original_price: 297,
      },
      customer: {
        id: '************************',
        full_name: '***********************',
        email: '***********************',
        whatsapp: '************',
        document_number: '***********',
        address: {
          city: 'Niterói',
          state: 'RJ',
          number: '**',
          street: '************************',
          zipcode: '********',
          complement: '****',
          neighborhood: '********',
        },
      },
      coupon: {
        name: 'cliente10',
        amount: 10,
        type: 'amount',
      },
      affiliate: {
        full_name: '***********************',
        email: '***********************',
      },
      tracking_parameters: {
        src: null,
        sck: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
      },
      subscription: null,
      charges: [
        {
          id: '************************',
          amount: 297,
          status: 'paid',
          created_at: '2025-02-06T16:58:36.000Z',
        },
      ],
      splits: {
        base_price: 297,
        fee: 16.55,
        commissions: [
          {
            id: 1714875,
            type: 'affiliate',
            email: '***********************',
            amount: 169.29,
            release_date: '2025-02-06',
            released: true,
          },
          {
            id: 1714876,
            type: 'supplier',
            email: '***********************',
            amount: 66,
            release_date: '2025-02-06',
            released: true,
          },
          {
            id: 1714877,
            type: 'producer',
            email: '***********************',
            amount: 45.16,
            release_date: '2025-02-06',
            released: true,
          },
        ],
        my_commission: 45.16,
        release_date: '2025-02-06',
        released: true,
      },
      refund: null,
      checkout: {
        url: '********************************',
      },
      tracking: {
        code: '********************',
        url: 'www.correios.com.br',
        company: 'correios',
      },
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async affiliateRequest() {
    const body = {
      product: {
        id: 0,
        name: 'Produto afiliação teste',
      },
      affiliate: {
        name: 'John Doe',
        email: 'john@doe.com.br',
        phone: '47999999999',
      },
      event_name: 'Solicitação de afiliação',
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async affiliateApproved() {
    const body = {
      product: {
        id: 0,
        name: 'Produto afiliação teste',
      },
      affiliate: {
        name: 'John Doe',
        email: 'john@doe.com.br',
        phone: '47999999999',
      },
      event_name: 'approved-affiliate',
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async affiliateRejected() {
    const body = {
      product: {
        id: 0,
        name: 'Produto afiliação teste',
      },
      affiliate: {
        name: 'John Doe',
        email: 'john@doe.com.br',
        phone: '47999999999',
      },
      event_name: 'refused-affiliate',
    };
    const response = await new Webhook(this.url, this.token).send(body);
    return { status_code: response.status, status_text: response.statusText };
  }

  async execute() {
    if (!this.url) throw ApiError.badRequest('É necessário enviar uma url');
    if (!this.id_event)
      throw ApiError.badRequest('É necessário enviar id_event');
    if (Number.isNaN(Number(this.id_event)))
      throw ApiError.badRequest('Evento precisa ser um número');
    const event = findRulesTypes(Number(this.id_event));
    if (!event) throw ApiError.badRequest('Evento não encontrado');
    const { key } = event;
    const functions = {
      'approved-payment': async () => {
        const data = await this.approvedPayment();
        return data;
      },
      refund: async () => {
        const data = await this.refundPayment();
        return data;
      },
      'canceled-subscription': async () => {
        const data = await this.canceledSubscription();
        return data;
      },
      'renewed-subscription': async () => {
        const data = await this.renewedSubscription();
        return data;
      },
      'generated-pix': async () => {
        const data = await this.generatedPix();
        return data;
      },
      'generated-billet': async () => {
        const data = await this.generatedBillet();
        return data;
      },
      'abandoned-cart': async () => {
        const data = await this.abandonedCart();
        return data;
      },
      'refused-payment': async () => {
        const data = await this.refusedPayment();
        return data;
      },
      tracking: async () => {
        const data = await this.tracking();
        return data;
      },
      'affiliate-request': async () => {
        const data = await this.affiliateRequest();
        return data;
      },
      'approved-affiliate': async () => {
        const data = await this.affiliateApproved();
        return data;
      },
      'refused-affiliate': async () => {
        const data = await this.affiliateRejected();
        return data;
      },
    };
    try {
      const response = await functions[key]();
      return response;
    } catch (error) {
      throw ApiError.badRequest('Webhook Inválido');
    }
  }
};
