const jwt = require('jsonwebtoken');
const {
  findOneBackofficeUser,
} = require('../database/controllers/users_backoffice');

const { JWT_SECRET } = process.env;

module.exports = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) return res.status(401).send({ message: 'No token provided!' });
  if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err)
      return res.status(401).send({ message: 'Failed to authenticate token!' });

    try {
      const user = await findOneBackofficeUser({ id: decoded.id });

      if (!user) {
        return res.status(401).send({ message: 'User not found!' });
      }

      if (!user.active) {
        return res.status(403).send({
          message: 'Usuário desativado. Entre em contato com o administrador.',
        });
      }

      req.user = decoded;
      return next();
    } catch (error) {
      console.error('Error checking user status:', error);
      return res.status(500).send({ message: 'Error validating user status!' });
    }
  });
};
