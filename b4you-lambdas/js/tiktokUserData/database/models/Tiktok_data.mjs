import * as Sequelize from "sequelize";

export class Tiktok_user_data extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_plugin: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        display_name: {
          type: Sequelize.STRING,
        },
        follower_count: {
          type: Sequelize.BIGINT,
        },
        following_count: {
          type: Sequelize.BIGINT,
        },
        likes_count: {
          type: Sequelize.BIGINT,
        },
        video_count: {
          type: Sequelize.BIGINT,
        },
        videos_share_count: { type: Sequelize.BIGINT },
        videos_like_count: { type: Sequelize.BIGINT },
        videos_view_count: { type: Sequelize.BIGINT },
        videos_comment_count: { type: Sequelize.BIGINT },
        settings: {
          type: Sequelize.JSON,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn("now"),
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        sequelize,
        modelName: "tiktok_user_data",
      }
    );

    return this;
  }
}
