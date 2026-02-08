// Link documentação -> https://partners-staging.zoppy.com.br/home
import { PluginsLogs } from '../database/models/Plugins_logs.mjs';
import { HttpClient } from './HTTPClient.mjs';

export class Zoppy {
  #service;
  #apiKey;
  #id_user;

  constructor(apiKey, idUser) {
    this.#apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.#apiKey}`,
      'zoppy-access': '7l7naiOeqm0go52qfFOYB21vgiYYGXoG',
    };
    this.#service = new HttpClient({ baseURL: 'https://api-partners.zoppy.com.br' });
    this.#id_user = idUser;
  }

  async findCustomerByExternalId(externalId) {
    try {
      const { data } = await this.#service.get(`/customers/external/${externalId}`, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      if (error.response?.data?.message === 'Customer not found') {
        return null;
      }

      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify({}),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }

  async createCustomer(objCreatedCostumer) {
    const addressNumber = objCreatedCostumer?.address?.number
      ? `Número: ${objCreatedCostumer.address.number}`
      : '';
    const addressComplement = objCreatedCostumer?.address?.complement
      ? objCreatedCostumer.address.complement
      : '';

    const obj = {
      externalId: objCreatedCostumer?.id.toString(),
      email: objCreatedCostumer?.email,
      phone: objCreatedCostumer?.whatsapp,
      firstName: objCreatedCostumer?.full_name.split(' ')[0],
      lastName: objCreatedCostumer?.full_name.split(' ').slice(1).join(' '),
      birthDate: null,
      gender: null,
      address: {
        address1: objCreatedCostumer?.address?.street,
        address2: `${addressNumber} ${addressComplement}`,
        city: objCreatedCostumer?.address?.city,
        state: objCreatedCostumer?.address?.state,
        postcode: objCreatedCostumer?.address?.zipcode,
        country: null,
        latitude: null,
        longitude: null,
      },
    };

    try {
      const { data } = await this.#service.post('/customers', obj, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify(obj),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }

  async findProductByExternalId(externalId) {
    try {
      const { data } = await this.#service.get(`/products/external/${externalId}`, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      if (error.response?.data?.message === 'Product not found') {
        return null;
      }

      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify({}),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }

  async createProduct(objCreatedProduct) {
    const obj = {
      externalId: objCreatedProduct.id_product.toString(),
      name: objCreatedProduct.product.dataValues.name,
      status: 'publish',
      specification: null,
      price: 0,
      categories: [],
    };

    try {
      const { data } = await this.#service.post('/products', obj, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify(obj),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }

  async createOrder(objCreatedOrder) {
    const obj = {
      externalId: objCreatedOrder.id.toString(),
      customerId: objCreatedOrder.customer.id,
      couponCode: null,
      orderFromZoppy: false,
      completedAt: objCreatedOrder.sales.completedAt,
      status: objCreatedOrder.status,
      subtotal: objCreatedOrder.sales.subtotal,
      discount: objCreatedOrder.sales.discount,
      shipping: objCreatedOrder.sales.shipping,
      storeId: null,
      lineItems: objCreatedOrder.products.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      seller: {
        email: objCreatedOrder.seller.email,
        phone: objCreatedOrder.seller.phone,
        revenueRecord: objCreatedOrder.sales.subtotal,
      },
    };

    try {
      const { data } = await this.#service.post('/orders', obj, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify(obj),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }

  async findOrderByZoppyId(zoppyId) {
    try {
      const { data } = await this.#service.get(`/orders/${zoppyId}`, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      if (error.response?.data?.message === 'Order not found') {
        return null;
      }

      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify({}),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }

  async updateOrderStatus(objUpdatedOrder) {
    const obj = {
      couponCode: objUpdatedOrder.couponCode,
      storeId: objUpdatedOrder.storeId,
      createCoupon: objUpdatedOrder.couponCreated,
      provider: objUpdatedOrder.provider,
      orderFromZoppy: false,
      completedAt: objUpdatedOrder.completedAt,
      store: null,
      status: objUpdatedOrder.status,
      subtotal: objUpdatedOrder.subtotal,
      discount: objUpdatedOrder.discount,
      shipping: objUpdatedOrder.shipping,
      lineItems: objUpdatedOrder.lineItems,
      createdAt: objUpdatedOrder.createdAt,
      updatedAt: new Date().toISOString(),
      seller: objUpdatedOrder.seller,
    };

    try {
      const { data } = await this.#service.put(`/orders/${objUpdatedOrder.id}`, obj, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify(obj),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }

  async createAbandonedCart(objCreatedAbandonedCart) {
    try {
      const { data } = await this.#service.post('/abandoned-carts', objCreatedAbandonedCart, {
        headers: this.headers,
      });

      return data;
    } catch (error) {
      await PluginsLogs.create({
        id_user: this.#id_user,
        id_plugin: 23,
        method: error.request.method,
        url: error.response?.request?.res?.responseUrl,
        headers: JSON.stringify(this.headers),
        body: JSON.stringify(objCreatedAbandonedCart),
        response: JSON.stringify(error.response?.data),
        status_code: error.status,
        is_manual_resend: false,
        resent: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      throw new Error(error);
    }
  }
}
