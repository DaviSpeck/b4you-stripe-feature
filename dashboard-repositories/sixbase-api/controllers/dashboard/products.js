const fs = require('fs');
const { Op } = require('sequelize');
const { format } = require('@fast-csv/format');
const sanitizeHtml = require('sanitize-html');
const he = require('he');
const ApiError = require('../../error/ApiError');
const ImageHelper = require('../../utils/helpers/images');
const FileManager = require('../../services/FileManager');
const SerializeProductsIntegrations = require('../../presentation/dashboard/productsIntegrations');
const SerializeLinks = require('../../presentation/dashboard/coproductions/checkoutLinks');
const SerializeProductsName = require('../../presentation/dashboard/productsName');
const SerializeSingleProduct = require('../../presentation/dashboard/singleProduct');
const SerializeGeneralProduct = require('../../presentation/dashboard/generalProduct');
const SerializeProductsWithOffers = require('../../presentation/dashboard/ProductsWithOffers');
const CreateProductUseCase = require('../../useCases/dashboard/products/CreateProduct');
const UpdateProductUseCase = require('../../useCases/dashboard/products/UpdateProduct');
const DeleteProductUseCase = require('../../useCases/dashboard/products/DeleteProduct');
const SendFileToStorage = require('../../useCases/common/files/SendFileToStorage');
const DeleteLogo = require('../../useCases/dashboard/products/images/DeleteLogo');
const ProductsRepository = require('../../repositories/sequelize/ProductsRepository');
const {
  findProductMarketStatusByKey,
} = require('../../status/productMarketStatus');
const { resolveImageFromBuffer } = require('../../utils/files');
const {
  updateProduct,
  findProducts,
  findSingleProductWithProducer,
  findSingleProductAffiliateOrCoproducer,
  findAllIntegrationsProducts,
  findProductsRanking,
  findAllProductsForSelectUpsellAndOrderBump,
} = require('../../database/controllers/products');
const {
  findOfferPaginatedLinks,
} = require('../../database/controllers/product_offer');
const {
  findRawProductsAffiliatesWebhooks,
} = require('../../database/controllers/affiliates');
const { productCategories } = require('../../types/productCategories');
const DeleteCover = require('../../useCases/dashboard/products/images/DeleteCover');
const DeleteEbookCover = require('../../useCases/dashboard/products/images/DeleteEbookCover');
const ClassroomsRepository = require('../../repositories/sequelize/ClassroomsRepository');
const ProductAffiliateSettingsRepository = require('../../repositories/sequelize/ProductsAffiliateSettingsRepository');
const {
  findAffiliateStatusByKey,
  findAffiliateStatus,
} = require('../../status/affiliateStatus');
const Cache = require('../../config/Cache');
const Product_offer = require('../../database/models/Product_offer');
const Product_images = require('../../database/models/Product_images');
const {
  createVerifyMarket,
} = require('../../database/controllers/verify_market');
const dateHelper = require('../../utils/helpers/date');
const {
  findProductMarketVerifyStatusByKey,
} = require('../../status/productMarketVerifyStatus');
const Affiliates = require('../../database/models/Affiliates');
const {
  VIDEOTYPE,
  EBOOKTYPE,
  PAYMENT_ONLY_TYPE,
  PHYSICAL_TYPE,
  ECOMMERCE,
} = require('../../types/productTypes');
const { capitalizeName, slugify } = require('../../utils/formatters');
const Products = require('../../database/models/Products');
const Coproductions = require('../../database/models/Coproductions');
const Shop_integrations = require('../../database/models/Shop_integrations');
const Suppliers = require('../../database/models/Suppliers');
const Plugins = require('../../database/models/Plugins');
const { findIntegrationTypeByKey } = require('../../types/integrationTypes');
const ApprovedPayment = require('../../services/email/ApprovedPayment');

function sanitizarTemplateEmail(html) {
  const decoded = he.decode(html);
  return sanitizeHtml(decoded, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'ol',
      'ul',
      'li',
      'h1',
      'h2',
      'h3',
      'a',
      'span',
      'b',
      'i',
      'u',
      'strike',
    ],
    allowedAttributes: {
      a: ['href', 'target'],
      span: ['style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
    transformTags: {
      b: 'strong',
      i: 'em',
    },
    allowedSchemesAppliedToAttributes: ['href'],
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
  });
}

