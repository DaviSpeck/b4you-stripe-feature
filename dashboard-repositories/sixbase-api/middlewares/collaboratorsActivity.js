const SQS = require('../queues/aws');

module.exports = async (req, res, next) => {
  const {
    session: { user, owner },
    body,
    query,
    params,
  } = req;

  if (user.id !== owner.id)
    await SQS.add('collaboratorsActivity', {
      id_user_request: owner.id,
      id_user: user.id,
      body,
      query,
      params,
      route: req.originalUrl,
    });

  return next();
};
