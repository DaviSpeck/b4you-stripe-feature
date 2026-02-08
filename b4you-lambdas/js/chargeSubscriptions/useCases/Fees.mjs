import { PV, PMT, ROUND_CEIL } from '../utils/math.mjs';

const calculateSplitPrice = ({
  price,
  original_price,
  discount_amount,
  student_pays_interest,
  interest_installment_amount,
}) => {
  if (price === 0) return 0;
  let split_price = original_price - discount_amount;
  if (!student_pays_interest) {
    split_price -= interest_installment_amount;
  }
  return split_price;
};

export class Fees {
  constructor({
    fees: { psp_fixed_cost, psp_variable_cost }, // custo fixo e variável do PSP
    settings: {
      fee_variable_percentage_service, // tarifa de serviço percentual
      fee_fixed_amount_service, // tarifa de serviço fixa
    },
    taxes: { tax_variable_percentage },
    price,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount = 0,
    coupon_discount = 0,
    coupon = null,
    monthly_installment_interest,
  }) {
    this.psp_cost_variable_percentage = psp_variable_cost; // custo % do PSP
    this.psp_cost_fixed_amount = psp_fixed_cost; // custo fixo do PSP
    this.fee_variable_method = monthly_installment_interest;
    this.fee_variable_percentage_service = fee_variable_percentage_service; // tarifa variavel
    this.fee_fixed_amount_service = fee_fixed_amount_service; // tarifa fixa
    this.tax_fee_percentage = tax_variable_percentage; // % de imposto sobre tarifa
    this.tax_interest_percentage = tax_variable_percentage; // % de imposto sobre juros
    this.price_product = price; // preço do produto
    this.student_pays_interest = student_pays_interest;
    this.installments = installments; // parcelas
    this.brand = brand; // bandeira do cartão
    this.sales_items = sales_items; // itens de venda - array de objetos { price, type, subscription_fee, shipping_price }
    this.discount = discount;
    this.coupon_discount = coupon_discount;
    this.coupon = coupon;
  }

