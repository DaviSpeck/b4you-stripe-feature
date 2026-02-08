const regexCoupons = (coupon) => {
  const re = /^[A-Za-z-0-9]*$/;
  return re.test(coupon);
};

export default regexCoupons;
