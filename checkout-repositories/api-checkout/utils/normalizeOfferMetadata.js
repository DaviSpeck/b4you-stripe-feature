const normalizeOfferMetadata = (metadata) => {
  if (!metadata) return null;

  let parsed = metadata;

  if (typeof metadata === 'string') {
    try {
      parsed = JSON.parse(metadata);
    } catch {
      return null;
    }
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray(parsed.line_items)
  ) {
    return null;
  }

  return {
    line_items: parsed.line_items,
    ...parsed,
  };
};

module.exports = normalizeOfferMetadata;
