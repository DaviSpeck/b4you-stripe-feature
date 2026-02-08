const router = require('express').Router();
const ApiError = require('../error/ApiError');
const CreateRefund = require('../useCases/refunds/CreateRefund');

const { BACKOFFICE_TOKEN_KONDUTO } = process.env;

router.post('/refund', async (req, res, next) => {
  const {
    body: { sales_items_uuids },
  } = req;
  console.log('req headers', req.headers, BACKOFFICE_TOKEN_KONDUTO);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('sem header');
    return res.status(401).json({ error: 'Token não enviado' });
  }
  try {
    const token = authHeader.split(' ')[1];
    console.log('token', token);
    if (BACKOFFICE_TOKEN_KONDUTO === token) {
      for await (const uuid of sales_items_uuids) {
        await new CreateRefund({
          saleUuid: uuid,
          bankAccount: null,
          reason: 'Reembolso solicitado pela Konduto via webhook',
        }).execute();
      }
    } else {
      console.log('invalid token');
      return res.status(500).send('invalid token');
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log('KONDUTO REFUND ERROR', error);
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
});

module.exports = router;
