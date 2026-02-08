function paymentOfferData(params) {
  const {
    price,
    discount_card,
    discount_billet,
    discount_pix,
    installments,
    payment_methods,
    student_pays_interest,
    installmentFee,
  } = params;

  const prices = {
    // eslint-disable-next-line no-extra-boolean-cast
    pix: Boolean(discount_pix) ? price * (1 - discount_pix / 100) : price,
    // eslint-disable-next-line no-extra-boolean-cast
    billet: Boolean(discount_billet)
      ? price * (1 - discount_billet / 100)
      : price,
    // eslint-disable-next-line no-extra-boolean-cast
    credit_card: Boolean(discount_card)
      ? price * (1 - discount_card / 100)
      : price,
  };

  const paymentMethods = payment_methods.split(',');

  const monthlyRate = installmentFee / 100;

  let mainPaymentMethod = null;

  if (paymentMethods.includes('credit_card')) {
    mainPaymentMethod = 'credit_card';
  } else if (
    !paymentMethods.includes('credit_card') &&
    paymentMethods.includes('pix')
  ) {
    mainPaymentMethod = 'pix';
  } else {
    mainPaymentMethod = 'billet';
  }

  const installmentArr = Array.from({ length: installments }, (_, index) => {
    const power = (1 + monthlyRate) ** (index + 1);

    const coefficient = (monthlyRate * power) / (power - 1);
    const installmentValue = prices[mainPaymentMethod] * coefficient;

    // eslint-disable-next-line no-extra-boolean-cast
    if (!Boolean(student_pays_interest)) {
      return {
        parcel: index + 1,
        value: parseFloat((prices[mainPaymentMethod] / (index + 1)).toFixed(2)),
      };
    }

    return {
      parcel: index + 1,
      value: parseFloat(
        index + 1 === 1
          ? prices[mainPaymentMethod]?.toFixed(2)
          : installmentValue?.toFixed(2),
      ),
    };
  });

  return {
    originalPrice: prices[mainPaymentMethod],
    mainPaymentMethod,
    maxInstallment: installmentArr[installmentArr.length - 1] ?? null,
  };
}

module.exports = { paymentOfferData };
