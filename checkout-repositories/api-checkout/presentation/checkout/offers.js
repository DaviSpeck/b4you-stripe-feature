const { capitalizeName } = require('../../utils/formatters');
const { resolveType } = require('../common');
const { findFrequency } = require('../../types/frequencyTypes');
const { pixelsTypes } = require('../../types/pixelsTypes');
const CalculateInstallments = require('../../useCases/checkout/installments/CalculateInstallments');
const { PHYSICAL_TYPE } = require('../../types/productTypes');

const serializeSingleProduct = (product) => {
  const {
    name,
    description,
    content_delivery,
    cover,
    warranty,
    sales_page_url,
    support_email,
    support_whatsapp,
    logo,
    id_type,
    excerpt,
    id,
  } = product;
  return {
    id,
    name,
    description,
    excerpt,
    type: resolveType(id_type),
    content_delivery,
    cover,
    warranty,
    sales_page_url,
    support_email,
    support_whatsapp,
    logo,
  };
};

const resolveCounter = (counter) => {
  if (!counter) return null;
  if (Object.keys(counter).length === 0) return null;
  if (!counter.active) return null;
  return counter;
};

const resolveCounterThreeSteps = (counter_three_steps) => {
  if (!counter_three_steps) return null;
  if (Object.keys(counter_three_steps).length === 0) return null;
  if (!counter_three_steps.active) return null;
  return counter_three_steps;
};

const resolveCheckoutOptions = ({
  hex_color,
  sidebar_picture,
  header_picture,
  sidebar_picture_mobile,
  header_picture_mobile,
  favicon,
  second_header_mobile,
  second_header,
  url_video_checkout,
}) => ({
  hex_color,
  sidebar_picture,
  header_picture,
  sidebar_picture_mobile,
  header_picture_mobile,
  favicon,
  second_header_mobile,
  header_picture_secondary: second_header,
  url_video_checkout,
});

const resolvePayment = ({
  plans,
  settings,
  product: { payment_type },
  installments,
  student_pays_interest,
  payment_methods,
}) => ({
  type: payment_type,
  methods: payment_methods.split(','),
  installments,
  installments_fee: settings.fee_interest_card.student_fees.find(
    (fee) => fee.brand === 'master',
  ).monthly_installment_interest,
  plans: plans.map(
    ({
      uuid,
      price: pricePlan,
      label,
      frequency_label,
      subscription_fee,
      subscription_fee_price,
      charge_first,
    }) => ({
      uuid,
      price: pricePlan,
      label,
      frequency_label: findFrequency(capitalizeName(frequency_label)).translate,
      frequency: findFrequency(capitalizeName(frequency_label)).label,
      subscription_fee,
      subscription_fee_price,
      charge_first,
    }),
  ),
  student_pays_interest,
});

const resolveOrderBumps = ({
  order_bumps,
  settings,
  discounts,
  installments,
  student_pays_interest,
}) =>
  order_bumps.map(
    ({
      uuid,
      show_quantity,
      max_quantity,
      price_before,
      product_name,
      title,
      label,
      description,
      cover,
      offer: { offer_product: product, price, offer_image },
    }) => ({
      uuid,
      price,
      show_quantity: product.id_type === PHYSICAL_TYPE && show_quantity,
      alternative_image: offer_image,
      label,
      title,
      product_name,
      description,
      max_quantity,
      cover,
      product: serializeSingleProduct(product),
      price_before,
      discounts,
      payment_type: product.payment_type,
      prices: {
        card: price * (1 - discounts.card / 100),
        billet: price * (1 - discounts.billet / 100),
        pix: price * (1 - discounts.pix / 100),
      },
      installments_list: new CalculateInstallments({
        settings,
        installments,
        student_pays_interest,
        price: price * (1 - discounts.card / 100),
      }).execute(),
    }),
  );

const serializePixels = (pixels, sessionPixelsEventId) =>
  pixelsTypes.reduce(
    (a, v) => ({
      ...a,
      sessionPixelsEventId,
      [v.type]: pixels
        .filter((p) => p.id_type === v.id)
        .map(({ uuid, settings }) => {
          const { api_token, domain, ...rest } = settings;
          return {
            uuid,
            settings: {
              domain: domain ? `pixel.${domain}` : `${process.env.PIXEL_URL}`,
              api_token: !!api_token,
              ...rest,
            },
          };
        }),
    }),
    {},
  );

