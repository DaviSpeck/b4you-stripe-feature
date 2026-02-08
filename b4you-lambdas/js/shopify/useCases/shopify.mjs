import { Sales } from '../database/models/Sales.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { Sales_items_plugins } from '../database/models/Sales_items_plugins.mjs';
import Shopify from 'shopify-api-node';
import { Coupons_sales } from '../database/models/Coupons_sales.mjs';
import { Coupons } from '../database/models/Coupons.mjs';
import { capitalizeName, splitFullName } from '../utils/formatters.mjs';
import { Charges } from '../database/models/Charges.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import * as Sequelize from 'sequelize';
import { verifyRegionByZipcode } from '../utils/verifyRegionByZipcode.mjs';


export class ShopifyUseCase {
    #saleId;
    #status;
    #id_sale_item;

    constructor({ sale_id, status, id_sale_item }) {
        this.#saleId = sale_id;
        this.#status = status
        this.#id_sale_item = id_sale_item
    }

    async #validSale() {
        if (this.#status === "refunded" && this.#id_sale_item) {
            try {
                const saleItemPlugin = await Sales_items_plugins.findOne({
                    raw: true,
                    where: {
                        id_sale_item: this.#id_sale_item,
                        id_shopify: { [Sequelize.Op.ne]: null }
                    },
                    attributes: ['id_shopify', 'id_sale_item'],
                });

                if (!saleItemPlugin || !saleItemPlugin.id_shopify) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Sale item plugin not found or id_shopify missing`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                        id_shopify: null,
                    };
                }

                const saleItem = await Sales_items.findOne({
                    raw: true,
                    attributes: ['id_sale'],
                    where: { id: this.#id_sale_item },
                });

                if (!saleItem) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Sale item not found`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                        id_shopify: null,
                    };
                }

                const sale = await Sales.findOne({
                    raw: true,
                    attributes: ['id', 'id_user'],
                    where: { id: saleItem.id_sale },
                });