const makeFileManager = () => {
  const fileManager = new FileManager(process.env.BUCKET_NAME);
  return fileManager;
};

const resolveType = (type) => {
  if (type === VIDEOTYPE) return 'video';
  if (type === EBOOKTYPE) return 'ebook';
  if (type === PAYMENT_ONLY_TYPE) return 'payment_only';
  if (type === PHYSICAL_TYPE) return 'physical';
  if (type === ECOMMERCE) return 'ecommerce';
  return 'physical';
};

const uploadCertificateController = async (req, res, next) => {
  const {
    product: { id, certificate, certificate_key },
    file,
  } = req;
  try {
    if (certificate) {
      const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
      await FileManagerInstance.deleteFile(certificate_key);
    }
    const { file: url, key } = await new SendFileToStorage({
      file,
      readPermission: 'private',
    }).execute();
    await updateProduct(id, { certificate: url, certificate_key: key });
    return res.status(200).send({
      success: true,
      message: 'Certificado atualizado',
      certificate: url,
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

const updateProductLogoController = async (req, res, next) => {
  const {
    product: { id },
    file,
  } = req;
  try {
    let data;
    const { width, height } = await ImageHelper.getImageDimensions(file.path);
    if (
      width > ImageHelper.CONFIG.PRODUCT_LOGO.width ||
      height > ImageHelper.CONFIG.PRODUCT_LOGO.height
    ) {
      const fileBuffer = await ImageHelper.formatImageLogo(
        file.path,
        ImageHelper.CONFIG.PRODUCT_LOGO,
      );
      data = await resolveImageFromBuffer(fileBuffer, file.key);
      fs.unlinkSync(file.path);
    } else {
      data = await new SendFileToStorage({ file }).execute();
    }
    const { file: url, key } = data;
    await updateProduct(id, { logo: url, logo_key: key });
    return res.status(200).send({
      success: true,
      message: 'Logo do produto atualizada',
      url,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const updateProductVideoController = async (req, res, next) => {
  const {
    product: { id },
    body: { embed },
  } = req;
  try {
    await updateProduct(id, { url_video_checkout: embed });
    return res.sendStatus(200);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const deleteProductVideoController = async (req, res, next) => {
  const {
    product: { id },
  } = req;
  try {
    await updateProduct(id, { url_video_checkout: null });
    return res.sendStatus(200);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const updateProductCoverController = async (req, res, next) => {
  const {
    product: { id },
    file,
  } = req;
  try {
    const fileBufferCover = await ImageHelper.formatImageCover(
      file.path,
      ImageHelper.CONFIG.PRODUCT_COVER,
    );
    const fileBufferThumbnail = await ImageHelper.formatImageThumbnail(
      file.path,
      ImageHelper.CONFIG.PRODUCT_THUMBNAIL,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const extensionFile = file.key.match(/\.[0-9a-z]+$/i)[0];
    const dataThumbnail = await resolveImageFromBuffer(
      fileBufferThumbnail,
      file.key.replace(extensionFile, `-thumbnail${extensionFile}`),
    );
    fs.unlinkSync(file.path);

    const { file: url, key } = dataCover;

    await updateProduct(id, {
      cover: url,
      cover_key: key,
      thumbnail: dataThumbnail.url,
      thumbnail_key: dataThumbnail.key,
    });
    return res.status(200).send({
      success: true,
      message: 'Imagem do produto atualizada',
      url,
      thumbnail: dataThumbnail.file,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const updateEbookCoverController = async (req, res, next) => {
  const {
    product: { id },
    file,
  } = req;
  try {
    const fileBufferCover = await ImageHelper.formatImageCover(
      file.path,
      ImageHelper.CONFIG.EBOOK_COVER,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    fs.unlinkSync(file.path);

    const { file: url, key } = dataCover;

    await updateProduct(id, {
      ebook_cover: url,
      ebook_cover_key: key,
    });
    return res.status(200).send({
      success: true,
      message: 'Imagem do ebook atualizada',
      url,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const findSingleProductController = async (req, res, next) => {
  const { product } = req;
  try {
    return res.status(200).send(new SerializeSingleProduct(product).adapt());
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

const createNewProductController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body,
  } = req;
  try {
    const product = await new CreateProductUseCase(
      ProductsRepository,
      ClassroomsRepository,
      ProductAffiliateSettingsRepository,
    ).save({ ...body, id_user });
    return res.status(200).send(new SerializeGeneralProduct(product).adapt());
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

const findCoproductionsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { page = 0, size = 0 },
  } = req;
  const limit = parseInt(size, 10);
  const offset = parseInt(page, 10) * limit;
  try {
    const coproductions = await Coproductions.findAndCountAll({
      nest: true,
      where: {
        id_user,
        status: 2,
      },
      offset,
      limit,
      attributes: [
        'id',
        'uuid',
        'id_product',
        'commission_percentage',
        'expires_at',
        'split_invoice',
      ],
      include: [
        {
          association: 'product',
          attributes: ['name', 'id_type'],
          right: true,
          include: [
            {
              association: 'producer',
              attributes: ['full_name'],
            },
          ],
        },
      ],
    });
    return res.status(200).send({
      count: coproductions.count,
      rows: coproductions.rows.map((c) => ({
        uuid: c.uuid,
        name: capitalizeName(c.product.name),
        slug: slugify(c.product.name),
        producer: { full_name: capitalizeName(c.product.producer.full_name) },
        type: resolveType(c.product.id_type),
        rules: {
          commission: c.commission_percentage,
          split_invoice: c.split_invoice,
          expires_at: c.expires_at,
        },
      })),
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

const findProductsPaginatedController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { page = 0, size = 10, order = 'ASC' } = req.query;

  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * limit;
    const products = await Products.findAndCountAll({
      raw: true,
      where: {
        id_user,
      },
      offset,
      limit,
      attributes: ['uuid', 'id', 'name', 'id_type', 'payment_type', 'cover'],
      order: [['name', order === 'DESC' ? 'DESC' : 'ASC']],
    });

    const productIds = products.rows.map((p) => p.id);
    const shopIntegrations = await Shop_integrations.findAll({
      where: { id_product: productIds },
      attributes: ['id_product'],
      raw: true,
    });
    const shopProductIds = new Set(shopIntegrations.map((s) => s.id_product));

    return res.status(200).send({
      count: products.count,
      rows: products.rows.map((p) => ({
        ...p,
        name: capitalizeName(p.name),
        type: resolveType(p.id_type),
        has_shop_integration: shopProductIds.has(p.id),
      })),
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

const findShopifyProductPaginatedController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { page = 0, size = 10, order = 'ASC' } = req.query;

  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * limit;
    const products = await Products.findAndCountAll({
      raw: true,
      where: {
        id_user,
        id_type: 6,
      },
      offset,
      limit,
      attributes: ['uuid', 'name', 'id_type', 'payment_type', 'cover'],
      order: [['name', order === 'DESC' ? 'DESC' : 'ASC']],
    });
    return res.status(200).send({
      count: products.count,
      rows: products.rows.map((p) => ({
        ...p,
        name: capitalizeName(p.name),
        type: resolveType(p.id_type),
      })),
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

const findEcommercePaginatedController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  const { page = 0, size = 10, order = 'ASC' } = req.query;

  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * limit;
    const products = await Products.findAndCountAll({
      raw: true,
      where: {
        id_user,
        id_type: 5,
      },
      offset,
      limit,
      attributes: ['uuid', 'name', 'id_type', 'payment_type', 'cover'],
      order: [['name', order === 'DESC' ? 'DESC' : 'ASC']],
    });
    return res.status(200).send({
      count: products.count,
      rows: products.rows.map((p) => ({
        ...p,
        name: capitalizeName(p.name),
        type: resolveType(p.id_type),
      })),
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

const findProductsIntegrationsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const [products, productsAffiliates, suppliers] = await Promise.all([
      findAllIntegrationsProducts({ id_user }),
      findRawProductsAffiliatesWebhooks({
        id_user,
        status: findAffiliateStatusByKey('active').id,
      }),
      Suppliers.findAll({
        nest: true,
        where: { id_user, id_status: 2 },
        group: ['id_product'],
        include: [
          {
            association: 'product',
            attributes: ['name', 'uuid', 'id_type', 'id'],
          },
        ],
      }),
    ]);
    if (
      products.length === 0 &&
      productsAffiliates.length === 0 &&
      suppliers.length === 0
    ) {
      return res.status(200).send({
        rows: [],
      });
    }

    return res.status(200).send({
      rows: new SerializeProductsIntegrations(products, id_user).adapt(),
      affiliates: productsAffiliates,
      suppliers,
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

const findCoproductionsLinksController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { page = 0, size = 10 },
    params: { product_uuid },
  } = req;
  try {
    const product = await findSingleProductAffiliateOrCoproducer({
      uuid: product_uuid,
      '$coproductions.id_user$': id_user,
    });
    if (product) {
      const offers = await findOfferPaginatedLinks(
        { id_product: product.id, active: true },
        page,
        size,
      );
      return res.status(200).send({
        count: offers.count,
        rows: new SerializeLinks(offers.rows).adapt(),
      });
    }
    return res
      .status(200)
      .send({ message: 'Sem coproduções para este produto' });
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

const updateProductController = async (req, res, next) => {
  const {
    body,
    params: { product_id },
    user: { id: id_user },
  } = req;
  try {
    body.bling_sku = body.bling_sku?.trim() === '' ? null : body.bling_sku;
    body.tiny_sku = body.tiny_sku?.trim() === '' ? null : body.tiny_sku;
    if (body.email_template) {
      body.email_template = sanitizarTemplateEmail(body.email_template);
    }
    const { id } = await new UpdateProductUseCase(ProductsRepository).save({
      body,
      id_user,
      product_uuid: product_id,
    });
    const product = await findSingleProductWithProducer({ id });
    const plugin = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: [
          findIntegrationTypeByKey('blingshippingv3').id,
          findIntegrationTypeByKey('blingshipping').id,
        ],
      },
    });
    if (plugin) product.has_bling = true;

    const pluginTiny = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: [findIntegrationTypeByKey('tiny').id],
      },
    });
    if (pluginTiny) product.has_tiny = true;

    // Invalidate membership product cache
    await Cache.del(`membership_product:${product_id}`);
    // Also invalidate membership config cache
    await Cache.del(`membership_config_${product_id}`);

    return res.status(200).send(new SerializeSingleProduct(product).adapt());
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

const removeEmailTemplateController = async (req, res, next) => {
  const {
    params: { product_id },
    user: { id: id_user },
  } = req;
  try {
    const body = {
      email_template: null,
      email_subject: null,
    };
    await new UpdateProductUseCase(ProductsRepository).save({
      body,
      id_user,
      product_uuid: product_id,
    });

    return res.sendStatus(200);
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

const sendTemplateController = async (req, res, next) => {
  const {
    params: { product_id },
    user: { id: id_user, email, full_name },
    body: { email_template = null, email_subject = null },
  } = req;
  try {
    const product = await findSingleProductWithProducer({
      uuid: product_id,
      id_user,
    });
    if (product && email_template && email_subject) {
      await new ApprovedPayment({
        email,
        full_name,
        product_name: product.name,
        amount: 250,
        producer_name: 'Nome teste',
        support_email: product.support_email || 'teste@b4you.com.br',
        token: '!@123',
        type: product.content_delivery === 'physical' ? 'external' : null,
        sale_uuid: 'bce2ec83-f291-437e-9d5b-b50f1e76048b',
        email_subject,
        email_template,
      }).send();
    }

    return res.sendStatus(200);
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

const findProductsNameController = async (req, res, next) => {
  const {
    product: { id },
    user: { id: id_user },
  } = req;
  try {
    const products = await findProducts({
      id_user,
      id: {
        [Op.ne]: id,
      },
    });

    return res.status(200).send(new SerializeProductsName(products).adapt());
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

const updateProductMembershipColorController = async (req, res, next) => {
  const {
    product: { id, uuid },
    body: {
      hex_color,
      hex_color_secondary,
      hex_color_text,
      hex_color_hover,
      apply_membership_colors,
    },
  } = req;
  try {
    const shouldApplyMembershipColors = !!apply_membership_colors;

    await updateProduct(id, {
      hex_color_membership_primary: hex_color,
      hex_color_membership_secondary: hex_color_secondary,
      hex_color_membership_text: hex_color_text,
      hex_color_membership_hover: hex_color_hover,
      apply_membership_colors: shouldApplyMembershipColors,
    });
    await Cache.set(
      `membership_config_${uuid}`,
      JSON.stringify({
        hex_color_membership_primary: hex_color,
        hex_color_membership_secondary: hex_color_secondary,
        hex_color_membership_text: hex_color_text,
        hex_color_membership_hover: hex_color_hover,
        apply_membership_colors: shouldApplyMembershipColors,
      }),
    );
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

const getProductCategoriesController = async (req, res, next) => {
  try {
    return res.status(200).send(productCategories);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const deleteProductController = async (req, res, next) => {
  const {
    params: { product_id },
    user: { id: id_user },
  } = req;
  try {
    await new DeleteProductUseCase({
      product_id,
      id_user,
      ProductsRepository,
    }).execute();
    return res.sendStatus(200);
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

const deleteLogoController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteLogo(ProductsRepository, makeFileManager()).execute({
      product_uuid,
      id_user,
    });
    return res
      .status(200)
      .send({ success: true, message: 'Logo deletada com sucesso' });
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

const deleteCoverController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteCover(ProductsRepository, makeFileManager()).execute({
      product_uuid,
      id_user,
    });
    return res
      .status(200)
      .send({ success: true, message: 'Capa deletada com sucesso' });
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

const deleteEbookCoverController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id: product_uuid },
  } = req;
  try {
    await new DeleteEbookCover(ProductsRepository, makeFileManager()).execute({
      product_uuid,
      id_user,
    });
    return res
      .status(200)
      .send({ success: true, message: 'Capa deletada com sucesso' });
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

const updateListOnMarketController = async (req, res, next) => {
  const {
    product: {
      id: id_product,
      id_user,
      payment_type,
      list_on_market: p_list_market,
    },
    body: { list_on_market = false },
  } = req;
  try {
    if (!p_list_market) {
      throw ApiError.badRequest(
        'Produto necessita estar com a configuração “Listar na Vitrine” marcada como “Sim”.',
      );
    }
    const offer = await Product_offer.findOne({
      nest: true,
      attributes: ['id', 'price'],
      where: {
        id_product,
        active: true,
        allow_affiliate: true,
      },
      include: [{ association: 'plans', required: false }],
    });
    if (!offer) {
      throw ApiError.badRequest(
        'Produto precisa ter ao menos uma oferta com plano para com permissão de venda para afiliado.',
      );
    }
    if (payment_type === 'subscription' && offer.plans.length === 0) {
      throw ApiError.badRequest(
        'Produto assinatura precisa ter ao menos uma oferta com permissão de venda para afiliado.',
      );
    }
    const images = await Product_images.findOne({
      where: {
        id_product,
      },
    });
    if (!images) {
      throw ApiError.badRequest(
        'Para enviar solicitação ao mercado de afiliados, é necessário enviar ao menos uma imagem do produto.',
      );
    }
    const id_status_market = list_on_market
      ? findProductMarketStatusByKey('pending').id
      : findProductMarketStatusByKey('hide').id;
    await updateProduct(id_product, { id_status_market });
    await createVerifyMarket({
      id_user,
      id_product,
      requested_at: dateHelper().now(),
      id_status: findProductMarketVerifyStatusByKey('pending').id,
    });
    return res.sendStatus(200);
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

const cancelAffiliation = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_uuid },
  } = req;

  try {
    const affiliate = await Affiliates.findOne({
      raw: true,
      where: {
        id_user,
        status: [
          findAffiliateStatusByKey('active').id,
          findAffiliateStatusByKey('pending').id,
        ],
        '$product.uuid$': product_uuid,
      },
      include: [
        {
          association: 'product',
          attributes: ['uuid'],
        },
      ],
    });
    if (!affiliate) throw ApiError.badRequest('Afiliação não encontrada');
    await Affiliates.update(
      { status: findAffiliateStatusByKey('canceled').id },
      {
        where: { id: affiliate.id },
      },
    );
    return res.sendStatus(200);
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

const findProductsAffiliateController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const affiliates = await Affiliates.findAll({
      nest: true,
      attributes: ['status'],
      where: {
        id_user,
      },
      include: [
        {
          association: 'product',
          attributes: ['uuid', 'name', 'payment_type', 'id_type'],
          required: true,
        },
      ],
      order: [['id', 'desc']],
    });

    return res.status(200).send(
      affiliates.map(({ status, product }) => ({
        uuid: product.uuid,
        name: capitalizeName(product.name),
        type: resolveType(product.id_type),
        payment_type: product.payment_type,
        slug: slugify(product.name),
        status: findAffiliateStatus(status),
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

const findProductsRankingController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;

  try {
    const products = await findProductsRanking({
      id_user,
      page: Math.max(0, query.page - 1),
      size: query.size,
      start: query.start,
      end: query.end,
      id_category: query.category,
      order_by: query.filter,
    });

    return res.status(200).send(products);
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

const exportProductsRankingController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;

  try {
    const products = await findProductsRanking({
      id_user,
      page: 0,
      size: 1000,
      start: query.start,
      end: query.end,
      id_category: query.category,
      order_by: query.filter,
    });

    const csvData = products.rows.map((product, index) => ({
      Posição: `${index + 1}º`,
      Nome: product.product,
      Categoria: product.category,
      Faturamento: Number(product.total_sales).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      'Volume de Vendas': product.total_sold,
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=produtos_ranking_${dateHelper().now()}.csv`,
    );

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    csvData.forEach((item) => csvStream.write(item));
    csvStream.end();

    return res.status(200);
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

const findProductsWithOffersController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { subscriptions = true },
  } = req;

  try {
    const productsWithOffers = await findAllProductsForSelectUpsellAndOrderBump(
      {
        id_user,
        subscriptions,
      },
    );

    productsWithOffers.forEach((product) => {
      if (Array.isArray(product.product_offer)) {
        product.product_offer.forEach((offer) => {
          if (
            product.payment_type === 'subscription' &&
            offer.plans?.length > 0
          ) {
            const minPrice = offer.plans.reduce((min, plan) => {
              if (plan.price !== null && (min === null || plan.price < min)) {
                return plan.price;
              }
              return min;
            }, null);
            offer.price = minPrice;
          }
        });
      }
    });

    const plugin = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: [
          findIntegrationTypeByKey('blingshippingv3').id,
          findIntegrationTypeByKey('blingshipping').id,
        ],
      },
    });

    let has_bling = false;
    if (plugin) has_bling = true;

    return res
      .status(200)
      .send(
        new SerializeProductsWithOffers(productsWithOffers, has_bling).adapt(),
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

module.exports = {
  removeEmailTemplateController,
  findProductsAffiliateController,
  cancelAffiliation,
  createNewProductController,
  deleteCoverController,
  deleteEbookCoverController,
  deleteLogoController,
  deleteProductController,
  findCoproductionsLinksController,
  findProductsIntegrationsController,
  findProductsNameController,
  findSingleProductController,
  getProductCategoriesController,
  updateEbookCoverController,
  updateListOnMarketController,
  updateProductController,
  updateProductCoverController,
  updateProductLogoController,
  uploadCertificateController,
  updateProductVideoController,
  deleteProductVideoController,
  updateProductMembershipColorController,
  findProductsPaginatedController,
  findEcommercePaginatedController,
  findCoproductionsController,
  findProductsRankingController,
  exportProductsRankingController,
  sendTemplateController,
  findShopifyProductPaginatedController,
  findProductsWithOffersController,
};
