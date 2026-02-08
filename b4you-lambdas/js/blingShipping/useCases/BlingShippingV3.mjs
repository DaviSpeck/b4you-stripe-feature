import { Sales } from '../database/models/Sales.mjs';
import { Integration_notifications } from '../database/models/Integration_notifications.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { Sales_items_plugins } from '../database/models/Sales_items_plugins.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Bling_errors } from '../database/models/Bling_errors.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { BlingV3 } from '../services/BlingShippingV3.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { delay } from '../utils/delay.mjs';
import { Op } from 'sequelize';
import { capitalizeName } from '../utils/formatters.mjs';
import axios from 'axios';
const TELEGRAM_BOT_TOKEN = '7386474980:AAFHkpPmGZD7QmafL57Kin8YATkdEEoq9Z8';
const TELEGRAM_CHAT_ID = '-1002545243602';
const PHYSICAL_TYPE = 4;
const BLING_NOTIFY_TYPE = 2

const sanitizeString = (str) => {
  return str.replace(/[!@#$%^&*+=]/g, '');
};

const formatCity = (str) => {
  if (str.toLowerCase() === 'santana do livramento')
    return "Sant'Ana do Livramento";
  return sanitizeString(str);
};

const removeAccents = (str) => {
  if (!str) return str;
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const limitLength = (str, maxLength = 40) => {
  if (!str) return str;
  return str.length > maxLength ? str.substring(0, maxLength) : str;
};

function getDocumentType(doc) {
  const clean = String(doc).replace(/\D/g, '');
  if (clean.length === 11) return 'F';
  if (clean.length === 14) return 'J';
  return 'INVÁLIDO';
}

function calculateDiscountPercentage(item) {
  if (item.discount_percentage && item.discount_percentage !== 0) {
    return Number(Number(item.discount_percentage).toFixed(2));
  }

  if (item.discount_amount && item.price_product) {
    const percentage = (item.discount_amount / item.price_product) * 100;
    return Number(percentage.toFixed(2));
  }

  return 0;
}

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
  };

  try {
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error(
      'Erro ao enviar mensagem para o Telegram:',
      err.response?.data || err.message
    );
  }
}

export class BlingShippingV3 {
  #saleId;
  #isUpsell;
  #isSubscription;
  #idSaleItem;

  constructor(saleId, isUpsell, isSubscription = false, idSaleItem = null) {
    this.#saleId = saleId;
    this.#isUpsell = isUpsell;
    this.#isSubscription = isSubscription
    this.#idSaleItem = idSaleItem

  }

  async execute() {
    let id_user = null;
    let user_email = null;
    const where = {
      id: this.#saleId,
      '$sales_items.id_status$': findSalesStatusByKey('paid').id,
    }
    const whereSaleItem = {}
    if (!this.#isSubscription && !this.#isUpsell) {
      where.id_order_bling = null
    }

    console.log("where sale", where)

    const sale = await Sales.findOne({
      where,
      include: [
        {
          association: 'sales_items',
          attributes: [
            'id',
            'price_product',
            'shipping_price',
            'quantity',
            'discount_amount',
            'discount_percentage',
            'payment_method',
            'integration_shipping_company',
            'type'
          ],
          include: [
            {
              paranoid: false,
              association: 'product',
              where: {
                id_type: PHYSICAL_TYPE,
              },
            },
            {
              association: 'offer',
              paranoid: false,
              attributes: ['uuid', 'id', 'name', 'metadata', 'bling_sku'],
            },
            {
              association: 'charges',
              attributes: ['installments'],
            },
          ],
        },
        {
          association: 'student',
          attributes: ['full_name', 'document_number', 'email', 'whatsapp', 'uuid'],
        },
        {
          association: 'user',
          attributes: ['email'],
        },
      ],
    });

    if (!sale) {
      console.log('Sale with missing parameters. SALE ID->: ', this.#saleId);
      return;
    }

    id_user = sale.id_user;
    user_email = sale.user.email;

    console.log('SALE COMPLETA', JSON.stringify(sale));

    const plugin = await Plugins.findOne({
      where: {
        id_user: sale.id_user,
        id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
        active: true,
      },
    });

    if (!plugin) {
      console.log('Plugin not found. SALE ID: ', this.#saleId);
      return;
    }
    if (!sale) {
      console.log('Sale not found. SALE ID: ', this.#saleId);
      return;
    }

    const blingV3 = new BlingV3(
      plugin.settings.refresh_token,
      plugin.settings.access_token
    );

    try {
      if (!(await blingV3.verifyCredentials())) {
        console.log('old refresh token', plugin.settings.refresh_token, plugin.settings.access_token)
        const { refresh_token, access_token } = await blingV3.refreshToken();
        console.log('new refresh token', refresh_token, access_token)


        await Plugins.update(
          {
            settings: {
              ...plugin.settings,
              refresh_token,
              access_token,
            },
          },
          {
            where: {
              id: plugin.id,
            },
          }
        );
      }

      const products = [];

      if (this.#isSubscription) {
        console.log('Is subscription, finding sales_items', this.#idSaleItem)

        const saleItem = await Sales_items.findAll({
          where: {
            id: this.#idSaleItem
          },
          include: [
            {
              paranoid: false,
              association: 'product',
              where: {
                id_type: PHYSICAL_TYPE,
              },
            },
            {
              association: 'offer',
              paranoid: false,
              attributes: ['uuid', 'id', 'name', 'metadata', 'bling_sku'],
            },
            {
              association: 'charges',
              attributes: ['installments'],
            },
          ],
        })
        if (saleItem.length > 0) {
          sale.sales_items = saleItem
        } else {
          console.log('erro ao buscar sale item de assinatura, finalizando execucao');
          throw new Error(
            `Falha ao criar produto no Bling para o SKU: ${item.offer.bling_sku} - ${item.offer.uuid}`
          );
        }
      }

      for await (let item of sale.sales_items) {
        const offer = item.offer;
        if (
          !(
            offer &&
            offer.dataValues &&
            offer.dataValues.metadata &&
            Array.isArray(offer.dataValues.metadata.line_items)
          )
        ) {
          console.log('validando sku SEM shopify');
          await delay(1);
          if (item.product.bling_sku) {
            console.log('finding by sku product', item.product.uuid);
            const { id: idsku } = await blingV3.getProduct(
              item.product.bling_sku
            );
            console.log('id sku by product', idsku);
            products.push({ id: idsku, code: item.product.bling_sku });
          } else if (item.offer.bling_sku) {
            console.log(
              'finding by sku offer',
              item.offer.uuid,
              item.offer.bling_sku
            );
            const { id: idsku } = await blingV3.getProduct(
              item.offer.bling_sku
            );
            if (idsku) {
              console.log('tem o sku cadastrado', idsku);
              products.push({ id: idsku, code: item.offer.bling_sku });
            } else {
              console.log(
                'não tem o sku cadastrado, cadastrando',
                item.offer.bling_sku
              );
              const { id: new_id_sku } = await blingV3.createProduct({
                code: item.offer.bling_sku,
                name: `${item.product.name} ${item.offer.name}`,
                price: item.price_product / item.quantity,
              });
              console.log('criado novo sku', new_id_sku);
              if (new_id_sku) {
                console.log('tem o sku');
                products.push({ id: new_id_sku, code: item.offer.bling_sku });
              } else {
                console.log('erro ao criar, finalizando execucao');
                throw new Error(
                  `Falha ao criar produto no Bling para o SKU: ${item.offer.bling_sku} - ${item.offer.uuid}`
                );
              }
            }
          } else {
            await delay(1);
            const { id } = await blingV3.getProduct(item.offer.uuid);

            if (!id) {
              await delay(1);
              const { id } = await blingV3.createProduct({
                code: item.offer.uuid,
                name: `${item.product.name} ${item.offer.name}`,
                price: item.price_product / item.quantity,
              });

              products.push({ id, code: item.offer.uuid });
            }
            products.push({ id, code: item.offer.uuid });
          }
        }
      }

      await delay(1);
      let client = await blingV3.getContact(sale.student.document_number);
      if (!client) {
        await delay(1);
        console.log('Cliente não existe existe, cadastrando...');
        client = await blingV3.createContact({
          name: removeAccents(capitalizeName(sale.student.full_name)),
          document: sale.student.document_number,
          type: getDocumentType(sale.student.document_number),
          email: sale.student.email,
          cellphone: sale.whatsapp,
          code: sale.student.uuid,
          contactType: 'Cliente',
          address: {
            street: limitLength(sanitizeString(sale.address.street)),
            number: sanitizeString(sale.address.number),
            complement: sanitizeString(sale.address?.complement ?? ''),
            zipcode: sanitizeString(sale.address.zipcode),
            neighborhood: limitLength(sanitizeString(sale.address.neighborhood)),
            city: formatCity(sale.address.city),
            state: sanitizeString(sale.address.state),
          },
          id_user: sale.id_user,
        });
        console.log('Cliente cadastrado:', client?.id);
      } else {
        console.log('Cliente já existe, usando:', client?.id);
      }

      const order = {
        //   nat_operacao: plugin.settings.nat_operacao,
        id_user: sale.id_user,
        payment_method: sale?.sales_items[0]?.payment_method || 'card',
        installments_order: sale?.sales_items[0]?.charges[0]?.installments || 1,
        codShipping: sale?.sales_items[0]?.integration_shipping_company
          ? sale.sales_items[0].integration_shipping_company.split('_')[0]
          : null,
        sale_uuid: !this.#isSubscription ? sale.uuid : sale.sales_items[0].uuid,
        date: !this.#isSubscription ? new Date(sale.created_at).toISOString().split('T')[0] : new Date(sale.sales_items[0].created_at).toISOString().split('T')[0],
        shipping: plugin.settings.shipping,
        shippingService: plugin.settings.shipping_service || 'sedex',
        clientId: client.id,
        freight: sale.sales_items.reduce(
          (total, s) => total + s.shipping_price,
          0
        ),
        clientName: removeAccents(capitalizeName(sale.student.full_name)),
        address: {
          street: limitLength(sanitizeString(sale.address.street)),
          number: sanitizeString(sale.address.number),
          complement: sanitizeString(sale.address?.complement ?? ''),
          neighborhood: limitLength(sanitizeString(sale.address.neighborhood)),
          zipcode: sanitizeString(sale.address.zipcode),
          city: formatCity(sale.address.city),
          state: sanitizeString(sale.address.state),
        },
        items: sale.sales_items.map((element) => ({
          name: `${element.product.name} ${element.offer.name}`,
          quantity: element.quantity,
          amount: element.price_product / element.quantity,
          uuid: element.offer.uuid,
          discount_percentage: calculateDiscountPercentage(element),
          productId: products.find(
            (product) =>
              product.code === element.offer.uuid ||
              (element.product.bling_sku &&
                product.code === element.product.bling_sku) ||
              (element.offer.bling_sku &&
                product.code === element.offer.bling_sku)
          )?.id,
        })),
        installments: {
          due_date: new Date(sale.created_at).toISOString().split('T')[0],
          amount: sale.sales_items.reduce(
            (total, s) => total + s.price_product,
            0
          ),
        },
      };
      console.log('order antes', order);
      //------------------------

      for await (const si of sale.sales_items) {
        const offer = si.offer;
        if (
          offer &&
          offer.dataValues &&
          offer.dataValues.metadata &&
          Array.isArray(offer.dataValues.metadata.line_items)
        ) {
          console.log('validando sku COM shopify');
          for await (const data of offer.dataValues.metadata.line_items) {
            console.log('shopify order with metadata', data);
            await delay(1);
            const code = data.sku || offer.bling_sku || data.variant_id;
            const { id } = await blingV3.getProduct(code);
            if (!id) {
              await delay(1);
              if (code && data.title && data.price) {
                const { id } = await blingV3.createProduct({
                  code,
                  name: data.title,
                  price: data.price,
                });
                console.log('nao tava cadastrado', id);
                products.push({ id, code });
              } else {
                console.log(
                  'nao tem todos os atributo para cadastrar um produto na bling',
                  data
                );
                return;
              }
            } else {
              console.log('ja tava cadastrado', id, code);
              products.push({ id, code });
            }
          }
        }
      }

      let newData = []
      sale.sales_items.forEach((item) => {
        const offer = item.offer;
        if (offer && offer.dataValues && offer.dataValues.metadata) {
          const metadata = offer.dataValues.metadata;
          if (Array.isArray(metadata.line_items)) {
            metadata.line_items.forEach((l) => {
              const code = l.sku || l.variant_id;
              const product = products.find((product) => product.code === code);
              if (!product) {
                console.log(
                  'Produto não encontrado na lista de produtos',
                  code
                );
                return;
              }
              const data = {
                name: l.title,
                quantity: l.quantity,
                amount: l.price,
                uuid: offer.uuid,
                discount_percentage: calculateDiscountPercentage(item),
                productId: product.id,
              }
              newData.push(data)
            });
          }
        }
      });

      if (newData.length > 0) {
        order.items = newData
      }
      // ------------------------
      console.log('order depois ', order);

      await delay(1);
      let responseBling;
      if (this.#isUpsell) {
        console.log('1 - update bling order', sale);
        if (sale?.id_order_bling) {
          console.log('2 - update bling order', sale.id_order_bling);
          responseBling = await blingV3.updateOrder(sale.id_order_bling, order);
        } else {
          const mainSaleItem = sale.sales_items.find((e) => e.type === 1)
          console.log('3 - update bling order plugin');
          if (mainSaleItem) {
            console.log('4 - update bling order', mainSaleItem.id);
            const salePlugin = await Sales_items_plugins.findOne({
              raw: true,
              where: {
                id_sale_item: mainSaleItem.id,
                id_bling: {
                  [Op.ne]: null,
                },
              }
            })
            console.log('5 - update bling order', salePlugin);
            if (salePlugin?.id_bling) {
              console.log('6 - update bling order', salePlugin.id_bling);
              responseBling = await blingV3.updateOrder(salePlugin.id_bling, order);
            }
          }
        }
      } else {
        responseBling = await blingV3.createOrder(order);
      }

      console.log('Response bling', JSON.stringify(responseBling));

      if (responseBling?.id) {
        if (!this.#isSubscription && !this.#isUpsell) {
          await Sales.update(
            { id_order_bling: responseBling?.id },
            { where: { id: sale.id } }
          );
        } else if (this.#isUpsell && !this.#isSubscription) {
          await Sales_items_plugins.create({
            id_bling: responseBling?.id,
            id_sale_item: this.#idSaleItem,
            body: order,
            response: responseBling
          })
        } else {
          for await (const id of this.#idSaleItem) {
            await Sales_items_plugins.create({
              id_bling: responseBling?.id,
              id_sale_item: id,
              body: order,
              response: responseBling
            })
          }

        }
        try {
          console.log('Mark done notification', sale.id)
          await Integration_notifications.update({
            done: 1
          }, {
            where: {
              id_sale: sale.id
            }
          })
        } catch (error) {
          console.log('error on mark read notification', error)
        }
      }
      console.log("FINISHED SALE ID", sale.id)
      return responseBling;

    } catch (error) {
      if (error && error.response && error.response.data) {
        console.log('Erro Final ->', JSON.stringify(error.response.data));
        try {
          if (error?.response?.data?.error?.type === 'invalid_grant' || error?.response?.data?.error?.type === 'invalid_token') {
            // token bling desativado, expirado ou com problemas na conta
            await Integration_notifications.create({
              id_user: sale.id_user,
              id_type: BLING_NOTIFY_TYPE,
              id_sale: sale.id,
              read: false,
              done: false,
              params: {
                message: "Credencias bling inválidas/expiradas",
                action: "Atualize suas credenciais no painel da B4you em de Apps -> Bling"
              }
            })
          }

          if (
            error?.response?.data?.error?.type === 'VALIDATION_ERROR' &&
            error?.response?.data?.error?.message === 'Não foi possível salvar o contato'
          ) {
            let notificationMessage = "Erro ao enviar pedido bling";
            let actionMessage = "";


            if (Array.isArray(error?.response?.data?.error?.fields) && error.response.data.error.fields.length > 0) {

              const firstField = error.response.data.error.fields.find(field => field.msg);

              if (firstField && firstField.msg) {
                notificationMessage += `: ${firstField.msg}`;
              }


              const isPhoneError = error.response.data.error.fields.some(
                field => field.element === 'celular' || field.element === 'fone' ||
                  (field.msg && (field.msg.toLowerCase().includes('telefone') || field.msg.toLowerCase().includes('celular')))
              );


              const isAddressError = error.response.data.error.fields.some(
                field => field.element === 'cidade' || field.element === 'cidadeCobranca' ||
                  (field.msg && (field.msg.toLowerCase().includes('cidade') || field.msg.toLowerCase().includes('cep')))
              );

              if (isPhoneError) {
                actionMessage = `Corrija telefone/celular da venda do cliente -> ${sale.student.email}`;
              } else if (isAddressError) {
                actionMessage = `Corrija cep/cidade da venda do cliente -> ${sale.student.email}`;
              } else {

                actionMessage = `Corrija os dados da venda do cliente -> ${sale.student.email}`;
              }
            } else {
              actionMessage = `Corrija os dados da venda do cliente -> ${sale.student.email}`;
            }

            const notify = await Integration_notifications.findOne({
              where: {
                id_sale: sale.id
              }
            })

            if (!notify) {
              await Integration_notifications.create({
                id_user: sale.id_user,
                id_type: BLING_NOTIFY_TYPE,
                id_sale: sale.id,
                read: false,
                done: false,
                params: {
                  message: notificationMessage,
                  action: actionMessage
                }
              })
            } else {
              await Integration_notifications.update({
                id_type: BLING_NOTIFY_TYPE,
                done: false,
                params: {
                  message: notificationMessage,
                  action: actionMessage
                }
              }, {
                where: {
                  id_sale: sale.id
                }
              })
            }
          }
          if (error?.response?.data?.error?.type === 'VALIDATION_ERROR' &&
            error?.response?.data?.error?.message === 'Não foi possível salvar a venda') {
            const notificationMessage = error.response.data.error.fields[0].msg
            const actionMessage = "Verifique informações da venda como SKU (oferta ou produto) ou outras informações"
            console.log('gerando notificação', notificationMessage, actionMessage)
            const notify = await Integration_notifications.findOne({
              where: {
                id_sale: sale.id
              }
            })
            if (!notify) {
              await Integration_notifications.create({
                id_user: sale.id_user,
                id_type: BLING_NOTIFY_TYPE,
                id_sale: sale.id,
                read: false,
                done: false,
                params: {
                  message: notificationMessage,
                  action: actionMessage
                }
              })
            } else {
              await Integration_notifications.update({
                id_type: BLING_NOTIFY_TYPE,
                read: false,
                done: false,
                params: {
                  message: notificationMessage,
                  action: actionMessage
                }
              }, {
                where: {
                  id_sale: sale.id
                }
              })
            }
          }
        } catch (error) {
          console.log("error on create notification", error)
        }


        if (error?.response?.data?.error?.type === 'TOO_MANY_REQUESTS') {
          console.log('REPROCESSANDO PEDIDO TOO_MANY_REQUESTS');
          throw error;
        }
        try {
          const erroString =
            typeof error.response?.data === 'string'
              ? error.response.data
              : JSON.stringify(error.response?.data);
          await Bling_errors.create({
            id_sale: this.#saleId,
            reason: erroString,
            id_user,
          });
          await sendTelegramMessage(`${user_email} - ${erroString}`);
        } catch (error) {
          console.log('error on create log', error);
        }

        if (error?.response?.data?.error?.type === 'SERVER_ERROR') {
          console.log('REPROCESSANDO PEDIDO SERVER_ERROR');
          throw error;
        }
        if (error?.response?.data?.error?.type === 'invalid_token') {
          console.log('REPROCESSANDO PEDIDO invalid_token');
          throw error;
        }
      }
    }
  }
}
