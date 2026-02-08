const AwardShipmentsRepository = require('../repositories/sequelize/AwardShipmentsRepository');
const CreateAwardShipment = require('../useCases/awardShipments/CreateAwardShipment');
const ConfirmAwardShipment = require('../useCases/awardShipments/ConfirmAwardShipment');
const ListAwardShipments = require('../useCases/awardShipments/ListAwardShipments');
const UpdateAwardShipment = require('../useCases/awardShipments/UpdateAwardShipment');
const DeleteAwardShipment = require('../useCases/awardShipments/DeleteAwardShipment');
const AwardShipped = require('../services/email/awards/AwardShipped');
const Database = require('../database/models');
const { QueryTypes } = require('sequelize');
const { validateUrl } = require('../utils/validators/url');
const logger = require('../utils/logger');

module.exports = {
  async create(req, res, next) {
    try {
      const useCase = new CreateAwardShipment(AwardShipmentsRepository);
      const result = await useCase.execute(req.body);
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  },

  async confirm(req, res, next) {
    try {
      const useCase = new ConfirmAwardShipment(AwardShipmentsRepository);
      const result = await useCase.execute({
        id: Number(req.params.id),
        ...req.body,
      });

      const awardData = await AwardShipmentsRepository.findById(
        Number(req.params.id),
      );
      if (awardData) {
        const producer = await Database.sequelize.query(
          `SELECT full_name, email FROM users WHERE id = :producer_id`,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { producer_id: awardData.producer_id },
          },
        );

        const hasProducer = producer.length > 0;
        const hasTrackingCode = Boolean(awardData.tracking_code) && awardData.tracking_code !== '-' ;
        const hasValidTrackingLink = awardData.tracking_link && validateUrl(awardData.tracking_link);

        if (hasProducer && hasTrackingCode && hasValidTrackingLink) {
          const emailService = new AwardShipped({
            email: producer[0].email,
            full_name: producer[0].full_name,
            milestone: awardData.milestone,
            tracking_code: awardData.tracking_code,
            tracking_link: awardData.tracking_link,
          });

          emailService.send().catch((emailErr) => {
            logger.error('[AwardShipmentsController][confirm] Error:', emailErr)
          });
        }
      }

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async list(req, res, next) {
    try {
      const {
        producer_id,
        producer_uuid,
        milestone,
        status,
        input,
        start_date,
        end_date,
        page = 0,
        size = 20,
      } = req.query;

      let finalProducerId = producer_id ? Number(producer_id) : undefined;

      if (producer_uuid && !finalProducerId) {
        const user = await Database.sequelize.query(
          `SELECT id FROM users WHERE uuid = :uuid`,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { uuid: producer_uuid },
          },
        );

        if (user.length > 0) {
          finalProducerId = user[0].id;
        }
      }

      const useCase = new ListAwardShipments(AwardShipmentsRepository);
      const result = await useCase.execute({
        producer_id: finalProducerId,
        milestone,
        status,
        input,
        start_date,
        end_date,
        page: Number(page),
        size: Number(size),
      });

      const producerIds = Array.from(
        new Set(result.rows.map((r) => r.producer_id).filter(Boolean)),
      );

      let usersMap = {};
      let commissionMap = {};

      if (producerIds.length) {
        const users = await Database.sequelize.query(
          `SELECT id, uuid, full_name, email, whatsapp FROM users WHERE id IN (:ids)`,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { ids: producerIds },
          },
        );
        usersMap = users.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {});
        const commissionRows = await Database.sequelize.query(
          `
          SELECT c.id_user AS producer_id, COALESCE(SUM(c.amount), 0) AS total
          FROM commissions c
          JOIN sales_items si ON si.id = c.id_sale_item
          WHERE si.id_status IN (2) AND c.id_user IN (:ids)
          GROUP BY c.id_user
          `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: { ids: producerIds },
          },
        );
        commissionMap = commissionRows.reduce((acc, r) => {
          acc[r.producer_id] = Number(r.total || 0);
          return acc;
        }, {});
      }

      const enriched = {
        count: result.count,
        rows: result.rows.map((row) => ({
          ...row,
          producer: usersMap[row.producer_id]
            ? {
              id: row.producer_id,
              uuid: usersMap[row.producer_id].uuid,
              full_name: usersMap[row.producer_id].full_name,
              email: usersMap[row.producer_id].email,
              phone: usersMap[row.producer_id].whatsapp,
            }
            : null,
          user_total_comission: commissionMap[row.producer_id] || 0,
        })),
      };

      return res.json(enriched);
    } catch (err) {
      return next(err);
    }
  },

  async update(req, res, next) {
    try {
      const useCase = new UpdateAwardShipment(AwardShipmentsRepository);
      const result = await useCase.execute(Number(req.params.id), req.body);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const useCase = new DeleteAwardShipment(AwardShipmentsRepository);
      const result = await useCase.execute(Number(req.params.id));
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  },
};
