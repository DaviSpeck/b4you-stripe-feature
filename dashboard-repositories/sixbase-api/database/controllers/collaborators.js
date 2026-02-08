const Collaborators = require('../models/Collaborators');
const Users = require('../models/Users');

const findAllCollaboratorsPaginated = async (where, page, size) => {
  const limit = parseInt(size, 10);
  const offset = limit * parseInt(page, 10);
  const collaborators = await Collaborators.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Users,
        as: 'producer',
      },
      {
        model: Users,
        as: 'collaborator',
      },
    ],
  });
  return collaborators;
};

const findOneCollaborator = async (where) => {
  const collaborator = await Collaborators.findOne({
    where,
    include: [
      {
        model: Users,
        as: 'producer',
      },
    ],
  });

  if (collaborator) return collaborator.toJSON();
  return collaborator;
};

const createCollaborator = async (data) => Collaborators.create(data);

const updateCollaborator = async (where, data) =>
  Collaborators.update(data, { where });

const deleteCollaborator = async (where) => Collaborators.destroy({ where });

const findAllCollaborators = async (where) =>
  Collaborators.findAll({
    where,
    include: [
      {
        model: Users,
        as: 'producer',
      },
    ],
  });
module.exports = {
  findAllCollaboratorsPaginated,
  findOneCollaborator,
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
  findAllCollaborators,
};
