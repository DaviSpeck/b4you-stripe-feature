import { DataTypes, Model } from 'sequelize';

export class SalesItems extends Model {
    static initModel(sequelize) {
        return SalesItems.init(
            {
                id: { type: DataTypes.BIGINT, primaryKey: true },
                id_status: DataTypes.INTEGER,
                paid_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'sales_items',
                timestamps: false,
            },
        );
    }
}