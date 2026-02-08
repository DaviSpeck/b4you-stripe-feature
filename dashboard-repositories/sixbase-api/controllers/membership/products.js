const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const db = require('../../database/models');
const FileManager = require('../../services/FileManager');
const SerializeLesson = require('../../presentation/membership/lesson');
const SerializeStudentCourse = require('../../presentation/membership/studentProduct');
const SerializeStudentProduct = require('../../presentation/membership/product');
const FindHomeStudentUseCase = require('../../useCases/membership/findHomeProduct');
const PdfHelper = require('../../utils/helpers/pdf');
const ImageHelper = require('../../utils/helpers/images');
const Cache = require('../../config/Cache');
const {
  capitalizeName,
  formatDocument,
  slugify,
} = require('../../utils/formatters');
const {
  findStudentProductsCoursePaginated,
  findSingleStudentProduct,
} = require('../../database/controllers/student_products');
const {
  findStudentClassroomWithModules,
  findProducerClassroom,
} = require('../../database/controllers/classrooms');
const { findOnlySaleItem } = require('../../database/controllers/sales_items');
const { EBOOKTYPE, VIDEOTYPE } = require('../../types/productTypes');
const rawData = require('../../database/rawData');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const {
  findProducerProductsPaginated,
  findProductColors,
} = require('../../database/controllers/products');
const Products = require('../../database/models/Products');
const Uuid = require('../../utils/helpers/uuid');

const { membership_page_layouts: MembershipPageLayouts } = db.sequelize.models;

const applyLayoutBanners = async (product) => {
  if (!product || !product.id || !MembershipPageLayouts) {
    return product;
  }

  try {
    const layout = await MembershipPageLayouts.findOne({
      attributes: ['banner', 'banner_mobile'],
      where: { id_product: product.id },
    });

    if (!layout) {
      return product;
    }

    const layoutData =
      typeof layout.get === 'function' ? layout.get({ plain: true }) : layout;

    if (!product.banner && layoutData.banner) {
      product.banner = layoutData.banner;
    }

    if (!product.banner_mobile && layoutData.banner_mobile) {
      product.banner_mobile = layoutData.banner_mobile;
    }
  } catch (error) {
    // Printe o erro se necessário
  }

  return product;
};

