import { date } from './date.mjs';

const payment_methods = {
  pix: 'release_pix',
  billet: 'release_billet',
  card: 'release_credit_card',
};

export const resolveReleaseDate = ({ paid_at, payment_method, saleSettings, status }) => {
  if (status !== 2) return null;
  return date(paid_at)
    .add(saleSettings[payment_methods[payment_method]], 'd')
    .subtract(3, 'h')
    .format('YYYY-MM-DD');
};
