const ApiError = require('../../error/ApiError');
const {
  createUserBankAccounts,
  findUserBankAccounts,
} = require('../../database/controllers/user_bank_accounts');


const onlyDigits = (v) => (v == null ? v : String(v).replace(/\D/g, ''));

const getUserId = (req) =>
  (req.owner && req.owner.id) || (req.user && req.user.id);


const findUserBank = async (req, res, next) => {
  try {
    const id_user = getUserId(req);
    if (!id_user) throw ApiError.unauthorized('Usuário não autenticado');

    const current = await findUserBankAccounts(id_user);

    return res.status(200).send(current || {});
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const createUserBank = async (req, res, next) => {
  try {
    const id_user = getUserId(req);
    if (!id_user) throw ApiError.unauthorized('Usuário não autenticado');

    const {
      // PF
      document_number,
      bank_code,
      agency,
      account_number,
      account_type,
      // PJ
      cnpj,
      company_bank_code,
      company_agency,
      company_account_number,
      company_account_type,
      is_company,
      pending_approval,
    } = req.body || {};

    const payload = {
      id_user,
      is_company: !!is_company,
      pending_approval: !!pending_approval,
      document_number: onlyDigits(document_number),
      bank_code,
      agency: onlyDigits(agency),
      account_number: onlyDigits(account_number),
      account_type,
      cnpj: onlyDigits(cnpj),
      company_bank_code,
      company_agency: onlyDigits(company_agency),
      company_account_number: onlyDigits(company_account_number),
      company_account_type,
    };
    const created = await createUserBankAccounts(payload);
    return res.status(201).send(created);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  createUserBank,
  findUserBank,
};
