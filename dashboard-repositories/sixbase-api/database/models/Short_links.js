const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class ShortLink extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                },

                uuid: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    unique: true,
                },

                short_id: {
                    type: Sequelize.STRING(16),
                    allowNull: false,
                    unique: true,
                },

                type: {
                    type: Sequelize.ENUM('PAGE', 'OFFER'),
                    allowNull: false,
                },

                page_uuid: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    defaultValue: null,
                },

                offer_uuid: {
                    type: Sequelize.UUID,
                    allowNull: true,
                    defaultValue: null,
                },

                owner_type: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '1=producer, 2=coproducer, 3=affiliate, 4=global',
                },

                owner_uuid: {
                    type: Sequelize.CHAR(36),
                    allowNull: true,
                },

                redirect_url: {
                    type: Sequelize.STRING(2048),
                    allowNull: false,
                },

                clicks: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },

                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },

                updated_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },

                deleted_at: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
            },
            {
                hooks: {
                    beforeCreate: (shortLink) => {
                        shortLink.uuid = uuid.v4();
                    },
                },
                freezeTableName: true,
                timestamps: true,
                paranoid: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                deletedAt: 'deleted_at',
                sequelize,
                modelName: 'short_links',
            }
        );

        return this;
    }

    static associate(models) {
        /**
         * OWNER pode ser:
         * - USER (produtor/coprodutor)
         * - AFFILIATE
         * - GLOBAL (sem owner_uuid)
         *
         * Associações SEM constraints,
         * porque owner_uuid pode vir de users ou affiliates.
         */

        this.belongsTo(models.users, {
            foreignKey: 'owner_uuid',
            targetKey: 'uuid',
            as: 'owner_user',
            constraints: false,
        });

        this.belongsTo(models.affiliates, {
            foreignKey: 'owner_uuid',
            targetKey: 'uuid',
            as: 'owner_affiliate',
            constraints: false,
        });

        this.belongsTo(models.product_pages, {
            foreignKey: 'page_uuid',
            targetKey: 'uuid',
            as: 'page',
            constraints: false,
        });

        this.belongsTo(models.product_offer, {
            foreignKey: 'offer_uuid',
            targetKey: 'uuid',
            as: 'offer',
            constraints: false,
        });
    }
}

module.exports = ShortLink;