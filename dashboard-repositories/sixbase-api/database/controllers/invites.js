const Invites = require('../models/Invites');

const createInvite = async () => Invites.create();

const updateInvite = async (where, data) =>
  Invites.update(data, {
    where,
  });

const findOneInvite = async (where) =>
  Invites.findOne({
    where,
  });

module.exports = {
  createInvite,
  updateInvite,
  findOneInvite,
};
