import { HttpClient } from "./HTTPClient.mjs";

// Link documentação -> https://developers.tiktok.com/doc/overview
const { TIKTOK_CLIENT_ID, TIKTOK_CLIENT_SECRET } = process.env;
export class Tiktok {
  #client_id;

  #client_secret;

  #base_api;

  #service;

  constructor() {
    this.#client_id = TIKTOK_CLIENT_ID;
    this.#client_secret = TIKTOK_CLIENT_SECRET;
    this.#base_api = "https://open.tiktokapis.com";

    this.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    this.#service = new HttpClient({
      baseURL: `${this.#base_api}/`,
    });
  }

  async generateToken(code, refresh_token = false) {
    try {
      const body = new URLSearchParams({
        client_key: this.#client_id,
        client_secret: this.#client_secret,
        grant_type: refresh_token ? "refresh_token" : "authorization_code",
        code: refresh_token ? null : code,
        redirect_uri: "https://b4you.codgital.site/redirect",
        refresh_token: refresh_token ? code : null,
      });

      const response = await this.#service.post(
        "https://open.tiktokapis.com/v2/oauth/token/",
        body,
        {
          headers: this.headers,
        }
      );

      if (response && response.data && response.data.access_token) {
        return {
          token: response.data.access_token,
          expire_n: response.data.expires_in,
          refresh_token: response.data.refresh_token,
          refresh_token_expire_in: response.data.refresh_expires_in,
        };
      }
      return null;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async getUserInfo(token) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const url =
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,follower_count,following_count,likes_count,video_count,avatar_url,avatar_url_100";
    const response = await this.#service.get(url, { headers });
    return response.data.data.user;
  }

  async getVideos(token) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const videos = [];
    const listUrl =
      "https://open.tiktokapis.com/v2/video/list/?fields=id,like_count,comment_count,share_count,view_count,title,video_description,cover_image_url,embed_link";

    let hasMore = true;
    let cursor;

    try {
      while (hasMore) {
        const body = {
          max_count: 20,
          ...(cursor && { cursor }),
        };

        const response = await this.#service.post(listUrl, body, { headers });

        const {
          videos: currentVideos = [],
          has_more,
          cursor: newCursor,
        } = response.data.data;
        videos.push(...currentVideos);
        hasMore = has_more;
        cursor = newCursor;
      }
      return videos;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data ||
        error.message ||
        error;
      console.error("Erro ao buscar vídeos do TikTok:", errorMessage);
      return [];
    }
  }
}