                if (!sale) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Sale not found`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                        id_shopify: null,
                    };
                }

                const plugin = await Plugins.findOne({
                    where: {
                        id_user: sale.id_user,
                        id_plugin: findIntegrationTypeByKey('shopify').id,
                        active: true,
                    },
                    raw: true,
                });

                if (!plugin) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Plugin not found for this user on shopify`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                        id_shopify: null,
                    };
                }

                if (!plugin.settings?.shopName || !plugin.settings?.accessToken) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Plugin missing required settings (shopName or accessToken)`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                        id_shopify: null,
                    };
                }

                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Refund validation successful, id_shopify: ${saleItemPlugin.id_shopify}`
                );

                return {
                    is_valid: true,
                    sale: null,
                    plugin,
                    id_shopify: saleItemPlugin.id_shopify,
                };

            } catch (error) {
                console.error(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Error validating refund:`,
                    error.message
                );
                return {
                    is_valid: false,
                    sale: null,
                    plugin: null,
                    id_shopify: null,
                };
            }
        }

        if (this.#saleId && (this.#status === "paid" || this.#status === "pending")) {
            try {

                const sale = await Sales.findOne({
                    raw: true,
                    attributes: ['id', 'id_user'],
                    where: { id: this.#saleId },
                });

                if (!sale) {
                    console.log(`SALE_ID:${this.#saleId} -> Venda não encontrada`);
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                console.log(
                    `SALE_ID:${this.#saleId} -> Sale found, trying to get user plugin shopify`
                );

                const plugin = await Plugins.findOne({
                    where: {
                        id_user: sale.id_user,
                        id_plugin: findIntegrationTypeByKey('shopify').id,
                        active: true,
                    },
                    raw: true,
                });

                if (!plugin) {
                    console.log(
                        `SALE_ID:${this.#saleId} -> Plugin not found for this user on shopify`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                if (!plugin.settings?.shopName || !plugin.settings?.accessToken) {
                    console.log(
                        `SALE_ID:${this.#saleId} -> Plugin missing required settings (shopName or accessToken)`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                console.log(
                    `SALE_ID:${this.#saleId} -> Plugin found, trying to get complete sale`
                );

                const finalSale = await Sales.findOne({
                    where: {
                        id: sale.id,
                    },
                    include: [
                        {
                            association: 'sales_items',
                            attributes: [
                                'id',
                                'payment_method',
                                'integration_shipping_company',
                                'shipping_price',
                                'discount_amount',
                                "id_product",
                                "price",
                                "quantity"

                            ],
                            include: [
                                {
                                    association: 'offer',
                                    paranoid: false,
                                    attributes: ['uuid', 'id', 'name', 'metadata', 'allow_shipping_region'],
                                },
                                {
                                    association: 'product',
                                    paranoid: false,
                                    attributes: ['id',],
                                },
                            ],
                        },
                    ],
                });

                if (!finalSale) {
                    console.log(
                        `SALE_ID:${this.#saleId} -> Sale doesn't have all attributes to send to shopify`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                if (!finalSale.sales_items || finalSale.sales_items.length === 0) {
                    console.log(
                        `SALE_ID:${this.#saleId} -> Sale has no valid items to process`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                const principalSaleItem = finalSale.sales_items[0];
                const offer = principalSaleItem.offer;
                const offerData = offer?.dataValues || offer;
                const metadata = offerData?.metadata;

                const hasMetadataLineItems =
                    metadata?.line_items &&
                    Array.isArray(metadata.line_items) &&
                    metadata.line_items.length > 0;

                if (!hasMetadataLineItems) {
                    console.log(
                        `SALE_ID:${this.#saleId} -> Offer metadata missing line_items`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }


                const saleData = finalSale.get ? finalSale.get({ plain: true }) : finalSale;

                return {
                    is_valid: true,
                    sale: saleData,
                    plugin,
                    id_shopify: null,
                };


            } catch (error) {
                console.error(
                    `SALE_ID:${this.#saleId} -> Error validating sale:`,
                    error.message
                );
                return {
                    is_valid: false,
                    sale: null,
                    plugin: null,
                };
            }
        }
        if (this.#id_sale_item && (this.#status === "paid" || this.#status === "pending")) {

            try {
                const saleItem = await Sales_items.findOne({
                    raw: true,
                    attributes: ['id', 'id_sale', 'id_status'],
                    where: {
                        id: this.#id_sale_item,

                    },
                });

                if (!saleItem) {
                    console.log(`SALE_ITEM_ID:${this.#id_sale_item} -> Sale item não encontrada`);
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                const sale = await Sales.findOne({
                    raw: true,
                    attributes: ['id', 'id_user'],
                    where: { id: saleItem.id_sale },
                });

                if (!sale) {
                    console.log(`SALE_ITEM_ID:${this.#id_sale_item} -> Venda não encontrada para este item`);
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Sale item found, trying to get user plugin shopify`
                );

                const plugin = await Plugins.findOne({
                    where: {
                        id_user: sale.id_user,
                        id_plugin: findIntegrationTypeByKey('shopify').id,
                        active: true,
                    },
                    raw: true,
                });

                if (!plugin) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Plugin not found for this user on shopify`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                if (!plugin.settings?.shopName || !plugin.settings?.accessToken) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Plugin missing required settings (shopName or accessToken)`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Plugin found, trying to get complete sale item`
                );

                const finalSaleItem = await Sales_items.findOne({
                    where: {
                        id: this.#id_sale_item,
                    },
                    attributes: [
                        'id',
                        'payment_method',
                        'integration_shipping_company',
                        'shipping_price',
                        'discount_amount',
                        'id_product',
                        'price',
                        'quantity'
                    ],
                    include: [
                        {
                            association: 'offer',
                            paranoid: false,
                            attributes: ['uuid', 'id', 'name', 'metadata', 'allow_shipping_region'],
                        },
                        {
                            association: 'product',
                            paranoid: false,
                            attributes: ['id'],
                        },
                    ],
                });

                if (!finalSaleItem) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Sale item doesn't have all attributes to send to shopify`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                const offer = finalSaleItem.offer;
                const offerData = offer?.dataValues || offer;
                const metadata = offerData?.metadata;

                const hasMetadataLineItems =
                    metadata?.line_items &&
                    Array.isArray(metadata.line_items) &&
                    metadata.line_items.length > 0;

                if (!hasMetadataLineItems) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Offer metadata missing line_items`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }

                const finalSale = await Sales.findOne({
                    where: {
                        id: saleItem.id_sale,
                    },
                    attributes: [
                        'id',
                        'id_user',
                        'full_name',
                        'email',
                        'whatsapp',
                        'document_number',
                        'address',
                    ],
                });

                if (!finalSale) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Sale not found for this item`
                    );
                    return {
                        is_valid: false,
                        sale: null,
                        plugin: null,
                    };
                }


                const saleData = finalSale.get ? finalSale.get({ plain: true }) : finalSale;
                const saleItemData = finalSaleItem.get ? finalSaleItem.get({ plain: true }) : finalSaleItem;
                const saleWithItem = {
                    ...saleData,
                    sales_items: [saleItemData],
                };

                return {
                    is_valid: true,
                    sale: saleWithItem,
                    plugin,
                    id_shopify: null,
                };

            } catch (error) {
                console.error(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Error validating sale item:`,
                    error.message
                );
                return {
                    is_valid: false,
                    sale: null,
                    plugin: null,
                };
            }
        }
    }

    async execute() {
        try {
            const validation = await this.#validSale();

            if (!validation.is_valid) {
                return {
                    success: false,
                    order: null,
                    error: 'Sale validation failed',
                };
            }

            const { sale, plugin, id_shopify } = validation;

            if (this.#status === 'refunded' && id_shopify) {
                return await this.#processRefund(plugin, id_shopify);
            }

            if (this.#id_sale_item && this.#status === "paid") {
                const saleItemPlugin = await Sales_items_plugins.findOne({
                    raw: true,
                    where: {
                        id_sale_item: this.#id_sale_item,
                        id_shopify: { [Sequelize.Op.ne]: null }
                    },
                    attributes: ['id_shopify', 'id_sale_item'],
                });
                if (saleItemPlugin) {
                    return await this.#processPixPaid(plugin, saleItemPlugin.id_shopify);
                }
            }

            const shopify = new Shopify({
                shopName: plugin.settings.shopName,
                accessToken: plugin.settings.accessToken,
            });

            const coupon = await Coupons_sales.findOne({
                raw: true,
                where: {
                    id_sale: sale.id,
                },
            });
            let couponDetails = '';
            if (coupon) {
                couponDetails = await Coupons.findOne({
                    raw: true,
                    where: { id: coupon.id_coupon },

                });
            }
            let pix_code = ""

            if (sale.sales_items[0].payment_method === 'pix') {
                const charge = await Charges.findOne({
                    raw: true,
                    attributes: ["pix_code"],
                    where: {
                        id_sale: sale.id
                    }
                })
                pix_code = charge.pix_code
            }


            const orderData = this.#buildOrderData(sale, coupon, couponDetails, pix_code, this.#status);

            if (!orderData) {
                console.log(
                    `SALE_ID:${this.#saleId} -> Failed to build order data`
                );
                return {
                    success: false,
                    order: null,
                    error: 'Failed to build order data',
                };
            }

            console.log(
                `SALE_ID:${this.#saleId} -> Creating order in Shopify:`,
                JSON.stringify(orderData)
            );

            const createdOrder = await shopify.order.create(orderData);

            if (createdOrder?.id) {
                const principalSaleItem = sale.sales_items[0];
                if (principalSaleItem?.id) {
                    await Sales_items_plugins.create({
                        id_sale_item: principalSaleItem.id,
                        id_shopify: createdOrder.id,
                        body: orderData,
                        response: createdOrder,
                    });
                }

                console.log(
                    `SALE_ID:${this.#saleId} -> Order created successfully in Shopify:`,
                    createdOrder.id
                );
            }

            return {
                success: true,
                order: createdOrder,
                error: null,
            };
        } catch (error) {
            console.error(
                `SALE_ID:${this.#saleId} -> Error executing Shopify integration:`,
                error.message,
                error.stack
            );
            return {
                success: false,
                order: null,
                error: error.message || 'Unknown error occurred',
            };
        }
    }

    #buildOrderData(sale, coupon = null, couponDetails = null, pix_code = "", status = "paid") {
        try {
            const { firstName, lastName } = splitFullName(sale.full_name);
            const principalSaleItem = sale.sales_items?.[0];

            if (!principalSaleItem) {
                return null;
            }

            const totalSaleAmount = sale.sales_items.reduce((acc, obj) => acc + obj.price * obj.quantity, 0);



            const itensOrder = sale.sales_items.map((element) => {
                let grams = 1000;
                let width = 0;
                let height = 0;
                let length = 0;

                const offer = element.offer;
                const offerData = offer?.dataValues || offer;
                const metadata = offerData?.metadata;

                if (
                    offer &&
                    metadata &&
                    metadata.dimensions &&
                    Array.isArray(metadata.dimensions) &&
                    metadata.dimensions.length > 0
                ) {
                    const dim = metadata.dimensions[0];
                    grams = dim.weight || grams;
                    width = dim.width || 0;
                    height = dim.height || 0;
                    length = dim.length || 0;
                }

                return {
                    id: element.product.id,
                    title: offerData?.name || element.offer?.name || '',
                    price: element.price,
                    grams,
                    quantity: element.quantity,
                    properties: {
                        width,
                        height,
                        length,
                    },
                };
            });
            let shipping_lines_title = 'Frete';
            if (principalSaleItem.offer.allow_shipping_region === 1) {
                const cepRegion = verifyRegionByZipcode(sale.address.zipcode);
                switch (cepRegion) {
                    case 'NO':
                        shipping_lines_title =
                            principalSaleItem.offer.metadata &&
                                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                                principalSaleItem.offer.metadata.line_items.length > 0 &&
                                principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.NO
                                ? principalSaleItem.offer.metadata.line_items[0].shipping_data.NO
                                : 'Frete';
                        break;
                    case 'NE':
                        shipping_lines_title =
                            principalSaleItem.offer.metadata &&
                                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                                principalSaleItem.offer.metadata.line_items.length > 0 &&
                                principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.NE
                                ? principalSaleItem.offer.metadata.line_items[0].shipping_data.NE
                                : 'Frete';
                        break;
                    case 'CO':
                        shipping_lines_title =
                            principalSaleItem.offer.metadata &&
                                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                                principalSaleItem.offer.metadata.line_items.length > 0 &&
                                principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.CO
                                ? principalSaleItem.offer.metadata.line_items[0].shipping_data.CO
                                : 'Frete';

                        break;
                    case 'SE':
                        shipping_lines_title =
                            principalSaleItem.offer.metadata &&
                                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                                principalSaleItem.offer.metadata.line_items.length > 0 &&
                                principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.SE
                                ? principalSaleItem.offer.metadata.line_items[0].shipping_data.SE
                                : 'Frete';
                        break;
                    case 'SU':
                        shipping_lines_title =
                            principalSaleItem.offer.metadata &&
                                Array.isArray(principalSaleItem.offer.metadata.line_items) &&
                                principalSaleItem.offer.metadata.line_items.length > 0 &&
                                principalSaleItem.offer.metadata.line_items[0]?.shipping_data?.SU
                                ? principalSaleItem.offer.metadata.line_items[0].shipping_data.SU
                                : 'Frete';
                        break;
                    default:
                        break;
                }
            }
            const financialStatus = status === 'pending' ? 'pending' : 'paid';
            const transactionStatus = status === 'pending' ? 'pending' : 'success';
            const isPixPending = status === 'pending' && sale.sales_items[0]?.payment_method === 'pix';

            const orderData = {
                line_items: itensOrder,
                financial_status: financialStatus,
                ...(isPixPending && { payment_gateway_names: ['Pix'] }),
                transactions: [
                    {
                        gateway: 'B4You',
                        gateway_display_name: 'B4You',
                        kind: 'sale',
                        status: transactionStatus,
                        amount: totalSaleAmount,
                    },
                ],
                discount_codes: coupon
                    ? [
                        {
                            code: couponDetails.coupon,
                            amount: principalSaleItem.discount_amount,
                            type: 'fixed_amount',
                        },
                    ]
                    : [],
                discount_application: coupon
                    ? [
                        {
                            discount_applications: {
                                type: 'manual',
                                value: principalSaleItem.discount_amount,
                                value_type: 'fixed_amount',
                                allocation_method: 'across',
                                target_selection: 'all',
                                target_type: 'line_item',
                                code: couponDetails.coupon,
                            },
                        },
                    ]
                    : [],
                localizationExtensions: {
                    nodes: [
                        {
                            countryCode: 'BR',
                            purpose: 'SHIPPING',
                            title: 'CPF/CNPJ',
                            value: sale.document_number,
                        },
                    ],
                },
                email: sale.email,
                total_tax: 0,
                currency: 'BRL',
                shipping_address: {
                    first_name: capitalizeName(firstName),
                    last_name: capitalizeName(lastName),
                    address1: `${sale.address.street}, ${sale.address.number}`,
                    address2: sale.address.complement,
                    phone: sale.whatsapp,
                    city: sale.address.city,
                    company: sale.document_number,
                    province: sale.address.state,
                    country: 'Brazil',
                    country_code: 'BR',
                    zip: sale.address.zipcode,
                },
                billing_address: {
                    first_name: capitalizeName(firstName),
                    last_name: capitalizeName(lastName),
                    address1: `${sale.address.street}, ${sale.address.number}`,
                    address2: sale.address.complement,
                    city: sale.address.city,
                    company: sale.document_number,
                    country: 'Brazil',
                    phone: sale.whatsapp,
                    province: sale.address.state,
                    zip: sale.address.zipcode,
                    country_code: 'BR',
                },
                shipping_lines: [
                    {
                        price: principalSaleItem.shipping_price,
                        title: principalSaleItem.integration_shipping_company
                            ? principalSaleItem.integration_shipping_company
                            : shipping_lines_title,
                        code: 'Standard',
                        source: 'shopify',
                        requested_fulfillment_service_id: null,
                        delivery_category: null,
                        carrier_identifier: null,
                        discounted_price: 0,
                        phone: null,
                    },
                ],
                note_attributes: [
                    {
                        name: 'additional_cpf_cnpj',
                        value: sale.document_number,
                    },
                    {
                        name: 'additional_info_billing_number',
                        value: sale.address.number,
                    },
                    {
                        name: 'additional_info_billing_complement',
                        value: sale.address.complement,
                    },
                    {
                        name: 'payment_status',
                        value: financialStatus,
                    },
                    {
                        name: 'payment_method',
                        value: sale.sales_items[0]?.payment_method || 'pix',
                    },
                    {
                        name: 'additional_info_billing_street',
                        value: sale.address.street,
                    },
                    {
                        name: 'additional_info_pix_code',
                        value: pix_code,
                    },
                ],
            };

            const offer = principalSaleItem?.offer;
            const offerData = offer?.dataValues || offer;
            const metadata = offerData?.metadata;

            if (
                principalSaleItem &&
                offer &&
                metadata &&
                metadata.line_items &&
                Array.isArray(metadata.line_items) &&
                metadata.line_items.length > 0
            ) {

                orderData.line_items = metadata.line_items;

                if (coupon) {
                    orderData.line_items.properties = {
                        Tag: couponDetails.coupon,
                    };
                    orderData.line_items.discount_allocations = [
                        {
                            amount: principalSaleItem.discount_amount,
                            code: couponDetails.coupon,
                            amount_set: {
                                shop_money: {
                                    amount: principalSaleItem.discount_amount,
                                    currency_code: 'BRL',
                                },
                                presentment_money: {
                                    amount: principalSaleItem.discount_amount,
                                    currency_code: 'BRL',
                                },
                            },
                            discount_application_index: 0,
                        },
                    ];
                }


            }
            return orderData

        } catch (error) {
            console.error(
                `SALE_ID:${this.#saleId} -> Error building order data:`,
                error.message
            );
            return null;
        }
    }

    async #processRefund(plugin, id_shopify) {
        try {
            const shopify = new Shopify({
                shopName: plugin.settings.shopName,
                accessToken: plugin.settings.accessToken,
            });

            console.log(
                `SALE_ITEM_ID:${this.#id_sale_item} -> Processing refund for Shopify order: ${id_shopify}`
            );

            const saleItem = await Sales_items.findOne({
                raw: true,
                attributes: ['price', 'quantity', 'id_sale'],
                where: { id: this.#id_sale_item },
            });

            if (!saleItem) {
                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Sale item not found for refund`
                );
                return {
                    success: false,
                    order: null,
                    error: 'Sale item not found for refund',
                };
            }

            const refundAmount = (parseFloat(saleItem.price) * saleItem.quantity).toFixed(2);

            const order = await shopify.order.get(id_shopify);

            if (!order) {
                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Order ${id_shopify} not found in Shopify`
                );
                return {
                    success: false,
                    order: null,
                    error: `Order ${id_shopify} not found in Shopify`,
                };
            }

            const refundData = {
                amount: refundAmount,
                currency: order.currency || 'BRL',
                notify: true,
                note: 'Reembolso processado automaticamente',
            };

            console.log(
                `SALE_ITEM_ID:${this.#id_sale_item} -> Creating refund transaction in Shopify:`,
                JSON.stringify(refundData)
            );

            const refundTransaction = await shopify.transaction.create(id_shopify, {
                kind: 'refund',
                amount: refundAmount,
                currency: order.currency || 'BRL',
                gateway: 'B4You',
                parent_id: order.transactions?.[0]?.id || null,
            });

            console.log(
                `SALE_ITEM_ID:${this.#id_sale_item} -> Refund processed successfully in Shopify:`,
                refundTransaction.id
            );

            return {
                success: true,
                order: { id: id_shopify, refund_transaction: refundTransaction },
                error: null,
            };

        } catch (error) {
            console.error(
                `SALE_ITEM_ID:${this.#id_sale_item} -> Error processing refund in Shopify:`,
                error.message,
                error.stack
            );
            return {
                success: false,
                order: null,
                error: error.message || 'Unknown error occurred during refund',
            };
        }
    }

    async #processPixPaid(plugin, id_shopify) {
        try {
            const shopify = new Shopify({
                shopName: plugin.settings.shopName,
                accessToken: plugin.settings.accessToken,
            });

            console.log(
                `SALE_ITEM_ID:${this.#id_sale_item} -> Processing pix paid for Shopify order: ${id_shopify}`
            );

            const saleItem = await Sales_items.findOne({
                raw: true,
                attributes: ['price', 'quantity', 'id_sale'],
                where: { id: this.#id_sale_item },
            });

            if (!saleItem) {
                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Sale item not found for pix paid`
                );
                return {
                    success: false,
                    order: null,
                    error: 'Sale item not found for pix paid',
                };
            }

            const order = await shopify.order.get(id_shopify);


            if (!order) {
                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Order ${id_shopify} not found in Shopify`
                );
                return {
                    success: false,
                    order: null,
                    error: `Order ${id_shopify} not found in Shopify`,
                };
            }

            const pixAmount = (parseFloat(saleItem.price) * saleItem.quantity).toFixed(2);

            if (order.financial_status === 'paid') {
                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Order ${id_shopify} is already paid`
                );
                return {
                    success: true,
                    order: { id: id_shopify, current_status: order.financial_status },
                    error: null,
                };
            }

            if (order.financial_status === 'pending') {
                const transactions = await shopify.transaction.list(id_shopify);

                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Found ${transactions.length} transactions for order ${id_shopify}`
                );

                const pendingTransaction = transactions.find(
                    (t) => (t.kind === 'authorization' || t.kind === 'sale') && t.status === 'pending'
                );

                if (pendingTransaction) {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Found pending transaction ${pendingTransaction.id}, creating capture transaction`
                    );

                    const data = {
                        kind: "sale",
                        status: "success",
                        amount: pixAmount,
                        source: "external",
                        gateway: "B4You",
                        message: "PIX payment confirmed"

                    }

                    const captureTransaction = await shopify.transaction.create(id_shopify, data);

                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Pix paid processed successfully in Shopify. Capture transaction:`,
                        captureTransaction.id
                    );

                    return {
                        success: true,
                        order: { id: id_shopify, capture_transaction: captureTransaction },
                        error: null,
                    };
                } else {
                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> No pending transaction found, creating sale transaction`
                    );
                    const saleTransaction = await shopify.transaction.create(id_shopify, {
                        kind: 'sale',
                        status: 'success',
                        amount: pixAmount,
                        currency: order.currency || 'BRL',
                        gateway: 'B4You',
                    });

                    console.log(
                        `SALE_ITEM_ID:${this.#id_sale_item} -> Pix paid processed successfully in Shopify. Sale transaction:`,
                        saleTransaction.id
                    );

                    return {
                        success: true,
                        order: { id: id_shopify, sale_transaction: saleTransaction },
                        error: null,
                    };
                }

            } else {
                console.log(
                    `SALE_ITEM_ID:${this.#id_sale_item} -> Order ${id_shopify} has unexpected financial status: ${order.financial_status}`
                );
                return {
                    success: false,
                    order: null,
                    error: `Order has unexpected financial status: ${order.financial_status}`,
                };
            }

        } catch (error) {
            console.log("STATUS:", error.response?.statusCode);
            console.log("BODY:", error.response?.body);
            console.log("HEADERS:", error.response?.headers);
            console.error(
                `SALE_ITEM_ID:${this.#id_sale_item} -> Error processing pix paid in Shopify:`,
                error.message,
                error.stack
            );
            return {
                success: false,
                order: null,
                error: error.message || 'Unknown error occurred during pix paid processing',
            };
        }
    }
}
