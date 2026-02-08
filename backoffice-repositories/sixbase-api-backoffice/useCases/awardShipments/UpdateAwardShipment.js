module.exports = class UpdateAwardShipment {
  constructor(AwardShipmentsRepository) {
    this.AwardShipmentsRepository = AwardShipmentsRepository;
  }

  async execute(id, data) {
    const row = await this.AwardShipmentsRepository.findById(id);
    if (!row) {
      const err = new Error('Registro não encontrado');
      err.status = 404;
      throw err;
    }
    await this.AwardShipmentsRepository.updateById(id, data);
    return this.AwardShipmentsRepository.findById(id);
  }
};
