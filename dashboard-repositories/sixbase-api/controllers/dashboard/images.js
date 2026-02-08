const ApiError = require('../../error/ApiError');
const CreateGeneral = require('../../useCases/dashboard/products/images/CreateGeneral');
const DeleteGeneral = require('../../useCases/dashboard/products/images/DeleteGeneral');
const DeleteBannerMobileUseCase = require('../../useCases/dashboard/products/images/DeleteBannerMobile');
const DeleteBannerUseCase = require('../../useCases/dashboard/products/images/DeleteBanner');
const DeleteFaviconUseCase = require('../../useCases/dashboard/products/images/DeleteFavicon');
const DeleteHeaderPictureDesktopUseCase = require('../../useCases/dashboard/products/images/DeleteHeaderPictureDesktop');
const DeleteHeaderSecondaryPictureDesktop = require('../../useCases/dashboard/products/images/DeleteHeaderSecondaryPictureDesktop');
const DeleteHeaderPictureMobileUseCase = require('../../useCases/dashboard/products/images/DeleteHeaderPictureMobile');
const DeleteSidebarPictureDesktopUseCase = require('../../useCases/dashboard/products/images/DeleteSidebarPictureDesktop');
const UpdateBannerMobileUseCase = require('../../useCases/dashboard/products/images/UpdateBannerMobile');
const UpdateBannerUseCase = require('../../useCases/dashboard/products/images/UpdateBanner');
const UpdateFaviconUseCase = require('../../useCases/dashboard/products/images/UpdateFavicon');
const UpdateHeaderPictureDesktopUseCase = require('../../useCases/dashboard/products/images/UpdateHeaderPictureDesktop');
const UpdateHeaderPictureSecondaryDesktop = require('../../useCases/dashboard/products/images/UpdateHeaderPictureSecondaryDesktop');
const UpdateHeaderPictureMobileUseCase = require('../../useCases/dashboard/products/images/UpdateHeaderPictureMobile');
const UpdateSidebarPictureDesktopUseCase = require('../../useCases/dashboard/products/images/UpdateSidebarPictureDesktop');
const UpdateSecondHeaderMobile = require('../../useCases/dashboard/products/images/UpdateSecondHeaderMobile');
const DeleteSecondHeaderMobile = require('../../useCases/dashboard/products/images/DeleteSecondHeaderMobile');
const UpdateCoverCustomUseCase = require('../../useCases/dashboard/products/images/UpdateCoverCustom');
const DeleteCoverCustomUseCase = require('../../useCases/dashboard/products/images/DeleteCoverCustom');
const ProductsRepository = require('../../repositories/sequelize/ProductsRepository');
const ProductImagesRepository = require('../../repositories/sequelize/ProductImagesRepository');
const FileManager = require('../../services/FileManager');
const Products = require('../../database/models/Products');
const Product_images = require('../../database/models/Product_images');
const { findImageType, findImageTypeByKey } = require('../../types/imageTypes');

const makeFileManager = () => {
  const fileManager = new FileManager(process.env.BUCKET_NAME);
  return fileManager;
};

const updateBannerImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateBannerUseCase(ProductsRepository).execute({
      product_uuid,
      file,
      id_user,
    });
    return res.status(200).send({ url });
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

const updateBannerMobileImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateBannerMobileUseCase(ProductsRepository).execute(
      {
        product_uuid,
        file,
        id_user,
      },
    );
    return res.status(200).send({ url });
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

