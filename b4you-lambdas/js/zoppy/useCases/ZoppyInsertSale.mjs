import { Sales } from "../database/models/Sales.mjs";
import { findSalesItemsStatusById, findSalesStatusById } from "../status/salesStatus.mjs";

export class ZoppyInsertSale {
  #sale;
  #zoppy;

  constructor(sale, zoppy) {
    this.#sale = sale;
    this.#zoppy = zoppy;
  }

  async execute() {
    let costumer = null;
    let products = [];

    const existsCustomer = await this.#zoppy.findCustomerByExternalId(this.#sale.id_student);

    if(!existsCustomer) {
        const objCreatedCostumer = {
          id: this.#sale.id_student,
          ...this.#sale.student.dataValues
        }

        const costumerCreated = await this.#zoppy.createCustomer(objCreatedCostumer)
        costumer = costumerCreated
    } else {
        costumer = existsCustomer
    }

    for (let i = 0; i < this.#sale.sales_items.length; i++) {
        const product = this.#sale.sales_items[i]
        const existsProduct = await this.#zoppy.findProductByExternalId(product.id_product)

        if(!existsProduct) {
          const productCreated = await this.#zoppy.createProduct(product)
            products.push({
              ...productCreated,
              quantity: product.dataValues.quantity,
              status: findSalesItemsStatusById(product.id_status).name,
            })
        } else {
          products.push({
            ...existsProduct,
            quantity: product.dataValues.quantity,
            status: findSalesItemsStatusById(product.id_status).name,
          })
        }
    }

    const verifySaleStatus = findSalesStatusById(products);

    const orderCreated = await this.#zoppy.createOrder({
      id: this.#sale.id,
      customer: costumer,
      products: products,
      sales: {
        completedAt: this.#sale.updated_at?.toISOString() ?? null,
        shipping: this.#sale.sales_items?.reduce((acc, item) => acc + (item.shipping_price ?? 0), 0) ?? 0,
        discount: this.#sale.sales_items?.reduce((acc, item) => acc + (item.discount_amount ?? 0), 0) ?? 0,
        subtotal: this.#sale.sales_items?.reduce((acc, item) => acc + (item.price_total ?? 0), 0) ?? 0,
      },
      status: verifySaleStatus,
      seller: {
        email: this.#sale.user.email,
        phone: this.#sale.user.whatsapp,
      },
    });

    await Sales.update({ id_order_zoppy: orderCreated.id }, {
      where: {
        id: this.#sale.id,
      },
    });

    return orderCreated;
  }
}

