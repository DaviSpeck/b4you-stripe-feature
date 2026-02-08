const { Op, Sequelize } = require('sequelize');
const ApiError = require('../error/ApiError');
const BackofficeNotes = require('../database/models/Backoffice_notes');
const Users = require('../database/models/Users');
const Users_backoffice = require('../database/models/Users_backoffice');
const date = require('../utils/helpers/date');
const {
  findNoteType,
  findNoteTypeById,
  findFollowupStatus,
  findFollowupStatusById,
} = require('../types/noteTypes');

const parseNumber = (value) => {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

module.exports.list = async (req, res, next) => {
  const {
    page = 0,
    size = 20,
    type = null,
    manager_id = null,
    followup_status = null,
    start_date = null,
    end_date = null,
    revenue_min = null,
    revenue_max = null,
  } = req.query;

  try {
    const limit = Number(size) || 20;
    const offset = (Number(page) || 0) * limit;

    const whereNotes = { deleted_at: null };

    if (type) {
      const typeInfo = findNoteType(type);
      if (typeInfo) {
        whereNotes.type =
          typeInfo.key === 'administrative'
            ? { [Op.or]: [typeInfo.id, null] }
            : typeInfo.id;
      }
    }

    if (followup_status) {
      const followupInfo = findFollowupStatus(followup_status);
      if (followupInfo) whereNotes.followup_status = followupInfo.id;
    }

    if (start_date || end_date) {
      whereNotes.created_at = {};
      if (start_date) whereNotes.created_at[Op.gte] = new Date(start_date);
      if (end_date) whereNotes.created_at[Op.lte] = new Date(end_date);
    }

    const revenueMin = parseNumber(revenue_min);
    const revenueMax = parseNumber(revenue_max);

    const includeUser = {
      model: Users,
      as: 'user',
      attributes: ['id', 'uuid', 'full_name', 'id_manager', 'annual_revenue'],
      required: false,
    };

    if (manager_id) {
      includeUser.where = { id_manager: manager_id };
      includeUser.required = true;
    }

    if (revenueMin !== null || revenueMax !== null) {
      includeUser.where = {
        ...(includeUser.where || {}),
        annual_revenue: {
          ...(revenueMin !== null && { [Op.gte]: revenueMin }),
          ...(revenueMax !== null && { [Op.lte]: revenueMax }),
        },
      };
      includeUser.required = true;
    }

    const includeAuthor = {
      model: Users_backoffice,
      as: 'user_backoffice',
      attributes: ['id', 'full_name', 'email'],
      required: false,
    };

    const total = await BackofficeNotes.count({
      distinct: true,
      col: 'uuid',
      where: whereNotes,
      include: [includeUser],
    });

    const latestPerUuid = await BackofficeNotes.findAll({
      raw: true,
      where: whereNotes,
      include: [includeUser],
      attributes: [
        'uuid',
        [Sequelize.fn('MAX', Sequelize.col('version')), 'max_version'],
        [
          Sequelize.fn(
            'MAX',
            Sequelize.col('backoffice_notes.created_at')
          ),
          'latest_created_at',
        ],
      ],
      group: ['backoffice_notes.uuid'],
      order: [[Sequelize.literal('latest_created_at'), 'DESC']],
      limit,
      offset,
    });

    const versionPairs = latestPerUuid.map((item) => ({
      uuid: item.uuid,
      version: item.max_version,
    }));

    const rows = versionPairs.length
      ? await BackofficeNotes.findAll({
        raw: true,
        nest: true,
        where: {
          ...whereNotes,
          [Op.or]: versionPairs,
        },
        include: [includeUser, includeAuthor],
        attributes: [
          'id',
          'uuid',
          'version',
          'note',
          'type',
          'summary',
          'next_action',
          'pending_points',
          'additional_notes',
          'followup_status',
          'next_contact_at',
          'created_at',
        ],
        order: [[Sequelize.col('backoffice_notes.created_at'), 'DESC']],
      })
      : [];

    const data = rows.map((row) => {
      const mappedType = findNoteTypeById(row.type) || findNoteType(row.type);
      const mappedFollowup =
        row.followup_status !== null && row.followup_status !== undefined
          ? findFollowupStatusById(row.followup_status) ||
          findFollowupStatus(row.followup_status)
          : null;

      return {
        id: row.id,
        uuid: row.uuid,
        version: row.version,
        type: mappedType ? mappedType.key : row.type,
        summary: row.summary,
        next_action: row.next_action,
        pending_points: row.pending_points,
        additional_notes: row.additional_notes,
        followup_status: mappedFollowup
          ? mappedFollowup.key
          : row.followup_status,
        next_contact_at: row.next_contact_at,
        note: row.note,
        created_at: row.created_at
          ? date(row.created_at)
            .utcOffset(-3, true)
            .format('DD/MM/YYYY HH:mm:ss')
          : null,
        producer: row.user
          ? {
            id: row.user.id,
            uuid: row.user.uuid,
            name: row.user.full_name,
            manager_id: row.user.id_manager,
            annual_revenue: row.user.annual_revenue,
          }
          : null,
        author: row.user_backoffice
          ? {
            id: row.user_backoffice.id,
            name: row.user_backoffice.full_name,
            email: row.user_backoffice.email,
          }
          : null,
      };
    });

    return res.json({
      page: Number(page) || 0,
      size: limit,
      total,
      rows: data,
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

module.exports.history = async (req, res, next) => {
  const {
    params: { noteUuid },
  } = req;

  try {
    const rows = await BackofficeNotes.findAll({
      raw: true,
      nest: true,
      where: {
        uuid: noteUuid,
        deleted_at: null,
      },
      include: [
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'uuid', 'full_name', 'id_manager', 'annual_revenue'],
        },
        {
          model: Users_backoffice,
          as: 'user_backoffice',
          attributes: ['id', 'full_name', 'email'],
          required: false,
        },
      ],
      attributes: [
        'id',
        'uuid',
        'version',
        'note',
        'type',
        'summary',
        'next_action',
        'pending_points',
        'additional_notes',
        'followup_status',
        'next_contact_at',
        'created_at',
      ],
      order: [['version', 'DESC']],
    });

    const data = rows.map((row) => {
      const mappedType = findNoteTypeById(row.type) || findNoteType(row.type);
      const mappedFollowup =
        row.followup_status !== null && row.followup_status !== undefined
          ? findFollowupStatusById(row.followup_status) ||
          findFollowupStatus(row.followup_status)
          : null;

      return {
        id: row.id,
        uuid: row.uuid,
        version: row.version,
        type: mappedType ? mappedType.key : row.type,
        summary: row.summary,
        next_action: row.next_action,
        pending_points: row.pending_points,
        additional_notes: row.additional_notes,
        followup_status: mappedFollowup
          ? mappedFollowup.key
          : row.followup_status,
        next_contact_at: row.next_contact_at
          ? date(row.next_contact_at)
            .utcOffset(-3, true)
            .format('DD/MM/YYYY HH:mm:ss')
          : null,
        note: row.note,
        created_at: row.created_at
          ? date(row.created_at)
            .utcOffset(-3, true)
            .format('DD/MM/YYYY HH:mm:ss')
          : null,
        producer: row.user
          ? {
            id: row.user.id,
            uuid: row.user.uuid,
            name: row.user.full_name,
            manager_id: row.user.id_manager,
            annual_revenue: row.user.annual_revenue,
          }
          : null,
        author: row.user_backoffice
          ? {
            id: row.user_backoffice.id,
            name: row.user_backoffice.full_name,
            email: row.user_backoffice.email,
          }
          : null,
      };
    });

    return res.json({ rows: data });
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