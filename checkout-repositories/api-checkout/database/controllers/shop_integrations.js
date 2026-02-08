const Shop_integrations = require('../models/Shop_integrations');
const Products = require('../models/Products');
const Product_offer = require('../models/Product_offer');
const Order_bumps = require('../models/Order_bumps');

// ============================================
// SHOP INTEGRATIONS
// ============================================

const findShopIntegrationByDomain = async (shop_domain) =>
  Shop_integrations.findOne({
    where: { shop_domain, active: true },
  });

const findShopIntegrationByUuid = async (uuid) =>
  Shop_integrations.findOne({
    where: { uuid, active: true },
  });

const findShopIntegrationByProductId = async (id_product) =>
  Shop_integrations.findOne({
    where: { id_product, active: true },
    attributes: ['id', 'uuid', 'id_product'],
  });

const findShopIntegrationForCheckout = async (
  shop_domain,
  shop_uuid = null,
) => {
  const where = shop_uuid
    ? { uuid: shop_uuid, active: true }
    : { shop_domain, active: true };

  return Shop_integrations.findOne({
    where,
    include: [
      {
        model: Products,
        as: 'container_product',
        required: false,
      },
      {
        model: Product_offer,
        as: 'default_offer',
        required: false,
        include: [
          {
            model: Order_bumps,
            as: 'order_bumps',
            required: false,
            include: [
              {
                association: 'offer',
                attributes: ['id', 'uuid', 'price', 'name'],
                required: false,
              },
            ],
          },
        ],
      },
    ],
  });
};

const findShopIntegrationsByUser = async (id_user) =>
  Shop_integrations.findAll({
    where: { id_user, active: true },
    include: [
      {
        model: Products,
        as: 'container_product',
        required: false,
      },
      {
        model: Product_offer,
        as: 'default_offer',
        required: false,
      },
    ],
  });

const findShopIntegrationWithProduct = async (uuid) =>
  Shop_integrations.findOne({
    where: { uuid, active: true },
    include: [
      {
        model: Products,
        as: 'container_product',
        required: false,
      },
      {
        model: Product_offer,
        as: 'default_offer',
        required: false,
        include: [
          {
            model: Order_bumps,
            as: 'order_bumps',
            required: false,
          },
        ],
      },
    ],
  });

const createShopIntegration = async (data) => Shop_integrations.create(data);

const updateShopIntegration = async (id, data) =>
  Shop_integrations.update(data, { where: { id } });

// ============================================
// ORDER BUMPS (Product-level, via default_offer)
// ============================================

const findOrderBumpsByOffer = async (id_offer) =>
  Order_bumps.findAll({
    where: { id_offer },
    include: [
      {
        model: Product_offer,
        as: 'offer',
      },
    ],
  });

const createOrderBump = async (data) => Order_bumps.create(data);

const updateOrderBump = async (id, data) =>
  Order_bumps.update(data, { where: { id } });

const deleteOrderBump = async (id) => Order_bumps.destroy({ where: { id } });

// ============================================
// CHECKOUT DATA VIEW
// ============================================

const getCheckoutData = async (identifier, type = 'domain') => {
  const { sequelize } = Shop_integrations;
  const column = type === 'uuid' ? 'shop_uuid' : 'shop_domain';

  const [results] = await sequelize.query(
    `SELECT * FROM shop_checkout_data WHERE ${column} = :identifier LIMIT 1`,
    {
      replacements: { identifier },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  if (!results) return null;

  const parseJson = (field) => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field) || [];
      } catch {
        return [];
      }
    }
    return field || [];
  };

  return {
    shop_id: results.shop_id,
    shop_uuid: results.shop_uuid,
    id_user: results.id_user,
    id_product: results.id_product,
    id_default_offer: results.id_default_offer,
    platform: results.platform,
    shop_domain: results.shop_domain,
    shop_name: results.shop_name,
    shop_config: parseJson(results.shop_config),
    order_bumps: parseJson(results.order_bumps),
    offer_payment_methods: results.offer_payment_methods,
    offer_installments: results.offer_installments,
    offer_student_pays_interest: results.offer_student_pays_interest,
    offer_discount_card: results.offer_discount_card,
    offer_discount_pix: results.offer_discount_pix,
    offer_discount_billet: results.offer_discount_billet,
    offer_allow_coupon: results.offer_allow_coupon,
    offer_enable_two_cards_payment: results.offer_enable_two_cards_payment,
    offer_default_installment: results.offer_default_installment,
    offer_shipping_type: results.offer_shipping_type,
    offer_shipping_price: results.offer_shipping_price,
    offer_require_address: results.offer_require_address,
    offer_allow_shipping_region: results.offer_allow_shipping_region,
    offer_shipping_price_no: results.offer_shipping_price_no,
    offer_shipping_price_ne: results.offer_shipping_price_ne,
    offer_shipping_price_co: results.offer_shipping_price_co,
    offer_shipping_price_so: results.offer_shipping_price_so,
    offer_shipping_price_su: results.offer_shipping_price_su,
    offer_shipping_text: results.offer_shipping_text,
    offer_shipping_region: results.offer_shipping_region,
    offer_thankyou_page: results.offer_thankyou_page,
    offer_thankyou_page_card: results.offer_thankyou_page_card,
    offer_thankyou_page_pix: results.offer_thankyou_page_pix,
    offer_thankyou_page_billet: results.offer_thankyou_page_billet,
    offer_thankyou_page_upsell: results.offer_thankyou_page_upsell,
    offer_id_upsell: results.offer_id_upsell,
    offer_is_upsell_active: results.offer_is_upsell_active,
    offer_is_upsell_native: results.offer_is_upsell_native,
    offer_url_video_checkout: results.offer_url_video_checkout,
    offer_counter: results.offer_counter,
    offer_counter_three_steps: results.offer_counter_three_steps,
    offer_popup: results.offer_popup,
    offer_checkout_customizations: parseJson(
      results.offer_checkout_customizations,
    ),
    offer_terms: results.offer_terms,
    offer_url_terms: results.offer_url_terms,
    offer_type_exibition_value: results.offer_type_exibition_value,
    offer_is_plan_discount_message: results.offer_is_plan_discount_message,
    offer_show_cnpj: results.offer_show_cnpj,
  };
};

const getCheckoutDataByDomain = async (shop_domain) =>
  getCheckoutData(shop_domain, 'domain');

const getCheckoutDataByUuid = async (shop_uuid) =>
  getCheckoutData(shop_uuid, 'uuid');

module.exports = {
  findShopIntegrationByDomain,
  findShopIntegrationByUuid,
  findShopIntegrationByProductId,
  findShopIntegrationForCheckout,
  findShopIntegrationsByUser,
  findShopIntegrationWithProduct,
  createShopIntegration,
  updateShopIntegration,

  findOrderBumpsByOffer,
  createOrderBump,
  updateOrderBump,
  deleteOrderBump,

  getCheckoutData,
  getCheckoutDataByDomain,
  getCheckoutDataByUuid,
};
