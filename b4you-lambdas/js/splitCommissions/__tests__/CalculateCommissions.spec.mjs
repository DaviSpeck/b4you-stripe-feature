import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalculateCommissions } from '../useCases/CalculateCommissionsTransactions.mjs';
import { Suppliers } from '../database/models/Suppliers.mjs';
import { Affiliates } from '../database/models/Affiliates.mjs';
import { Managers } from '../database/models/Managers.mjs';
import { Sales_settings } from '../database/models/UserSalesSettings.mjs';
import { findRoleTypeByKey } from '../types/rolesTypes.mjs';

// Mock dependencies
vi.mock('../database/models/Suppliers.mjs');
vi.mock('../database/models/Affiliates.mjs');
vi.mock('../database/models/Managers.mjs');
vi.mock('../database/models/UserSalesSettings.mjs');
vi.mock('../database/models/Sales_items.mjs');
vi.mock('../types/rolesTypes.mjs');
vi.mock('../database/models/Sales_items.mjs');
vi.mock('../types/rolesTypes.mjs');

describe('CalculateCommissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    findRoleTypeByKey.mockImplementation((key) => {
      const map = {
        producer: { id: 1 },
        affiliate: { id: 2 },
        coproducer: { id: 3 },
        supplier: { id: 4 },
        manager: { id: 5 },
      };
      return map[key];
    });

    Affiliates.findOne.mockResolvedValue(null);
    Managers.sequelize = { query: vi.fn().mockResolvedValue(null) };
    Suppliers.findAll.mockResolvedValue([]);
    Sales_settings.findOne.mockResolvedValue({});
  });

  const baseSaleItem = {
    id: 1,
    id_product: 100,
    id_offer: 200,
    split_price: 100,
    subscription_fee: 0,
    shipping_price: 20,
    fee_total: 10,
    id_status: 2, // Approved
    paid_at: '2024-01-01T00:00:00Z',
    payment_method: 'card',
    product: {
      id: 100,
      id_user: 999, // Producer ID
      producer: {
        user_sale_settings: {},
      },
      coproductions: [],
    },
  };

  it('should split commission correctly with a standard supplier', async () => {
    const saleItem = { ...baseSaleItem };

    // Mock Supplier: receives 10.00 fixed amount
    Suppliers.findAll.mockResolvedValue([
      { id_user: 50, amount: 10, receives_shipping_amount: false },
    ]);

    const transactions = await CalculateCommissions.execute({
      sale_item: saleItem,
      first_charge: true,
      affiliate: null,
      shipping_type: 1, // Standard shipping behavior
    });

    // Calculations:
    // Amount Sale = 100 (split_price)
    // - 0 (affiliate)
    // - 10 (fee)
    // = 90
    //
    // Producer Amount Initial = 90
    //
    // Supplier Amount = 10
    //
    // Producer Final = 90 - 10 = 80
    //
    // Supplier Transaction: 10
    // Producer Transaction: 80

    const supplierTransaction = transactions.find((t) => t.id_role === 4);
    const producerTransaction = transactions.find((t) => t.id_role === 1);

    expect(supplierTransaction).toBeDefined();
    expect(supplierTransaction.amount).toBe(10);
    expect(supplierTransaction.id_user).toBe(50);

    expect(producerTransaction).toBeDefined();
    expect(producerTransaction.amount).toBe(80);
  });

  it('should add shipping price to supplier commission when receives_shipping_amount is true', async () => {
    const saleItem = { ...baseSaleItem };

    // Mock Supplier: receives 10.00 + shipping
    Suppliers.findAll.mockResolvedValue([
      { id_user: 51, amount: 10, receives_shipping_amount: true },
    ]);

    const transactions = await CalculateCommissions.execute({
      sale_item: saleItem,
      first_charge: true,
      affiliate: null,
      shipping_type: 1,
    });

    // Calculations:
    // Amount Sale (Net) = 90
    // Shipping Price = 20
    //
    // Supplier Amount = 10 (base) + 20 (shipping) = 30
    //
    // Producer Final = 90 - 30 = 60

    const supplierTransaction = transactions.find((t) => t.id_role === 4);
    const producerTransaction = transactions.find((t) => t.id_role === 1);

    expect(supplierTransaction).toBeDefined();
    expect(supplierTransaction.amount).toBe(30); // 10 + 20
    expect(producerTransaction.amount).toBe(60);
  });

  it('should fail gracefully or handle logic when total supplier amount exceeds producer amount', async () => {
    // This tests the logic: if (totalSuppliers >= amountProducer)
    // Note: amountProducer here seems to be calculated BEFORE removing minProducer (0.01) in the loop logic in code
    // let's trace:
    // amountProducer = 90.
    // Supplier wants 200.
    // totalSuppliers = 200.
    // e = 90 / 200 = 0.45
    // supplierAmount = 0.45 * 200 = 90.

    const saleItem = { ...baseSaleItem };
    // Producer has 90 available.

    Suppliers.findAll.mockResolvedValue([
      { id_user: 52, amount: 200, receives_shipping_amount: false },
    ]);

    const transactions = await CalculateCommissions.execute({
      sale_item: saleItem,
      first_charge: true,
      affiliate: null,
      shipping_type: 1,
    });

    const supplierTransaction = transactions.find((t) => t.id_role === 4);
    const producerTransaction = transactions.find((t) => t.id_role === 1);

    // In the code:
    // amountProducer (initially 90)
    // minProducer = 0.01
    // amountProducer -= 0.01 => 89.99
    // total_producer = 89.99

    // calculateSupplierAmount:
    // totalSuppliers (200) >= amountProducer (89.99) ? Yes.
    // e = 89.99 / 200 = 0.44995
    // supplierAmount += 0.44995 * 200 = 89.99

    // loop: amountProducer (89.99) -= 89.99 => 0

    // After loop: amountProducer += 0.01 => 0.01

    expect(supplierTransaction.amount).toBeCloseTo(89.99);
    expect(producerTransaction.amount).toBeCloseTo(0.01);
  });
});
