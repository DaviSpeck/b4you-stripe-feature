const DateHelper = require('../utils/helpers/date');
const { findProductCategories } = require('../types/productCategories');
const {
  VIDEOTYPE,
  EBOOKTYPE,
  PAYMENT_ONLY_TYPE,
  PHYSICAL_TYPE,
} = require('../types/productTypes');
const videoStatus = require('../status/videoStatus');
const { capitalizeName } = require('../utils/formatters');
const date = require('../utils/helpers/date');
const { permissionTypes } = require('../types/permissionsTypes');

const serializeProductProgress = (lessons, returnInPercentage) => {
  const [totalLessons, doneLessons] = lessons.reduce(
    (acc, { active, study_history }) => {
      acc[0] += active ? 1 : 0;
      acc[1] += active && study_history && study_history.done ? 1 : 0;
      return acc;
    },
    [0, 0],
  );
  if (totalLessons === 0) return 0;
  if (returnInPercentage) {
    return Number(((doneLessons / totalLessons) * 100).toFixed(2));
  }
  return Number((doneLessons / totalLessons).toFixed(2));
};

const serializeProgress = (modules, percentage = false) => {
  if (modules.length === 0) return 0;
  const lessons = modules.map(({ lesson }) => lesson).flat();
  const activeLessons = lessons.filter(({ active }) => active);
  if (lessons.length === 0) return 0;
  return serializeProductProgress(activeLessons, percentage);
};

const serializeProducer = ({
  full_name,
  profile_picture,
  nickname,
  biography,
  support_email,
  support_whatsapp,
}) => ({
  full_name: capitalizeName(full_name),
  profile_picture,
  nickname,
  biography,
  support_email,
  support_whatsapp,
});

const resolveType = (type) => {
  if (type === VIDEOTYPE) return 'video';
  if (type === EBOOKTYPE) return 'ebook';
  if (type === PAYMENT_ONLY_TYPE) return 'payment_only';
  if (type === PHYSICAL_TYPE) return 'physical';

  return 'physical';
};

const serializeHistory = (history) => {
  if (!history)
    return {
      time: 0,
      done: false,
    };

  const { time, done } = history;

  return {
    time,
    done,
  };
};

const translateDurationToStringTime = (durationInSeconds) => {
  if (!durationInSeconds) return '00:00:00';
  const time = new Date(durationInSeconds * 1000).toISOString().substr(11, 8);
  const [hours, minutes, seconds] = time.split(':');
  return `${hours}:${minutes}:${seconds}`;
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const byte = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(byte));

  return `${parseFloat(bytes / byte ** i).toFixed(decimals)} ${sizes[i]}`;
};

const resolveAttachments = (attachments) => {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];

  return attachments.map(
    ({ original_name, uuid, file_size, file_extension }) => ({
      uuid,
      original_name,
      file_size: formatBytes(file_size, 0),
      file_extension,
    }),
  );
};

const resolveNextLesson = (module, paid_at = '2022-01-01') => {
  if (module.length === 0) return null;
  const sortedLessons = module
    .filter(({ release }) => date().diff(date(paid_at).add(release, 'd')) >= 0)
    .map(({ lesson }) => lesson.sort((a, b) => a.order - b.order))
    .flat();
  const [firstLesson] = sortedLessons;
  const lessonsWithHistory = sortedLessons.filter(
    ({ study_history }) =>
      study_history && Object.keys(study_history).length > 0,
  );
  if (lessonsWithHistory.length === 0) return firstLesson;
  const notWatched = lessonsWithHistory.find(
    ({ study_history }) => !study_history.done,
  );
  if (!notWatched) return firstLesson;
  const [lastWatched] = lessonsWithHistory.sort(
    (a, b) =>
      DateHelper(b.study_history.updated_at).toUnix() -
      DateHelper(a.study_history.updated_at).toUnix(),
  );
  if (!lastWatched.study_history.done) return lastWatched;
  const lastWatchedIndex = sortedLessons.findIndex(
    (s) => s.id === lastWatched.id,
  );
  if (lastWatchedIndex === sortedLessons.length - 1) return firstLesson;
  return sortedLessons[lastWatchedIndex + 1];
};

const wasVideoUploaded = (video_status) => {
  const status = videoStatus.find((v) => v.id === video_status);
  return status.name || null;
};

const translatePaymentMethod = (payment_method) => {
  const methods = {
    pix: 'Pix',
    billet: 'Boleto',
    card: 'Cartão de Crédito',
    credit_card: 'Cartão de CréditotranslatePaymentMethod(',
  };
  return methods[payment_method];
};

const resolveProductCategoriesById = (id) => findProductCategories(id).label;

const resolveProductCategoriesByName = (name) => findProductCategories(name).id;

const serializePermissions = (permissions) => {
  const permissionsKeys = permissionTypes.map(({ key }) => key);

  return permissionsKeys.reduce(
    (acc, key) => ({ ...acc, [key]: !!permissions[key] }),
    {},
  );
};

module.exports = {
  resolveAttachments,
  resolveNextLesson,
  resolveProductCategoriesById,
  resolveProductCategoriesByName,
  resolveType,
  serializeHistory,
  serializePermissions,
  serializeProducer,
  serializeProgress,
  translateDurationToStringTime,
  translatePaymentMethod,
  wasVideoUploaded,
  formatBytes,
};
