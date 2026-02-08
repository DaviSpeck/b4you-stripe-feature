module.exports = class DeleteAwardShipment {
  constructor(AwardShipmentsRepository) {
    this.AwardShipmentsRepository = AwardShipmentsRepository;
  }

  async execute(id) {
    const row = await this.AwardShipmentsRepository.findById(id);
    if (!row) {
      const err = new Error('Registro não encontrado');
      err.status = 404;
      throw err;
    }
    await this.AwardShipmentsRepository.deleteById(id);
    return { success: true };
  }
};
