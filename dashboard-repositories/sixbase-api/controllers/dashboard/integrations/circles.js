const ApiError = require('../../../error/ApiError');
const CirclesCommunity = require('../../../services/CirclesCommunity');

module.exports.create = async (req, res, next) => {
  const {
    user: { email, full_name },
  } = req;
  try {
    await new CirclesCommunity().inviteMember({
      email,
      name: full_name,
    });
    return res.status(200).send();
  } catch (error) {
    return next(
      ApiError.internalServerError(
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
    user: { email },
  } = req;
  try {
    const data = await new CirclesCommunity().searchMember({
      email,
    });
    return res.status(200).send({ registered: data?.success !== false });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.delete = async (req, res, next) => {
  const {
    user: { email },
  } = req;
  try {
    const data = await new CirclesCommunity().removeMember({
      email,
    });
    return res.status(200).send({ registered: data?.success !== false });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
