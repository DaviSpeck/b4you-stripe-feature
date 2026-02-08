const PV = (rate, nper, pmt) => (pmt / rate) * (1 - (1 + rate) ** -nper);
const PMT = (ir, np, pv, fv, type) => {
  /*
   * ir   - interest rate per month
   * np   - number of periods (months)
   * pv   - present value
   * fv   - future value
   * type - when the payments are due:
   *        0: end of the period, e.g. end of month (default)
   *        1: beginning of period
   */
  let pmt;
  let pvif;
  /* eslint-disable-next-line */
  fv || (fv = 0);
  /* eslint-disable-next-line */
  type || (type = 0);

  if (ir === 0) return -(pv + fv) / np;
  /* eslint-disable-next-line */
  pvif = Math.pow(1 + ir, np);
  pmt = (-ir * (pv * pvif + fv)) / (pvif - 1);

  if (type === 1) pmt /= 1 + ir;

  return pmt;
};

const ROUND_CEIL = (number, decimal_places) =>
  Math.ceil((number + Number.EPSILON) * (10 * decimal_places)) / (10 * decimal_places);

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
      fee_fixed_method, // taxa da six do meio de pagamento (fixa)
      fee_variable_method, // taxa da six do meio de pagamento (percentual)
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
  }) {
    this.psp_cost_variable_percentage = psp_variable_cost; // custo % do PSP
    this.psp_cost_fixed_amount = psp_fixed_cost; // custo fixo do PSP
    this.fee_fixed_method = fee_fixed_method;
    this.fee_variable_method = brand
      ? fee_variable_method.monthly_installment_interest
      : fee_variable_method;
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
  }

  sale() {
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
    const discount_percentage = this.discount;
    const discount_decimal = discount_percentage / 100;
    const discount_coupon_decimal = this.coupon_discount / 100;

    // eslint-disable-next-line prefer-const
    let [sale_base_price, subscription_fee_sum, discount_amount] = this.sales_items.reduce(
      (acc, { price: sale_price, subscription_fee = 0, shipping_price = 0, type }) => {
        const totalPrice = sale_price + subscription_fee + shipping_price;
        acc[0] += totalPrice;
        acc[1] += subscription_fee;
        acc[2] +=
          totalPrice * (type === 1 ? discount_decimal + discount_coupon_decimal : discount_decimal);
        return acc;
      },
      [0, 0, 0]
    );

    // const discount_amount = sale_base_price * discount_decimal;

    const discount_subscription_fee = subscription_fee_sum * discount_decimal;

    const subscription_fee_with_discount = subscription_fee_sum - discount_subscription_fee;

    const original_price = sale_base_price;

    sale_base_price -= discount_amount;

    if (this.student_pays_interest) {
      // caso é a prazo
      /**
       * Calculo do juros de parcelamento, é utilizado ROUND_CEIL, pra ganhar mais dinheiro
       */

      if (this.installments === 1) {
        sale_total_price = sale_base_price;
      } else {
        const pmt = PMT(this.fee_variable_method / 100, this.installments, sale_base_price);

        interest_installment_amount = ROUND_CEIL(
          Math.abs(pmt) * this.installments - sale_base_price,
          2
        ); // juros de parcelamento
        interest_installment_percentage = (interest_installment_amount / sale_base_price) * 100; // percentual dos juros de parcelamento

        sale_total_price = sale_base_price + interest_installment_amount; // preco total = soma dos preços de produto + juros de parcelamento;
      }
    } else {
      sale_total_price = sale_base_price;
    }

    psp_cost_variable_amount = sale_total_price * (this.psp_cost_variable_percentage / 100); // calculo do custo variável do PSP

    // custo total do PSP
    psp_cost_total = psp_cost_variable_amount + this.psp_cost_fixed_amount;

    // transação de custo
    transactions.push({
      withdrawal_amount: 0,
      withdrawal_total: 0,
      price_product: sale_total_price,
      price_total: sale_total_price,
      price_base: sale_total_price,
      psp_cost_variable_percentage: this.psp_cost_variable_percentage,
      psp_cost_variable_amount,
      psp_cost_fixed_amount: this.psp_cost_fixed_amount,
      psp_cost_total,
      revenue: sale_total_price - psp_cost_total,
      interest_installment_percentage: 0,
      interest_installment_amount: 0,
      fee_variable_percentage: 0,
      fee_variable_percentage_amount: 0,
      fee_fixed_amount: 0,
      fee_total: 0,
      user_gross_amount: 0,
      user_net_amount: 0,
      company_gross_profit_amount: 0,
      tax_fee_percentage: 0,
      tax_fee_total: 0,
      tax_interest_percentage: 0,
      tax_interest_total: 0,
      tax_total: 0,
      company_net_profit_amount: 0,
      spread_over_price_product: 0,
      spread_over_price_total: 0,
      installments: this.installments,
      monthly_installment_interest: this.brand ? this.fee_variable_method : 0,
      card_brand: this.brand,
      type: 7,
      discount_amount,
      discount_percentage,
      original_price,
      subscription_fee: subscription_fee_with_discount,
      split_price: 0,
    });

    for (const { price, type, subscription_fee = 0, shipping_price = 0 } of this.sales_items) {
      const discount_amount_sale_item =
        price * (type === 1 ? discount_decimal + discount_coupon_decimal : discount_decimal);
      const original_price_sale_item = price + subscription_fee + shipping_price;
      const discount_subscription_fee_sale_item = subscription_fee * discount_decimal;
      const subscription_fee_with_discount_sale_item =
        subscription_fee - discount_subscription_fee_sale_item;
      price_base = original_price_sale_item - discount_amount_sale_item - discount_subscription_fee;
      if (this.student_pays_interest) {
        // Caso o estudante paga, price_base é igual o valor do produto
        // caso for a vista, o preço total é o mesmo do produto
        if (this.installments === 1) {
          // caso seja a vista
          price_total = price_base;
        } else {
          // caso é a prazo
          /**
           * Calculo do juros de parcelamento, é utilizado ROUND_CEIL, pra ganhar mais dinheiro
           */
          const pmt = PMT(this.fee_variable_method / 100, this.installments, price_base);

          interest_installment_amount = ROUND_CEIL(
            Math.abs(pmt) * this.installments - price_base,
            2
          ); // juros de parcelamento
          interest_installment_percentage = (interest_installment_amount / price_base) * 100; // percentual dos juros de parcelamento
          price_total = price_base + interest_installment_amount;
        }
      } else {
        // produtor paga
        price_total = price_base;
        if (this.installments === 1) {
          // caso é a vista
        } else {
          // caso é a prazo
          /**
           * Calculo do juros de parcelamento, é utilizado ROUND_CEIL, pra ganhar mais dinheiro
           */
          interest_installment_amount = ROUND_CEIL(
            price_base -
              PV(this.fee_variable_method / 100, this.installments, price_base / this.installments),
            2
          );
          interest_installment_percentage = (interest_installment_amount / price_base) * 100;
          price_base -= interest_installment_amount;
        }
      }

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
        withdrawal_amount: 0,
        withdrawal_total: 0,
        price_product: price,
        price_total,
        price_base,
        psp_cost_variable_percentage: 0,
        psp_cost_variable_amount: 0,
        psp_cost_fixed_amount: 0,
        psp_cost_total: 0,
        revenue,
        interest_installment_percentage,
        interest_installment_amount,
        fee_variable_percentage: this.fee_variable_percentage_service,
        fee_variable_percentage_amount,
        fee_fixed_amount: this.fee_fixed_amount_service,
        fee_total,
        user_gross_amount,
        user_net_amount,
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
        card_brand: this.brand,
        type,
        discount_amount: discount_amount_sale_item,
        discount_percentage: discount_percentage + (type === 1 ? this.coupon_discount : 0),
        original_price: original_price_sale_item,
        subscription_fee: subscription_fee_with_discount_sale_item,
        split_price,
        shipping_price,
      });
    }

    return transactions;
  }
}
