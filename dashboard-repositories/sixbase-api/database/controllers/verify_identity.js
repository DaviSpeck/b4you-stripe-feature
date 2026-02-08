const VerifyIdentity = require('../models/Verify_identity');

const createVerifyIdentity = async (data) => VerifyIdentity.create(data);

const findVerifyIdentity = async (where) => VerifyIdentity.findOne({ where });

module.exports = {
  createVerifyIdentity,
  findVerifyIdentity,
};
