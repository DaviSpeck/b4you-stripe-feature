const AffiliatesRepository = require('../repositories/sequelize/AffiliatesRepository');
const ApiError = require('../error/ApiError');
const FindProductAffiliatesPaginated = require('../useCases/affiliates/FindProductAffiliates');
const FindUserAffiliates = require('../useCases/affiliates/FindUserAffiliates');
const SerializeAffiliates = require('../presentation/affiliates/SerializeAffiliates');
const SerialzieUserAffiliates = require('../presentation/affiliates/SerializeUser');
const UsersRepository = require('../repositories/sequelize/UsersRepository');

module.exports.findAllAffiliates = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null },
    params: { productUuid },
  } = req;
  try {
    const { rows, count } = await new FindProductAffiliatesPaginated(
      AffiliatesRepository,
    ).execute({ input, page, size, productUuid });
    return res.send({
      count,
      rows: new SerializeAffiliates(rows).adapt(),
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

module.exports.get = async (req, res, next) => {
  const {
    query: { page = 0, size = 10 },
    params: { userUuid },
  } = req;
  try {
    const { count, rows } = await new FindUserAffiliates(
      UsersRepository,
      AffiliatesRepository,
    ).execute({ userUuid, page, size });
    return res.send({
      count,
      rows: new SerialzieUserAffiliates(rows).adapt(),
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

module.exports.findAllAffiliates = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null },
    params: { productUuid },
  } = req;
  try {
    const { rows, count } =
      await AffiliatesRepository.findProductAffiliatedPaginatedWithSQL({
        input,
        page,
        size,
        productUuid,
      });
    return res.send({
      count,
      rows: new SerializeAffiliates(rows).adapt(),
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

module.exports.getUserAffiliates = async (req, res, next) => {
  const {
    query: { page = 0, size = 10 },
    params: { userUuid },
  } = req;
  try {
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');

    const { count, rows } =
      await AffiliatesRepository.findUserAffiliatesPaginatedWithSQL({
        page,
        size,
        id_user: user.id,
      });
    return res.send({
      count,
      rows: new SerialzieUserAffiliates(rows).adapt(),
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
