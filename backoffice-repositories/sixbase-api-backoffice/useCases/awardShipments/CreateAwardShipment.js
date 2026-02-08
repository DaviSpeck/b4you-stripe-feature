module.exports = class CreateAwardShipment {
  constructor(AwardShipmentsRepository) {
    this.AwardShipmentsRepository = AwardShipmentsRepository;
  }

  async execute({
    producer_id,
    producer_uuid,
    producer_email,
    milestone,
    achieved_date,
    tracking_code,
    tracking_link,
    status,
    sent_date,
  }) {
    const Database = require('../../database/models');
    const { QueryTypes } = require('sequelize');

    if (!producer_id) {
      let query, replacements, errorMessage;
      if (producer_uuid) {
        query = 'SELECT id FROM users WHERE uuid = :identifier LIMIT 1';
        replacements = { identifier: producer_uuid };
        errorMessage = 'Produtor não encontrado para o UUID informado';
      } else if (producer_email) {
        query = 'SELECT id FROM users WHERE email = :identifier LIMIT 1';
        replacements = { identifier: producer_email };
        errorMessage = 'Produtor não encontrado para o email informado';
      } else {
        const err = new Error('UUID ou email do produtor é obrigatório');
        err.status = 400;
        throw err;
      }

      const row = await Database.sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements,
      });
      const found = Array.isArray(row) ? row[0] : row;
      if (!found) {
        const err = new Error(errorMessage);
        err.status = 404;
        throw err;
      }
      producer_id = found.id;
    }

    const [eligibility] = await Database.sequelize.query(
      'SELECT award_eligible FROM users WHERE id = :id LIMIT 1',
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { id: producer_id },
      },
    );
    if (!eligibility || eligibility.award_eligible !== true) {
      const err = new Error('Produtor inelegível para premiação');
      err.status = 403;
      throw err;
    }

    const existing =
      await this.AwardShipmentsRepository.findByProducerAndMilestone(
        producer_id,
        milestone,
      );
    if (existing) {
      const err = new Error(
        'Registro já existe para este produtor e milestone',
      );
      err.status = 409;
      throw err;
    }

    return this.AwardShipmentsRepository.create({
      producer_id,
      milestone,
      achieved_date,
      tracking_code: tracking_code || null,
      tracking_link: tracking_link || null,
      status: status || 'pending',
      sent_date: sent_date || null,
    });
  }
};
