const express = require('express');

const router = express.Router();
const Sales_items = require('../../database/models/Sales_items');
const Students = require('../../database/models/Students');
const Affiliates = require('../../database/models/Affiliates');
const Products = require('../../database/models/Products');
const Product_offer = require('../../database/models/Product_offer');
const Coupons = require('../../database/models/Coupons');
const ApiError = require('../../error/ApiError');

router.get('/sale/:id', async (req, res, next) => {
  const {
    params: { id },
    user: { id: id_owner },
  } = req;
  try {
    const sale_item = await Sales_items.findOne({
      raw: true,
      attributes: ['id_product', 'id_affiliate', 'id_student'],
      where: { uuid: id },
      include: [
        {
          association: 'product',
          attributes: ['id'],
          where: {
            id_user: id_owner,
          },
        },
      ],
    });
    if (!sale_item) {
      return res.status(400).send({ message: 'Venda não encontrada' });
    }

    const response = {};
    response.id_product = sale_item.id_product;
    const student = await Students.findOne({
      raw: true,
      attributes: [
        'full_name',
        'whatsapp',
        'email',
        'document_number',
        'address',
      ],
      where: { id: sale_item.id_student },
    });
    const { document_number, ...s } = student;
    response.student = { ...s, cpf: document_number };

    if (sale_item.id_affiliate) {
      const aff = await Affiliates.findOne({
        nest: true,
        attributes: ['id', 'commission', 'uuid'],
        where: { id: sale_item.id_affiliate },
        include: [
          {
            association: 'user',
            attributes: ['full_name', 'email', 'id'],
          },
        ],
      });
      response.affiliate = {
        ...aff.user.toJSON(),
        commissions: aff.commission,
        uuid: aff.uuid,
      };
    }
    return res.status(200).send(response);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get('/products', async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const products = await Products.findAll({
      raw: true,
      where: {
        id_user,
      },
      attributes: ['id', 'name'],
    });
    return res.status(200).send(products);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get('/product/:id_product', async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { id_product },
  } = req;
  try {
    const product = await Products.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        id_user,
        id: id_product,
      },
    });
    if (!product) return res.sendStatus(400);
    const [offers, affiliates, coupons] = await Promise.all([
      Product_offer.findAll({
        raw: true,
        attributes: ['id', 'uuid', 'price', 'name'],
        where: {
          id_product,
          allow_affiliate: 1,
          active: 1,
        },
        order: [['name', 'ASC']],
      }),

      Affiliates.findAll({
        attributes: ['id', 'uuid'],
        where: {
          id_product,
          status: 2,
        },
        include: [
          {
            association: 'user',
            attributes: ['full_name', 'email'],
          },
        ],
        order: [['id', 'ASC']],
      }),

      Coupons.findAll({
        raw: true,
        attributes: ['coupon'],
        where: { id_product },
        order: [['coupon', 'ASC']],
      }),
    ]);
    return res.status(200).send({
      offers,
      affiliates: affiliates.map((a) => ({
        uuid: a.uuid,
        full_name: a.user.full_name,
        email: a.user.email,
      })),
      coupons,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

module.exports = router;
