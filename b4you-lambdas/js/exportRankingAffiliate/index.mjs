import fs from "fs";
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import ExcelJS from "exceljs";
import * as nanoid from "nanoid";
import { Database } from "./database/sequelize.mjs";
import { attachmentMessage } from "./email/messages.mjs";
import { MailService } from "./services/MailService.mjs";
import { capitalizeName } from "./utils/formatters.mjs";
nanoid.customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-"
);

import { readChunk } from "read-chunk";
import { Sequelize } from "sequelize";
import { DATABASE_DATE, date } from "./utils/date.mjs";

export const handler = async (event) => {
  console.log(event);
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    ACCESS_KEY,
    SECRET_ACCESS_KEY,
    MAILJET_EMAIL_SENDER,
    MAILJET_PASSWORD,
    MAILJET_TEMPLATE_ID,
    MAILJET_USERNAME,
  } = process.env;

  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: 3306,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
    region: "sa-east-1",
  });

  let uploadId;
  const bucketName = "arquivos-mango5";

  let filename;

  try {
    const { Records } = event;

    const [message] = Records;
    const { start, end, products, email, id_user, first_name } = JSON.parse(
      message.body
    );

    const format = "xlsx";
    const filename = `${nanoid.nanoid(10)}-affiliate-ranking.${format}`;
    const filePath = `/tmp/${filename}`;

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      useStyles: true,
      useSharedStrings: true,
      filename: filePath,
    });

    const dateCondition =
      start && end ? `si.paid_at BETWEEN :start AND :end` : "1=1";

    const parsedProducts = products
      ? products
          .split(",")
          .map((p) => parseInt(p.trim(), 10))
          .filter((p) => !Number.isNaN(p))
      : [];

    const productsCondition =
      parsedProducts.length > 0 ? `and p.id IN (:products)` : "";

    const dataQuery = `
    WITH
    sales_summary AS (
      SELECT
        si.id_product         AS product_id,
        p.name                AS product_name,
        c.id_user             AS id_user_affiliate,
        COUNT(*)              AS total_items_sold,
        SUM(si.price_base)    AS total_sales_value,
        SUM(c.amount)         AS total_commission
      FROM sales_items si
      JOIN commissions c    ON c.id_sale_item = si.id
      JOIN products p       ON p.id = si.id_product
      WHERE
        si.id_affiliate IS NOT NULL
        AND si.id_status   = 2
        AND c.id_role      = 3
        AND p.id_user      = :id_user
        AND ${dateCondition}
        ${productsCondition}
      GROUP BY si.id_product, p.name, c.id_user
    ),
    click_summary AS (
      SELECT
        af.id_user           AS id_user_affiliate,
        SUM(ac.click_amount) AS click_amount
      FROM affiliate_clicks ac
      JOIN affiliates af    ON af.id = ac.id_affiliate
      GROUP BY af.id_user
    )
  SELECT
    ss.product_id,
    ss.product_name,
    ss.id_user_affiliate,
    u.full_name,
    u.email,
    ss.total_items_sold,
    ss.total_sales_value,
    ss.total_commission,
    COALESCE(cs.click_amount, 0) AS click_amount
  FROM sales_summary AS ss
  JOIN users AS u
    ON u.id = ss.id_user_affiliate
  LEFT JOIN click_summary AS cs
    ON cs.id_user_affiliate = ss.id_user_affiliate
  ORDER BY ss.product_name, ss.total_sales_value DESC
  `;

    const results = await database.sequelize.query(dataQuery, {
      logging: true,
      replacements: {
        id_user,
        start: start
          ? date(start).startOf("day").add(3, "h").format(DATABASE_DATE)
          : null,
        end: end
          ? date(end).endOf("day").add(3, "h").format(DATABASE_DATE)
          : null,
        products: parsedProducts,
      },
      type: Sequelize.QueryTypes.SELECT,
    });
    const grouped = results.reduce((acc, row) => {
      const {
        product_name,
        full_name,
        email,
        total_items_sold,
        total_sales_value,
        total_commission,
        click_amount,
      } = row;

      const existingProduct = acc.find(
        (item) => item.product_name === product_name
      );

      const affiliateData = {
        affiliate_name: capitalizeName(full_name),
        affiliate_email: email,
        total_items_sold,
        total_sales_value,
        total_commission,
        click_amount,
      };

      if (existingProduct) {
        existingProduct.affiliates.push(affiliateData);
      } else {
        acc.push({
          product_name,
          affiliates: [affiliateData],
        });
      }

      return acc;
    }, []);

    for (const product of grouped) {
      const { product_name, affiliates } = product;

      const sheet = workbook.addWorksheet(product_name.slice(0, 31));

      sheet.columns = [
        { header: "Nome", key: "affiliate_name", width: 30 },
        { header: "Email", key: "affiliate_email", width: 30 },
        { header: "Nº de Vendas", key: "total_items_sold", width: 15 },
        { header: "Total em Comissões", key: "total_commission", width: 20 },
        { header: "Total em Faturamento", key: "total_sales_value", width: 20 },
      ];

      const headerRow = worksheet.getRow(1);

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "001432" },
        };
        cell.font = {
          color: { argb: "FFFFFF" },
          bold: true,
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      affiliates.forEach((affiliate, index) => {
        sheet.addRow({
          affiliate_name: affiliate.affiliate_name,
          affiliate_email: affiliate.affiliate_email,
          total_items_sold: affiliate.total_items_sold,
          total_commission: affiliate.total_commission,
          total_sales_value: affiliate.total_sales_value,
        });

        row.getCell("total_items_sold").alignment = { horizontal: "center" };
        row.getCell("total_commission").alignment = { horizontal: "center" };
        row.getCell("total_sales_value").alignment = { horizontal: "center" };

        if (index % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F2F2F2" },
            };
          });
        }
      });

      ["total_commission", "total_sales_value"].forEach((key) => {
        sheet.getColumn(key).numFmt = '"R$"#,##0.00;[Red]-"R$"#,##0.00';
      });
    }

    await workbook.commit();
    const name = capitalizeName(first_name);

    const stats = fs.statSync(filePath);
    const bytes = 10 * 1024 * 1024;
    const numberParts = stats.size / bytes;

    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: filename,
        ACL: "public-read",
      })
    );

    uploadId = multipartUpload.UploadId;
    const uploadPromises = [];

    for (let part = 0; part < numberParts; part += 1) {
      const chunk = await readChunk(filePath, {
        length: bytes,
        startPosition: part * bytes,
      });

      uploadPromises.push(
        s3Client
          .send(
            new UploadPartCommand({
              Bucket: bucketName,
              Key: filename,
              UploadId: uploadId,
              Body: chunk,
              PartNumber: part + 1,
            })
          )
          .then((d) => {
            console.log("Part", part, "uploaded");
            return d;
          })
      );
    }

    const uploadResults = await Promise.all(uploadPromises);

    await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: filename,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: uploadResults.map(({ ETag }, i) => ({
            ETag,
            PartNumber: i + 1,
          })),
        },
      })
    );

    const url = `https://arquivos-mango5.s3.sa-east-1.amazonaws.com/${filename}`;
    const emailTemplate = attachmentMessage(name, url);

    await new MailService({
      userName: MAILJET_USERNAME,
      password: MAILJET_PASSWORD,
      emailSender: MAILJET_EMAIL_SENDER,
      templateID: MAILJET_TEMPLATE_ID,
    }).sendMail({
      subject: "Sua planilha do ranking de afiliados está pronta.",
      toAddress: [
        {
          Email: email,
          Name: name,
        },
      ],
      variables: emailTemplate,
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.log(error);
    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: filename,
        UploadId: uploadId,
      });

      await s3Client.send(abortCommand);
    }
  } finally {
    await database.closeConnection();
  }
  return {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
};
