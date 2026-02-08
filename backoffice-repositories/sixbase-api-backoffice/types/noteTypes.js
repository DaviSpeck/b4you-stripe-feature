const noteTypes = [
  { id: 1, key: 'administrative', label: 'Administrativa' },
  { id: 2, key: 'commercial', label: 'Comercial' }
];

const followupStatusTypes = [
  { id: 1, key: 'in_progress', label: 'Em andamento' },
  { id: 2, key: 'done', label: 'Concluido' },
  { id: 3, key: 'awaiting_producer', label: 'Aguardando produtor' },
  { id: 4, key: 'awaiting_internal', label: 'Aguardando interno' },
  { id: 5, key: 'resolved', label: 'Resolvido' },
  { id: 6, key: 'left_platform', label: 'Saiu da plataforma' }
];

const findNoteType = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      const byId = noteTypes.find((item) => item.id === numeric);
      if (byId) return byId;
    }
    return noteTypes.find((item) => item.key === value) || null;
  }
  return noteTypes.find((item) => item.id === value) || null;
};

const findNoteTypeById = (id) => findNoteType(id);
const findNoteTypeByKey = (key) => findNoteType(key);

const findFollowupStatus = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      const byId = followupStatusTypes.find((item) => item.id === numeric);
      if (byId) return byId;
    }
    return followupStatusTypes.find((item) => item.key === value) || null;
  }
  return followupStatusTypes.find((item) => item.id === value) || null;
};

const findFollowupStatusById = (id) => findFollowupStatus(id);
const findFollowupStatusByKey = (key) => findFollowupStatus(key);

module.exports = {
  noteTypes,
  followupStatusTypes,
  findNoteType,
  findNoteTypeById,
  findNoteTypeByKey,
  findFollowupStatus,
  findFollowupStatusById,
  findFollowupStatusByKey,
};
