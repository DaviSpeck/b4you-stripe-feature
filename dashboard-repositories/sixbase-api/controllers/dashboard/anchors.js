const ApiError = require('../../error/ApiError');
const CreateAnchor = require('../../useCases/dashboard/anchors/CreateAnchor');
const UpdateAnchor = require('../../useCases/dashboard/anchors/UpdateAnchor');
const FindAnchors = require('../../useCases/dashboard/anchors/FindAnchors');
const DeleteAnchor = require('../../useCases/dashboard/anchors/DeleteAnchor');
const AnchorsRepository = require('../../repositories/sequelize/AnchorsRepository');
const ModulesAnchorsRepository = require('../../repositories/sequelize/ModulesAnchorsRepository');
const SerializeAnchors = require('../../presentation/dashboard/anchors');
const LinkModule = require('../../useCases/dashboard/anchors/LinkModule');
const anchorsRepository = require('../../repositories/sequelize/AnchorsRepository');
const modulesRepository = require('../../repositories/sequelize/ModulesRepository');
const modulesAnchorsRepository = require('../../repositories/sequelize/ModulesAnchorsRepository');
const productsRepository = require('../../repositories/sequelize/ProductsRepository');
const UnlinkModule = require('../../useCases/dashboard/anchors/UnlinkModule');
const ReorderAnchors = require('../../useCases/dashboard/anchors/ReorderAnchors');
const ReorderModules = require('../../useCases/dashboard/anchors/ReorderModules');
const GetModules = require('../../useCases/dashboard/anchors/GetModules');
const UpdateAnchorView = require('../../useCases/dashboard/anchors/UpdateAnchorView');

module.exports = class AnchorsController {
  static async create(req, res, next) {
    const {
      body,
      product: { id: id_product },
    } = req;
    try {
      const anchor = await new CreateAnchor(AnchorsRepository).execute({
        ...body,
        id_product,
      });
      return res.status(200).send(new SerializeAnchors(anchor).adapt());
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
  }

  static async update(req, res, next) {
    const {
      body,
      product: { id: id_product },
      params: { anchorUuid },
    } = req;
    try {
      const anchor = await new UpdateAnchor(AnchorsRepository).execute({
        ...body,
        id_product,
        uuid: anchorUuid,
      });
      return res.status(200).send(new SerializeAnchors(anchor).adapt());
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
  }

  static async get(req, res, next) {
    const {
      product: { id: id_product },
    } = req;
    try {
      const anchors = await new FindAnchors(AnchorsRepository).execute({
        id_product,
      });
      return res.status(200).send(new SerializeAnchors(anchors).adapt());
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
  }

  static async delete(req, res, next) {
    const {
      product: { id: id_product },
      params: { anchorUuid },
    } = req;
    try {
      const anchors = await new DeleteAnchor(
        AnchorsRepository,
        ModulesAnchorsRepository,
      ).execute({
        id_product,
        uuid: anchorUuid,
      });
      return res.status(200).send(new SerializeAnchors(anchors).adapt());
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
  }

  static async link(req, res, next) {
    const {
      params: { anchorUuid, moduleUuid },
      product: { id: id_product },
    } = req;
    try {
      const linkedModule = await new LinkModule(
        anchorsRepository,
        modulesRepository,
        modulesAnchorsRepository,
      ).execute({
        anchorUuid,
        moduleUuid,
        id_product,
      });
      return res.status(200).send(linkedModule);
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
  }

  static async unlink(req, res, next) {
    const {
      params: { anchorUuid, moduleUuid },
      product: { id: id_product },
    } = req;
    try {
      await new UnlinkModule(
        anchorsRepository,
        modulesRepository,
        modulesAnchorsRepository,
      ).execute({
        anchorUuid,
        moduleUuid,
        id_product,
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
  }

  static async reorder(req, res, next) {
    const {
      body: { anchors_uuid },
      product: { id: id_product },
    } = req;
    try {
      await new ReorderAnchors(anchorsRepository).execute({
        anchorsUuid: anchors_uuid,
        id_product,
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
  }

  static async reorderModules(req, res, next) {
    const {
      body: { modules_uuid },
      product: { id: id_product },
      params: { anchorUuid },
    } = req;
    try {
      await new ReorderModules(
        anchorsRepository,
        modulesAnchorsRepository,
        modulesRepository,
      ).execute({
        anchorUuid,
        id_product,
        modulesUuid: modules_uuid,
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
  }

  static async getModules(req, res, next) {
    const {
      product: { id: id_product },
    } = req;
    try {
      const modules = await new GetModules(
        modulesRepository,
        anchorsRepository,
      ).execute({
        id_product,
      });
      return res
        .status(200)
        .send(modules.map(({ uuid, title }) => ({ uuid, title })));
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
  }

  static async updateAnchorView(req, res, next) {
    const {
      product: { id: id_product },
      body: { anchor_view },
    } = req;
    try {
      await new UpdateAnchorView(productsRepository).execute({
        id_product,
        anchor_view,
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
  }

  static async getAnchorView(req, res, next) {
    const {
      product: { anchor_view },
    } = req;
    try {
      return res.status(200).send({ anchor_view });
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
  }
};
