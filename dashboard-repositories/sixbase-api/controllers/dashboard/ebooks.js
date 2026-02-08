const lodash = require('lodash');
const ApiError = require('../../error/ApiError');
const SerializeEbook = require('../../presentation/dashboard/ebooks');
const FileManager = require('../../services/FileManager');
const {
  createProductEbook,
  findAllEbooks,
  deleteEbook,
  updateEbook,
} = require('../../database/controllers/product_ebooks');
const { updateProduct } = require('../../database/controllers/products');

const uploadEbookController = async (req, res, next) => {
  const { is_bonus, key, file_size, filename } = req.body;
  const {
    product: { id: id_product },
  } = req;

  try {
    await createProductEbook({
      name: filename,
      ebook_file: `https://arquivos-mango5.s3.sa-east-1.amazonaws.com/${key}`,
      ebook_key: key,
      is_bonus,
      id_product,
      file_size,
      file_extension: lodash.last(filename.split('.')),
    });

    return res.sendStatus(200);
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

const findEbooksController = async (req, res, next) => {
  const {
    product: { id: id_product, files_description },
  } = req;

  try {
    const ebooks = await findAllEbooks({ id_product });
    return res
      .status(200)
      .send(new SerializeEbook({ files_description, ebooks }).adapt());
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

const donwloadEbookController = async (req, res, next) => {
  const {
    ebook: { ebook_key, name },
  } = req;
  try {
    const fileManagerInstance = new FileManager(process.env.BUCKET_NAME);
    const pdfStream = await fileManagerInstance.getFile(ebook_key);
    const pdfBuffer = Buffer.from(pdfStream.Body, 'binary');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURI(name)}"`,
    );
    return res.status(200).send(pdfBuffer);
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

const deleteEbookController = async (req, res, next) => {
  const {
    ebook: { id, ebook_key },
  } = req;
  const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
  try {
    await FileManagerInstance.deleteFile(ebook_key);
    await deleteEbook({ id });
    return res.sendStatus(200);
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

const updateFIlesDescriptionController = async (req, res, next) => {
  const {
    product: { id },
    body: { files_description },
  } = req;
  try {
    await updateProduct(id, { files_description });
    return res.sendStatus(200);
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
const updateAllowPiracyWatermark = async (req, res, next) => {
  const {
    body: { allow_piracy_watermark = true },
    ebook,
  } = req;
  try {
    await updateEbook({ id: ebook.id }, { allow_piracy_watermark });
    return res.sendStatus(200);
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
  findEbooksController,
  uploadEbookController,
  donwloadEbookController,
  deleteEbookController,
  updateFIlesDescriptionController,
  updateAllowPiracyWatermark,
};
