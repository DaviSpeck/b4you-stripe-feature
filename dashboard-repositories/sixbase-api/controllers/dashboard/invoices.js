const ApiError = require('../../error/ApiError');
const SerializeInvoices = require('../../presentation/dashboard/invoices');
const PrintReceiptUseCase = require('../../useCases/dashboard/invoices/PrintReceipt');
const ExportXLS = require('../../useCases/dashboard/invoices/ExportXLS');
const dateHelper = require('../../utils/helpers/date');
const rawData = require('../../database/rawData');
const {
  findInvoicesPaginated,
  findInvoicesXls,
} = require('../../database/controllers/invoices');
const {
  invoiceTypes,
  findInvoiceTypeByKey,
} = require('../../types/invoiceTypes');
const { findRawUserProducts } = require('../../database/controllers/products');
const {
  findIntegrationTypeByKey,
  findIntegrationType,
} = require('../../types/integrationTypes');

const formatQuery = ({
  endDate,
  input,
  page = 0,
  plugin,
  product_uuid,
  size = 10,
  startDate,
  types,
}) => {
  const where = { page, size };
  if (types && types !== 'all') {
    try {
      where.id_type = types
        .split(',')
        .map((element) => findInvoiceTypeByKey(element).id);
    } catch (e) {
      throw ApiError.badRequest(
        'Tipo inválido, por favor informe um tipo válido.',
      );
    }
  }
  if (startDate && endDate) {
    where.start_date = startDate;
    where.end_date = endDate;
  }
  if (input) where.input = input;
  if (product_uuid) where.product_uuid = product_uuid;
  if (plugin && plugin !== 'all' && plugin !== 'none') {
    try {
      where.id_plugin = plugin
        .split(',')
        .map((element) => findIntegrationTypeByKey(element).id);
    } catch (e) {
      throw ApiError.badRequest(
        'Plugin inválido, por favor informe um tipo válido.',
      );
    }
  } else {
    where.id_plugin = plugin;
  }
  return where;
};

const findInvoicesPaginatedController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  try {
    const where = formatQuery(query);
    where.id_user = id_user;
    const { count, rows } = await findInvoicesPaginated(where);
    return res
      .status(200)
      .send({ count, rows: new SerializeInvoices(rawData(rows)).adapt() });
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

const filtersInvoiceController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const products = await findRawUserProducts(id_user);
    const rawProducts = products.map(({ name, uuid }) => ({ name, uuid }));
    return res.status(200).send({
      invoiceTypes,
      products: rawProducts,
      integrationTypes: [
        findIntegrationType('eNotas'),
        findIntegrationType('Bling'),
      ],
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

const printReceiptPDFController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { invoice_id },
  } = req;
  try {
    const pdfData = await new PrintReceiptUseCase(
      id_user,
      invoice_id,
    ).execute();
    res.contentType('application/pdf');
    return res.status(200).type('pdf').send(pdfData);
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

const exportXLSConstroller = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  try {
    const where = formatQuery(query);
    where.id_user = id_user;
    const invoices = await findInvoicesXls(where);
    const file = await new ExportXLS(id_user, invoices).execute();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    const dateFormat = 'DD-MM-YYYY';
    let filename;
    if (where.start_date) {
      filename = `notas_${dateHelper(where.start_date).format(
        dateFormat,
      )}_${dateHelper(where.end_date).format(dateFormat)}.xlsx`;
    } else {
      filename = `notas_${id_user}.xlsx`;
    }

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return file.xlsx.write(res).then(() => {
      res.status(200).end();
    });
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
  filtersInvoiceController,
  findInvoicesPaginatedController,
  printReceiptPDFController,
  exportXLSConstroller,
};