const getStudentCourses = async (req, res, next) => {
  const {
    student: { id: id_student, producer_id = 0, classroom_id },
  } = req;
  const { page = 0, size = 30 } = req.query;
  let courses = null;
  try {
    if (producer_id) {
      courses = await findProducerProductsPaginated({
        classroom_id,
        page,
        size,
        where: {
          id_user: producer_id,
          id_type: VIDEOTYPE,
        },
      });

      for await (const [i, course] of courses.rows.entries()) {
        const classroom = await findStudentClassroomWithModules({
          id_student,
          id_product: course.product.id,
          [Op.or]: {
            uuid: classroom_id,
            is_default: true,
          },
        });

        courses.rows[i] = {
          ...course,
          classroom,
        };
      }
    } else {
      courses = await findStudentProductsCoursePaginated(
        {
          id_student,
          '$product.id_type$': VIDEOTYPE,
        },
        page,
        size,
      );

      for await (const [i, course] of courses.rows.entries()) {
        const classroom = await findStudentClassroomWithModules({
          id_student,
          id_product: course.id_product,
          [Op.or]: {
            id: course.id_classroom,
            is_default: true,
          },
        });

        courses.rows[i] = {
          ...course,
          classroom,
        };
      }
    }
    return res.status(200).send({
      count: courses.count,
      rows: new SerializeStudentCourse(rawData(courses.rows)).adapt(),
    });
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

const getStudentEbooks = async (req, res, next) => {
  const {
    student: { id: id_student, producer_id = 0 },
  } = req;
  const { page = 0, size = 30 } = req.query;
  let ebooks = null;
  try {
    if (producer_id) {
      ebooks = await findProducerProductsPaginated({
        page,
        size,
        where: {
          id_user: producer_id,
          id_type: EBOOKTYPE,
        },
      });
    } else {
      ebooks = await findStudentProductsCoursePaginated(
        {
          id_student,
          '$product.id_type$': EBOOKTYPE,
        },
        page,
        size,
      );
    }
    return res.status(200).send({
      count: ebooks.count,
      rows: new SerializeStudentCourse(rawData(ebooks.rows)).adapt(),
    });
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

const getProductByUUID = async (req, res, next) => {
  const { product, studentProduct, student } = req;

  const cacheKey = `student_product_full:${product.uuid}:${student.id}`;
  const cached = await Cache.get(cacheKey);
  if (cached) {
    return res.status(200).send(JSON.parse(cached));
  }

  try {
    let modules = [];
    let paid_at = null;
    let next_lesson_id = null;

    const isPreview = student.producer_id && student.id === 0;

    if (product.id_type === VIDEOTYPE) {
      let classroom = null;

      if (isPreview) {
        classroom = await findProducerClassroom({
          uuid: student.classroom_id,
          id_product: product.id,
        });

        if (!classroom) {
          classroom = await findProducerClassroom({
            is_default: true,
            id_product: product.id,
          });
        }

        modules = classroom?.modules ? rawData(classroom.modules) : [];

        const firstModuleWithLessons = modules.find(
          (m) => m.lesson && m.lesson.length > 0,
        );

        if (firstModuleWithLessons) {
          next_lesson_id = firstModuleWithLessons.lesson[0].uuid;
        }

        paid_at = null;
      } else {
        classroom = await findStudentClassroomWithModules({
          id_student: student.id,
          id: studentProduct.id_classroom,
        });

        modules = rawData(classroom.modules);

        const saleItem = await findOnlySaleItem({
          id_product: product.id,
          id_student: student.id,
          id_status: findSalesStatusByKey('paid').id,
        });

        paid_at = saleItem?.paid_at || studentProduct.created_at;

        if (!paid_at) {
          throw new Error(
            'Invariant violation: paid_at is required for student',
          );
        }
      }
    }

    await applyLayoutBanners(product);

    const serializedProduct = new SerializeStudentProduct({
      ...product,
      modules,
      paid_at: new Date(paid_at),
      next_lesson_id,
      is_preview: isPreview,
    }).adapt();

    await Cache.set(cacheKey, JSON.stringify(serializedProduct), 5);

    return res.status(200).send(serializedProduct);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getLessonByUUID = async (req, res, next) => {
  const {
    studentProduct,
    params: { lesson_id },
    student: { id: id_student, producer_id, classroom_id = null },
    product,
  } = req;

  try {
    const isPreview = producer_id && id_student === 0;

    let classroom = null;
    let modules = [];
    let paid_at = null;

    if (isPreview) {
      const id_product = product?.id;

      if (!id_product) {
        throw ApiError.badRequest('Produto não identificado para preview');
      }

      classroom = await findProducerClassroom({
        uuid: classroom_id,
        id_product,
      });

      if (!classroom) {
        classroom = await findProducerClassroom({
          is_default: true,
          id_product,
        });
      }

      const rawModules = classroom?.modules ? rawData(classroom.modules) : [];

      const normalizedModules = rawModules.map((module) => {
        const lessons = (module.lesson || []).map((lesson, index, arr) => ({
          ...lesson,
          released: true,
          history: lesson.history ?? {
            done: false,
            time: 0,
          },
          prev_lesson: arr[index - 1] ? { uuid: arr[index - 1].uuid } : null,
          next_lesson: arr[index + 1] ? { uuid: arr[index + 1].uuid } : null,
        }));

        return {
          ...module,
          released: true,
          lessons,
        };
      });

      const allLessons = normalizedModules.map((m) => m.lessons).flat();

      const selectedLesson = allLessons.find(({ uuid }) => uuid === lesson_id);

      if (!selectedLesson) {
        throw ApiError.badRequest('Aula não encontrada');
      }

      return res.status(200).send({
        current_lesson: new SerializeLesson(
          selectedLesson,
          normalizedModules,
          null,
          true,
        ).adapt(),

        product: new SerializeStudentProduct({
          ...rawData(product),
          paid_at: null,
          modules: normalizedModules,
          is_preview: true,
        }).adapt(),
      });
    }

    const saleItem = await findOnlySaleItem({
      id_student,
      id_product: studentProduct.product.id,
      id_status: findSalesStatusByKey('paid').id,
    });

    classroom = await findStudentClassroomWithModules({
      id: studentProduct.id_classroom,
      id_student,
    });

    modules = rawData(classroom.modules);

    const allLessons = modules.map(({ lesson }) => lesson).flat();
    const selectedLesson = allLessons.find(({ uuid }) => uuid === lesson_id);

    if (!selectedLesson) {
      throw ApiError.badRequest('Aula não encontrada');
    }

    paid_at = saleItem?.paid_at || studentProduct.created_at;

    if (!paid_at) {
      throw new Error('Invariant violation: paid_at is required for student');
    }

    return res.status(200).send({
      current_lesson: new SerializeLesson(
        selectedLesson,
        modules,
        paid_at,
      ).adapt(),
      product: new SerializeStudentProduct({
        ...rawData(studentProduct.product),
        paid_at,
        modules,
      }).adapt(),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
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

const getTemplate = async (req, res, next) => {
  const { product_id } = req.params;
  try {
    const cachedConfig = await Cache.get(`membership_config_${product_id}`);
    if (cachedConfig) {
      const data = JSON.parse(cachedConfig);
      return res.status(200).send({
        hex_color_membership_primary:
          data.hex_color_membership_primary || data.hex_color,
        hex_color_membership_secondary:
          data.hex_color_membership_secondary || data.hex_color_secondary,
        hex_color_membership_text:
          data.hex_color_membership_text || data.hex_color_text,
        hex_color_membership_hover:
          data.hex_color_membership_hover || data.hex_color_hover,
        apply_membership_colors: !!data.apply_membership_colors,
      });
    }
    const product = await findProductColors({ uuid: product_id });
    if (product) {
      await Cache.set(
        `membership_config_${product_id}`,
        JSON.stringify(product),
      );
    }
    return res.status(200).send(product);
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

const downloadEBOOKController = async (req, res, next) => {
  const {
    ebook: { ebook_key, name, allow_piracy_watermark },
    student: { full_name, document_type, document_number, email },
  } = req;

  let file = null;

  try {
    const fileManagerInstance = new FileManager(process.env.BUCKET_NAME);
    const pdfStream = await fileManagerInstance.getFile(ebook_key);
    if (allow_piracy_watermark) {
      const watermark = document_number
        ? `Cópia licenciada para ${capitalizeName(
            full_name,
          )} - ${document_type} ${formatDocument(document_number)}`
        : `Cópia licenciada para ${email}`;
      const pdfBytes = await PdfHelper.waterMark(pdfStream.Body, {
        watermark,
      });
      file = Buffer.from(pdfBytes.buffer, 'binary');
    } else {
      file = Buffer.from(pdfStream.Body, 'binary');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${slugify(name)}"`);
    return res.status(200).send(file);
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

const downloadCertificateController = async (req, res, next) => {
  const {
    product: { certificate_key },
    student: { full_name },
  } = req;
  try {
    if (!certificate_key)
      throw ApiError.badRequest('Este produto não possui certificado');
    const fileManagerInstance = new FileManager(process.env.BUCKET_NAME);
    const certificateFile = await fileManagerInstance.getFile(certificate_key);
    const imageCertificate = await ImageHelper.generateCertificate(
      certificateFile.Body,
      full_name,
    );
    const file = await PdfHelper.certificatePDF(imageCertificate);
    res.setHeader('Content-Type', 'application/pdf');
    const pdf = Buffer.from(file.buffer, 'binary');
    return res.status(200).send(pdf);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const getHomeProductController = async (req, res, next) => {
  const {
    student: { id: id_student, producer_id = null },
    query: { uuid },
  } = req;
  try {
    if (uuid && Uuid.validate(uuid)) {
      const product = await Products.findOne({
        raw: true,
        where: { uuid },
      });
      const type = product.id_type === VIDEOTYPE ? 'video' : 'ebook';

      if (type === 'video') {
        if (id_student) {
          const classroom = await findStudentClassroomWithModules({
            id_product: product.id,
            id_student,
          });
          product.modules =
            classroom && classroom.modules && rawData(classroom.modules);

          const studentProduct = await findSingleStudentProduct({
            id_product: product.id,
            id_student,
          });

          if (studentProduct) {
            const saleItem = await findOnlySaleItem({
              id_product: product.id,
              id_student,
              id_status: findSalesStatusByKey('paid').id,
            });

            product.paid_at = saleItem?.paid_at || studentProduct.created_at;
          }
        } else {
          product.modules = [];
        }
      }

      await applyLayoutBanners(product);

      return res
        .status(200)
        .send({ home: new SerializeStudentProduct(product).adapt() });
    }
    if (producer_id) return res.status(200).send(null);
    const data = await new FindHomeStudentUseCase(id_student).execute();
    if (!data) return res.status(200).send({ home: null });

    let paid_at = null;
    if (id_student && data.id) {
      const studentProduct = await findSingleStudentProduct({
        id_product: data.id,
        id_student,
      });

      if (studentProduct) {
        const saleItem = await findOnlySaleItem({
          id_product: data.id,
          id_student,
          id_status: findSalesStatusByKey('paid').id,
        });

        paid_at = saleItem?.paid_at || studentProduct.created_at;
      }
    }

    if (!paid_at) {
      throw new Error('Invariant violation: paid_at is required for student');
    }

    data.paid_at = paid_at;
    await applyLayoutBanners(data);
    return res
      .status(200)
      .send({ home: new SerializeStudentProduct(data).adapt() });
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
  downloadCertificateController,
  downloadEBOOKController,
  getHomeProductController,
  getLessonByUUID,
  getProductByUUID,
  getStudentCourses,
  getStudentEbooks,
  getTemplate,
};
