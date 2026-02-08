const ApiError = require('../../error/ApiError');
const Users = require('../../database/models/Users');

exports.incrementMerlinInteractions = async (req, res, next) => {
  try {
    const { id_user } = req.body;
    if (!id_user) {
      return next(ApiError.badRequest('id_user é obrigatório no corpo da requisição.'));
    }

    await Users.increment('merlinInteractions', {
      by: 1,
      where: { id: id_user },
    });

    const { merlinInteractions } = await Users.findByPk(id_user, {
      attributes: ['merlinInteractions'],
    });

    return res.status(200).json({ merlinInteractions });
  } catch (err) {
    return next(
      ApiError.internalServerError(
        'Erro ao incrementar interações Merlin',
        err,
      ),
    );
  }
};

exports.getMerlinInteractions = async (req, res, next) => {
  try {
    const { id_user } = req.params;
    if (!id_user) {
      return next(ApiError.badRequest('id_user é obrigatório como parâmetro de rota.'));
    }

    const { merlinInteractions } = await Users.findByPk(id_user, {
      attributes: ['merlinInteractions'],
    });

    return res.status(200).json({ merlinInteractions });
  } catch (err) {
    return next(
      ApiError.internalServerError(
        'Erro ao buscar interações Merlin',
        err,
      ),
    );
  }
};