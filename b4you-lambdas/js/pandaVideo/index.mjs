import { Database } from './database/sequelize.mjs';
import { Product_gallery } from './database/models/Product_gallery.mjs';
import axios from 'axios'

const UPLOADING = 1
const AVAILABLE = 2

const defaultHeaders = {
  'Content-Type': 'application/json',
};

/**
 *
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @returns
 */
export const handler = async (event) => {
  console.log('new event on panda video', event);
  const body = JSON.parse(event.body);
  console.log('parsed', body);
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
    PANDA_KEY
  } = process.env;
  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();
  try {
    const pg = await Product_gallery.findOne({
      where: {
        external_id: body.video_id,
      }
    })
    let res = null
    if (pg) {
      res = await axios.get(
        `https://api-v2.pandavideo.com.br/videos/${body.video_id}`,
        {
          headers: { Authorization: PANDA_KEY },
        }
      );
      console.log("data", res.data)
    }
    if (pg && res?.data) {
      if (body.status === "CONVERTED") {
        await Product_gallery.update({
          upload_links: pg.upload_link,
          link: res.data.video_player,
          uri: res.data.video_hls,
          duration: res.data.length,
          thumbnail: res.data.preview,
          video_status: AVAILABLE
        }, {
          where: {
            id: pg.id
          }
        })
      } else if (body.status === "DRAFT" || body.status === "CONVERTING") {
        await Product_gallery.update({
          upload_links: pg.upload_link,
          link: res.data.video_player,
          uri: res.data.video_hls,
          duration: res.data.length,
          thumbnail: res.data.preview,
          video_status: pg.video_status === AVAILABLE ? AVAILABLE : UPLOADING
        }, {
          where: {
            id: pg.id
          }
        })
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'ok!' }),
      headers: defaultHeaders,
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
      headers: defaultHeaders,
    };
  } finally {
    await database.closeConnection();
  }
};

