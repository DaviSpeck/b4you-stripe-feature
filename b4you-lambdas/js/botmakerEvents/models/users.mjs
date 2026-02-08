import { DataTypes, Model } from "sequelize";

export class Users extends Model {
  static initModel(sequelize) {
    return Users.init(
      {
        id: { type: DataTypes.BIGINT, primaryKey: true },
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        full_name: DataTypes.STRING,
        email: DataTypes.STRING,
        whatsapp: DataTypes.STRING,
        active: DataTypes.BOOLEAN,
        birth_date: DataTypes.DATEONLY,
      },
      {
        sequelize,
        modelName: "users",
        tableName: "users",
        freezeTableName: true,
        timestamps: false,
      }
    );
  }
}