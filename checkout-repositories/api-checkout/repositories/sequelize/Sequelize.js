const { Op } = require('sequelize');
const models = require('../../database/models/index');

module.exports = models.sequelize;

module.exports.OP = Op;
