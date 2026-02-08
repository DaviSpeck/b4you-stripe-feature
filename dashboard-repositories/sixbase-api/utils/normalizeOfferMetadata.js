const normalizeOfferMetadata = (metadata) => {
    if (!metadata) return null;

    let parsed = metadata;

    // Se vier como string → tenta parse
    if (typeof metadata === 'string') {
        try {
            parsed = JSON.parse(metadata);
        } catch {
            return null;
        }
    }

    // Validação mínima exigida pelo Shopify
    if (
        !parsed ||
        typeof parsed !== 'object' ||
        !Array.isArray(parsed.line_items)
    ) {
        return null;
    }

    return {
        line_items: parsed.line_items,
    };
};

module.exports = normalizeOfferMetadata;