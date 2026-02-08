const _ = require('lodash');
const { slugify, capitalizeName } = require('../../utils/formatters');
const {
  resolveNextLesson,
  serializeProducer,
  serializeHistory,
  resolveType,
  resolveAttachments,
  translateDurationToStringTime,
  serializeProgress,
  formatBytes,
  resolveNextLessonPreview,
} = require('../common');
const { EBOOKTYPE } = require('../../types/productTypes');
const date = require('../../utils/helpers/date');
const { findProductCategoriesById } = require('../../types/productCategories');

const serializeLessons = (
  lessons,
  released,
  paid_at,
  moduleReleaseDate,
  isPreview = false,
) => {
  const activeLessons = lessons.filter(({ active }) => active);
  const sortedLessons = activeLessons.sort((a, b) => a.order - b.order);

  return sortedLessons.map(
    ({
      uuid,
      title,
      description,
      order,
      study_history,
      attachments,
      video,
      release = 0,
    }) => {
      if (isPreview) {
        return {
          uuid,
          title,
          description,
          uri: video ? video.uri : null,
          link: video ? video.link : null,
          duration: video
            ? translateDurationToStringTime(video.duration)
            : null,
          order,
          attachments: resolveAttachments(attachments),
          history: serializeHistory(study_history),
          release_date: null,
          released: true,
        };
      }

      const paidAtDate = paid_at
        ? date(paid_at).utcOffset(-3)
        : null;
      if (!paidAtDate || !paidAtDate.isValid?.()) {
        throw new Error('Invalid paid_at');
      }

      let release_date = moduleReleaseDate;
      let isReleased = released;

      if (isReleased) {
        release_date = paidAtDate.clone().add(release, 'day');
        const now = date().utcOffset(-3);
        isReleased = now.diff(release_date) >= 0;
      }

      return {
        uuid,
        title,
        description: isReleased ? description : null,
        uri: isReleased && video ? video.uri : null,
        link: isReleased && video ? video.link : null,
        duration:
          isReleased && video
            ? translateDurationToStringTime(video.duration)
            : null,
        order,
        attachments: isReleased ? resolveAttachments(attachments) : null,
        history: serializeHistory(study_history),
        release_date: release_date.toISOString(),
        released: isReleased,
      };
    },
  );
};

const resolveActiveModules = (modules) => {
  const activeModules = modules.filter(({ active }) => active);
  if (activeModules.length === 0) return activeModules;
  return activeModules.sort((a, b) => a.order - b.order);
};

const serializeModules = (modules, paid_at, isPreview = false) =>
  modules.map(
    ({
      uuid,
      title,
      description,
      order,
      lesson,
      release,
      cover,
      cover_custom,
    }) => {
      if (isPreview) {
        return {
          uuid,
          title,
          description,
          order,
          lessons: serializeLessons(lesson, true, null, null, true),
          release_date: null,
          released: true,
          cover,
          cover_custom,
        };
      }

      const paidAtDate = paid_at
        ? date(paid_at).utcOffset(-3)
        : null;

      if (!paidAtDate || !paidAtDate.isValid?.()) {
        throw new Error('Invalid paid_at');
      }

      const release_date = paidAtDate.clone().add(release, 'day');
      const now = date().utcOffset(-3);
      const released = now.diff(release_date) >= 0;

      return {
        uuid,
        title,
        description: released ? description : null,
        order,
        lessons: serializeLessons(
          lesson,
          released,
          paid_at,
          release_date,
          false,
        ),
        release_date: release_date.toISOString(),
        released,
        cover,
        cover_custom,
      };
    },
  );

const resolveFinishedCourse = (progress) => {
  if (!progress) return { finished_at: null, finished: false };
  const { finished_at } = progress;
  return {
    finished: true,
    finished_at,
  };
};

