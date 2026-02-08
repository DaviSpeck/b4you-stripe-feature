import { DataTypes, Model } from "sequelize";

export class Commissions extends Model {
    static initModel(sequelize) {
        return Commissions.init(
            {
                id: { type: DataTypes.BIGINT, primaryKey: true },
                id_user: DataTypes.BIGINT,
                id_role: DataTypes.INTEGER,
                created_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: "commissions",
                tableName: "commissions",
                freezeTableName: true,
                timestamps: false,
            }
        );
    }
}