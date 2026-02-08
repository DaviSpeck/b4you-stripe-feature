const ApiError = require("../../error/ApiError");
const ShortLinksService = require('../../services/ShortLinkService');
const { findOwnerType } = require("../../types/ownerTypes");

module.exports.create = async (req, res, next) => {
    try {
        const {
            type,            // PAGE | OFFER
            target_uuid,
            owner_type,      // producer | coproducer | affiliate | global
            owner_uuid: bodyOwnerUuid,
        } = req.body;

        if (!type || !target_uuid || !owner_type) {
            return res.status(400).json({ error: "Dados inválidos" });
        }

        const ownerTypeObj = findOwnerType(owner_type);
        if (!ownerTypeObj) {
            throw ApiError.badRequest("owner_type inválido");
        }

        let owner_uuid = bodyOwnerUuid;

        if (owner_type === "producer" || owner_type === "coproducer") {
            owner_uuid = req.user?.id;

            if (!owner_uuid) {
                return res.status(400).json({
                    error: "owner_uuid não encontrado para producer/coproducer",
                });
            }
        }

        if (owner_type === "global") {
            owner_uuid = null;
        }

        const short_link = await ShortLinksService.createManual({
            type,
            owner_type_id: ownerTypeObj.id,
            owner_uuid,
            page_uuid: type === "PAGE" ? target_uuid : null,
            offer_uuid: type === "OFFER" ? target_uuid : null,
        });

        return res.status(201).json({ short_link });
    } catch (error) {
        if (error instanceof ApiError) return res.status(error.code).send(error);

        return next(
            ApiError.internalServerError(
                `Erro interno em ${req.method} ${req.originalUrl}`,
                error
            )
        );
    }
};