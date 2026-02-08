const Pixels = require('../models/Pixels');
const rawData = require('../rawData');

const createPixel = async (data) => Pixels.create(data);

const updatePixel = async (where, data) => Pixels.update(data, { where });

const findOnePixel = async (where) =>
  Pixels.findOne({
    where,
    include: [{ association: 'user', required: false, attributes: ['email'] }],
  });

const findAllPixel = async (where) => {
  const pixels = await Pixels.findAll({ where });
  return rawData(pixels);
};

const deletePixel = async (id) => Pixels.destroy({ where: { id } });

module.exports = {
  createPixel,
  deletePixel,
  findAllPixel,
  findOnePixel,
  updatePixel,
};
