/**
 *
 * @param {number} rate installment interest rate
 * @param {number} nper number of installments
 * @param {number} pmt amount of a installment (total/nper)
 * @returns
 */
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

const ROUND_FLOOR = (number, decimal_places) =>
  Math.floor((number + Number.EPSILON) * (10 * decimal_places)) /
  (10 * decimal_places);

const ROUND_CEIL = (number, decimal_places) =>
  Math.ceil((number + Number.EPSILON) * (10 * decimal_places)) /
  (10 * decimal_places);

module.exports = {
  PV,
  PMT,
  ROUND_FLOOR,
  ROUND_CEIL,
};