const serializeEbooks = (ebooks) => {
  const serializedEbooks = ebooks.map(
    ({ uuid, name, is_bonus, file_size, file_extension }) => ({
      uuid,
      name: capitalizeName(name),
      main_product: !is_bonus,
      file_extension,
      file_size: formatBytes(file_size),
    }),
  );

  return _.orderBy(serializedEbooks, ['main_product'], ['desc']);
};

const serializeAnchors = (anchors, allModules, paid_at, isPreview = false) => {
  if (!anchors) return null;
  return anchors.map(({ uuid, label, order, modules }) => {
    const anchorModules = [];
    modules
      .sort((a, b) => a.modules_anchors.order - b.modules_anchors.order)
      .forEach((m) => {
        const currentModule = allModules.find((a) => a.id === m.id);
        if (currentModule) {
          anchorModules.push({
            ...currentModule,
            order: m.modules_anchors.order,
          });
        }
      });

    return {
      uuid,
      label,
      order,
      modules: serializeModules(anchorModules, paid_at, isPreview),
    };
  });
};

const serializeSingleProduct = (product) => {
  const {
    uuid,
    name,
    description,
    cover,
    cover_custom,
    excerpt,
    logo,
    id_type,
    thumbnail,
    modules,
    producer,
    progress,
    ebooks,
    certificate_key,
    files_description,
    ebook_cover,
    nickname,
    biography,
    support_email,
    paid_at,
    banner,
    banner_mobile,
    category,
    support_whatsapp,
    anchor_view,
    anchors,
    hex_color_membership_primary,
    hex_color_membership_secondary,
    hex_color_membership_text,
    hex_color_membership_hover,
    membership_comments_enabled,
    membership_comments_auto_approve,
    apply_membership_colors,
    module_cover_format,
    is_preview,
  } = product;

  if (id_type === EBOOKTYPE)
    return {
      uuid,
      name,
      description,
      excerpt,
      cover,
      cover_custom,
      ebook_cover,
      logo,
      thumbnail,
      slug: slugify(name),
      type: resolveType(id_type),
      producer: serializeProducer({
        ...producer,
        nickname,
        biography,
        support_whatsapp,
        support_email,
      }),
      files: serializeEbooks(ebooks),
      instructions: files_description,
      support_email,
      banner,
      banner_mobile,
      category: findProductCategoriesById(category),
      hex_color_membership_primary,
      hex_color_membership_secondary,
      hex_color_membership_text,
      hex_color_membership_hover,
      apply_membership_colors,
      module_cover_format,
    };

  const activeModules = resolveActiveModules(modules);
  const nextLesson = is_preview
    ? resolveNextLessonPreview(activeModules)
    : resolveNextLesson(activeModules, paid_at);
  const { finished, finished_at } = resolveFinishedCourse(progress);

  return {
    uuid,
    name,
    description,
    excerpt,
    cover,
    cover_custom,
    logo,
    thumbnail,
    has_certificate: !!certificate_key,
    finished,
    finished_at,
    next_lesson_id: nextLesson ? nextLesson.uuid : null,
    last_watched_lesson: false,
    slug: slugify(name),
    progress: is_preview ? 0 : serializeProgress(activeModules),
    type: resolveType(id_type),
    producer: serializeProducer({
      ...producer,
      nickname,
      biography,
      support_whatsapp,
      support_email,
    }),
    modules: !anchor_view
      ? serializeModules(activeModules, paid_at, is_preview)
      : null,
    anchors:
      anchor_view && Array.isArray(anchors) && anchors.length > 0
        ? serializeAnchors(anchors, activeModules, paid_at, is_preview)
        : null,
    support_email,
    banner,
    banner_mobile,
    category: findProductCategoriesById(category),
    anchor_view,
    hex_color_membership_primary,
    hex_color_membership_secondary,
    hex_color_membership_text,
    hex_color_membership_hover,
    apply_membership_colors,
    module_cover_format,
    is_preview: !!is_preview,
    comments_settings: {
      enabled: !!membership_comments_enabled,
      auto_approve: !!membership_comments_auto_approve,
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeSingleProduct(this.data);
  }
};
