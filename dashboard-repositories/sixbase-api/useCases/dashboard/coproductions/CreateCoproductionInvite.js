const ApiError = require('../../../error/ApiError');
const CoproductionInviteEmail = require('../../../services/email/CoproductionInvite');
const DateHelper = require('../../../utils/helpers/date');
const {
  DATABASE_DATE,
  FRONTEND_DATE_WITHOUT_TIME,
} = require('../../../types/dateTypes');
const {
  findCoproductionStatus,
} = require('../../../status/coproductionsStatus');
const { MAXCOMMISSION } = require('./common');
const Affiliates = require('../../../database/models/Affiliates');
const Suppliers = require('../../../database/models/Suppliers');
const Managers = require('../../../database/models/Managers');

const validateCommission = (commission, pendingAndActiveCoproductions) => {
  const commissionInUse = pendingAndActiveCoproductions.reduce(
    (acc, { commission_percentage }) => {
      acc += commission_percentage;
      return acc;
    },
    0,
  );

  if (commission + commissionInUse > MAXCOMMISSION)
    throw ApiError.badRequest({
      text: 'A comissão solicitada é maior do que a definida para este produto',
      available: MAXCOMMISSION - commissionInUse,
    });
};

const validatePendingInvites = async ({
  id_producer,
  id_coproducer,
  id_product,
  CoproductionsInvitesRepository,
}) => {
  const pending_invites = await CoproductionsInvitesRepository.find({
    id_productor: id_producer,
    id_coproducer,
    id_product,
    status: findCoproductionStatus('Pendente').id,
  });

  if (pending_invites) {
    const expired = DateHelper().diff(pending_invites.expires_at, 'd');
    if (expired < 0)
      throw ApiError.badRequest(
        'This product already have a invite, but the invitation has not expired yet.',
      );
  }
  const affiliations = await Affiliates.findOne({
    raw: true,
    where: { status: [1, 2, 3], id_product, id_user: id_coproducer },
    attributes: ['id'],
  });
  if (affiliations) {
    throw ApiError.badRequest('Usuário tem afiliação neste produto');
  }
  const supplier = await Suppliers.findOne({
    raw: true,
    attributes: ['id'],
    where: { id_user: id_coproducer, id_product, id_status: [1, 2] },
  });
  if (supplier) {
    throw ApiError.badRequest('Usuário é fornecedor neste produto');
  }
  const manager = await Managers.findOne({
    raw: true,
    attributes: ['id'],
    where: { id_user: id_coproducer, id_product, id_status: [1, 2] },
  });
  if (manager) {
    throw ApiError.badRequest('Usuário é gerente neste produto');
  }
};

const validateActiveCoproductions = (coproductions, id_coproducer) => {
  const isThereCoproduction = coproductions.filter(
    (coproduction) => coproduction.id_user === id_coproducer,
  );
  if (isThereCoproduction.length > 0)
    throw ApiError.badRequest(
      'Este produto já possui coprodução ativa/pendente',
    );
};

const createCoproduction = async ({
  id_producer,
  id_coproductor,
  id_product,
  commission,
  days_to_expire,
  split_invoice,
  allow_access,
  CoproductionsRepository,
  CoproductionsInvitesRepository,
}) => {
  const expire_date =
    days_to_expire !== 0
      ? DateHelper().add(days_to_expire, 'd').format(DATABASE_DATE)
      : null;

  const invite = await CoproductionsInvitesRepository.create({
    id_productor: id_producer,
    id_coproducer: id_coproductor,
    id_product,
    status: findCoproductionStatus('Pendente').id,
    commission_percentage: commission,
    expires_at: DateHelper().add(7, 'd').format(DATABASE_DATE),
  });

  await CoproductionsRepository.create({
    id_product,
    id_user: id_coproductor,
    commission_percentage: commission,
    status: findCoproductionStatus('Pendente').id,
    expires_at: expire_date,
    id_invite: invite.id,
    split_invoice,
    allow_access,
  });

  return invite;
};

module.exports = class CreateCoproductionInvite {
  #id_product;

  #id_producer;

  #commission;

  #coproducer_email;

  #days_to_expire;

  #producer_email;

  #producer_first_name;

  #producer_last_name;

  #product_name;

  #split_invoice;

  #allow_access;

  #UserRepository;

  #CoproductionsRepository;

  #CoproductionsInvitesRepository;

  #EmailService;

  constructor(
    {
      id_product,
      id_producer,
      commission,
      coproducer_email,
      days_to_expire,
      producer_email,
      producer_first_name,
      producer_last_name,
      product_name,
      split_invoice,
      allow_access,
    },
    UserRepository,
    CoproductionsRepository,
    CoproductionsInvitesRepository,
    EmailService,
  ) {
    this.#id_product = id_product;
    this.#id_producer = id_producer;
    this.#commission = commission;
    this.#coproducer_email = coproducer_email;
    this.#days_to_expire = days_to_expire;
    this.#producer_email = producer_email;
    this.#producer_first_name = producer_first_name;
    this.#producer_last_name = producer_last_name;
    this.#product_name = product_name;
    this.#split_invoice = split_invoice;
    this.#allow_access = allow_access;
    this.#UserRepository = UserRepository;
    this.#CoproductionsRepository = CoproductionsRepository;
    this.#CoproductionsInvitesRepository = CoproductionsInvitesRepository;
    this.#EmailService = EmailService;
  }

  async execute() {
    if (this.#producer_email === this.#coproducer_email)
      throw ApiError.badRequest(
        'Você não pode enviar uma solicitação de coprodução para si mesmo.',
      );
    const coproducer = await this.#UserRepository.findByEmail(
      this.#coproducer_email,
    );
    if (!coproducer) throw ApiError.badRequest('Coprodutor não encontrado');

    const coproductions = await this.#CoproductionsRepository.findAll({
      id_product: this.#id_product,
    });
    const pendingAndActiveCoproductions = coproductions.filter(
      (coproduction) =>
        coproduction.status === findCoproductionStatus('Ativo').id ||
        coproduction.status === findCoproductionStatus('Pendente').id,
    );
    validateCommission(this.#commission, pendingAndActiveCoproductions);
    validateActiveCoproductions(pendingAndActiveCoproductions, coproducer.id);
    await validatePendingInvites({
      id_producer: this.#id_producer,
      id_coproducer: coproducer.id,
      id_product: this.#id_product,
      CoproductionsInvitesRepository: this.#CoproductionsInvitesRepository,
    });
    await createCoproduction({
      id_producer: this.#id_producer,
      id_coproductor: coproducer.id,
      id_product: this.#id_product,
      commission: this.#commission,
      days_to_expire: this.#days_to_expire,
      split_invoice: this.#split_invoice,
      allow_access: this.#allow_access,
      CoproductionsRepository: this.#CoproductionsRepository,
      CoproductionsInvitesRepository: this.#CoproductionsInvitesRepository,
    });
    const expire_date =
      this.#days_to_expire !== 0
        ? DateHelper()
            .add(this.#days_to_expire, 'd')
            .format(FRONTEND_DATE_WITHOUT_TIME)
        : 'Vitalício ou até cancelar';
    await new CoproductionInviteEmail(
      {
        email: coproducer.email,
        full_name: coproducer.full_name,
        producer: `${this.#producer_first_name} ${this.#producer_last_name}`,
        product_name: this.#product_name,
        commission: this.#commission,
        due_date: expire_date,
      },
      this.#EmailService,
    ).send();
    return {
      success: true,
      message: 'Coprodução criada com sucesso',
      status: findCoproductionStatus('Pendente'),
    };
  }
};
