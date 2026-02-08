const { Op } = require('sequelize');
const Collaborators = require('../models/Collaborators');
const Users = require('../models/Users');
const Verify_identity = require('../models/Verify_identity');
const Onboarding = require('../models/Onboarding');
const Form_user_profiles = require('../models/Form_user_profiles');

const createUser = async (userObject, t = null) => {
  try {
    const user = await Users.create(userObject, t ? { transaction: t } : null);
    return user.toJSON();
  } catch (error) {
    throw error;
  }
};

const updateAddress = async (id, addressObject) => {
  try {
    const address = await Users.update(addressObject, {
      where: {
        id,
      },
    });
    return address;
  } catch (error) {
    throw error;
  }
};

const updateBankAccount = async (id, bankObject) => {
  try {
    const bank = await Users.update(bankObject, {
      where: {
        id,
      },
    });
    return bank;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, userObject) => {
  try {
    const user = await Users.update(userObject, {
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async (email) => {
  const user = await Users.findOne({
    where: { email, active: true },
    include: [
      {
        model: Collaborators,
        as: 'collaborations',
        required: false,
        where: {
          id_status: 2,
        },
        include: [
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
    ],
  });
  if (user) return user.toJSON();
  return user;
};

const findUserByUUID = async (uuid) => {
  try {
    const user = await Users.findOne({
      raw: true,
      where: { uuid },
    });
    return user;
  } catch (error) {
    throw error;
  }
};

const findUserByID = async (id) => {
  const user = await Users.findByPk(id, {
    include: [
      {
        model: Verify_identity,
        as: 'verify_identity',
        limit: 1,
        required: false,
        order: [['updated_at', 'DESC']],
      },
      {
        model: Collaborators,
        as: 'collaborations',
        required: false,
        where: {
          id_status: 2,
        },
        include: [
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
    ],
  });

  if (user) return user.toJSON();
  return user;
};

const findOnboardingByUserID = async (id) => {
  const onboarding = await Onboarding.findOne({
    where: {
      id_user: id,
    },
  });

  if (onboarding) return onboarding.toJSON();
  return onboarding;
};

const findUserOnboardingProfile = async (id_user) => {
  const profile = await Form_user_profiles.findOne({
    where: {
      id_user,
      completed_at: { [Op.ne]: null },
    },
    attributes: ['id', 'completed_at', 'form_type', 'form_version'],
  });

  return profile ? profile.toJSON() : null;
};

const findUser = async (where) =>
  Users.findOne({
    where,
  });

const findUserByEmailOrDocument = async ({ email, document_number }) =>
  Users.findOne({
    where: {
      [Op.or]: {
        email,
        document_number,
      },
    },
  });

module.exports = {
  createUser,
  findOnboardingByUserID,
  findUserOnboardingProfile,
  findUser,
  findUserByEmail,
  findUserByEmailOrDocument,
  findUserByID,
  findUserByUUID,
  updateAddress,
  updateBankAccount,
  updateUser,
};
