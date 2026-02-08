const OnesignalUserTags = require('../../../database/models/OnesignalUserTags');

/**
 * Sincroniza as tags de um usuário com a tabela local de tags do OneSignal.
 *
 * @param {number} id_user - ID do usuário interno
 * @param {Record<string, string>} tags - Objeto com pares chave-valor (ex: { affiliate_status: 'active' })
 * @param {object} [transaction] - Opcional: transação Sequelize
 */
async function syncUserTags(id_user, tags, transaction = null) {
    if (!id_user || !tags || typeof tags !== 'object') {
        throw new Error('Parâmetros inválidos para sincronizar tags');
    }

    const tagKeys = Object.keys(tags);
    await Promise.all(
        tagKeys.map(async key => {
            const value = tags[key];
            const existing = await OnesignalUserTags.findOne({
                where: { id_user, tag_key: key },
                transaction,
                paranoid: false,
            });
            if (existing) {
                return existing.update({ tag_value: value }, { transaction });
            }
            return OnesignalUserTags.create(
                { id_user, tag_key: key, tag_value: value },
                { transaction }
            );
        })
    );
}

module.exports = { syncUserTags };