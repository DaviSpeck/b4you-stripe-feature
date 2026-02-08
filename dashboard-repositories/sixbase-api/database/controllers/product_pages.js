const Product_pages = require('../models/ProductPages');
const Products = require('../models/Products');
const Users = require('../models/Users');
const Product_affiliate_settings = require('../models/Product_affiliate_settings');

/**
 * Busca uma página de vendas específica pelo UUID.
 * Inclui produto e produtor, e ignora registros soft-deletados.
 */
const findPage = async (uuid) => {
    const page = await Product_pages.findOne({
        nest: true,
        where: { uuid },
        paranoid: true,
        include: [
            {
                model: Products,
                as: 'product',
                paranoid: false,
                include: [
                    { model: Product_affiliate_settings, as: 'affiliate_settings' },
                    { model: Users, as: 'producer', attributes: ['id', 'full_name', 'email'] },
                ],
            },
        ],
    });

    return page;
};

/**
 * Busca várias páginas associadas a um produto.
 */
const findPagesByProduct = async (id_product) => {
    const pages = await Product_pages.findAll({
        nest: true,
        where: { id_product },
        paranoid: true,
        include: [
            {
                model: Products,
                as: 'product',
                paranoid: false,
                include: [
                    { model: Product_affiliate_settings, as: 'affiliate_settings' },
                    { model: Users, as: 'producer', attributes: ['id', 'full_name', 'email'] },
                ],
            },
        ],
    });

    return pages;
};

module.exports = {
    findPage,
    findPagesByProduct,
};
