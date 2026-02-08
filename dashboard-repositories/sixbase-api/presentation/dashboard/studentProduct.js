const { capitalizeName, formatDocument } = require('../../utils/formatters');
const DateHelper = require('../../utils/helpers/date');

const resolveClassroom = (classroom) => {
  if (!classroom) return null;
  const { uuid, label } = classroom;

  return {
    uuid,
    label,
  };
};

const resolveCreatedAt = (created_at, sales_items) => {
  if (created_at) return DateHelper(created_at).format('DD/MM/YYYY');
  if (sales_items && sales_items.paid_at)
    return DateHelper(sales_items.paid_at).format('DD/MM/YYYY');
  return 'Não informado';
};

const serializeSingleStudentProduct = (studentProduct) => {
  const {
    student: {
      uuid,
      full_name,
      email,
      whatsapp,
      profile_picture,
      document_type,
      document_number,
    },
    classroom,
    id_sale_item,
    id,
    created_at,
    sales_items,
    progress_percentage,
    completed_lessons,
    available_lessons,
    total_lessons,
    last_access_at,
  } = studentProduct;

  const releaseDate = resolveCreatedAt(created_at, sales_items);
  const lessonsAvailable = Number(
    available_lessons ?? total_lessons ?? 0,
  );
  const completedLessons = Number(completed_lessons ?? 0);
  const rawProgress =
    progress_percentage !== undefined && progress_percentage !== null
      ? Number(progress_percentage)
      : null;
  const normalizedProgress =
    rawProgress !== null && Number.isFinite(rawProgress)
      ? Number(rawProgress.toFixed(2))
      : null;

  const result = {
    id,
    uuid,
    full_name: capitalizeName(full_name),
    email,
    document_type,
    document_number: document_number ? formatDocument(document_number) : null,
    whatsapp,
    profile_picture,
    classroom: resolveClassroom(classroom),
    imported: !id_sale_item,
    created_at: releaseDate,
    released_at: releaseDate,
    last_access_at,
  };

  if (normalizedProgress !== null) {
    result.progress = normalizedProgress;
    result.progress_percentage = normalizedProgress;
    result.completed_lessons = completedLessons;
    result.available_lessons = lessonsAvailable;
    result.is_completed = normalizedProgress >= 100;
  }

  return result;
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleStudentProduct);
    }
    return serializeSingleStudentProduct(this.data);
  }
};
