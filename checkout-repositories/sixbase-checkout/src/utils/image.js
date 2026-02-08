const normalizeBase64 = (rawValue) => {
  const compact = rawValue.replace(/\s+/g, '');
  if (!compact) {
    return '';
  }

  const base64Url = compact.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64Url.length % 4;
  const padded =
    padding === 0 ? base64Url : `${base64Url}${'='.repeat(4 - padding)}`;

  return padded;
};

export const resolveImageSrc = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('data:image')) {
    return trimmed;
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const normalized = normalizeBase64(trimmed);
  const isProbablyBase64 = /^[A-Za-z0-9+/=]+$/.test(normalized);

  if (normalized && isProbablyBase64) {
    return `data:image/png;base64,${normalized}`;
  }

  return '';
};

export const resolveFirstImageSrc = (...values) =>
  values.reduce((acc, candidate) => acc || resolveImageSrc(candidate), '');
