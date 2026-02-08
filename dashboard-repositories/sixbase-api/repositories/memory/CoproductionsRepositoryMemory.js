const uuid = require('../../utils/helpers/uuid');

const coproductions = [
  {
    id: 1,
    id_product: 21,
    id_user: 3,
    commission_percentage: 15.0,
    expires_at: null,
    created_at: '2022-04-25 17:18:46',
    updated_at: '2022-04-25 17:19:32',
    status: 2,
    accepted_at: '2022-04-25 17:19:32',
    rejected_at: null,
    uuid: 'be6b5e34-2dc4-4cc5-8295-4239795c10ff',
    id_invite: 1,
    split_invoice: 0,
    canceled_at: null,
    warning_one_day: 0,
    warning_seven_days: 0,
    allow_access: 0,
    user: {
      id: 3,
      email: 'vinixp.vp@gmail.com',
      password: '$2b$10$gKXkee9JCx95qyWFZfrlY.ZrAdLykjvPy90/PnlaBJleFam/aXc.G',
      first_name: 'lorex',
      last_name: 'Palma',
      company_name: null,
      document_number: '09487944966',
      zipcode: null,
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: null,
      state: null,
      country: null,
      active: 1,
      whatsapp: '47 99273 2896',
      bank_code: '104',
      agency: '6543',
      account_number: '654456654',
      account_type: 'conta-corrente-conjunta',
      operation: null,
      profile_picture:
        'https://arquivos-mango5.s3.sa-east-1.amazonaws.com/1662648277458-4cebe240-9bc0-46ca-b7e8-99bf7888e13f-295189877_102364842522587_6455816568492788115_n.jpg',
      created_at: '2022-04-21 14:30:44',
      updated_at: '2022-09-14 16:32:00',
      deleted_at: null,
      uuid: '4cebe240-9bc0-46ca-b7e8-99bf7888e13f',
      occupation: null,
      profile_picture_key:
        '1662648277458-4cebe240-9bc0-46ca-b7e8-99bf7888e13f-295189877_102364842522587_6455816568492788115_n.jpg',
      cnpj: '02243625000100',
      trade_name: null,
      is_company: 1,
      verified_id: 1,
      id_documents: 5,
      verified_company: 1,
      status_cnpj: 3,
      cnpj_details: null,
    },
    product: {
      id: 21,
      uuid: 'ce732234-f34d-4db9-995c-e837c731f682',
      id_user: 8,
      name: 'Curso de Javascript',
      payment_type: 'single',
      content_delivery: 'membership',
      cover: null,
      warranty: 7,
      sales_page_url: null,
      support_email: null,
      nickname: null,
      logo: 'https://arquivos-mango5.s3.sa-east-1.amazonaws.com/1650907206860-dba1370e-c27e-43f0-81b7-b41320bcda0d-1%20zFOmo73YnwZzrrTXZouEGQ.png',
      hex_color: '#24292f',
      creditcard_descriptor: '',
      created_at: '2022-04-25 12:43:50',
      updated_at: '2022-04-25 17:20:18',
      support_whatsapp: null,
      visible: null,
      id_type: 1,
      category: 24,
      cover_key: null,
      logo_key:
        '1650907206860-dba1370e-c27e-43f0-81b7-b41320bcda0d-1 zFOmo73YnwZzrrTXZouEGQ.png',
      description: null,
      sidebar_picture:
        'https://arquivos-mango5.s3.sa-east-1.amazonaws.com/1650907215878-dba1370e-c27e-43f0-81b7-b41320bcda0d-1%20zFOmo73YnwZzrrTXZouEGQ.png',
      header_picture:
        'https://arquivos-mango5.s3.sa-east-1.amazonaws.com/1650907211770-dba1370e-c27e-43f0-81b7-b41320bcda0d-1%20zFOmo73YnwZzrrTXZouEGQ.png',
      thumbnail: null,
      sidebar_key:
        '1650907215878-dba1370e-c27e-43f0-81b7-b41320bcda0d-1 zFOmo73YnwZzrrTXZouEGQ.png',
      header_key:
        '1650907211770-dba1370e-c27e-43f0-81b7-b41320bcda0d-1 zFOmo73YnwZzrrTXZouEGQ.png',
      thumbnail_key: null,
      excerpt: null,
      certificate: null,
      allow_affiliate: 0,
      folder_uri: null,
      certificate_key: null,
      files_description: null,
      deleted_at: null,
      checkout_description: null,
      header_picture_mobile:
        'https://arquivos-mango5.s3.sa-east-1.amazonaws.com/1650907213657-dba1370e-c27e-43f0-81b7-b41320bcda0d-1%20zFOmo73YnwZzrrTXZouEGQ.png',
      header_picture_mobile_key:
        '1650907213657-dba1370e-c27e-43f0-81b7-b41320bcda0d-1 zFOmo73YnwZzrrTXZouEGQ.png',
      ebook_cover: null,
      ebook_cover_key: null,
      biography: null,
      favicon:
        'https://arquivos-mango5.s3.sa-east-1.amazonaws.com/1650907208913-dba1370e-c27e-43f0-81b7-b41320bcda0d-1%20zFOmo73YnwZzrrTXZouEGQ.png',
      favicon_key:
        '1650907208913-dba1370e-c27e-43f0-81b7-b41320bcda0d-1 zFOmo73YnwZzrrTXZouEGQ.png',
      banner: null,
      banner_key: null,
      banner_mobile: null,
      banner_mobile_key: null,
    },
    invite: {
      id: 1,
      id_productor: 8,
      id_coproducer: 3,
      id_product: 21,
      status: 2,
      commission_percentage: 15.0,
      expires_at: '2022-05-02 17:18:46',
      created_at: '2022-04-25 17:18:46',
      updated_at: '2022-04-25 17:19:32',
      uuid: '3e7b9b55-3725-473e-a896-29f11a218e49',
    },
  },
];