const verifyPagarmeSellers = (producer, affiliate, product) => {
  let is_Valid = false;
  // produto digital (video e ebook)
  if ([1, 2].includes(product.id_type)) {
    if (
      producer.verified_company_pagarme_3 === 3 ||
      producer.verified_pagarme_3 === 3
    ) {
      is_Valid = true;
    }
    if (!affiliate || !is_Valid) {
      return is_Valid;
    }
    if (
      affiliate.user.verified_company_pagarme_3 === 3 ||
      affiliate.user.verified_pagarme_3 === 3
    ) {
      return true;
    }

    return false;
  }
  if (
    producer.verified_company_pagarme === 3 ||
    producer.verified_pagarme === 3
  ) {
    is_Valid = true;
  }

  if (!affiliate || !is_Valid) {
    return is_Valid;
  }
  if (
    affiliate.user.verified_company_pagarme === 3 ||
    affiliate.user.verified_pagarme === 3
  ) {
    return true;
  }

  return false;
};

const resolveRequireAddress = ({ require_address, id_type }) => {
  if ([4, 5].includes(id_type)) {
    return true;
  }

  return require_address;
};

const serializeSingleProductOffer = (productOffer) => {
  const {
    uuid,
    description,
    price,
    offer_product: product,
    upsell,
    end_offer,
    start_offer,
    order_bumps,
    plans,
    settings,
    discount_pix,
    discount_billet,
    discount_card,
    installments,
    student_pays_interest,
    payment_methods,
    sessionPixelsEventId,
    shipping_type,
    shipping_price,
    shipping_text,
    counter,
    hasActiveCoupon,
    quantity,
    name,
    alternative_name,
    banner_image,
    banner_image_secondary,
    banner_image_mobile,
    banner_image_mobile_secondary,
    sidebar_image,
    url_video_checkout,
    uuid_offer_back_redirect,
    affiliate,
    terms,
    url_terms,
    require_address,
    id_product,
    has_frenet,
    counter_three_steps,
    sixid,
    popup,
    is_plan_discount_message,
    enable_two_cards_payment,
    is_upsell_active,
    is_upsell_native,
    show_cnpj
  } = productOffer;

  const discounts = {
    billet: discount_billet || 0,
    card: discount_card || 0,
    pix: discount_pix || 0,
  };

  product.id = id_product;

  return {
    uuid,
    terms,
    url_terms,
    description,
    price,
    quantity,
    original_price: price,
    prices: {
      billet: price * (1 - (discount_billet || 0) / 100),
      card: price * (1 - (discount_card || 0) / 100),
      pix: price * (1 - (discount_pix || 0) / 100),
    },
    discounts,
    start_offer,
    end_offer,
    shipping_type,
    shipping_price,
    shipping_text,
    require_address: resolveRequireAddress({
      require_address,
      id_type: product.id_type,
    }),
    payment: resolvePayment({
      plans,
      settings,
      product,
      price,
      discount_card,
      installments,
      student_pays_interest,
      payment_methods,
      shipping_price,
    }),
    offer: {
      name,
      alternative_name,
    },
    checkout: resolveCheckoutOptions(product),
    product: serializeSingleProduct(product),
    image_offer: {
      header_picture: banner_image,
      header_picture_secondary: banner_image_secondary,
      header_picture_mobile: banner_image_mobile,
      second_header_mobile: banner_image_mobile_secondary,
      sidebar_picture: sidebar_image,
      url_video_checkout,
    },
    pixels: serializePixels(product.pixels, sessionPixelsEventId),
    upsell:
      Boolean(upsell) ||
      (Boolean(is_upsell_active) && Boolean(is_upsell_native)),
    order_bumps: resolveOrderBumps({
      order_bumps,
      settings,
      installments,
      student_pays_interest,
      discounts,
    }),
    counter: resolveCounter(counter),
    counter_three_steps: resolveCounterThreeSteps(counter_three_steps),
    hasActiveCoupon: !!hasActiveCoupon,
    full_name: product.producer ? product.producer.full_name : null,
    verified_id: verifyPagarmeSellers(product.producer, affiliate, product),
    uuid_offer_back_redirect: uuid_offer_back_redirect
      ? `https://checkout.b4you.com.br/${uuid_offer_back_redirect}`
      : null,
    clear_sale_fingerprint: process.env.CLEAR_SALE_FINGERPRINT,
    has_frenet,
    sixid,
    popup,
    is_plan_discount_message: Boolean(is_plan_discount_message),
    enable_two_cards_payment: Boolean(enable_two_cards_payment),
    show_cnpj,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleProductOffer);
    }
    return serializeSingleProductOffer(this.data);
  }
};
