const validateDto =
  (schema, path = 'body') =>
  async (req, res, next) => {
    try {
      // For membership page layout, we need to preserve all config properties
      // So we use stripUnknown: false to keep all nested properties
      const isMembershipLayout = req.path && req.path.includes('membership-page-layout');
      const validData = await schema.validate(req[path], {
        abortEarly: false,
        stripUnknown: !isMembershipLayout, // Don't strip unknown for membership layout
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
