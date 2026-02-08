const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const Blacklist = require('../database/models/Blacklist');
const Blocks = require('../database/models/Blocks');
const Sales_blacklist = require('../database/models/Sales_blacklist');
const { findsaleBlocksStatusByKey } = require('../status/saleBlocks');
const { findTypeBlockByKey } = require('../types/blackBlockTypes');
const { findBlockReasonByKey } = require('../types/blackBlockReasons');
const { findBlockTypes } = require('../types/blockTypes');
const { findSalesStatusByKey } = require('../status/salesStatus');
const clearSaleService = require('../services/ClearSale');
const CreateRefund = require('../useCases/refunds/CreateRefund');
const HttpClient = require('../services/HTTPClient');
const {
  createLogBackoffice,
} = require('../database/controllers/logs_backoffice');
const { findRoleTypeByKey } = require('../types/userEvents');

module.exports.findBlacklist = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null },
  } = req;
  try {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const where = {
      id_type: {
        [Op.notIn]: [7],
      },
    };
    if (input) {
      where.data = input;
    }
    const { rows, count } = await Blacklist.findAndCountAll({
      offset,
      limit,
      where,
      order: [['id', 'desc']],
    });
    return res.send({
      count,
      rows: rows.map((r) => r.toJSON()),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.setBlacklist = async (req, res, next) => {
  try {
    const {
      body: { id, active = true },
    } = req;

    await Blacklist.update({ active }, { where: { id } });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getSales = async (req, res, next) => {
  const {
    query: { page = 0, size = 10 },
  } = req;

  const offset = Number(page) * Number(size);
  const limit = Number(size);
  try {
    const result = await Sales_blacklist.findAndCountAll({
      offset,
      limit,
      distinct: true,
      where: {
        id_status: findsaleBlocksStatusByKey('pending').id,
      },
      include: [
        {
          association: 'sale',
          required: true,
          include: [
            {
              association: 'products',
              required: true,
              attributes: [
                'id_student',
                'id_product',
                'id_status',
                'price',
                'payment_method',
                'paid_at',
              ],
              where: {
                id_status: findSalesStatusByKey('paid').id,
              },
              include: [
                {
                  association: 'student',
                  attributes: ['email', 'full_name', 'document_number', 'uuid'],
                },
                {
                  association: 'product',
                  attributes: ['name', 'uuid', 'id_type'],
                  paranoid: false,
                  include: [
                    {
                      association: 'producer',
                      attributes: ['id', 'uuid', 'full_name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          association: 'blacklist',
          where: {
            id_reason: 8,
          },
        },
      ],
    });
    return res.send({
      count: result.count,
      rows: result.rows.map((r) => r.toJSON()),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getOldSales = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null },
  } = req;
  try {
    let where = null;
    if (input) {
      if (input.includes('@')) {
        where = { email: input };
      } else if (/\d/.test(input)) {
        where = { document_number: input.replace(/\D/g, '') };
      } else {
        where = { full_name: { [Op.like]: `%${input}%` } };
      }
    }
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const count = await Sales_blacklist.count({
      where: {
        id_status: [
          findsaleBlocksStatusByKey('refunded').id,
          findsaleBlocksStatusByKey('trust').id,
        ],
      },
    });

    const rows = await Sales_blacklist.findAll({
      offset,
      limit,
      order: [['id', 'desc']],
      where: {
        id_status: [
          findsaleBlocksStatusByKey('refunded').id,
          findsaleBlocksStatusByKey('trust').id,
        ],
      },
      include: [
        {
          association: 'sale',
          where,
          include: [
            {
              association: 'products',
              include: [
                { association: 'student' },
                {
                  association: 'product',
                  paranoid: false,
                  include: [
                    {
                      association: 'producer',
                      attributes: ['id', 'full_name', 'uuid'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          association: 'blacklist',
        },
      ],
    });
    return res.send({
      count,
      rows: rows.map((r) => r.toJSON()),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.setAction = async (req, res, next) => {
  try {
    const {
      body: {
        id,
        refund = null,
        sale_items_uuids,
        bank_code,
        agency: account_agency,
        account_number,
        account_type,
        id_sale,
        id_user_sale,
      },
      user: { id: id_user_backoffice },
    } = req;
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    let bankAccount = {};
    if (bank_code && account_agency && account_number && account_type) {
      bankAccount = {
        bank_code,
        account_number,
        account_agency,
        account_type,
      };
    }

    if (refund)
      for await (const uuid of sale_items_uuids) {
        await new CreateRefund({
          saleUuid: uuid,
          bankAccount,
          reason: 'Reembolso manual pelo antifraude interno',
        }).execute();
      }

    const id_status = refund
      ? findsaleBlocksStatusByKey('refunded').id
      : findsaleBlocksStatusByKey('trust').id;

    await createLogBackoffice({
      id_user_backoffice,
      id_event:
        id_status === 2
          ? findRoleTypeByKey('blacklist-refund-sale').id
          : findRoleTypeByKey('blackslit-trust-sale').id,
      params: {
        user_agent,
        id_sale,
      },
      ip_address,
      id_user: id_user_sale,
    });

    await Sales_blacklist.update({ id_status }, { where: { id } });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const {
      body: { inputBlock, typeBlock },
    } = req;
    await Blacklist.create({
      data: inputBlock,
      id_type: findTypeBlockByKey(typeBlock).id,
      active: true,
      id_reason: findBlockReasonByKey('support').id,
    });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getBlocks = async (req, res, next) => {
  const {
    query: { input, typeBlock },
  } = req;
  try {
    const where = {
      id_type: { [Op.notIn]: [1, 7] },
      active: true,
    };
    if (typeBlock === 'email') {
      where.email = input;
    } else {
      where.document_number = input;
    }
    const blocks = await Blocks.findAll({
      where,
      attributes: ['id', 'id_type', 'created_at'],
    });
    const newBlocks = blocks.map((e) => ({
      id: e.id,
      blockType: findBlockTypes(e.id_type).label,
      created_at: e.created_at,
    }));
    return res.status(200).send(newBlocks);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.removeBlock = async (req, res, next) => {
  const { ids } = req.body;
  const API_TOKEN = process.env.BACKOFFICE_TOKEN_OFFER_CACHE;
  const service = new HttpClient({
    baseURL: `https://api-b4.b4you.com.br/api/backoffice/`,
  });

  try {
    const blocks = await Blocks.findAll({ where: { id: ids } });

    const requests = blocks.map((block) => {
      const blockType = findBlockTypes(block.id_type)?.key;

      if (!blockType) return null;

      let key;
      switch (blockType) {
        case 'fingerprint':
          key = `visitor_id:${block.visitorId}`;
          break;
        case 'ip':
          key = `ip:${block.ip}`;
          break;
        case 'card':
          key = `card:${block.body.card.card_number}:${block.body.offer_id}:${block.email}`;
          break;
        case 'offer-email':
          key = `offer_email:${block.body.offer_id}:${block.email}`;
          break;
        case 'session':
          key = `session_id:${block.body.sessionID}`;
          break;
        case 'offer-customer-name':
          key = `offer_name:${block.body.offer_id}:${block.full_name}`;
          break;
        default:
          return null;
      }
      return service.post('offer/blocks', {
        key,
        token: API_TOKEN,
      });
    });
    await Promise.all(requests.filter(Boolean));
    await Blocks.update(
      { active: false },
      {
        where: {
          id: {
            [Op.in]: ids,
          },
        },
      },
    );
    return res.status(200).send(blocks);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);

    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.score = async (req, res, next) => {
  try {
    const {
      body: { id },
    } = req;
    const blacklist = await Sales_blacklist.findOne({
      where: { id, transaction_id: null },
      include: [
        {
          association: 'sale',
          attributes: [
            'document_number',
            'full_name',
            'email',
            'whatsapp',
            'address',
            'uuid',
          ],
        },
      ],
    });
    if (!blacklist) return res.sendStatus(200);
    const transaction = {
      cpf: blacklist.sale.document_number,
      name: blacklist.sale.full_name,
      email: blacklist.sale.email,
      uuid_sale: blacklist.sale.uuid,
      whatsapp: blacklist.sale.whatsapp,
      address: blacklist.sale.address,
    };
    const data = await clearSaleService.createTransaction(transaction);
    if (data && data.transaction_id) {
      console.log(
        `data clear response ${JSON.stringify(
          blacklist.sale,
        )} -> data ${JSON.stringify(data)}`,
      );
      await Sales_blacklist.update(
        {
          transaction_id: data.transaction_id,
          antifraud_response: data.data[0],
        },
        {
          where: {
            id: blacklist.id,
          },
        },
      );
    }
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
