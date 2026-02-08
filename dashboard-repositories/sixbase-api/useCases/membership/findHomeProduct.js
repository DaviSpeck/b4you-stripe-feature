const {
  findStudentProductDesc,
} = require('../../database/controllers/student_products');
const {
  findStudentClassroomWithModules,
} = require('../../database/controllers/classrooms');
const {
  findStudentStudyHistoryDesc,
} = require('../../database/controllers/study_history');
const { findOnlySaleItem } = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const dateHelper = require('../../utils/helpers/date');
const { VIDEOTYPE } = require('../../types/productTypes');
const rawData = require('../../database/rawData');

module.exports = class {
  constructor(id_student) {
    this.id_student = id_student;
  }

  async execute() {
    let homeProduct = {};
    const homeProductLastViewed = await findStudentStudyHistoryDesc({
      id_student: this.id_student,
    });

    const homeProductLastBuyed = await findStudentProductDesc({
      id_student: this.id_student,
    });

    if (!homeProductLastViewed && !homeProductLastBuyed) return null;

    if (homeProductLastViewed && homeProductLastBuyed) {
      const saleItem = await findOnlySaleItem({
        id_product: homeProductLastBuyed.id_product,
        id_student: homeProductLastBuyed.id_student,
        id_status: findSalesStatusByKey('paid').id,
      });
      if (
        saleItem &&
        dateHelper(saleItem.paid_at).isAfter(homeProductLastViewed.updated_at)
      ) {
        homeProduct = homeProductLastBuyed;
      } else {
        homeProduct = homeProductLastViewed;
      }
    } else {
      homeProduct = homeProductLastBuyed || homeProductLastViewed;
    }

    homeProduct = homeProduct.toJSON();

    const {
      product: { id, id_type },
    } = homeProduct;

    const type = id_type === VIDEOTYPE ? 'video' : 'ebook';

    if (type === 'video') {
      const classroom = await findStudentClassroomWithModules({
        id_product: id,
        id_student: this.id_student,
      });
      homeProduct.product.modules =
        classroom && classroom.modules && rawData(classroom.modules);
    }

    return homeProduct.product;
  }
};
