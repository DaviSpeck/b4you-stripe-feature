const ApiError = require('../error/ApiError');
const UserRepository = require('../repositories/sequelize/UsersRepository');
const CoproductionsRepository = require('../repositories/sequelize/CoproductionsRepository');
const FindCoproductions = require('../useCases/coproductions/FindCoproductions');
const SerializeCoproductions = require('../presentation/coproductions/single');

module.exports.get = async (req, res, next) => {
  const {
    query: { page = 0, size = 10 },
    params: { userUuid },
  } = req;
  try {
    const { count, rows } = await new FindCoproductions(
      UserRepository,
      CoproductionsRepository,
    ).execute({ userUuid, page, size });
    return res.send({
      count,
      rows: new SerializeCoproductions(rows).adapt(),
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
};
