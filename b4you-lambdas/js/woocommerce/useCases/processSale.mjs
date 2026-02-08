import { Op } from 'sequelize';
import { Sales } from '../database/models/Sales.mjs';
import { Coupons } from '../database/models/Coupons.mjs';
import { Coupons_sales } from '../database/models/Coupons_sales.mjs';
import { Plugins } from '../database/models/Plugins.mjs';
import { findIntegrationTypeByKey } from '../types/integrationTypes.mjs';
import { WoocommerceService } from '../services/Woocommerce.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { Sales_items_plugins } from '../database/models/Sales_items_plugins.mjs';

const splitFullName = (name) => ({
    firstName: name.split(' ')[0],
    lastName: name.substring(name.split(' ')[0].length).trim(),
});

const capitalizeName = (name) => {
    if (!name) return '';
    name = name
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

    const PreposM = ['Da', 'De', 'Do', 'Das', 'Dos', 'A', 'E'];
    const prepos = ['da', 'de', 'do', 'das', 'dos', 'a', 'e'];

    for (let i = PreposM.length - 1; i >= 0; i -= 1) {
        name = name.replace(
            RegExp(
                `\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`,
                'g'
            ),
            prepos[i]
        );
    }

    return name;
};

const prepareOrder = (sale, offers, coupon_data) => {
    const { firstName, lastName } = splitFullName(sale.full_name);
    const shipping_lines_title = 'Frete';
    const order = {
        payment_method:
            sale.sales_items[0].payment_method === 'card' ? 'credit_card' : 'pix',
        payment_method_title:
            sale.sales_items[0].payment_method === 'card' ? 'credit_card' : 'pix',
        set_paid: true,
        billing: {
            first_name: capitalizeName(firstName),
            last_name: capitalizeName(lastName),
            address_1: sale.address.street,
            city: sale.address.city,
            state: sale.address.state,
            postcode: sale.address.zipcode,
            country: 'BR',
            email: sale.email,
            phone: sale.whatsapp,
            billing_cpf: sale.document_number,
            billing_street: sale.address.street,
            billing_number: sale.address.number,
            billing_complement: sale.address.neighborhood,
        },
        shipping: {
            first_name: capitalizeName(firstName),
            last_name: capitalizeName(lastName),
            address_1: sale.address.street,
            address_2: sale.address.neighborhood || '',
            city: sale.address.city,
            state: sale.address.state,
            postcode: sale.address.zipcode,
            country: 'BR',
            billing_street: sale.address.street,
            billing_number: sale.address.number,
            billing_complement: sale.address.neighborhood,
        },
        line_items: offers.flatMap((offer) =>
            (offer.metadata?.line_items || []).map((li) => ({
                product_id: parseInt(li.variant_id, 10),
                quantity: li.quantity,
                name: li.title,
                subtotal: Number(li.price).toFixed(2),
                total: (Number(li.price) * Number(li.quantity)).toFixed(2),
            }))
        ),
        shipping_lines: [
            {
                method_id: 'flat_rate',
                method_title: sale.sales_items[0].integration_shipping_company
                    ? sale.sales_items[0].integration_shipping_company
                    : shipping_lines_title,
                total: sale.sales_items[0].shipping_price.toFixed(2),
            },
        ],
        customer_note: coupon_data?.code
            ? `CUPOM UTILIZADO -> "${coupon_data.code}" E VALOR DO DESCONTO APLICADO "R$ ${coupon_data.amount}"`
            : 'Nenhum cupom utilizado nesta compra',
        meta_data: [
            {
                key: '_billing_cpf',
                value: sale.document_number,
            },
            {
                key: '_billing_complement',
                value: sale.address.neighborhood,
            },
            {
                key: '_billing_number',
                value: sale.address.number,
            },
            {
                key: '_billing_neighborhood',
                value: sale.address.neighborhood,
            },
        ],
    };

    return order;
};

export class Woocommerce {
    #saleId;
    #isUpsell;
    #isSubscription;
    #idSaleItem;
    #saleItemId;