const updateSecondHeaderMobileController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id },
  } = req;
  try {
    const url = await new UpdateSecondHeaderMobile(ProductsRepository).execute({
      product_uuid: product_id,
      id_user,
      file,
    });
    return res.status(200).send({ url });
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

const updateHeaderDesktopImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateHeaderPictureDesktopUseCase(
      ProductsRepository,
    ).execute({
      product_uuid,
      file,
      id_user,
    });
    return res.status(200).send({ url });
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

const updateHeaderSecondaryDesktopImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateHeaderPictureSecondaryDesktop(
      ProductsRepository,
    ).execute({
      product_uuid,
      file,
      id_user,
    });
    return res.status(200).send({ url });
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

const updateSidebarDesktopImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateSidebarPictureDesktopUseCase(
      ProductsRepository,
    ).execute({
      product_uuid,
      file,
      id_user,
    });
    return res.status(200).send({ url });
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

const updateHeaderMobileImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateHeaderPictureMobileUseCase(
      ProductsRepository,
    ).execute({ product_uuid, file, id_user });
    return res.status(200).send({ url });
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

const updateFaviconController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateFaviconUseCase(ProductsRepository).execute({
      product_uuid,
      file,
      id_user,
    });
    return res.status(200).send({ url });
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

const deleteHeaderDesktopImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteHeaderPictureDesktopUseCase(
      ProductsRepository,
      makeFileManager(),
    ).execute({
      product_uuid,
      id_user,
    });
    return res.status(200).send('Imagem header desktop removida com sucesso');
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

const deleteHeaderSecondaryDesktopImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteHeaderSecondaryPictureDesktop(
      ProductsRepository,
      makeFileManager(),
    ).execute({
      product_uuid,
      id_user,
    });
    return res.status(200).send('Imagem header desktop removida com sucesso');
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

const deleteSidebarDesktopImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteSidebarPictureDesktopUseCase(
      ProductsRepository,
      makeFileManager(),
    ).execute({
      product_uuid,
      id_user,
    });
    return res.status(200).send('Imagem sidebar removida com sucesso');
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

const deleteHeaderMobileImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteHeaderPictureMobileUseCase(
      ProductsRepository,
      makeFileManager(),
    ).execute({
      product_uuid,
      id_user,
    });
    return res.status(200).send('Imagem header mobile removida com sucesso');
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

const deleteFaviconController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteFaviconUseCase(
      ProductsRepository,
      makeFileManager(),
    ).execute({
      product_uuid,
      id_user,
    });
    return res.status(200).send({ message: 'Favicon removido com sucesso' });
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

const deleteBannerController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteBannerUseCase(
      ProductsRepository,
      makeFileManager(),
    ).execute({ product_uuid, id_user });
    return res.status(200).send({ message: 'Banner removido com sucesso' });
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

const deleteBannerMobileController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteBannerMobileUseCase(
      ProductsRepository,
      makeFileManager(),
    ).execute({ product_uuid, id_user });
    return res
      .status(200)
      .send({ message: 'Banner mobile removido com sucesso' });
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

const deleteSecondHeaderMobileController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id },
  } = req;
  try {
    await new DeleteSecondHeaderMobile(
      ProductsRepository,
      makeFileManager(),
    ).execute({
      product_uuid: product_id,
      id_user,
    });
    return res
      .status(200)
      .send({ message: 'Banner mobile removido com sucesso' });
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

const createGeneralImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    if (!file) {
      throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
    }
    const isGif = file.originalname.endsWith('.gif') || file.mimetype === 'image/gif';
    const MAX_FILE_SIZE = 5 * 1024 * 1024; 
    const MAX_GIF_SIZE = 10 * 1024 * 1024; 

    // Validação de tamanho
    if (isGif && file.size > MAX_GIF_SIZE) {
      throw ApiError.badRequest('GIFs não podem ultrapassar 10MB');
    } else if (!isGif && file.size > MAX_FILE_SIZE) {
      throw ApiError.badRequest('Imagens não podem ultrapassar 5MB');
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw ApiError.badRequest('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP');
    }
    const { url, imageProduct } = await new CreateGeneral(
      ProductsRepository,
      ProductImagesRepository,
    ).execute({
      product_uuid,
      id_user,
      file,
      id_type: findImageTypeByKey('market-content').id,
      isGif,
    });
    return res.status(200).send({
      message: 'Imagem criada com sucesso',
      url,
      key: imageProduct.key,
      uuid: imageProduct.uuid,
      type: findImageType(imageProduct.id_type),
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

const createCoverMarketImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    // Verifica se é GIF (opcional: adicionar validação de tamanho máximo)
    const isGif = file.originalname.endsWith('.gif') || file.mimetype === 'image/gif';

    const { url, imageProduct } = await new CreateGeneral(
      ProductsRepository,
      ProductImagesRepository,
    ).execute({
      product_uuid,
      id_user,
      file,
      id_type: findImageTypeByKey('market-cover').id,
      isGif, // Passa a flag para a classe
    });
    return res.status(200).send({
      message: 'Imagem criada com sucesso',
      url,
      key: imageProduct.key,
      uuid: imageProduct.uuid,
      type: findImageType(imageProduct.id_type),
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

const deleteGeneralImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid, uuid },
  } = req;
  try {
    await new DeleteGeneral(
      ProductsRepository,
      ProductImagesRepository,
      makeFileManager(),
    ).execute({
      product_uuid,
      id_user,
      uuid,
    });
    return res.status(200).send({ message: 'Imagem deletada com sucesso' });
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

const getGeneralImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const product = await Products.findOne({
      where: {
        uuid: product_uuid,
        id_user,
      },
      attributes: ['id'],
    });
    if (!product)
      throw ApiError.badRequest(
        'É necessário enviar um identificador de produto',
      );
    const productImages = await Product_images.findAll({
      where: {
        id_product: product.id,
        id_user,
        id_type: findImageTypeByKey('market-content').id,
      },
    });
    return res.status(200).send(
      productImages.map(({ file, key, uuid, id_type }) => ({
        uuid,
        file,
        key,
        type: findImageType(id_type),
      })),
    );
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

const getMarktCoverImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const product = await Products.findOne({
      where: {
        uuid: product_uuid,
        id_user,
      },
      attributes: ['id'],
    });
    if (!product)
      throw ApiError.badRequest(
        'É necessário enviar um identificador de produto',
      );
    const productImages = await Product_images.findAll({
      where: {
        id_product: product.id,
        id_user,
        id_type: findImageTypeByKey('market-cover').id,
      },
    });
    return res.status(200).send(
      productImages.map(({ file, key, uuid, id_type }) => ({
        uuid,
        file,
        key,
        type: findImageType(id_type),
      })),
    );
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

const updateCoverCustomImageController = async (req, res, next) => {
  const {
    file,
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    const url = await new UpdateCoverCustomUseCase(ProductsRepository).execute({
      product_uuid,
      file,
      id_user,
    });
    return res.status(200).send({ url });
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

const deleteCoverCustomImageController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteCoverCustomUseCase(
      ProductsRepository,
      makeFileManager(),
    ).execute({
      product_uuid,
      id_user,
    });
    return res.status(200).send({ message: 'Capa customizada removida com sucesso' });
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
  deleteBannerController,
  deleteBannerMobileController,
  deleteFaviconController,
  deleteHeaderDesktopImageController,
  deleteHeaderMobileImageController,
  deleteSidebarDesktopImageController,
  updateBannerImageController,
  updateBannerMobileImageController,
  updateFaviconController,
  updateHeaderDesktopImageController,
  updateHeaderMobileImageController,
  updateSidebarDesktopImageController,
  updateSecondHeaderMobileController,
  deleteSecondHeaderMobileController,
  updateHeaderSecondaryDesktopImageController,
  deleteHeaderSecondaryDesktopImageController,
  createGeneralImageController,
  deleteGeneralImageController,
  getGeneralImageController,
  createCoverMarketImageController,
  getMarktCoverImageController,
  updateCoverCustomImageController,
  deleteCoverCustomImageController,
};
