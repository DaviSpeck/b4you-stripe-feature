import { findSalesStatusById } from "../status/salesStatus.mjs";

export class ZoppyUpdateSale {
  #sale;
  #zoppy;

  constructor(sale, zoppy) {
    this.#sale = sale;
    this.#zoppy = zoppy;
  }

  async execute() {
    const existsOrder = await this.#zoppy.findOrderByZoppyId(this.#sale.id_order_zoppy);

    if(!existsOrder) {
      throw new Error('Order not found')
    }

    const products = this.#sale.sales_items
    const verifySaleStatus = findSalesStatusById(products);

    const orderUpdated = await this.#zoppy.updateOrderStatus({
      ...existsOrder,
      status: verifySaleStatus,
      seller: {
        email: this.#sale.user.email,
        phone: this.#sale.user.whatsapp,
        revenueRecord: this.#sale.sales_items?.reduce((acc, item) => acc + (item.price_total ?? 0), 0) ?? 0,
      },
    });

    return orderUpdated;
  }
}
