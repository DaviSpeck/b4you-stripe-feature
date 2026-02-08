const router = require('express').Router();
const Affiliates = require('../database/models/Affiliates');
const date = require('../utils/helpers/date');
const uuid = require('../utils/helpers/uuid');
const { createCookie } = require('../database/controllers/cookies_jar');
const { getCookieOptions } = require('../utils/getCookieOptions');

const TEN_YEARS = 365 * 10 * 24 * 60 * 60 * 1000;
router.get('/', async (req, res) => {
  const { affiliate } = req;
  try {
    const aff = await Affiliates.findOne({
      raw: true,
      where: {
        uuid: affiliate,
        status: 2,
      },
      attributes: ['id', 'id_product'],
      // eslint-disable-next-line
      logging: console.log,
    });
    if (!aff) {
      return res.sendStatus(404);
    }
    let { sixid } = req.cookies;
    if (!sixid) {
      sixid = uuid.nanoid();

      const cookieOptions = getCookieOptions(req);

      res.cookie('sixid', sixid, {
        maxAge: TEN_YEARS,
        httpOnly: true,
        ...cookieOptions,
      });
    }
    await createCookie({
      id_offer: 0,
      id_affiliate: aff.id,
      id_product: aff.id_product,
      sixid,
      max_age: date().add(24, 'h'),
    });
    return res.sendStatus(200);
  } catch (error) {
    // eslint-disable-next-line
    console.log('error while getting affiliate -> ', error);
    return res.sendStatus(500);
  }
});
module.exports = router;
