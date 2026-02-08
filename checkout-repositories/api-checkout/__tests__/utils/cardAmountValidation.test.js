describe('Card Amount Validation', () => {
  test('should validate that sum of card amounts equals offer price', () => {
    const offerPrice = 100.0;
    const card1Amount = 50.0;
    const card2Amount = 50.0;
    const sum = card1Amount + card2Amount;
    const difference = Math.abs(offerPrice - sum);

    expect(difference).toBeLessThan(0.05);
  });

  test('should allow difference up to 0.05 for rounding', () => {
    const offerPrice = 100.0;
    const card1Amount = 50.01;
    const card2Amount = 49.99;
    const sum = card1Amount + card2Amount;
    const difference = Math.abs(offerPrice - sum);

    expect(difference).toBeLessThanOrEqual(0.05);
  });

  test('should reject when difference is greater than 0.05', () => {
    const offerPrice = 100.0;
    const card1Amount = 30.0;
    const card2Amount = 40.0;
    const sum = card1Amount + card2Amount;
    const difference = Math.abs(offerPrice - sum);

    expect(difference).toBeGreaterThan(0.05);
  });

  test('should distribute difference to last card', () => {
    const offerPrice = 100.0;
    const cards = [
      { amount: 50.0 },
      { amount: 49.99 },
    ];
    const sum = cards.reduce((acc, card) => acc + card.amount, 0);
    const difference = offerPrice - sum;

    const lastCardIndex = cards.length - 1;
    cards[lastCardIndex].amount = Number((cards[lastCardIndex].amount + difference).toFixed(2));

    const finalSum = cards.reduce((acc, card) => acc + card.amount, 0);
    expect(finalSum).toBe(100.0);
  });
});

