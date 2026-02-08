const Token = require('../utils/helpers/token');
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
const authUsers = [
  {
    token:
      'i6OkX4oR?eI3m!i19LSx/4FF1itYRcnKek7twuReN6=jSNYrxc6t/TpADoOgCkrEXNG-UwndPL3NWHAS7n8xeObRTnHddE3=i?j8BYexl-NERAXd0U7NCSj0ng!LdQ!2iEZ?JqUW3h9d7udNLGmFwFoELSQXxJ5ZoXAIk03C8oohR5vgZ6sxG4Bn9uBe6E4mNubhed-1c!YfMTDBM47Z1P86NdyUDIYQDpL317Co2w/dyeeHgRkQhfiPzzk8QDfv',
    name: 'PLACEAPP',
  },
];
/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.validateThirdPartyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const thirdPartyUser = authUsers.find((u) => u.token === apiKey);
  if (!thirdPartyUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.validateAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Authorization token is missing or malformed' });
  }
  const [, token] = authorization.split('Bearer ');
  console.log('Token received:', token);
  try {
    const decoded = Token.verify(token);
    console.log('Decoded token:', decoded);
    req.id_user = decoded.id_user;
    req.user = { id: decoded.id_user };
    return next();
  } catch (error) {
    console.log('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
