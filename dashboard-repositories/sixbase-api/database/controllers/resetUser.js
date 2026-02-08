const ResetUser = require('../models/Reset_user');
const Users = require('../models/Users');

const createResetUserPassword = async (resetObject) => {
  const reset = await ResetUser.create(resetObject);
  return reset;
};

const findResetUserByUUID = async (uuid) => {
  const reset = await ResetUser.findOne({
    raw: true,
    nest: true,
    where: {
      uuid,
    },
    include: [
      {
        model: Users,
        as: 'user',
      },
    ],
  });

  return reset;
};

const deleteResetUserRequest = async (id) => {
  const deleted = await ResetUser.destroy({
    where: {
      id,
    },
  });
  return deleted;
};

const findResetRequestByIdUser = async (id_user) => {
  const reset = await ResetUser.findOne({
    where: {
      id_user,
    },
  });
  return reset;
};

module.exports = {
  createResetUserPassword,
  deleteResetUserRequest,
  findResetRequestByIdUser,
  findResetUserByUUID,
};