    constructor({
        sale_id,
        is_upsell,
        is_subscription = false,
        id_sale_item = null,
        sale_item_id,
    }) {
        this.#saleId = sale_id;
        this.#isUpsell = is_upsell;
        this.#isSubscription = is_subscription;
        this.#idSaleItem = id_sale_item;
        this.#saleItemId = sale_item_id;
    }

    async execute() {
        const sale = await Sales.findOne({
            raw: true,
            attributes: ['id', 'id_user'],
            where: { id: this.#saleId },
        });

        if (!sale) {
            console.log(`SALE_ID:${this.#saleId} -> Venda não encontrada`);
            return;
        }

        const salePlugin = await Sales_items_plugins.findOne({
            where: {
                id_sale_item: this.#saleItemId,
                id_order_woocommerce: {
                    [Op.ne]: null,
                },
            },
        });

        if (salePlugin) {
            console.log(`SALE_ID:${this.#saleId} -> Venda já enviada a woocommerce, finalizando execucao`);
            return;
        }

        console.log(
            `SALE_ID:${this.#saleId
            } -> Sale found, trying to get user plugin woocommerce`
        );

        const plugin = await Plugins.findOne({
            where: {
                id_user: sale.id_user,
                id_plugin: findIntegrationTypeByKey('woocommerce').id,
                active: true,
            },
        });
        if (!plugin) {
            console.log(
                `SALE_ID:${this.#saleId
                } -> Plugin not found fot this user on woocommerce`
            );
            return;
        }
        console.log(
            `SALE_ID:${this.#saleId} -> Plugin found, trying to get complete sale`
        );

        const finalSale = await Sales.findOne({
            where: {
                id: sale.id,
                '$sales_items.id_status$': findSalesStatusByKey('paid').id,
            },
            include: [
                {
                    association: 'sales_items',
                    where: {
                        id: this.#saleItemId,
                    },
                    attributes: [
                        'payment_method',
                        'integration_shipping_company',
                        'shipping_price',
                        'discount_amount',
                    ],
                    include: [
                        {
                            association: 'offer',
                            paranoid: false,
                            attributes: ['uuid', 'id', 'name', 'metadata'],
                        },
                    ],
                },
            ],
        });

        if (!finalSale) {
            console.log(
                `SALE_ID:${this.#saleId
                } -> Sale doesnt have all attributes to send to woocommerce`
            );
            return;
        }

        const offersWithMetadata = finalSale.sales_items
            .filter((item) => item.offer && item.offer.metadata)
            .map((item) => ({
                id: item.offer.id,
                uuid: item.offer.uuid,
                name: item.offer.name,
                metadata: item.offer.metadata,
            }));

        if (offersWithMetadata.length === 0) {
            console.log(
                `SALE_ID:${this.#saleId
                } -> Sale offers doesnt have all attributes to send to woocommerce (metadata)`
            );
            return false;
        }

        let coupon_data = {
            amount:
                finalSale?.sales_items?.length > 0 &&
                    finalSale.sales_items[0]?.discount_amount != null
                    ? `${finalSale.sales_items[0].discount_amount.toFixed(2)}`
                    : '0.00',
            code: null,
        };

        const couponSale = await Coupons_sales.findOne({
            where: {
                id_sale: this.#saleId,
            },
        });

        if (couponSale) {
            const coupon = await Coupons.findOne({
                where: {
                    id: couponSale.id_coupon,
                },
            });
            if (coupon) {
                coupon_data.code = coupon.coupon;
            }
        }
        const order = prepareOrder(finalSale, offersWithMetadata, coupon_data);
        console.log(`SALE_ID: ${this.#saleId}: ORDER-> ${JSON.stringify(order)}`);
        const data = await new WoocommerceService({
            consumer_key: plugin.settings.consumer_key,
            consumer_secret: plugin.settings.consumer_secret,
            url: plugin.settings.url,
        }).sendOrder(order);
        console.log(`${this.#saleId}: RETURN DATA-> ${JSON.stringify(data)}`);
        if (data?.id) {
            await Sales_items_plugins.create({
                id_order_woocommerce: data.id,
                id_sale_item: this.#saleItemId,
                body: order,
                response: data,
            });
        }
        return data;
    }
}
