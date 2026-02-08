import { ExportXLS } from './useCases/ExportXls.mjs';
import { Database } from './database/sequelize.mjs';
import { attachmentMessage } from './email/messages.mjs';
import { capitalizeName } from './utils/formatters.mjs';
import { MailService } from './services/MailService.mjs';
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import * as nanoid from 'nanoid';
import { readChunk } from 'read-chunk';
import fs from 'fs';

export const handler = async (event) => {
  console.log('Export affiliates event ->', event);
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

  console.log('Starting exportAffiliates (S3 link flow)...');
  const startTime = Date.now();

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
  const bucketName = 'arquivos-mango5';
  let uploadId;
  let filename;
  let filePath;

  try {
    const { Records } = event;
    const [message] = Records;
    const { query, email, first_name, id_user } = JSON.parse(message.body);

    const file = await new ExportXLS({ ...query, id_user }).execute();

    const format = 'xlsx';
    filename = `afiliados_${id_user || 'unknown'}-${nanoid.nanoid(10)}.${format}`;
    filePath = `/tmp/${filename}`;
    fs.writeFileSync(filePath, file);

    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: filename,
        ACL: 'public-read',
      })
    );

    uploadId = multipartUpload.UploadId;
    const stats = fs.statSync(filePath);
    const bytes = 10 * 1024 * 1024; // 10MB
    const numberParts = Math.ceil(stats.size / bytes);

    const uploadPromises = [];
    for (let part = 0; part < numberParts; part += 1) {
      const startPosition = part * bytes;
      const chunk = await readChunk(filePath, { length: bytes, startPosition });
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
            console.log(`📤 Part ${part + 1}/${numberParts} uploaded`);
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

    console.log('📧 Sending email notification...');
    const url = `https://arquivos-mango5.s3.sa-east-1.amazonaws.com/${filename}`;

    const name = capitalizeName(first_name);
    const emailTemplate = attachmentMessage(name, url);

    await new MailService({
      userName: MAILJET_USERNAME,
      password: MAILJET_PASSWORD,
      emailSender: MAILJET_EMAIL_SENDER,
      templateID: MAILJET_TEMPLATE_ID,
    }).sendMail({
      subject: 'Sua planilha de afiliados está pronta',
      toAddress: [
        {
          Email: email,
          Name: name,
        },
      ],
      variables: emailTemplate,
    });

    fs.unlinkSync(filePath);

    const totalTime = Date.now() - startTime;
    console.log(`Export affiliates concluído em ${(totalTime / 1000).toFixed(2)}s`, { url });
  } catch (error) {
    console.log('error', error);
    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: filename,
        UploadId: uploadId,
      });
      await s3Client.send(abortCommand);
    }
    throw error;
  } finally {
    await database.closeConnection();
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
