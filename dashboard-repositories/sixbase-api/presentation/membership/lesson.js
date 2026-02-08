const {
  serializeHistory,
  resolveAttachments,
  translateDurationToStringTime,
} = require('../common');
const { capitalizeName } = require('../../utils/formatters');
const date = require('../../utils/helpers/date');
const { findEmbedType, findEmbedTypeByKey } = require('../../types/embedTypes');

/**
 * Resolve video URL from video entity
 */
const resolveVideoID = (video) => {
  if (!video) return null;

  if (video.embed_url) {
    return video.embed_url;
  }

  if (Number(video.id_embed_type) === findEmbedTypeByKey('owner_panda').id) {
    return video.uri;
  }

  if (video.uri && video.uri.includes('/videos/')) {
    const [, videoID] = video.uri.split('/videos/');
    return `https://vimeo.com/${videoID}`;
  }

  return video.uri || null;
};

/**
 * Fallback-safe resolver when lesson.video is missing
 */
const resolveSafeVideoID = ({ video, uri, link }) => {
  if (video) {
    return resolveVideoID(video);
  }

  // fallback: some joins don't bring video, but uri/link exist
  if (uri) return uri;
  if (link) return link;

  return null;
};

const findPrevAndNextLesson = (modules, lessonID, paid_at) => {
  const response = [null, null];
  if (modules.length === 0) return response;

  const paidAtDate = paid_at
    ? date(paid_at).utcOffset(-3)
    : null;

  const now = date().utcOffset(-3);

  const filteredModules = modules.filter(
    ({ release }) =>
      paidAtDate &&
      now.diff(paidAtDate.clone().add(release, 'day')) >= 0,
  );

  if (filteredModules.length === 0) return response;

  const lessons = filteredModules
    .sort((a, b) => a.order - b.order)
    .map(({ lesson }) => lesson.sort((a, b) => a.order - b.order))
    .flat()
    .filter(({ active }) => active);

  const currentLessonIndex = lessons.findIndex(({ id }) => id === lessonID);

  if (currentLessonIndex === -1) {
    return [
      {
        uuid: lessons[lessons.length - 1].uuid,
        title: capitalizeName(lessons[lessons.length - 1].title),
      },
      {
        uuid: lessons[0].uuid,
        title: capitalizeName(lessons[0].title),
      },
    ];
  }

  const prevLesson = lessons[currentLessonIndex - 1];
  if (prevLesson) {
    response[0] = {
      uuid: prevLesson.uuid,
      title: capitalizeName(prevLesson.title),
    };
  }

  const nextLesson = lessons[currentLessonIndex + 1];
  if (nextLesson) {
    response[1] = {
      uuid: nextLesson.uuid,
      title: capitalizeName(nextLesson.title),
    };
  }

  return response;
};

const serializeSingleLesson = (
  {
    id,
    uuid,
    title,
    description,
    uri,
    link,
    duration,
    order,
    study_history,
    attachments,
    video,
    release,
  },
  modules,
  paid_at,
  isPreview = false,
) => {
  if (isPreview) {
    const selectedModule = modules.find(({ lessons }) =>
      lessons.some((l) => l.uuid === uuid),
    );

    return {
      uuid,
      title,
      description,
      module_id: selectedModule?.uuid ?? null,

      prev_lesson: null,
      next_lesson: null,

      videoID: resolveSafeVideoID({ video, uri, link }),
      duration: video ? translateDurationToStringTime(video.duration) : null,

      history: serializeHistory(study_history),
      attachments: resolveAttachments(attachments),

      released: true,
      release_date: null,

      provider: video ? findEmbedType(Number(video.id_embed_type)).key : null,

      course_finale: false,
      is_pilot: false,
    };
  }

  const paidAtDate = paid_at
    ? date(paid_at).utcOffset(-3)
    : null;
  if (!paidAtDate || !paidAtDate.isValid?.()) {
    throw new Error('Invalid paid_at');
  }

  const selectedModule = modules.find(({ lesson }) =>
    lesson.some((l) => l.uuid === uuid),
  );

  const now = date().utcOffset(-3);

  const activeModules = modules.filter(
    ({ active, lesson, release: releaseModule }) =>
      active &&
      lesson.length > 0 &&
      now.diff(
        paidAtDate.clone().add(releaseModule, 'day'),
      ) >= 0,
  );

  const [prevLesson, nextLesson] = findPrevAndNextLesson(
    activeModules,
    id,
    paid_at,
  );

  const lessons = modules.map(({ lesson }) => lesson).flat();
  const course_finale = lessons[lessons.length - 1].id === id;
  const is_pilot = lessons[0].id === id;

  const release_date = paidAtDate
    .clone()
    .add(release, 'day');

  const isReleased = now.diff(release_date) >= 0;

  return {
    uuid,
    title,
    description: isReleased ? description : null,
    uri: isReleased ? uri : null,
    link: isReleased ? link : null,
    module_id: selectedModule.uuid,
    prev_lesson: prevLesson,
    next_lesson: nextLesson,

    videoID: isReleased
      ? resolveSafeVideoID({ video, uri, link })
      : null,

    duration: translateDurationToStringTime(duration),
    order,
    history: serializeHistory(study_history),
    attachments: isReleased ? resolveAttachments(attachments) : [],
    course_finale,
    is_pilot,
    provider: video ? findEmbedType(Number(video.id_embed_type)).key : null,
    release_date: release_date.toISOString(),
    released: isReleased,
  };
};

module.exports = class {
  constructor(lessons, modules, paid_at, isPreview = false) {
    this.lessons = lessons;
    this.modules = modules;
    this.paid_at = paid_at;
    this.isPreview = isPreview;
  }

  adapt() {
    if (!this.lessons) {
      throw new Error('Expect data to be not undefined or null');
    }

    if (Array.isArray(this.lessons)) {
      return this.lessons.map((lesson) =>
        serializeSingleLesson(
          lesson,
          this.modules,
          this.paid_at,
          this.isPreview,
        ),
      );
    }

    return serializeSingleLesson(
      this.lessons,
      this.modules,
      this.paid_at,
      this.isPreview,
    );
  }
};