const router = require('express').Router();
const ReferralProgram = require('../../database/models/ReferralProgram');
const ReferralBalance = require('../../database/models/ReferralBalance');
const ReferralCommissions = require('../../database/models/ReferralCommissions');
const ReferralUsers = require('../../database/models/ReferralUsers');
const { findReferralStatus } = require('../../status/referralStatus');
const {
  findReferralCommissionStatus,
} = require('../../status/referralCommissionStatus');
const ApiError = require('../../error/ApiError');

router.post('/', async (req, res, next) => {
  const {
    owner: { id: id_user },
  } = req;
  try {
    const alreadyOnReferralProgram = await ReferralProgram.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        id_user,
      },
    });
    if (alreadyOnReferralProgram)
      throw ApiError.badRequest(
        'Você já participa do programa de indique e ganhe.',
      );
    const referral = await ReferralProgram.create({
      id_user,
      percentage: 1,
      id_status: findReferralStatus('active').id,
    });
    await ReferralBalance.create({
      id_user,
    });
    return res.status(200).send({
      active_referral: 0,
      code: referral.code,
      available_balance: 0,
      pending_balance: 0,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

router.get('/', async (req, res, next) => {
  const {
    owner: { id: id_user },
  } = req;
  try {
    const referralProgram = await ReferralProgram.findOne({
      raw: true,
      attributes: ['code'],
      where: {
        id_user,
      },
    });

    if (!referralProgram) return res.status(200).send({ has_referral: false });
    const [available_balance, active_referral, pending_balance] =
      await Promise.all([
        ReferralBalance.findOne({
          raw: true,
          where: { id_user },
          attributes: ['total'],
        }),
        ReferralUsers.count({
          where: { id_user },
        }),
        ReferralCommissions.sum('amount', {
          where: {
            id_user,
            id_status: findReferralCommissionStatus('release-pending').id,
          },
        }),
      ]);
    return res.status(200).send({
      active_referral,
      has_referral: true,
      code: `https://b4you.com.br/r/${referralProgram.code}`,
      available_balance: available_balance.total,
      pending_balance,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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
