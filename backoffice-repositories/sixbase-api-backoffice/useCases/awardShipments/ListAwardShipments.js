module.exports = class ListAwardShipments {
  constructor(AwardShipmentsRepository) {
    this.AwardShipmentsRepository = AwardShipmentsRepository;
  }

  async execute({
    producer_id,
    milestone,
    status,
    input,
    start_date,
    end_date,
    page,
    size,
  }) {
    return this.AwardShipmentsRepository.list({
      producer_id,
      milestone,
      status,
      input,
      start_date,
      end_date,
      page,
      size,
    });
  }
};
