const { resolveType } = require('../common');
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
  } = product;
  return {
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
        price_before,
        label,
        description,
        offer:  { offer_product: product, price },
      }) => ({
        uuid,
        price,
        show_quantity: product.id_type === PHYSICAL_TYPE && show_quantity,
        label,
        description,
        product: serializeSingleProduct(product),
        price_before,
        discounts,
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

  
    module.exports = class {
        constructor(data) {
          this.data = data;
        }
      
        adapt() {
          if (!this.data) throw new Error('Expect data to be not undefined or null');
          if (Array.isArray(this.data)) {
            return this.data.map(resolveOrderBumps);
          }
          return resolveOrderBumps(this.data);
        }
      };