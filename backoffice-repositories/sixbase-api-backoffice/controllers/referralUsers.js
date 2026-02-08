const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const Users = require('../database/models/Users');
const ReferralProgram = require('../database/models/ReferralProgram');
const ReferralBalance = require('../database/models/ReferralBalance');
const ReferralCommissions = require('../database/models/ReferralCommissions');
const {
  findReferralCommissionStatus,
} = require('../status/referralCommissionsStatus');
const { capitalizeName } = require('../utils/formatters');
const { findReferralStatus } = require('../status/referralStatus');
const ReferralUsers = require('../database/models/ReferralUsers');

module.exports.findReferralUsers = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      search = null,
      status = 'all',
      statusProducts = 'all',
    },
  } = req;

  try {
    const limit = parseInt(size, 10);
    const offset = limit * parseInt(page, 10);

    // Build where clause for search
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { full_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { document_number: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Build referral program where clause for status filter
    const referralProgramWhere = {};
    if (status !== 'all') {
      const statusId = parseInt(status, 10);
      if (!isNaN(statusId)) {
        referralProgramWhere.id_status = statusId;
      }
    }

    if (statusProducts !== 'all') {
      whereClause.referral_disabled = statusProducts === 'true';
    }

    // Get total count of users in referral program
    const totalCount = await Users.count({
      where: whereClause,
      include: [
        {
          model: ReferralProgram,
          as: 'referral_program',
          required: true,
          where: referralProgramWhere,
        },
      ],
    });

    // Get users who are part of the referral program
    const users = await Users.findAll({
      where: whereClause,
      attributes: [
        'id',
        'uuid',
        'full_name',
        'email',
        'document_number',
        'referral_disabled',
        'created_at',
      ],
      include: [
        {
          model: ReferralProgram,
          as: 'referral_program',
          required: true,
          where: referralProgramWhere,
          attributes: ['percentage', 'code', 'id_status', 'created_at'],
        },
        {
          model: ReferralBalance,
          as: 'referral_balance',
          required: false,
          attributes: ['total'],
        },
      ],
      order: [['referral_program', 'created_at', 'DESC']],
      limit,
      offset,
    });

    // Transform the data to match the expected format
    const usersWithBalance = users.map((user) => {
      const userData = user.toJSON();
      return {
        ...userData,
        referral_balance: {
          total: userData.referral_balance?.total || 0,
        },
        referral_disabled: userData.referral_disabled,
      };
    });

    // Get additional referral commission data for each user
    const usersWithCommissions = await Promise.all(
      usersWithBalance.map(async (user) => {
        const userData = user;

        // Get pending referral commissions (status 2: release-pending)
        const pendingCommissions = await ReferralCommissions.sum('amount', {
          where: {
            id_user: user.id,
            id_status: findReferralCommissionStatus('release-pending').id,
          },
        });

        // Get total earned referral commissions (pending + released)
        const totalEarned = await ReferralCommissions.sum('amount', {
          where: {
            id_user: user.id,
            id_status: {
              [Op.in]: [
                findReferralCommissionStatus('release-pending').id,
                findReferralCommissionStatus('released').id,
              ],
            },
          },
        });

        return {
          ...userData,
          full_name: capitalizeName(userData.full_name),
          referral_program: {
            percentage: userData.referral_program?.percentage || 0,
            code: userData.referral_program?.code || '',
            status: findReferralStatus(
              userData.referral_program?.id_status || 0,
            ),
            joined_at: userData.referral_program?.created_at || null,
          },
          referral_balance: userData.referral_balance?.total || 0,
          pending_commissions: pendingCommissions || 0,
          total_earned: totalEarned || 0,
        };
      }),
    );

    // Sort by referral balance in descending order
    usersWithCommissions.sort(
      (a, b) => (b.referral_balance || 0) - (a.referral_balance || 0),
    );

    return res.status(200).send({
      count: totalCount,
      rows: usersWithCommissions,
      page: parseInt(page, 10),
      size: limit,
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

module.exports.findReferralUserDetails = async (req, res, next) => {
  const {
    params: { userUuid },
  } = req;

  try {
    const user = await Users.findOne({
      where: { uuid: userUuid },
      attributes: [
        'id',
        'uuid',
        'full_name',
        'email',
        'document_number',
        'referral_disabled',
        'created_at',
      ],
      include: [
        {
          model: ReferralProgram,
          as: 'referral_program',
          required: false,
          attributes: ['percentage', 'code', 'id_status', 'created_at'],
        },
        {
          model: ReferralBalance,
          as: 'referral_balance',
          required: false,
          attributes: ['total'],
        },
      ],
    });

    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    // Check if user is part of referral program
    const hasReferralProgram = !!user.referral_program;

    // Get detailed referral commission data only if user has referral program
    let pendingCommissions = 0;
    let totalEarned = 0;
    let totalPeopleReferred = 0;
    let recentCommissions = [];

    if (hasReferralProgram) {
      totalPeopleReferred = await await ReferralUsers.count({
        where: { id_user: user.id },
      });

      pendingCommissions = await ReferralCommissions.sum('amount', {
        where: {
          id_user: user.id,
          id_status: findReferralCommissionStatus('release-pending').id,
        },
      });

      totalEarned = await ReferralCommissions.sum('amount', {
        where: {
          id_user: user.id,
          id_status: {
            [Op.in]: [
              findReferralCommissionStatus('release-pending').id,
              findReferralCommissionStatus('released').id,
            ],
          },
        },
      });

      // Get recent referral commissions with status information
      recentCommissions = await ReferralCommissions.findAll({
        where: { id_user: user.id },
        attributes: ['amount', 'id_status', 'release_date', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 10,
      });
    }

    const userData = user.toJSON();
    const response = {
      ...userData,
      full_name: capitalizeName(userData.full_name),
      has_referral_program: hasReferralProgram,
      referral_disabled: userData.referral_disabled,
      referral_program: hasReferralProgram
        ? {
            percentage: userData.referral_program?.percentage || 0,
            code: userData.referral_program?.code || '',
            status: findReferralStatus(
              userData.referral_program?.id_status || 0,
            ),
            joined_at: userData.referral_program?.created_at || null,
          }
        : null,
      referral_balance: hasReferralProgram
        ? userData.referral_balance?.total || 0
        : 0,
      pending_commissions: pendingCommissions || 0,
      total_earned: totalEarned || 0,
      total_people_referred: totalPeopleReferred,
      recent_commissions: hasReferralProgram
        ? recentCommissions.map((commission) => ({
            ...commission.toJSON(),
            status: findReferralCommissionStatus(commission.id_status),
          }))
        : [],
    };

    return res.status(200).send(response);
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

module.exports.updateReferralUserStatus = async (req, res, next) => {
  const {
    params: { userUuid },
    body: { status },
  } = req;

  try {
    // Validate status
    if (!status || typeof status !== 'number') {
      throw ApiError.badRequest('Status deve ser um número válido');
    }

    // Check if status exists in referral status
    const statusExists = findReferralStatus(status);
    if (!statusExists) {
      throw ApiError.badRequest('Status inválido');
    }

    // Find user and their referral program
    const user = await Users.findOne({
      attributes: ['id', 'uuid'],
      where: { uuid: userUuid },
    });

    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    const referralProgram = await ReferralProgram.findOne({
      attributes: ['id'],
      where: { id_user: user.id },
    });

    // if (!referralProgram) {
    //   throw ApiError.badRequest(
    //     'Usuário não faz parte do programa de indicação',
    //   );
    // }

    // Update referral program status
    await ReferralProgram.update(
      { id_status: status },
      { where: { id: referralProgram.id } },
    );

    // Get updated referral program data
    const updatedReferralProgram = await ReferralProgram.findByPk(
      referralProgram.id,
    );

    return res.status(200).send({
      message: 'Status atualizado com sucesso',
      referral_program: {
        id: updatedReferralProgram.id,
        percentage: updatedReferralProgram.percentage,
        code: updatedReferralProgram.code,
        status: findReferralStatus(updatedReferralProgram.id_status),
        joined_at: updatedReferralProgram.created_at,
      },
    });
  } catch (error) {
    console.dir(error, { depth: null });
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

module.exports.updateReferralDisabled = async (req, res, next) => {
  const {
    params: { userUuid },
    body: { referral_disabled },
  } = req;

  try {
    if (typeof referral_disabled !== 'boolean') {
      throw ApiError.badRequest('O campo referral_disabled deve ser booleano');
    }

    const user = await Users.findOne({
      where: { uuid: userUuid },
      attributes: ['id', 'uuid', 'referral_disabled'],
    });

    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    user.referral_disabled = referral_disabled;
    await user.save();

    return res.status(200).send({
      message: 'Status de referral_disabled atualizado com sucesso',
      referral_disabled: user.referral_disabled,
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
