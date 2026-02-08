const Checkout_info = require('../database/models/Checkout_info');
const ApiError = require('../error/ApiError');

const createCheckoutInfoController = async (req, res, next) => {
  try {
    const { full_name, email, whatsapp, address, document_number } = req.body;

    const createdCheckoutInfo = await Checkout_info.create({
      full_name,
      email,
      whatsapp,
      address: JSON.stringify(address),
      document_number,
    });

    return res.status(201).json(createdCheckoutInfo);
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
};

const findCheckoutInfoController = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const checkoutInfo = await Checkout_info.findOne({
      raw: true,
      where: { uuid },
    });

    if (!checkoutInfo) {
      return res.status(404).json({ message: 'Checkout info not found' });
    }

    return res.status(200).json(checkoutInfo);
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
};

const updateCheckoutInfoController = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const { full_name, email, whatsapp, address, document_number } = req.body;

    const [updatedRows] = await Checkout_info.update(
      {
        full_name,
        email,
        whatsapp,
        document_number,
        address: JSON.stringify(address),
      },
      { where: { uuid } },
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Checkout info not found' });
    }

    const updatedCheckoutInfo = await Checkout_info.findOne({
      raw: true,
      where: { uuid },
    });

    return res.status(200).json(updatedCheckoutInfo);
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
};

module.exports = {
  createCheckoutInfoController,
  findCheckoutInfoController,
  updateCheckoutInfoController,
};
