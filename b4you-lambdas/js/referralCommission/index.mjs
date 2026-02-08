import moment from "moment";
import { Op } from "sequelize";
import { ReferralCommissions } from "./database/models/ReferralCommissions.mjs";
import { ReferralProgram } from "./database/models/ReferralProgram.mjs";
import { ReferralUsers } from "./database/models/ReferralUsers.mjs";
import { Database } from "./database/sequelize.mjs";
import { Products } from "./database/models/Products.mjs";
import { Users } from "./database/models/Users.mjs";

const response = {
  statusCode: 200,
  body: JSON.stringify("Hello from Lambda!"),
};

/**
 *  @param {number} id_status - sale item status
 *  @return {{id_status: number, release_date: ?Date }}
 * */
const resolveStatusAndReleaseDate = (id_status) => {
  if (id_status === 1) {
    return {
      id_status: 1,
      release_date: null,
    };
  }

  if (id_status === 2) {
    return {
      id_status: 2,
      release_date: moment().add(2, "months").startOf("month"),
    };
  }

  return {
    id_status: 5,
    release_date: null,
  };
};

export const handler = async (event) => {
  console.log(event);

  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
  } = process.env;

  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: MYSQL_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  try {
    const { Records } = event;
    const [message] = Records;
    const {
      id_user: id_referral_user,
      amount,
      id_status,
      id_sale_item,
      id_product,
    } = JSON.parse(message.body);
    const product = await Products.findOne({
      raw: true,
      where: { id: id_product },
      attributes: ["id_user"],
    });
    if (!product) {
      return response;
    }

    const user = await Users.findOne({
      raw: true,
      where: { id: product.id_user },
      attributes: ["referral_disabled"],
    });
    if (user.referral_disabled) {
      console.log("user disabled -> ", user);
      return response;
    }
    const referralUser = await ReferralUsers.findOne({
      raw: true,
      attributes: ["id_user"],
      where: {
        id_referral_user,
        valid_until: {
          [Op.gte]: new Date().toISOString(),
        },
      },
    });
    if (!referralUser) {
      console.log("Usuário sem programa de indicações");
      return response;
    }
    const referralProgram = await ReferralProgram.findOne({
      raw: true,
      attributes: ["percentage"],
      where: {
        id_user: referralUser.id_user,
        id_status: 1,
      },
    });
    if (!referralProgram) {
      console.log("Usúario sem programa de indicações => ", referralProgram);
      return response;
    }
    // valor da comissão é 10% do valor de tarifa da b4you
    const commissionAmount = amount * 0.1;
    const commission = await ReferralCommissions.create({
      id_user: referralUser.id_user,
      amount: commissionAmount,
      id_sale_item,
      ...resolveStatusAndReleaseDate(id_status),
    });

    console.log("commission created -> ", commission.toJSON());
    return response;
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  } finally {
    await database.closeConnection();
  }
};
