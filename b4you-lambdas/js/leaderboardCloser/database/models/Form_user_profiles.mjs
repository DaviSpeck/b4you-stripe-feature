import { DataTypes, Model } from 'sequelize';

export class FormUserProfiles extends Model {
    static initModel(sequelize) {
        return FormUserProfiles.init(
            {
                id: { type: DataTypes.BIGINT, primaryKey: true },
                id_user: DataTypes.BIGINT,
                form_type: DataTypes.INTEGER,
            },
            {
                sequelize,
                tableName: 'form_user_profiles',
                timestamps: false,
            },
        );
    }
}