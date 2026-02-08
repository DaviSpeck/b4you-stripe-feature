const ApiError = require('../../../error/ApiError');
const ChangeCommissionUserAffiliate = require('../../../services/email/ChangeCommissionUserAffiliate');
const {
  findCoproductionStatusByKey,
} = require('../../../status/coproductionsStatus');
const { MAXCOMMISSION } = require('./common');

module.exports = class UpdateCoproducerCommission {
  #commission;

  #id_product;

  #coproducer_uuid;

  #CoproductionsRepository;

  #CoproductionsInvitesRepository;

  #EmailService;

  constructor(
    { commission, id_product, coproducer_uuid },
    CoproductionsRepository,
    CoproductionsInvitesRepository,
    EmailService,
  ) {
    this.#commission = commission;
    this.#coproducer_uuid = coproducer_uuid;
    this.#id_product = id_product;
    this.#CoproductionsRepository = CoproductionsRepository;
    this.#CoproductionsInvitesRepository = CoproductionsInvitesRepository;
    this.#EmailService = EmailService;
  }

  async execute() {
    const coproduction = await this.#CoproductionsRepository.find({
      uuid: this.#coproducer_uuid,
      status: [
        findCoproductionStatusByKey('pending').id,
        findCoproductionStatusByKey('active').id,
      ],
      id_product: this.#id_product,
    });
    if (!coproduction) throw ApiError.badRequest('Coprodutor não encontrado');

    const coproductions = await this.#CoproductionsRepository.findAll({
      id_product: this.#id_product,
      status: [
        findCoproductionStatusByKey('pending').id,
        findCoproductionStatusByKey('active').id,
      ],
    });

    const totalCommission = coproductions.reduce(
      (acc, { commission_percentage }) => {
        acc += commission_percentage;
        return acc;
      },
      0,
    );

    const availableCommission =
      totalCommission - coproduction.commission_percentage + this.#commission;
    if (availableCommission > 99)
      throw ApiError.badRequest({
        text: 'A comissão solicitada é maior do que a definida para este produto',
        available:
          MAXCOMMISSION - totalCommission + coproduction.commission_percentage,
      });

    await this.#CoproductionsRepository.update(
      { id: coproduction.id },
      { commission_percentage: this.#commission },
    );

    await this.#CoproductionsInvitesRepository.update(coproduction.invite.id, {
      commission_percentage: this.#commission,
    });

    await new ChangeCommissionUserAffiliate(
      {
        email: coproduction.user.email,
        affiliate_name: `${coproduction.user.first_name} ${coproduction.user.last_name}`,
        old_commission: coproduction.commission_percentage,
        new_commission: this.#commission,
        product_name: coproduction.product.name,
      },
      this.#EmailService,
    ).send();
  }
};
