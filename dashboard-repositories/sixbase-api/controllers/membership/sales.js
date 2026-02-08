const ApiError = require('../../error/ApiError');
const SerializeSale = require('../../presentation/membership/sales');
const SerializeActivity = require('../../presentation/membership/activity');
const SerializaProductAsSale = require('../../presentation/dashboard/membership/products');
const { findStudentSales } = require('../../database/controllers/sales');
const { findAllproducts } = require('../../database/controllers/products');
const {
  findStudentActivityPaginated,
} = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const rawData = require('../../database/rawData');

const getStudentSales = async (req, res, next) => {
  const {
    student: { id: id_student, producer_id },
  } = req;
  const { page = 0, size = 10 } = req.query;
  try {
    if (!producer_id) {
      const sales = await findStudentSales({ id_student }, page, size);
      return res.status(200).send({
        count: sales.count,
        rows: new SerializeSale(sales.rows).adapt(),
      });
    }
    const products = await findAllproducts(
      { id_user: producer_id },
      page,
      size,
    );
    return res.status(200).send({
      count: products.count,
      rows: new SerializaProductAsSale(rawData(products.rows)).adapt(),
    });
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

const getStudentActivity = async (req, res, next) => {
  const {
    student: { id: id_student },
  } = req;
  const { page = 0, size = 10 } = req.query;
  try {
    const studentSaleItems = await findStudentActivityPaginated(
      {
        id_student,
        id_status: findSalesStatusByKey('paid').id,
      },
      page,
      size,
    );

    return res.status(200).send({
      count: studentSaleItems.count,
      rows: new SerializeActivity(studentSaleItems.rows).adapt(),
    });
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

module.exports = {
  getStudentSales,
  getStudentActivity,
};
