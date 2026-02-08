const Logs_backoffice = require('../models/Logs_backoffice');

const createLogBackoffice = async (data, t = -null) =>
  Logs_backoffice.create(data, t ? { transaction: t } : null);

const findOneLogBackoffice = async (where) =>
  Logs_backoffice.findOne({ where });

const findLogsPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);

  const logs = await Logs_backoffice.findAndCountAll({
    where,
    subQuery: false,
    include: [
      {
        association: 'user',
        attributes: ['full_name'],
      },
      {
        association: 'user_client',
        attributes: ['full_name', 'uuid'],
        required: false,
      },
    ],
    offset,
    limit,
    order: [['created_at', 'desc']],
  });
  return logs;
};

const findAllLogs = async (where) => {
  const logs = await Logs_backoffice.findAndCountAll({
    where,
    subQuery: false,
    include: [
      {
        association: 'user',
      },
    ],
  });
  return logs;
};
module.exports = {
  createLogBackoffice,
  findOneLogBackoffice,
  findLogsPaginated,
  findAllLogs,
};
