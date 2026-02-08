const {
  getSignedUrl,
  S3RequestPresigner,
} = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const {
  findUserByID,
  findUserByUUID,
  findRawUserByID,
} = require('../database/controllers/users');
const ApprovedDocuments = require('../services/email/producer/kyc/ApprovedDocuments');
const ReprovedDocuments = require('../services/email/producer/kyc/ReprovedDocuments');
const ApprovedCNPJ = require('../services/email/producer/kyc/AprovedCNPJ');
const ReproveCNPJ = require('../services/email/producer/kyc/ReprovedCNPJ');
const {
  findVerifyIdentity,
  findVerifyIdentities,
  findVerifyIdentitiesCNPJ,
  findUserHistory,
} = require('../database/controllers/verify_identity');
const { sequelize: dbInstance } = require('../database/models/index');
const s3 = require('../config/s3');
const VerifyIdentityRepository = require('../repositories/sequelize/VerifyIdentityRepository');
const UsersRepository = require('../repositories/sequelize/UsersRepository');
const FindUserKycs = require('../useCases/kyc/FindUserKyc');
const ApiError = require('../error/ApiError');
const {
  createLogBackoffice,
} = require('../database/controllers/logs_backoffice');
const { findRoleTypeByKey } = require('../types/userEvents');
const { capitalizeName } = require('../utils/formatters');

const getVerifications = async (req, res) => {
  const { status = 2, page = 0, size = 10 } = req.query;
  try {
    const verifications = await findVerifyIdentities({ status }, page, size);

    return res.status(200).send({
      count: verifications.count,
      rows: verifications.rows.map((r) => ({
        ...r,
        user: {
          ...r.user,
          full_name: capitalizeName(r.user.full_name),
        },
      })),
    });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getCNPJVerifications = async (req, res) => {
  const { status_cnpj = 2 } = req.query;
  try {
    const verifications = await findVerifyIdentitiesCNPJ({ status_cnpj });

    return res.status(200).send(verifications);
  } catch (error) {
    return res.status(500).send(error);
  }
};

// eslint-disable-next-line consistent-return
const createPresignedUrlWithClient = ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

const getKycFile = async (req, res) => {
  const { key } = req.params;
  try {
    const url = await createPresignedUrlWithClient({
      key,
      bucket: process.env.BUCKET_DOCUMENTS,
      region: process.env.AWS_DEFAULT_REGION,
    });
    return res.send({ url });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const approveCPFKyc = async (req, res) => {
  const {
    body: { uuid, details },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    const verification = await findVerifyIdentity({ uuid });
    if (!verification)
      return res.status(400).send({ message: 'Verification not found!' });

    const user = await findUserByID(verification.id_user);
    if (!user) return res.status(400).send({ message: 'User not found!' });

    await dbInstance.transaction(async (t) => {
      user.verified_id = 1;
      verification.status = 3;
      verification.details = details;
      await user.save({ transaction: t });
      await verification.save({ transaction: t });
    });
    await createLogBackoffice({
      id_user_backoffice: req.user.id,
      id_event: findRoleTypeByKey('approve-kyc-cpf').id,
      ip_address,
      params: { user_agent },
      id_user: user.id,
    });
    await new ApprovedDocuments({
      full_name: `${user.first_name} ${user.last_name}`,
      email: user.email,
    }).send();
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).send(error);
  }
};

const reproveCPFKyc = async (req, res) => {
  const { uuid, details } = req.body;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const verification = await findVerifyIdentity({ uuid });
    if (!verification)
      return res.status(400).send({ message: 'Verification not found!' });

    const user = await findUserByID(verification.id_user);
    if (!user) return res.status(400).send({ message: 'User not found!' });

    await dbInstance.transaction(async (t) => {
      user.verified_id = 0;
      verification.status = 4;
      verification.details = details;
      await user.save({ transaction: t });
      await verification.save({ transaction: t });
    });
    await createLogBackoffice({
      id_user_backoffice: req.user.id,
      id_event: findRoleTypeByKey('repprove-kyc-cpf').id,
      ip_address,
      params: { user_agent },
      id_user: user.id,
    });
    await new ReprovedDocuments({
      full_name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      description: details,
    }).send();
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).send(error);
  }
};

const approveCNPJKyc = async (req, res) => {
  const { uuid } = req.body;

  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const user = await findUserByUUID(uuid);
    if (!user) return res.status(400).send({ message: 'User not found!' });

    await dbInstance.transaction(async (t) => {
      user.is_company = 1;
      user.status_cnpj = 3;
      user.verified_company = 1;
      await user.save({ transaction: t });
    });
    await createLogBackoffice({
      id_user_backoffice: req.user.id,
      id_event: findRoleTypeByKey('approve-kyc-cnpj').id,
      ip_address,
      params: { user_agent },
      id_user: user.id,
    });
    await new ApprovedCNPJ({
      full_name: `${user.first_name} ${user.last_name}`,
      email: user.email,
    }).send();
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).send(error);
  }
};

const reproveCNPJKyc = async (req, res) => {
  const { uuid, details } = req.body;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const user = await findUserByUUID(uuid);
    if (!user) return res.status(400).send({ message: 'User not found!' });

    await dbInstance.transaction(async (t) => {
      user.verified_company = 0;
      user.status_cnpj = 4;
      await user.save({ transaction: t });
    });
    await createLogBackoffice({
      id_user_backoffice: req.user.id,
      id_event: findRoleTypeByKey('repprove-kyc-cnpj').id,
      ip_address,
      params: { user_agent },
      id_user: user.id,
    });
    await new ReproveCNPJ({
      full_name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      description: details,
    }).send();
    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getInfo = async (req, res) => {
  const { id_user } = req.params;
  try {
    const verifications = await findUserHistory({ id_user });
    const user = await findRawUserByID(id_user);
    return res.status(200).send({ verifications, user });
  } catch (error) {
    return res.status(500).send(error);
  }
};

const findUserKycs = async (req, res, next) => {
  try {
    const {
      query: { page = 0, size = 10 },
      params: { userUuid },
    } = req;
    const {
      kyc: { rows, count },
      cnpj,
    } = await new FindUserKycs(
      VerifyIdentityRepository,
      UsersRepository,
    ).executeWithSQL({ user_uuid: userUuid, page, size });
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        count,
        rows,
      },
      cnpj,
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  approveCNPJKyc,
  approveCPFKyc,
  findUserKycs,
  getCNPJVerifications,
  getInfo,
  getKycFile,
  getVerifications,
  reproveCNPJKyc,
  reproveCPFKyc,
};
