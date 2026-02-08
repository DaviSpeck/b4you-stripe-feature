const taxes = [
  {
    id: 1,
    tax_variable_percentage: 20.0,
    created_at: '2021-12-13 15:05:03',
    updated_at: null,
  },
  {
    id: 3,
    tax_variable_percentage: 20.0,
    created_at: '2022-04-08 17:24:18',
    updated_at: null,
  },
];

module.exports = class TaxesMemoryRepository {
  static async find() {
    return new Promise((resolve) => resolve(taxes[0]));
  }
};
