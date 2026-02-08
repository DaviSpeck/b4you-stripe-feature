import _ from "lodash";
import pLimit from "p-limit";
import { findIntegrationTypeByKey } from "../types/integrationsTypes.mjs";
import { Tiktok } from "../services/Tiktok.mjs";
import { Plugins } from "../database/models/Plugins.mjs";
import { Tiktok_user_data } from "../database/models/Tiktok_data.mjs";

const getTotalMetrics = async (token, tiktok_client) => {
  const videos = await tiktok_client.getVideos(token);
  return videos.reduce(
    (totais, video) => {
      totais.share_count += video.share_count || 0;
      totais.like_count += video.like_count || 0;
      totais.view_count += video.view_count || 0;
      totais.comment_count += video.comment_count || 0;
      return totais;
    },
    { share_count: 0, like_count: 0, view_count: 0, comment_count: 0 }
  );
};

export const TiktokData = async () => {
  console.log("--INICIANDO ATUALIZACAO TIKTOK--");

  const integrationType = findIntegrationTypeByKey("tiktok");
  const integrations = await Plugins.findAll({
    where: {
      id_plugin: integrationType.id,
      active: true,
    },
  });

  if (integrations.length === 0) {
    console.log("SEM INTEGRACOES ATIVAS");
    return;
  }

  const limit = pLimit(5);
  const tasks = integrations.map((i) =>
    limit(async () => {
      try {
        const tiktok_client = new Tiktok();
        if (!i?.settings?.refresh_token) return;

        console.log("BUSCANDO ID_USER", i.id_user, i.id);
        const token = await tiktok_client.generateToken(
          i.settings.refresh_token,
          true
        );
        const data = await tiktok_client.getUserInfo(token.token);
        console.log(`ID_USER:${i.id_user}-ID_PLUGIN:${i.id} USER INFO->`, data);
        const metrics = await getTotalMetrics(token.token, tiktok_client);
        console.log(
          `ID_USER:${i.id_user}-ID_PLUGIN:${i.id} METRICS->`,
          metrics
        );

        const defaults = {
          id_user: i.id_user,
          id_plugin: i.id,
          settings: data,
          follower_count: data.follower_count,
          following_count: data.following_count,
          likes_count: data.likes_count,
          video_count: data.video_count,
          display_name: data.display_name,
          videos_share_count: metrics.share_count,
          videos_like_count: metrics.like_count,
          videos_view_count: metrics.view_count,
          videos_comment_count: metrics.comment_count,
        };

        const existing = await Tiktok_user_data.findOne({
          where: { id_user: i.id_user, id_plugin: i.id },
        });

        if (existing) {
          await existing.update(defaults);
        } else {
          await Tiktok_user_data.create(defaults);
        }
      } catch (error) {
        console.error("Erro ao atualizar dados TikTok:", error);
      }
    })
  );

  await Promise.allSettled(tasks);
  console.log("--FINALIZADO ATUALIZACAO TIKTOK--");
};
