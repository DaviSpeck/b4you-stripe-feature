import { DataTypes, Model } from 'sequelize';

export class Commissions extends Model {
    static initModel(sequelize) {
        return Commissions.init(
            {
                id: { type: DataTypes.BIGINT, primaryKey: true },
                id_user: DataTypes.BIGINT,
                id_sale_item: DataTypes.BIGINT,
                amount: DataTypes.DECIMAL(14, 2),
            },
            {
                sequelize,
                tableName: 'commissions',
                timestamps: false,
            },
        );
    }
}