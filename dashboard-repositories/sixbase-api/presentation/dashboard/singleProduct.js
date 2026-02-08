const { resolveType } = require('../common');
const { findProductCategories } = require('../../types/productCategories');
const { slugify } = require('../../utils/formatters');

const availabelType = {
  1: 'single',
  2: 'three-steps',
  3: 'all',
};

const serializeSingleProducer = ({
  first_name,
  last_name,
  profile_picture,
}) => ({
  name: `${first_name} ${last_name}`,
  profile_picture,
});

const serializeSingleProduct = (product) => {
  const {
    uuid,
    producer,
    nickname,
    biography,
    category,
    name,
    description,
    payment_type,
    payment_frequency,
    content_delivery,
    cover,
    cover_custom,
    warranty,
    sales_page_url,
    support_email,
    support_whatsapp,
    logo,
    hex_color,
    thankyou_page,
    fire_purchase_on_billet,
    customcode_thankyou,
    customcode_checkout,
    creditcard_descriptor,
    customcode_billet,
    id_type,
    allow_affiliate,
    thumbnail,
    files_description,
    sidebar_picture,
    header_picture,
    sidebar_picture_mobile,
    header_picture_mobile,
    ebook_cover,
    favicon,
    banner,
    banner_mobile,
    second_header_mobile,
    default_url_tracking,
    second_header,
    url_video_checkout,
    hex_color_membership_primary,
    hex_color_membership_secondary,
    hex_color_membership_text,
    hex_color_membership_hover,
    apply_membership_colors,
    dimensions,
    has_bling = false,
    bling_sku,
    refund_email,
    has_tiny = false,
    tiny_sku,
    has_shop_integration = false,
    email_subject,
    email_template,
    membership_comments_enabled,
    membership_comments_auto_approve,
    module_cover_format,
    available_checkout_link_types,
  } = product;
  return {
    uuid,
    name,
    description,
    slug: slugify(name),
    type: resolveType(id_type),
    payment_type,
    payment_frequency,
    content_delivery,
    cover,
    cover_custom,
    warranty,
    sales_page_url,
    support_email,
    support_whatsapp,
    creditcard_descriptor,
    logo,
    allow_affiliate,
    hex_color,
    thankyou_page,
    fire_purchase_on_billet,
    customcode_thankyou,
    customcode_checkout,
    customcode_billet,
    nickname,
    biography,
    thumbnail,
    category: findProductCategories(category),
    producer: producer ? serializeSingleProducer(producer) : null,
    files_description,
    sidebar_picture,
    header_picture,
    sidebar_picture_mobile,
    header_picture_mobile,
    ebook_cover,
    favicon,
    min_offer_price: Number(process.env.MIN_PRICE),
    banner,
    banner_mobile,
    second_header_mobile,
    header_picture_secondary: second_header,
    default_url_tracking,
    url_video_checkout,
    hex_color_membership_primary,
    hex_color_membership_secondary,
    hex_color_membership_text,
    hex_color_membership_hover,
    apply_membership_colors,
    dimensions,
    has_bling,
    bling_sku,
    refund_email,
    has_tiny,
    tiny_sku,
    has_shop_integration,
    email_subject,
    email_template,
    membership_comments_enabled,
    membership_comments_auto_approve,
    module_cover_format,
    available_checkout_link_types: availabelType[available_checkout_link_types],
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleProduct);
    }
    return serializeSingleProduct(this.data);
  }
};
