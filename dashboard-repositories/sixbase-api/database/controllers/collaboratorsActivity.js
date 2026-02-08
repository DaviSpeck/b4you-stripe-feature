const CollaboratorsActivity = require('../models/Collaborators_Activity');

const createCollaboratorsActivity = async (data) =>
  CollaboratorsActivity.create(data);

module.exports = {
  createCollaboratorsActivity,
};
