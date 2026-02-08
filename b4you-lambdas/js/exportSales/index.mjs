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
import { Sales_items } from './database/models/Sales_items.mjs';
import { Database } from './database/sequelize.mjs';
import { attachmentMessage } from './email/messages.mjs';
import { ImprovedMailService } from './services/ImprovedMailService.mjs';
import { dataToExport, formatWhere, getHeaders, queryRole } from './useCases/ExportXls.mjs';
import { capitalizeName } from './utils/formatters.mjs';
import { readChunk } from 'read-chunk';
import { Op } from 'sequelize';
import { Coupons } from './database/models/Coupons.mjs';

nanoid.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-');

export const handler = async () => {
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

  console.log('🚀 Starting OPTIMIZED exportSales...');
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

  let uploadId;
  const bucketName = 'arquivos-mango5';
  let filename;

  try {
    const [, , queryString, email, first_name] = process.argv;

    console.log('📧 Processing for:', email);
    console.log('⏱  Start time:', new Date().toISOString());

    const query = JSON.parse(queryString);

    const format = 'xlsx';
    filename = `vendas_${query.id_user}-${nanoid.nanoid(10)}.${format}`;
    const filePath = `/tmp/${filename}`;

    // Create streaming Excel writer for better memory usage
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      useStyles: true,
      useSharedStrings: true,
      filename: filePath,
    });

    const worksheet = workbook.addWorksheet(filename, {
      pageSetup: { orientation: 'landscape' },
    });

    worksheet.columns = getHeaders();

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

    // OPTIMIZATION 1: Use cursor-based pagination instead of OFFSET
    let lastId = 0;
    let batchSize = 1000; // Increased batch size
    let totalProcessed = 0;
    let batchCount = 0;

    const where = formatWhere(query);
    const coupons = query.coupons;

    if (coupons) {
      if (coupons === 'all') {
        where['$sale->coupon_sale.id_coupon$'] = {
          [Op.ne]: null,
        };
      } else {
        let cp = await Coupons.findAll({
          raw: true,
          paranoid: false,
          where: {
            coupon: coupons,
          },
          attributes: ['id'],
        });

        cp = cp.map((c) => c.id);
        where['$sale->coupon_sale.id_coupon$'] = {
          [Op.in]: cp,
        };
      }
    }

    console.log('🔄 Starting optimized batch processing...');

    while (true) {
      const batchStartTime = Date.now();

      // OPTIMIZATION 2: Cursor-based pagination
      const batchWhere = {
        ...where,
        id: {
          [Op.gt]: lastId,
        },
      };

      const salesItems = await Sales_items.findAll({
        limit: batchSize,
        nest: true,
        distinct: true,
        subQuery: false,
        where: batchWhere,
        logging: false, // Disable logging for performance
        order: [['id', 'ASC']], // Order by ID for cursor pagination
        group: ['id'],
        attributes: [
          'id',
          'uuid',
          'created_at',
          'updated_at',
          'id_status',
          'payment_method',
          'paid_at',
          'quantity',
          'id_offer',
          'src',
          'sck',
          'utm_source',
          'utm_medium',
          'utm_campaign',
          'utm_content',
          'utm_term',
          'fee_fixed',
          'fee_variable_amount',
          'discount_amount',
          'tracking_code',
          'tracking_url',
          'tracking_company',
          'price',
          'shipping_price',
          'price_total',
          'type',
        ],
        include: [
          {
            association: 'offer',
            required: false,
            attributes: ['name', 'price'],
            paranoid: false,
          },
          {
            association: 'sale',
            attributes: ['address', 'full_name', 'document_number', 'whatsapp', 'email', 'uuid'],
            include: [
              {
                association: 'coupon_sale',
                attributes: ['id_coupon', 'id_sale', 'percentage'],
                include: [
                  {
                    association: 'coupon',
                    attributes: ['coupon'],
                    paranoid: false,
                  },
                ],
              },
            ],
          },
          { association: 'product', attributes: ['name'], paranoid: false },
          {
            association: 'commissions',
            attributes: ['amount', 'id_status', 'id_role', 'id_user', 'id', 'id_sale_item'],
            where: {
              id_user: query.id_user,
              id_role: queryRole(query.role),
            },
            include: [
              {
                association: 'sale_item',
                attributes: ['id'],
                include: [
                  {
                    association: 'commissions',
                    attributes: ['amount', 'id_status', 'id_role', 'id_user', 'id', 'id_sale_item'],
                    separate: true,
                    include: [
                      {
                        association: 'user',
                        attributes: ['full_name', 'email'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            association: 'charges',
            attributes: ['id', 'id_sale_item', 'installments', 'provider_response_details'],
          },
          {
            association: 'affiliate',
            attributes: ['id_user'],
            include: [{ association: 'user', attributes: ['full_name', 'email'] }],
          },
        ],
      });

      if (salesItems.length === 0) {
        console.log('✅ No more records to process');
        break;
      }

      // OPTIMIZATION 3: Process data efficiently
      salesItems.forEach((data, index) => {
        const row = worksheet.addRow(dataToExport(data.toJSON()));

        if ((totalProcessed + index) % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F2F2F2' },
            };
          });
        }
      });

      totalProcessed += salesItems.length;
      lastId = salesItems[salesItems.length - 1].id;
      batchCount++;

      const batchTime = Date.now() - batchStartTime;
      const progress =
        totalProcessed > 0 ? ((totalProcessed / (totalProcessed + 1000)) * 100).toFixed(1) : '0.0';

      console.log(
        `📊 Batch ${batchCount}: ${salesItems.length} records in ${batchTime}ms (Total: ${totalProcessed}, Progress: ~${progress}%)`
      );

      // OPTIMIZATION 4: Break if we got less than batch size (end of data)
      if (salesItems.length < batchSize) {
        console.log('✅ Reached end of data');
        break;
      }
    }

    console.log(`📈 Total processed: ${totalProcessed} records in ${batchCount} batches`);

    // Commit Excel file
    console.log('💾 Committing Excel file...');
    worksheet.commit();
    await workbook.commit();

    const name = capitalizeName(first_name);

    // OPTIMIZATION 5: Optimized S3 upload
    console.log('☁  Uploading to S3...');
    const stats = fs.statSync(filePath);
    const bytes = 10 * 1024 * 1024; // 10MB chunks
    const numberParts = Math.ceil(stats.size / bytes);

    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: filename,
        ACL: 'public-read',
      })
    );

    uploadId = multipartUpload.UploadId;
    const uploadPromises = [];

    // Process upload parts in parallel
    for (let part = 0; part < numberParts; part += 1) {
      const startPosition = part * bytes;
      const chunk = await readChunk(filePath, {
        length: bytes,
        startPosition,
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

    // Send email notification
    console.log('📧 Sending email notification...');
    const url = `https://arquivos-mango5.s3.sa-east-1.amazonaws.com/${filename}`;
    console.log('url do arquivo -> ', url);
    const emailTemplate = attachmentMessage(name, url);

    await new ImprovedMailService({
      userName: MAILJET_USERNAME,
      password: MAILJET_PASSWORD,
      emailSender: MAILJET_EMAIL_SENDER,
      templateID: MAILJET_TEMPLATE_ID,
    }).sendMail({
      subject: 'Sua planilha de vendas está pronta.',
      toAddress: [
        {
          Email: email,
          Name: name,
        },
      ],
      variables: emailTemplate,
    });

    // Cleanup
    fs.unlinkSync(filePath);

    const totalTime = Date.now() - startTime;
    console.log(`🎉 Export completed successfully in ${(totalTime / 1000).toFixed(2)}s`);
    console.log(
      `📊 Performance: ${(totalProcessed / (totalTime / 1000)).toFixed(0)} records/second`
    );
  } catch (error) {
    console.error('❌ Export failed:', error);
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
};

handler();
