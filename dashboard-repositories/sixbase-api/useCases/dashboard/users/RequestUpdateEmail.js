const ApiError = require('../../../error/ApiError');
const UpdateEmail = require('../../../services/email/producer/profile/UpdateEmail');
const { generateRandomCode } = require('../../../utils/generators');
const { validateEmail } = require('../../../utils/validations');
const { findUserHistoryTypeByKey } = require('../../../types/userHistory');

module.exports = class RequestUpdateUserEmail {
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
    new_email,
    ip = 'Não obtido',
    agent = 'Não obtido',
  }) {
    if (!validateEmail(new_email)) throw ApiError.badRequest('Email inválido');
    const user = await this.#UserRepository.findById(id_user);
    if (!user) throw ApiError.badRequest('Usuário não informado');
    const alreadyRegisterUser = await this.#UserRepository.findByEmail(
      new_email,
    );
    if (alreadyRegisterUser)
      throw ApiError.badRequest('Já existe uma conta cadastrada neste email');
    if (user.email === new_email)
      throw ApiError.badRequest(
        'Email não pode ser o mesmo utilizado atualmente',
      );
    const userHistory = await this.#UserHistoryRepository.find({
      id_user,
      params: {
        '"success"': false,
      },
    });
    if (userHistory) {
      await this.#UserHistoryRepository.delete({ id: userHistory.id });
    }
    const data = {
      id_user: user.id,
      id_type: findUserHistoryTypeByKey('mail-update').id,
      params: {
        old_email: user.email,
        new_email,
        ip,
        success: false,
        old_email_verification_code: generateRandomCode(6).toUpperCase(),
        new_email_verification_code: generateRandomCode(6).toUpperCase(),
        agent,
      },
    };
    await new UpdateEmail(this.#EmailService).send({
      full_name: user.full_name,
      email: user.email,
      new_email,
      old_email: user.email,
      code: data.params.old_email_verification_code,
      ip,
    });
    await new UpdateEmail(this.#EmailService).send({
      full_name: user.full_name,
      email: new_email,
      old_email: user.email,
      new_email,
      code: data.params.new_email_verification_code,
      ip,
    });
    await this.#UserHistoryRepository.create(data);
  }
};
