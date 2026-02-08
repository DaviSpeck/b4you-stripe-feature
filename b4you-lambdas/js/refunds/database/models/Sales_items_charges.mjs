import * as Sequelize from 'sequelize';
export class Sales_items_charges extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_charge: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'sales_items_charges',
      }
    );

    return this;
  }
}
