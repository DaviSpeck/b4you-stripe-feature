const router = require('express').Router();
const ApiError = require('../../error/ApiError');

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
router.get('/:referral_code', async (req, res, next) => {
  const {
    params: { referral_code },
    cookies,
  } = req;
  try {
    const { b4youReferral } = cookies;
    if (!b4youReferral) {
      res.cookie('b4youReferral', referral_code, {
        maxAge: THIRTY_DAYS,
        sameSite: 'none',
        secure: true,
        httpOnly: true,
        domain: '.b4you.com.br',
      });
    }
    res.set(
      'Location',
      `https://${process.env.ENVIRONMENT === 'PRODUCTION' ? 'dash' : 'sandbox-dash'
      }.b4you.com.br/cadastrar`,
    );
    return res.status(301).end();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

module.exports = router;
