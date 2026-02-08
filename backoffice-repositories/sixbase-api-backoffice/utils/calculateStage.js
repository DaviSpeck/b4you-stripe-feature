function calculateStage(item) {
    const variation = item.variation_percentage;

    if (variation >= 20) return 'SAUDAVEL';
    if (variation >= -20 && variation < 20) return 'ATENCAO';
    if (variation < -20) return 'QUEDA';

    return 'SAUDAVEL';
}

module.exports = { calculateStage };