/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

const { createStudent } = require('../../database/controllers/students');
const { splitFullName } = require('../../utils/formatters');
const Users = require('../../database/models/Users');
const Products = require('../../database/models/Products');
const Students = require('../../database/models/Students');
const StudentSessions = require('../../database/models/Student_sessions');
const StudentProducts = require('../../database/models/Students_products');
const Plugins = require('../../database/models/Plugins');
const ApiError = require('../../error/ApiError');
const Classrooms = require('../../database/models/Classrooms');
const { findIntegrationTypeByKey } = require('../../types/integrationTypes');
const ActiveCampaign = require('../../services/integrations/ActiveCampaign');

const defaultActiveCampaigAprovedList = 6;

const verifyStudentMembership = async (userEmail) => {
  const student = await Students.findOne({
    where: {
      email: userEmail,
    },
  });

  return student;
};

const createStudentMembership = async (userEmail) => {
  const user = await Users.findOne({
    where: {
      email: userEmail,
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const studant = await createStudent({
    email: user.email,
    full_name: user.full_name,
    status: 'active',
    password: user.password,
    document_number: user.document_number,
    document_type: 'CPF',
    whatsapp: user.whatsapp,
    profile_picture: user.profile_picture,
    no_hash: true,
  });

  return studant;
};

const checkIfStudentHasCourse = async ({ student, product }) => {
  const studentCourse = await StudentProducts.findOne({
    where: {
      id_student: student.id,
      id_product: product.id,
    },
  });

  return studentCourse;
};

const addUserToCourse = async ({ student, product }) => {
  const classroom = await Classrooms.findOne({
    where: {
      id_product: product.id,
    },
  });

  const studentCourse = await StudentProducts.create({
    id_student: student.id,
    id_product: product.id,
    id_classroom: classroom.id,
  });

  return studentCourse;
};

const createSessionToCourse = async ({ student }) => {
  const session = await StudentSessions.create({
    id_student: student.id,
  });

  return session;
};

const courseId =
  process.env.CREATOR_SCHOOL_COURSE_ID ||
  'f77cd951-9890-4a85-a63e-07a472e4ae8e';

const creatorSchoolController = async (req, res, next) => {
  const { email } = req.body;
  try {
    let student = await verifyStudentMembership(email);

    if (!student) {
      // Criar conta
      student = await createStudentMembership(email);
    }

    const product = await Products.findOne({
      where: {
        uuid: courseId,
      },
    });

    if (!product) {
      throw new Error('Curso não encontrado');
    }

    const studentCourse = await checkIfStudentHasCourse({
      student,
      product,
    });

    if (!studentCourse) {
      await addUserToCourse({
        student,
        product,
      });
    }
    const defaultActiveCampaignUser = await Users.findOne({
      where: {
        email: 'escolacreator.b4you@gmail.com',
      },
    });
    if (defaultActiveCampaignUser) {
      const plugin = await Plugins.findOne({
        where: {
          id_user: defaultActiveCampaignUser.id,
          id_plugin: findIntegrationTypeByKey('activecampaign').id,
        },
      });
      if (plugin) {
        const integration = new ActiveCampaign(
          plugin.settings.apiUrl,
          plugin.settings.apiKey,
        );
        const { firstName, lastName } = splitFullName(student.full_name);
        console.log('ACTIVE CAMPAIGN CREATOR START', student);
        const {
          contact: { id },
        } = await integration.createOrUpdateContact({
          email: student.email,
          firstName,
          lastName,
          phone: student.whatsapp,
        });
        await integration.insertContactOnList({
          idList: defaultActiveCampaigAprovedList,
          idContact: id,
        });
        console.log('ACTIVE CAMPAIGN CREATOR DONE', id);
      }
    }
    const session = await createSessionToCourse({
      student,
    });

    return res.status(200).json({
      sessionId: session.uuid,
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(ApiError.badRequest({ message: error.message }));
    }

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
  creatorSchoolController,
};
