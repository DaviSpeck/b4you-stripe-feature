import fs from 'fs';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import ExcelJS from 'exceljs';
import * as nanoid from 'nanoid';
import { Database } from './database/sequelize.mjs';
import { attachmentMessage } from './email/messages.mjs';
import { MailService } from './services/MailService.mjs';
import { capitalizeName } from './utils/formatters.mjs';
nanoid.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-');
import { readChunk } from 'read-chunk';
import { Op } from 'sequelize';
import { Affiliates } from './database/models/Affiliate.mjs';
import { findAffiliateStatusByKey } from './utils/affiliateStatus.mjs';
import { date } from './utils/date.mjs';

export const handler = async (event) => {
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
    dialect: 'mysql',
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
    region: 'sa-east-1',
  });

  let uploadId;
  const bucketName = 'arquivos-mango5';

  let filename;

  try {
    const { Records } = event;

    const [message] = Records;

    const { id_user, input, product_uuid, first_name, email } = JSON.parse(message.body);

    const format = 'xlsx';
    const filename = `${nanoid.nanoid(10)}-pending-affiliate.${format}`;
    const filePath = `/tmp/${filename}`;

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      useStyles: true,
      useSharedStrings: true,
      filename: filePath,
    });

    const where = {
      status: findAffiliateStatusByKey('pending').id,
      '$product.id_user$': id_user,
    };

    if (input) {
      where[Op.or] = [{ '$user.email$': { [Op.like]: `%${input}%` } }];
    }

    if (product_uuid && product_uuid !== 'all') {
      where['$product.uuid$'] = product_uuid;
    }

    const affiliates = await Affiliates.findAll({
      where: { ...where, status: 1 },
      raw: true,
      nest: true,
      attributes: ['created_at', 'commission'],
      include: [
        {
          association: 'product',
          attributes: ['id', 'name'],
        },
        {
          association: 'user',
          attributes: ['id', 'full_name', 'email', 'whatsapp'],
        },
      ],
    });

    const groupedByProduct = {};

    affiliates.forEach((a) => {
      const productName = a.product.name || 'Sem Nome';

      if (!groupedByProduct[productName]) {
        groupedByProduct[productName] = [];
      }

      groupedByProduct[productName].push(a);
    });

    for (const [productName, entries] of Object.entries(groupedByProduct)) {
      const worksheet = workbook.addWorksheet(productName.substring(0, 31));

      worksheet.columns = [
        { header: 'Data do Pedido', key: 'created_at', width: 20 },
        {
          header: 'Comissão',
          key: 'commission',
          width: 15,
          alignment: { horizontal: 'center' },
        },
        { header: 'Nome do Usuário', key: 'user_name', width: 30 },
        { header: 'Email', key: 'user_email', width: 30 },
        {
          header: 'WhatsApp',
          key: 'user_whatsapp',
          width: 20,
          alignment: { horizontal: 'center' },
        },
      ];

      const headerRow = worksheet.getRow(1);

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '001432' },
        };
        cell.font = {
          color: { argb: 'FFFFFF' },
          bold: true,
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
        };
      });

      entries.forEach((a, index) => {
        const row = worksheet.addRow({
          created_at: date(a.created_at).format('DD/MM/YYYY'),
          commission: `${a.commission}%`,
          user_name: a.user.full_name,
          user_email: a.user.email,
          user_whatsapp: a.user.whatsapp
            .replace(/\s/g, '')
            .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'),
        });

        row.getCell('created_at').alignment = { horizontal: 'center' };
        row.getCell('commission').alignment = { horizontal: 'center' };
        row.getCell('user_whatsapp').alignment = { horizontal: 'center' };

        if (index % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F2F2F2' },
            };
          });
        }
      });
      worksheet.commit();
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
        ACL: 'public-read',
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
            console.log('Part', part, 'uploaded');
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
      subject: 'Sua planilha de pedidos de afiliação está pronta.',
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
};
