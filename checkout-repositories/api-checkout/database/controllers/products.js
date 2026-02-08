
const Product = require('../models/Products');

const findOneProduct = async (where) => Product.findOne({ where });


module.exports = {
    findOneProduct
};
