const CreditCardFees = require('useCases/checkout/fees/CreditCardFees');
const Fees = require('useCases/checkout/fees/Fees');

jest.mock('useCases/checkout/fees/Fees');

describe('CreditCardFees', () => {
  const mockFees = [
    {
      brand: 'visa',
      installments: 1,
      psp_fixed_cost: 0.5,
      psp_variable_cost: 2.99,
    },
    {
      brand: 'visa',
      installments: 3,
      psp_fixed_cost: 0.5,
      psp_variable_cost: 3.49,
    },
    {
      brand: 'mastercard',
      installments: 1,
      psp_fixed_cost: 0.5,
      psp_variable_cost: 2.99,
    },
  ];

  const mockSettings = {
    fee_variable_card_service: {
      1: 5.0,
      3: 6.0,
    },
    fee_fixed_card_service: {
      1: 1.0,
      3: 1.5,
    },
  };

  const mockTaxes = {
    tax_variable_percentage: 15.0,
  };

  const mockSalesItems = [
    {
      price: 100.0,
      type: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Fees.mockImplementation(() => ({
      sale: jest.fn().mockResolvedValue([
        {
          type: 'cost',
          price: 105.0,
          installments: 1,
        },
        {
          type: 'payment',
          price: 105.0,
        },
      ]),
    }));
  });

  test('should calculate fees for visa card with 1 installment', async () => {
    const creditCardFees = new CreditCardFees({
      fees: mockFees,
      taxes: mockTaxes,
      settings: mockSettings,
      brand: 'visa',
      installments: 1,
      student_pays_interest: false,
      sales_items: mockSalesItems,
      discount: 0,
      coupon: null,
      document_number: '12345678901',
    });

    const result = await creditCardFees.execute();

    expect(Fees).toHaveBeenCalledWith({
      fees: {
        psp_fixed_cost: 0.5,
        psp_variable_cost: 2.99,
      },
      settings: {
        fee_variable_percentage_service: 5.0,
        fee_fixed_amount_service: 1.0,
      },
      taxes: mockTaxes,
      student_pays_interest: false,
      installments: 1,
      brand: 'visa',
      sales_items: mockSalesItems,
      discount: 0,
      coupon: null,
      monthly_installment_interest: 3.49,
      document_number: '12345678901',
    });

    expect(result).toBeDefined();
  });

  test('should calculate fees for visa card with 3 installments', async () => {
    const creditCardFees = new CreditCardFees({
      fees: mockFees,
      taxes: mockTaxes,
      settings: mockSettings,
      brand: 'visa',
      installments: 3,
      student_pays_interest: true,
      sales_items: mockSalesItems,
      discount: 0,
      coupon: null,
      document_number: '12345678901',
    });

    const result = await creditCardFees.execute();

    expect(Fees).toHaveBeenCalledWith({
      fees: {
        psp_fixed_cost: 0.5,
        psp_variable_cost: 3.49,
      },
      settings: {
        fee_variable_percentage_service: 6.0,
        fee_fixed_amount_service: 1.5,
      },
      taxes: mockTaxes,
      student_pays_interest: true,
      installments: 3,
      brand: 'visa',
      sales_items: mockSalesItems,
      discount: 0,
      coupon: null,
      monthly_installment_interest: 3.49,
      document_number: '12345678901',
    });

    expect(result).toBeDefined();
  });


  test('should handle different card brands correctly', async () => {
    const creditCardFees = new CreditCardFees({
      fees: mockFees,
      taxes: mockTaxes,
      settings: mockSettings,
      brand: 'mastercard',
      installments: 1,
      student_pays_interest: false,
      sales_items: mockSalesItems,
      discount: 0,
      coupon: null,
      document_number: '12345678901',
    });

    const result = await creditCardFees.execute();

    expect(Fees).toHaveBeenCalledWith(
      expect.objectContaining({
        fees: {
          psp_fixed_cost: 0.5,
          psp_variable_cost: 2.99,
        },
        brand: 'mastercard',
      }),
    );

    expect(result).toBeDefined();
  });
});

