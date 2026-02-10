const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../database/models');

const STRIPE_FLAG_KEYS = ['stripe', 'stripe_international'];

const CANDIDATE_QUERIES = [
  `
    SELECT *
      FROM feature_flags
     WHERE \`key\` IN (:keys)
     ORDER BY updated_at DESC, id DESC
     LIMIT 1
  `,
  `
    SELECT *
      FROM feature_flags
     WHERE feature_key IN (:keys)
     ORDER BY updated_at DESC, id DESC
     LIMIT 1
  `,
  `
    SELECT *
      FROM feature_flags
     WHERE name IN (:keys)
     ORDER BY updated_at DESC, id DESC
     LIMIT 1
  `,
  `
    SELECT *
      FROM feature_flags
     ORDER BY updated_at DESC, id DESC
     LIMIT 1
  `,
];

module.exports = class FeatureFlagsRepository {
  static async findStripeFlagRecord() {
    let lastError = null;

    for (const query of CANDIDATE_QUERIES) {
      try {
        const [record] = await sequelize.query(query, {
          type: QueryTypes.SELECT,
          replacements: {
            keys: STRIPE_FLAG_KEYS,
          },
        });

        if (record) {
          return record;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      throw lastError;
    }

    return null;
  }
};
