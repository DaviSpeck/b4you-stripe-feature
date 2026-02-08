const { capitalizeName } = require('../../utils/formatters');
const { findAffiliateStatus } = require('../../status/affiliateStatus');

const normalizeInstagram = (instagram) => {
  if (!instagram) return { username: null, link: null };
  const raw = String(instagram).trim();
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/.*/, '')
    .replace(/^@/, '')
    .trim();
  if (!cleaned) return { username: null, link: null };
  return {
    username: `@${cleaned}`,
    link: `https://instagram.com/${cleaned}`,
  };
};

const normalizeTikTok = (tiktok) => {
  if (!tiktok) return { username: null, link: null };
  const raw = String(tiktok).trim();
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?tiktok\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .trim();
  if (!cleaned) return { username: null, link: null };
  return {
    username: `@${cleaned}`,
    link: `https://www.tiktok.com/@${cleaned}`,
  };
};

const serializeAffiliate = (affiliate) => {
  const {
    uuid,
    commission,
    status,
    created_at,
    product: { name, uuid: uuid_product },
    user: { full_name, email, whatsapp, instagram, tiktok },
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
    allow_access,
  } = affiliate;

  const normalizedInstagram = normalizeInstagram(instagram);
  const normalizedTikTok = normalizeTikTok(tiktok);

  return {
    uuid,
    commission,
    subscription_fee,
    subscription_fee_only,
    subscription_fee_commission,
    commission_all_charges,
    status: findAffiliateStatus(status),
    allow_access,
    product: {
      uuid: uuid_product,
      name,
    },
    user: capitalizeName(full_name),
    email,
    whatsapp,
    instagram: normalizedInstagram.username,
    instagram_link: normalizedInstagram.link,
    tiktok: normalizedTikTok.username,
    tiktok_link: normalizedTikTok.link,
    date: created_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeAffiliate);
    }
    return serializeAffiliate(this.data);
  }
};
