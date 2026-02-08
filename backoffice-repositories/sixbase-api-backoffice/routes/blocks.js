const express = require('express');

const router = express.Router();
const Blocks = require('../database/models/Blocks');
const ApiError = require('../error/ApiError');
const { blockTypeTypes } = require('../types/blockTypes');

const blockTypesMap = new Map(
  blockTypeTypes.map((type) => [type.id, type.label]),
);

const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length <= 6) return cardNumber;
  return '*'.repeat(cardNumber.length - 6) + cardNumber.slice(-6);
};

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const size = Math.min(Math.max(1, parseInt(req.query.size, 10) || 10), 100);

    const limit = size;
    const offset = limit * page;

    const blocks = await Blocks.findAndCountAll({
      attributes: [
        'id',
        'email',
        'phone',
        'full_name',
        'document_number',
        'ip',
        'id_type',
        'address',
        'cookies',
        'created_at',
        'body',
      ],
      order: [['id', 'desc']],
      raw: true,
      limit,
      offset,
    });

    const data = blocks.rows.map((block) => {
      const typeLabel = blockTypesMap.get(block.id_type) || 'Desconhecido';

      let cardData = null;
      let offerId = null;

      if (block.body && typeof block.body === 'object') {
        if (block.body.card && typeof block.body.card === 'object') {
          cardData = {
            cvv: block.body.card.cvv,
            card_holder: block.body.card.card_holder,
            card_number: maskCardNumber(block.body.card.card_number),
            installments: block.body.card.installments,
            expiration_date: block.body.card.expiration_date,
          };
        }
        offerId = block.body.offer_id;
      }

      return {
        id: block.id,
        email: block.email,
        phone: block.phone,
        full_name: block.full_name,
        document_number: block.document_number,
        ip: block.ip,
        type: typeLabel,
        address: block.address,
        cookies: block.cookies,
        created_at: block.created_at,
        body: {
          card: cardData,
          offer_id: offerId,
        },
      };
    });

    return res.status(200).json({
      count: blocks.count,
      rows: data,
      pagination: {
        page,
        size,
        totalPages: Math.ceil(blocks.count / size),
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).json(error);
    }

    console.error('Error in blocks route:', error);

    return next(
      ApiError.internalservererror(
        `Internal Server Error: GET ${req.originalUrl}`,
        error,
      ),
    );
  }
});

module.exports = router;
