const serializeProduct = ({ uuid, name, cover, payment_type }) => ({
  uuid,
  name,
  cover,
  payment_type
});

const serializeClassroom = (classroom) => {
  if (!classroom) return null;
  const { uuid, label, is_default } = classroom;
  return {
    uuid,
    label,
    is_default,
  };
};

const serializeOffer = ({ uuid, name, price }) => ({
  uuid,
  label: name,
  price,
});

const serializePlans = (plans) => {
  if (!Array.isArray(plans)) return [];
  return plans.map(({ uuid, label, price }) => ({
    uuid,
    label,
    price,
  }));
}

const serializeSingleOrderBump = (order_bump) => {
  const {
    uuid,
    title,
    product_name,
    label,
    description,
    offer,
    price_before,
    show_quantity,
    max_quantity,
    cover,
  } = order_bump;

  let serializedOffer = null;
  let serializedClassroom = null;
  let serializedProduct = null;
  let serializedPlans = [];

  if (offer) {
    const { offer_product, classroom, ...rest } = offer;

    if (offer.plans) {
      serializedPlans = serializePlans(offer.plans);
    }

    serializedProduct = serializeProduct(offer_product);
    serializedOffer = serializeOffer(rest);
    serializedClassroom = serializeClassroom(classroom);
  }

  return {
    uuid,
    title,
    product_name,
    label,
    description,
    price_before,
    product: serializedProduct,
    offer: serializedOffer,
    classroom: serializedClassroom,
    plans: serializedPlans,
    show_quantity,
    max_quantity,
    cover,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleOrderBump);
    }
    return serializeSingleOrderBump(this.data);
  }
};
