const ApiError = require('../../../error/ApiError');
const CoproductionCancelInviteEmail = require('../../../services/email/CoproductionInviteCanceled');
const {
  findCoproductionStatusByKey,
} = require('../../../status/coproductionsStatus');
const { capitalizeName } = require('../../../utils/formatters');
const CoproductionCancel = require('../../../services/email/CoproductionCanceledProducer');

module.exports = class CancelCoproduction {
  #id_product;

  #coproduction_uuid;

  #producer_name;

  #CoproductionsRepository;

  #CoproductionsInvitesRepository;

  #EmailService;

  constructor(
    { id_product, coproduction_uuid, producer_name },
    CoproductionsRepository,
    CoproductionsInvitesRepository,
    EmailService,
  ) {
    this.#id_product = id_product;
    this.#coproduction_uuid = coproduction_uuid;
    this.#producer_name = producer_name;
    this.#CoproductionsRepository = CoproductionsRepository;
    this.#CoproductionsInvitesRepository = CoproductionsInvitesRepository;
    this.#EmailService = EmailService;
  }

  async execute() {
    const coproduction = await this.#CoproductionsRepository.find({
      id_product: this.#id_product,
      uuid: this.#coproduction_uuid,
      status: [
        findCoproductionStatusByKey('pending').id,
        findCoproductionStatusByKey('active').id,
      ],
    });

    if (!coproduction)
      throw ApiError.badRequest(
        'Você pode somente cancelar convites pendentes ainda não aceitos pelo produtor',
      );

    await this.#CoproductionsInvitesRepository.update(coproduction.id_invite, {
      status: findCoproductionStatusByKey('canceled').id,
    });

    await this.#CoproductionsRepository.update(
      { id: coproduction.id },
      { status: findCoproductionStatusByKey('canceled').id },
    );

    const emailData = {
      full_name: capitalizeName(
        `${coproduction.user.first_name} ${coproduction.user.last_name}`,
      ),
      email: coproduction.user.email,
      producer: capitalizeName(this.#producer_name),
      product_name: coproduction.product.name,
    };

    if (coproduction.status === findCoproductionStatusByKey('pending').id) {
      await new CoproductionCancelInviteEmail(
        emailData,
        this.#EmailService,
      ).send();
    } else {
      await new CoproductionCancel(emailData, this.#EmailService).send();
    }

    return coproduction;
  }
};
