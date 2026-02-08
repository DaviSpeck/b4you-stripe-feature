const Product_ebooks = require('../models/Products_ebooks');

const createProductEbook = async (data) => Product_ebooks.create(data);

const findAllEbooks = async (where) =>
  Product_ebooks.findAll({
    raw: true,
    where,
  });

const findOneEbook = async (where) =>
  Product_ebooks.findOne({
    raw: true,
    where,
  });

const deleteEbook = async (where) => Product_ebooks.destroy({ where });

const updateEbook = async (where, data) =>
  Product_ebooks.update(data, { where });

module.exports = {
  createProductEbook,
  findAllEbooks,
  findOneEbook,
  deleteEbook,
  updateEbook,
};
