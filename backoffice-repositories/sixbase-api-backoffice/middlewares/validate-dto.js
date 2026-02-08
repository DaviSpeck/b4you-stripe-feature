const validateDto =
  (schema, path = 'body') =>
  async (req, res, next) => {
    try {
      const validData = await schema.validate(req[path], {
        abortEarly: false,
        stripUnknown: true,
      });
      req[path] = validData;
      return next();
    } catch (error) {
      const errors = error.inner.map((err) => ({
        [err.path]: err.message,
      }));
      return res.status(400).send({
        code: 400,
        message: 'Erro de validação',
        body: { errors },
      });
    }
  };

module.exports = validateDto;