module.exports = class CoproductionsRepositoryMemory {
  // eslint-disable-next-line no-unused-vars
  static async create(data, t = null) {
    return new Promise((resolve) => {
      const coproduction = {
        ...coproductions[0],
        ...data,
        uuid: uuid.v4(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      coproductions.push(coproduction);
      resolve(coproduction);
    });
  }

  static async find(where) {
    return new Promise((resolve) => {
      const { id_product, id_user, status, uuid: uuidParam, id } = where;
      if (Object.keys(where).length === 0) return resolve(coproductions[0]);
      let result = coproductions;
      if (uuid) {
        result = result.filter((c) => c.uuid === uuidParam);
        if (result.length === 0) return resolve(null);
      }

      if (id) {
        result = result.filter((c) => c.id === id);
        if (result.length === 0) return resolve(null);
      }

      if (id_product) {
        result = result.filter((c) => c.id_product === id_product);
        if (result.length === 0) return resolve(null);
      }

      if (id_user) {
        result = result.filter((r) => r.id_user === id_user);
        if (result.length === 0) return resolve(null);
      }

      if (status) {
        if (Array.isArray(status)) {
          result = result.filter((r) => status.includes(r.status));
        } else {
          result = result.filter((r) => r.status === status);
        }
        if (result.length === 0) return resolve(null);
      }

      if (result.length === 0) return resolve(null);

      return resolve(result[0]);
    });
  }

  static async findAll(where) {
    return new Promise((resolve) => {
      const { id_product, id_user, status, uuid: uuidParam } = where;
      if (Object.keys(where).length === 0) return resolve(coproductions);
      let result = coproductions;
      if (uuid) {
        result = coproductions.filter((c) => c.uuid === uuidParam);
        if (result.length === 0) return resolve([]);
      }
      if (id_product) {
        result = coproductions.filter((c) => c.id_product === id_product);
        if (result.length === 0) return resolve([]);
      }

      if (id_user) {
        result = result.filter((r) => r.id_user === id_user);
        if (result.length === 0) return resolve([]);
      }

      if (status) {
        if (Array.isArray(status)) {
          result = result.filter((r) => status.includes(r.status));
        } else {
          result = result.filter((r) => r.status === status);
        }
        if (result.length === 0) return resolve([]);
      }

      return resolve(result);
    });
  }

  static async update(where, data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise((resolve) => {
      const coproduction = coproductions.find((c) => c.id === where.id);
      if (!coproduction) return resolve(null);
      const index = coproductions.findIndex((c) => c.id === coproduction.id);
      coproductions[index] = {
        ...coproduction,
        ...data,
      };

      return resolve();
    });
  }

  static async findAllRaw(where) {
    return new Promise((resolve) => {
      const { id_product, id_user, status, uuid: uuidParam } = where;
      if (Object.keys(where).length === 0) return resolve(coproductions);
      let result = coproductions;
      if (uuid) {
        result = coproductions.filter((c) => c.uuid === uuidParam);
        if (result.length === 0) return resolve([]);
      }
      if (id_product) {
        result = coproductions.filter((c) => c.id_product === id_product);
        if (result.length === 0) return resolve([]);
      }

      if (id_user) {
        result = result.filter((r) => r.id_user === id_user);
        if (result.length === 0) return resolve([]);
      }

      if (status) {
        if (Array.isArray(status)) {
          result = result.filter((r) => status.includes(r.status));
        } else {
          result = result.filter((r) => r.status === status);
        }
        if (result.length === 0) return resolve([]);
      }

      return resolve(result);
    });
  }
};
