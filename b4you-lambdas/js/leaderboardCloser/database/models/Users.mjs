import { DataTypes, Model } from 'sequelize';

export class Users extends Model {
    static initModel(sequelize) {
        return Users.init(
            {
                id: { type: DataTypes.BIGINT, primaryKey: true },
                full_name: DataTypes.STRING,
                profile_picture: DataTypes.STRING,
                created_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'users',
                timestamps: false,
            },
        );
    }
}