  async sale() {
    const transactions = [];
    let price_total = 0;
    let split_price = 0;
    let price_base = 0;
    let interest_installment_amount = 0; // total de juros do parcelamento
    let interest_installment_percentage = 0; // percentual de juros de parcelamento
    let fee_variable_percentage_amount = 0; // valor da tarifa de serviço
    let fee_total = 0;
    let revenue = 0;
    let user_gross_amount = 0;
    let user_net_amount = 0;
    let company_gross_profit_amount = 0;
    let tax_fee_total = 0;
    let tax_interest_total = 0;
    let tax_total = 0;
    let company_net_profit_amount = 0;
    let spread_over_price_product = 0;
    let spread_over_price_total = 0;
    let psp_cost_variable_amount = 0;
    let psp_cost_total = 0;
    let sale_total_price = 0;
    const discount_percentage = this.discount ?? 0;
    const discount_decimal = discount_percentage / 100;
    let discount_coupon_decimal = 0; // fixed amount per item (from coupon.amount split across items)
    // eslint-disable-next-line prefer-const
    let subscription_fee_sum = this.sales_items.reduce((acc, { subscription_fee = 0 }) => {
      acc += subscription_fee;
      return acc;
    }, 0);

    // Coupon application setup (no validation): compute fixed amount split per item and allow free_shipping
    if (this.coupon) {
      if (Number(this.coupon.amount || 0) > 0) {
        discount_coupon_decimal = Number(this.coupon.amount) / (this.sales_items.length || 1);
      }
      if (this.coupon.free_shipping) {
        this.sales_items = this.sales_items.map((s) => ({ ...s, shipping_price: 0 }));
      }
    }

    const discount_subscription_fee = subscription_fee_sum * discount_decimal;

    for (const { price, type, subscription_fee = 0, shipping_price = 0 } of this.sales_items) {
      // percentage coupon over item price or subscription_fee when price is zero
      let discount_coupon_percentage_decimal = 0;
      if (this.coupon && Number(this.coupon.percentage || 0) > 0) {
        if (price === 0 && subscription_fee) {
          discount_coupon_percentage_decimal =
            (Number(this.coupon.percentage) / 100) * subscription_fee;
        } else {
          discount_coupon_percentage_decimal = (Number(this.coupon.percentage) / 100) * price;
        }
      }
      const discount_amount_sale_item =
        discount_decimal * price + discount_coupon_decimal + discount_coupon_percentage_decimal;
      const original_price_sale_item = price + subscription_fee + shipping_price;
      let discount_coupon_subscription_fee = 0;
      if (this.coupon) {
        if (Number(this.coupon.percentage || 0) > 0) {
          discount_coupon_subscription_fee =
            subscription_fee * (Number(this.coupon.percentage) / 100);
        } else if (Number(this.coupon.amount || 0) > 0) {
          discount_coupon_subscription_fee = subscription_fee - Number(this.coupon.amount);
        }
      }
      const discount_subscription_fee_sale_item =
        subscription_fee * discount_decimal + discount_coupon_subscription_fee;
      const subscription_fee_with_discount_sale_item =
        subscription_fee - discount_subscription_fee_sale_item;
      price_base = original_price_sale_item - discount_amount_sale_item - discount_subscription_fee;
      // caso for a vista, o preço total é o mesmo do produto
      price_total = Number(Number(price_base).toFixed(2));
      if (this.student_pays_interest && this.installments > 1) {
        // caso é a prazo
        /**
         * Calculo do juros de parcelamento, é utilizado ROUND_CEIL, pra ganhar mais dinheiro
         */

        let pmt = PMT(this.fee_variable_method / 100, this.installments, price_base);

        pmt = Number(Math.abs(pmt).toFixed(2));

        // juros de parcelamento
        interest_installment_amount = Number(
          Number((pmt * this.installments - price_base).toFixed(2))
        );
        price_total = Number(Number(price_base + interest_installment_amount).toFixed(2));
      } else if (this.installments > 1) {
        // caso é a prazo
        /**
         * Calculo do juros de parcelamento, é utilizado ROUND_CEIL, pra ganhar mais dinheiro
         */
        interest_installment_amount = ROUND_CEIL(
          price_base -
            PV(this.fee_variable_method / 100, this.installments, price_base / this.installments),
          2
        );
        price_base -= interest_installment_amount;
      }

      interest_installment_percentage = (interest_installment_amount / price_base) * 100; // percentual dos juros de parcelamento

      // tarifa percentual
      fee_variable_percentage_amount = price_base * (this.fee_variable_percentage_service / 100);
      // tarifa total
      fee_total = this.fee_fixed_amount_service + fee_variable_percentage_amount;
      // bruto do produtor
      user_gross_amount = price_base;
      // Money On Hands
      if (type === 1) {
        revenue = price_total - psp_cost_total;
      } else {
        revenue = price_total;
      }
      // liquido do produtor
      user_net_amount = user_gross_amount - fee_total;
      // Lucro bruto
      company_gross_profit_amount = revenue - user_net_amount;
      // imposto sobre tarifa
      tax_fee_total = fee_total * (this.tax_fee_percentage / 100);
      // imposto sobre juros de parcelamento
      tax_interest_total = interest_installment_amount * (this.tax_interest_percentage / 100);
      // imposto total
      tax_total = tax_fee_total + tax_interest_total;
      // lucro liquido
      company_net_profit_amount = company_gross_profit_amount - tax_total;
      // spread sobre o preço do produto
      spread_over_price_product = (company_net_profit_amount / original_price_sale_item) * 100;
      // spread sobre o preço total (preço pago)
      spread_over_price_total = (company_net_profit_amount / price_total) * 100;
      split_price = calculateSplitPrice({
        discount_amount: discount_amount_sale_item,
        interest_installment_amount,
        original_price: original_price_sale_item,
        price,
        student_pays_interest: this.student_pays_interest,
      });
      transactions.push({
        price_product: price || subscription_fee,
        price_total,
        price_base,
        revenue,
        interest_installment_percentage,
        interest_installment_amount,
        fee_variable_percentage: this.fee_variable_percentage_service,
        fee_variable_amount: fee_variable_percentage_amount,
        fee_fixed: this.fee_fixed_amount_service,
        fee_total,
        company_gross_profit_amount,
        tax_fee_percentage: this.tax_fee_percentage,
        tax_fee_total,
        tax_interest_percentage: this.tax_interest_percentage,
        tax_interest_total,
        tax_total,
        company_net_profit_amount,
        spread_over_price_product,
        spread_over_price_total,
        installments: this.installments,
        monthly_installment_interest: this.brand ? this.fee_variable_method : 0,
        type,
        discount_amount: discount_amount_sale_item,
        discount_percentage:
          discount_percentage + (type === 1 ? Number(this.coupon?.percentage || 0) : 0),
        original_price: original_price_sale_item,
        subscription_fee: subscription_fee_with_discount_sale_item,
        split_price,
        shipping_price,
        customer_paid_interest: this.student_pays_interest,
      });
    }
    sale_total_price = transactions.reduce((acc, { price_total: pr }) => {
      acc += pr;
      return acc;
    }, 0);

    const subscription_fee_with_discount = subscription_fee_sum - discount_subscription_fee;

    const original_price = transactions.reduce((acc, { price_product }) => {
      acc += price_product;
      return acc;
    }, 0);

    psp_cost_variable_amount = sale_total_price * (this.psp_cost_variable_percentage / 100); // calculo do custo variável do PSP

    // custo total do PSP
    psp_cost_total = psp_cost_variable_amount + this.psp_cost_fixed_amount;

    const discount_amount = transactions.reduce((acc, { discount_amount: da }) => {
      acc += da;
      return acc;
    }, 0);

    const interest_installment_percentage_total = transactions.reduce(
      (acc, { interest_installment_percentage: i }) => {
        acc += i;
        return acc;
      },
      0
    );

    const interest_installment_amount_total = transactions.reduce(
      (acc, { interest_installment_amount: i }) => {
        acc += i;
        return acc;
      },
      0
    );

    // transação de custo
    const costTransaction = {
      price: sale_total_price,
      psp_cost_variable_percentage: this.psp_cost_variable_percentage,
      psp_cost_variable_amount,
      psp_cost_fixed_amount: this.psp_cost_fixed_amount,
      psp_cost_total,
      revenue: sale_total_price - psp_cost_total,
      interest_installment_percentage: interest_installment_percentage_total / transactions.length,
      interest_installment_amount: interest_installment_amount_total / transactions.length,
      tax_interest_percentage: this.tax_interest_percentage,
      tax_interest_total:
        (interest_installment_amount_total / transactions.length) *
        (this.tax_interest_percentage / 100),
      installments: this.installments,
      monthly_installment_interest: this.brand ? this.fee_variable_method : 0,
      discount_amount,
      discount_percentage,
      original_price,
      subscription_fee: subscription_fee_with_discount,
    };

    return [costTransaction, ...transactions];
  }
}
