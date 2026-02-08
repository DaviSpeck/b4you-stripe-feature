const models = require('../../database/models/index');
const {
  createWithdrawalSettings,
} = require('../../database/controllers/withdrawals_settings');
const { createUser } = require('../../database/controllers/users');
const { createBalance } = require('../../database/controllers/balances');
const {
  createNotificationsSettings,
} = require('../../database/controllers/notifications_settings');
const ProducerWelcomeEmail = require('../../services/email/ProducerWelcome');
const SalesSettingsRepository = require('../../repositories/sequelize/SalesSettingsRepository');
const ReferralProgram = require('../../database/models/ReferralProgram');
const ReferralUsers = require('../../database/models/ReferralUsers');
const { findReferralStatus } = require('../../status/referralStatus');
const { DATABASE_DATE } = require('../../types/dateTypes');
const date = require('../../utils/helpers/date');

/**
 * @param {String} referralCode
 * @param {number} id_referral_user
 * @param {function} transaction
 * @return {Promise} void
 * */
async function resolveReferralCode(
  referralCode,
  id_referral_user,
  transaction,
) {
  if (!referralCode) return;
  const referral = await ReferralProgram.findOne({
    raw: true,
    attributes: ['id_user'],
    where: {
      code: referralCode,
      id_status: findReferralStatus('active').id,
    },
    transaction,
  });

  if (!referral) return;
  await ReferralUsers.create(
    {
      id_user: referral.id_user,
      id_referral_user,
      valid_until: date().add(1, 'year').format(DATABASE_DATE),
    },
    {
      transaction,
    },
  );
}

/**
 * @typedef {Object} User
 * @param {String} email
 * @param {String} password
 * @param {String} first_name
 * @param {String} last_name
 * @param {String} document_number
 * @param {String} whatsapp
 * @param {String} referralCode
 *
 */

/**
 * Use case for user creation with bnalance and withdraw settings
 * @param {User} user
 * @returns {User}
 */

class CreateUserUseCase {
  constructor(user, sendMail = true) {
    this.user = user;
    this.sendMail = sendMail;
  }

  async create() {
    let createdUser;
    await models.sequelize.transaction(async (t) => {
      createdUser = await createUser(this.user, t);
      await Promise.all([
        createBalance(createdUser.id, t),
        createWithdrawalSettings(createdUser.id, t),
        SalesSettingsRepository.create(createdUser.id, t),
        createNotificationsSettings(createdUser.id, t),
        resolveReferralCode(this.user.b4youReferral, createdUser.id, t),
      ]);
      return true;
    });

    if (this.sendMail)
      await new ProducerWelcomeEmail({
        full_name: createdUser.full_name,
        email: this.user.email,
      }).send();
    return createdUser;
  }
}

module.exports = CreateUserUseCase;
