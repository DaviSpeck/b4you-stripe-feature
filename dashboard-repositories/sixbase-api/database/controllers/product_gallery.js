const Products_gallery = require('../models/Product_gallery');

const createProductGallery = async (galleryData) =>
  Products_gallery.create(galleryData);

const findAllVideosInGallery = async (where) =>
  Products_gallery.findAll({
    raw: true,
    where,
  });

const findAllVideosInGalleryWithLessons = async (where) =>
  Products_gallery.findAll({
    where,
    nest: true,
    order: [['id', 'desc']],
    include: [{ association: 'lessons' }],
  });

const updateVideoInGallery = async (where, data) =>
  Products_gallery.update(data, { where });

const deleteVideoFromGallery = async (where) =>
  Products_gallery.destroy({ where });

const findOneVideoGallery = async (where) =>
  Products_gallery.findOne({
    where,
    include: [
      {
        association: 'product',
      },
    ],
  });

module.exports = {
  createProductGallery,
  findAllVideosInGallery,
  findAllVideosInGalleryWithLessons,
  updateVideoInGallery,
  deleteVideoFromGallery,
  findOneVideoGallery,
};
