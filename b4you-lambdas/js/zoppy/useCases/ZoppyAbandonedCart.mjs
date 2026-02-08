import { Students } from "../database/models/Students.mjs";

export class ZoppyAbandonedCart {
  #cart;
  #zoppy;

  constructor(cart, zoppy) {
    this.#cart = cart;
    this.#zoppy = zoppy;
  }

  async execute() {
    let customer = null;
    let product = null;

    const findCustomer = await Students.findOne({
      where: { email: this.#cart.costumerEmail },
    });

    if (!findCustomer) {
      throw new Error('Customer not found');
    }

    const findCostumerByExternalId = await this.#zoppy.findCustomerByExternalId(findCustomer.id);

    if (!findCostumerByExternalId) {
      const objCreatedCustomer = {
        ...findCustomer.dataValues
      }

      const costumerCreated = await this.#zoppy.createCustomer(objCreatedCustomer);
      customer = costumerCreated
    } else {
      customer = findCostumerByExternalId;
    }

    const findProduct = await this.#zoppy.findProductByExternalId(this.#cart.product.id_product);

    if (!findProduct) {
      const objCreatedProduct = {
        id_product: this.#cart.product.id_product,
        product: {
          dataValues: {
            name: this.#cart.product.name
          }
        }
      };  

      const productCreated = await this.#zoppy.createProduct(objCreatedProduct);

      product = productCreated;
    } else {
      product = findProduct;
    }

    const obj = {
      subtotal: this.#cart.subtotal,
      discount: this.#cart.discount,
      shipping: this.#cart.shipping,
      url: this.#cart.url,
      lineItems: [
        {
          productId: product.id,
          quantity: this.#cart.product.quantity
        }
      ],
      createdAt: this.#cart.createdAt,
      updatedAt: this.#cart.updatedAt,
      externalId: this.#cart.externalId.toString(),
      customerId: customer.id,
    }

    const abandonedCartCreated = await this.#zoppy.createAbandonedCart(obj);
    return abandonedCartCreated;
  }
}

