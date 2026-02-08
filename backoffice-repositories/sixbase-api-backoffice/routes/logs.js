const router = require('express').Router();
const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const {
  findLogsPaginated,
} = require('../database/controllers/logs_backoffice');
const SerializeLogs = require('../presentation/user_logs/get');
const { userEventsTypes } = require('../types/userEvents');
const Users_backoffice = require('../database/models/Users_backoffice');
const User_login_logs = require('../database/models/User_login_logs');
const Users = require('../database/models/Users');

router.get('/', async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      event = 'all',
      id_user = 'all',
      input = 'all',
    },
  } = req;
  try {
    let where = {};
    if (input !== 'all') {
      where = {
        [Op.or]: [
          { '$user_client.email$': { [Op.like]: `%${input}%` } },
          { id_user: null },
        ],
      };
    }
    if (event !== 'all') {
      where.id_event = event;
    }
    if (id_user !== 'all') {
      where.id_user_backoffice = id_user;
    }
    const { rows, count } = await findLogsPaginated(where, page, size);
    return res.send({
      count,
      rows: new SerializeLogs(rows).adapt(),
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
});

router.get('/users', async (req, res, next) => {
  try {
    const Users = await Users_backoffice.findAll({
      attributes: ['id', 'full_name'],
      raw: true,
    });
    return res.send(Users);
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
});

router.get('/types', async (req, res, next) => {
  try {
    return res.send({
      events: userEventsTypes,
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
});

router.get('/ips', async (req, res, next) => {
  const {
    query: { user_uuid },
  } = req;
  try {
    const user = await Users.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        uuid: user_uuid,
      },
    });
    const logs = await User_login_logs.findAndCountAll({
      order: [['id', 'desc']],
      where: {
        id_user: user.id,
      },
      limit: 20,
    });
    return res.status(200).send(logs);
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
});

module.exports = router;
