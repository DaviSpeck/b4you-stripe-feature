const router = require('express').Router();
const ApiError = require('../../error/ApiError');
const S3Manager = require('../../services/S3Manager');

const { BUCKET_NAME } = process.env;

router.get('/', async (req, res, next) => {
  const {
    query: { filename },
  } = req;
  try {
    const { url, key } = await new S3Manager(BUCKET_NAME).getSignedUrl(
      filename,
    );
    return res.json({ url, key });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

module.exports = router;
