/**
 * Extrai a quantidade real de unidades que a variante representa.
 *
 * Shopify normalmente manda:
 * - quantity: 1
 * - variant_title: "2 Unidades", "Kit com 3", "Pack 4", etc
 *
 * Esse helper descobre que:
 * quantity real = quantity * unidades da variante
 */

function extractUnitsFromCatalog(catalogItem) {
    if (!catalogItem) return 1;

    // 1️⃣ Prioridade: options_with_values (mais confiável)
    const options = catalogItem.options_with_values || catalogItem.options;

    if (Array.isArray(options)) {
        const candidates = [
            'quantidade',
            'unidades',
            'unidade',
            'kit',
            'pack',
            'qtd',
            'qtde',
        ];

        for (const opt of options) {
            if (opt?.name && opt?.value) {
                const name = String(opt.name).toLowerCase();
                const value = String(opt.value);

                if (candidates.some((c) => name.includes(c))) {
                    const num = parseInt(value.match(/\d+/)?.[0], 10);
                    if (num && num > 0) return num;
                }
            }
        }
    }

    // 2️⃣ Fallback: variant_title
    if (catalogItem.variant_title) {
        const match = String(catalogItem.variant_title).match(/\d+/);
        if (match) {
            const num = parseInt(match[0], 10);
            if (num > 0) return num;
        }
    }

    // 3️⃣ Fallback extra: title completo
    if (catalogItem.title) {
        const match = String(catalogItem.title).match(/\d+/);
        if (match) {
            const num = parseInt(match[0], 10);
            if (num > 0) return num;
        }
    }

    // 4️⃣ Default seguro
    return 1;
}

module.exports = { extractUnitsFromCatalog };