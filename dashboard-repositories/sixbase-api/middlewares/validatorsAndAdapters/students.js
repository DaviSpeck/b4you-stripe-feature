const ApiError = require('../../error/ApiError');
const { validateAndFormatDocument } = require('../../utils/validations');
const Encrypter = require('../../utils/helpers/encrypter');
const { findStudentByUUID } = require('../../database/controllers/students');
const {
  findSingleStudentProduct,
} = require('../../database/controllers/student_products');

const validateCreateStudent = async (req, res, next) => {
  const { document_number } = req.body;
  try {
    const { rawDocument, document_type } =
      validateAndFormatDocument(document_number);
    req.body.document_type = document_type;
    req.body.document_number = rawDocument;
    return next();
  } catch (error) {
    return next(ApiError.badRequest(error.message));
  }
};

const validateStudentPassword = async (req, res, next) => {
  const { password } = req.body;
  const {
    student: { password: currentPassword },
  } = req;
  const isValid = await Encrypter.compare(password, currentPassword);
  if (!isValid)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Senha inválida',
      }),
    );
  return next();
};

const validateStudentDocument = async (req, res, next) => {
  const { document_number } = req.student;
  if (req.body.document_number) {
    const { rawDocument } = validateAndFormatDocument(req.body.document_number);
    req.body.document_number = rawDocument;
    return next();
  }
  req.body.document_number = document_number;
  return next();
};

const findSelectedStudent = async (req, res, next) => {
  const { student_id } = req.body;
  try {
    const student = await findStudentByUUID(student_id);
    if (!student)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Aluno não encontrado',
        }),
      );

    req.student = student;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const verifyIfStudentPurchasedProduct = async (req, res, next) => {
  const {
    student: { id: id_student },
    product: { id: id_product },
  } = req;

  try {
    const doesStudentHaveAccessToThisProduct = await findSingleStudentProduct({
      id_student,
      id_product,
    });

    if (!doesStudentHaveAccessToThisProduct)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'O aluno não tem acesso a esse produto',
        }),
      );

    req.student_product = doesStudentHaveAccessToThisProduct;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  validateCreateStudent,
  validateStudentDocument,
  validateStudentPassword,
  verifyIfStudentPurchasedProduct,
  findSelectedStudent,
};
