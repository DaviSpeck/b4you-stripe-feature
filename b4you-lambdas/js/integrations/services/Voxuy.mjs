import { HttpClient } from './HTTPClient.mjs';
import { date } from '../utils/date.mjs';
import { capitalizeName, floatAmountToInteger } from '../utils/formatters.mjs';

const CUSTOM_EVENT = 99;
const ABANDONED_CART = 80;
const CREDIT_CARD = 2;
const APPROVED = 1;
const CANCELED = 2;
const BILLET = 1;
const PIX = 7;
const CHARGEBACK = 3;
const PENDING = 0;
const REFUNDED = 4;

export class Voxuy {
  #service;

  constructor(apiUrl, apiToken) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.#service = new HttpClient({ baseURL: apiUrl });
  }

  async abandonedCart({ transaction_id, amount, name, email, phone, document_number, planId }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      planId,
      value: floatAmountToInteger(amount),
      totalValue: floatAmountToInteger(amount),
      paymentType: CUSTOM_EVENT,
      status: ABANDONED_CART,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
      clientDocument: document_number,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      boletoUrl: null,
      pixQrCode: null,
      pixUrl: null,
      customEvent: null,
      paymentLine: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async paidCard({ transaction_id, amount, name, email, phone, document_number, planId }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      planId,
      value: floatAmountToInteger(amount),
      totalValue: floatAmountToInteger(amount),
      paymentType: CREDIT_CARD,
      status: APPROVED,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
      clientDocument: document_number,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      boletoUrl: null,
      pixQrCode: null,
      pixUrl: null,
      customEvent: null,
      paymentLine: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async paidBillet({ transaction_id, amount, name, email, phone, document_number, planId }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      planId,
      value: floatAmountToInteger(amount),
      totalValue: floatAmountToInteger(amount),
      paymentType: BILLET,
      status: APPROVED,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
      clientDocument: document_number,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      boletoUrl: null,
      pixQrCode: null,
      pixUrl: null,
      customEvent: null,
      paymentLine: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async paidPix({ transaction_id, amount, name, email, phone, document_number, planId }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      planId,
      value: floatAmountToInteger(amount),
      totalValue: floatAmountToInteger(amount),
      paymentType: PIX,
      status: APPROVED,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
      clientDocument: document_number,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      boletoUrl: null,
      pixQrCode: null,
      pixUrl: null,
      customEvent: null,
      paymentLine: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async refusedCard({ transaction_id, amount, name, email, phone, document_number, planId }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      planId,
      value: floatAmountToInteger(amount),
      totalValue: floatAmountToInteger(amount),
      paymentType: CREDIT_CARD,
      status: CANCELED,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
      clientDocument: document_number,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      boletoUrl: null,
      pixQrCode: null,
      pixUrl: null,
      customEvent: null,
      paymentLine: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async chargeback({ uuid, amount, full_name, email, whatsapp, document_number, planId }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${uuid}`,
      planId,
      value: amount * 100 || 0,
      totalValue: amount * 100 || 0,
      paymentType: CREDIT_CARD,
      status: CHARGEBACK,
      clientName: capitalizeName(full_name),
      clientEmail: email,
      clientPhoneNumber: whatsapp,
      clientDocument: document_number,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      boletoUrl: null,
      pixQrCode: null,
      pixUrl: null,
      customEvent: null,
      paymentLine: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async generatedBillet({
    transaction_id,
    amount,
    name,
    email,
    phone,
    document_number,
    planId,
    url,
    bar_code,
  }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      planId,
      value: floatAmountToInteger(amount),
      totalValue: floatAmountToInteger(amount),
      paymentType: BILLET,
      status: PENDING,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
      clientDocument: document_number,
      boletoUrl: url,
      paymentLine: bar_code,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      pixQrCode: null,
      pixUrl: null,
      customEvent: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async generatedPix({ transaction_id, amount, name, email, phone, document_number, planId, url }) {
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      planId,
      value: floatAmountToInteger(amount),
      totalValue: floatAmountToInteger(amount),
      paymentType: PIX,
      status: PENDING,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
      clientDocument: document_number,
      pixQrCode: url,
      pixUrl: url,
      clientAddress: null,
      clientAddressNumber: null,
      clientAddressComp: null,
      clientAddressDistrict: null,
      clientAddressCity: null,
      clientAddressState: null,
      clientAddressCountry: null,
      clientZipCode: null,
      checkoutUrl: null,
      boletoUrl: null,
      customEvent: null,
      paymentLine: null,
      freight: null,
      freightType: null,
      date: date().now(),
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }

  async canceledSubscriptionOrRefunded({
    transaction_id,
    email,
    phone,
    name,
    planId,
    payment_method,
  }) {
    const paymentType = payment_method === 'card' ? CREDIT_CARD : PIX;
    const body = {
      apiToken: this.apiToken,
      id: `B4you-${transaction_id}`,
      paymentType,
      planId,
      status: REFUNDED,
      clientName: capitalizeName(name),
      clientEmail: email,
      clientPhoneNumber: phone,
    };
    const response = await this.#service.post('/', body, {
      headers: this.headers,
    });
    return response;
  }
}
