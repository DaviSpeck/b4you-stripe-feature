module.exports = class ConfirmAwardShipment {
  constructor(AwardShipmentsRepository) {
    this.AwardShipmentsRepository = AwardShipmentsRepository;
  }

  async execute({ id, tracking_code, tracking_link, sent_date }) {
    const row = await this.AwardShipmentsRepository.findById(id);
    if (!row) {
      const err = new Error('Registro não encontrado');
      err.status = 404;
      throw err;
    }

    await this.AwardShipmentsRepository.updateById(id, {
      tracking_code: tracking_code ?? row.tracking_code,
      tracking_link: tracking_link ?? row.tracking_link,
      sent_date: sent_date || new Date(),
      status: 'sent',
    });

    return this.AwardShipmentsRepository.findById(id);
  }
};
