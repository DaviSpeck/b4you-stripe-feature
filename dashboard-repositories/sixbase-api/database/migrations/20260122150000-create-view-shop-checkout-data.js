/**
 * Creates VIEW shop_checkout_data
 * Optimized to avoid per-row subqueries (critical for performance)
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW shop_checkout_data AS
      SELECT
        si.id AS shop_id,
        si.uuid AS shop_uuid,
        si.id_user,
        si.id_product,
        si.id_default_offer,
        si.platform,
        si.shop_domain,
        si.shop_name,
        si.config AS shop_config,

        -- Default offer configuration
        def_offer.payment_methods AS offer_payment_methods,
        def_offer.installments AS offer_installments,
        def_offer.student_pays_interest AS offer_student_pays_interest,
        def_offer.discount_card AS offer_discount_card,
        def_offer.discount_pix AS offer_discount_pix,
        def_offer.discount_billet AS offer_discount_billet,
        def_offer.allow_coupon AS offer_allow_coupon,
        def_offer.enable_two_cards_payment AS offer_enable_two_cards_payment,
        def_offer.default_installment AS offer_default_installment,
        def_offer.shipping_type AS offer_shipping_type,
        def_offer.shipping_price AS offer_shipping_price,
        def_offer.require_address AS offer_require_address,
        def_offer.allow_shipping_region AS offer_allow_shipping_region,
        def_offer.shipping_price_no AS offer_shipping_price_no,
        def_offer.shipping_price_ne AS offer_shipping_price_ne,
        def_offer.shipping_price_co AS offer_shipping_price_co,
        def_offer.shipping_price_so AS offer_shipping_price_so,
        def_offer.shipping_price_su AS offer_shipping_price_su,
        def_offer.shipping_text AS offer_shipping_text,
        def_offer.shipping_region AS offer_shipping_region,
        def_offer.thankyou_page AS offer_thankyou_page,
        def_offer.thankyou_page_card AS offer_thankyou_page_card,
        def_offer.thankyou_page_pix AS offer_thankyou_page_pix,
        def_offer.thankyou_page_billet AS offer_thankyou_page_billet,
        def_offer.thankyou_page_upsell AS offer_thankyou_page_upsell,
        def_offer.id_upsell AS offer_id_upsell,
        def_offer.is_upsell_active AS offer_is_upsell_active,
        def_offer.is_upsell_native AS offer_is_upsell_native,
        def_offer.url_video_checkout AS offer_url_video_checkout,
        def_offer.counter AS offer_counter,
        def_offer.counter_three_steps AS offer_counter_three_steps,
        def_offer.popup AS offer_popup,
        def_offer.checkout_customizations AS offer_checkout_customizations,
        def_offer.terms AS offer_terms,
        def_offer.url_terms AS offer_url_terms,
        def_offer.type_exibition_value AS offer_type_exibition_value,
        def_offer.is_plan_discount_message AS offer_is_plan_discount_message,
        def_offer.show_cnpj AS offer_show_cnpj,

        -- Pre-aggregated order bumps (NO correlated subquery)
        ob_agg.order_bumps

      FROM shop_integrations si

      LEFT JOIN product_offer def_offer
        ON si.id_default_offer = def_offer.id

      LEFT JOIN (
        SELECT
          ob.id_offer,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', ob.id,
              'uuid', ob.uuid,
              'order_bump_offer', ob.order_bump_offer,
              'product_name', ob.product_name,
              'title', ob.title,
              'label', ob.label,
              'description', ob.description,
              'price_before', ob.price_before,
              'cover', ob.cover,
              'show_quantity', ob.show_quantity,
              'max_quantity', ob.max_quantity,
              'offer_price', po.price,
              'offer_name', po.name
            )
          ) AS order_bumps
        FROM order_bumps ob
        LEFT JOIN product_offer po
          ON ob.order_bump_offer = po.id
        GROUP BY ob.id_offer
      ) ob_agg
        ON ob_agg.id_offer = si.id_default_offer

      WHERE si.active = 1
        AND si.deleted_at IS NULL;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'DROP VIEW IF EXISTS shop_checkout_data;'
    );
  },
};