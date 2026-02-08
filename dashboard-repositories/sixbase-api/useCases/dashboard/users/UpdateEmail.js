const ApiError = require('../../../error/ApiError');
const SuccessEmail = require('../../../services/email/producer/profile/SuccessUpdatedEmail');

module.exports = class UpdateUserEmail {
  #UserHistoryRepository;

  #UserRepository;

  #EmailService;

  constructor(UserHistoryRepository, UserRepository, EmailService) {
    this.#UserHistoryRepository = UserHistoryRepository;
    this.#UserRepository = UserRepository;
    this.#EmailService = EmailService;
  }

  async execute({
    id_user,
    current_token,
    new_token,
    ip = 'Não obtido',
    agent = 'Não obtido',
  }) {
    if (!new_token || !current_token)
      throw ApiError.badRequest('Token não informado');
    const user = await this.#UserRepository.findById(id_user);
    if (!user) throw ApiError.badRequest('Usuário não informado');
    const userHistory = await this.#UserHistoryRepository.find({
      id_user,
      params: {
        '"old_email_verification_code"': current_token,
        '"new_email_verification_code"': new_token,
        '"success"': false,
      },
    });
    if (!userHistory) throw ApiError.badRequest('Tokens inválidos');
    const alreadyRegisterUser = await this.#UserRepository.findByEmail(
      userHistory.params.new_email,
    );
    if (alreadyRegisterUser)
      throw ApiError.badRequest('Já existe uma conta cadastrada neste email');
    await this.#UserHistoryRepository.update(
      { id: userHistory.id },
      {
        params: {
          ...userHistory.params,
          ip_token: ip,
          agent_token: agent,
          success: true,
        },
      },
    );
    await new SuccessEmail(this.#EmailService).send({
      full_name: user.full_name,
      email: userHistory.params.old_email,
      new_email: userHistory.params.new_email,
      old_email: userHistory.params.old_email,
      ip,
    });
    await new SuccessEmail(this.#EmailService).send({
      full_name: user.full_name,
      email: userHistory.params.new_email,
      old_email: userHistory.params.old_email,
      new_email: userHistory.params.new_email,
      ip,
    });
    await this.#UserRepository.update(
      { id: id_user },
      { email: userHistory.params.new_email },
    );
  }
};
