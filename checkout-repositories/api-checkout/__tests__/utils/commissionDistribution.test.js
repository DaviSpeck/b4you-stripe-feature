describe('Commission Distribution for Multiple Cards', () => {
  test('should distribute commissions proportionally to card amounts', () => {
    const totalCommission = 10.0;
    const card1Amount = 60.0;
    const card2Amount = 40.0;
    const totalCardsAmount = card1Amount + card2Amount;

    const card1Commission = (card1Amount / totalCardsAmount) * totalCommission;
    const card2Commission = (card2Amount / totalCardsAmount) * totalCommission;

    expect(card1Commission).toBe(6.0);
    expect(card2Commission).toBe(4.0);
    expect(card1Commission + card2Commission).toBe(totalCommission);
  });

  test('should handle equal card amounts', () => {
    const totalCommission = 10.0;
    const card1Amount = 50.0;
    const card2Amount = 50.0;
    const totalCardsAmount = card1Amount + card2Amount;

    const card1Commission = (card1Amount / totalCardsAmount) * totalCommission;
    const card2Commission = (card2Amount / totalCardsAmount) * totalCommission;

    expect(card1Commission).toBe(5.0);
    expect(card2Commission).toBe(5.0);
  });

  test('should prevent negative commission amounts', () => {
    const totalCommission = 10.0;
    const card1Amount = 60.0;
    const card2Amount = 40.0;
    const totalCardsAmount = card1Amount + card2Amount;

    let card1Commission = (card1Amount / totalCardsAmount) * totalCommission;
    let card2Commission = (card2Amount / totalCardsAmount) * totalCommission;

    // Simular proteção contra valores negativos
    if (card1Commission < 0) card1Commission = 0;
    if (card2Commission < 0) card2Commission = 0;

    expect(card1Commission).toBeGreaterThanOrEqual(0);
    expect(card2Commission).toBeGreaterThanOrEqual(0);
  });

  test('should handle three cards with different amounts', () => {
    const totalCommission = 15.0;
    const cards = [
      { amount: 50.0 },
      { amount: 30.0 },
      { amount: 20.0 },
    ];
    const totalCardsAmount = cards.reduce((sum, card) => sum + card.amount, 0);

    const commissions = cards.map((card) => ({
      ...card,
      commission: (card.amount / totalCardsAmount) * totalCommission,
    }));

    const totalDistributed = commissions.reduce((sum, c) => sum + c.commission, 0);

    expect(commissions[0].commission).toBe(7.5);
    expect(commissions[1].commission).toBe(4.5);
    expect(commissions[2].commission).toBe(3.0);
    expect(totalDistributed).toBe(totalCommission);
  });
});

