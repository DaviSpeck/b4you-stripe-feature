const MuteStudent = require('../models/Mute_Student');

const muteStudent = async (muteObj) => {
  const muted = await MuteStudent.create(muteObj);
  return muted;
};

const findMutedStudent = async (where) => {
  const muted = await MuteStudent.findOne({
    raw: true,
    where,
  });
  return muted;
};

module.exports = {
  muteStudent,
  findMutedStudent,
};
