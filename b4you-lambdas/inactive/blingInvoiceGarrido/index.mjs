import { Sales } from './database/models/Sales.mjs';
import { Plugins } from './database/models/Plugins.mjs';
import { Database } from './database/sequelize.mjs';
import { BlingV3 } from './services/BlingShippingV3.mjs';
import { date as DateHelper } from './utils/date.mjs';
import { capitalizeName } from './utils/formatters.mjs';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
const url = 'https://flow.r2-d1.codgital.site/webhook/bling-bluue';
const TYPE_BLING_TRACKING_V3 = 16;

const findIntegrationsV3 = async () => {
  const bling = await Plugins.findAll({
    raw: true,
    where: {
      id_user: 94277,
      active: true,
      id_plugin: TYPE_BLING_TRACKING_V3,
    },
  });
  return bling;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const handler = async () => {
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT ,
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

  console.log('(GARRIDO) -> INICIANDO BLING INVOICES NFE ');
  try {
    const pluginsV3 = await findIntegrationsV3();
    if (pluginsV3.length > 0) {
      for await (const p of pluginsV3) {
        if (!p.settings.refresh_token || !p.settings.access_token) {
          console.log(`bling id ${p.id} sem autenticação de API`);
          continue;
        }
        const blingV3 = new BlingV3(p.settings.refresh_token, p.settings.access_token);

        try {
          if (!(await blingV3.verifyCredentials())) {
            const { refresh_token, access_token } = await blingV3.refreshToken();

            await Plugins.update(
              {
                settings: {
                  ...p.settings,
                  refresh_token,
                  access_token,
                },
              },
              {
                where: {
                  id: p.id,
                },
              }
            );
          }
        } catch (error) {
          console.log(
            `error on integration bling v3 integration id:  ${p.id} ->`,
            error?.response?.data
          );
        }

        const sales = await Sales.findAll({
          nest: true,
          limit: 20,
          where: {
            id_bling_invoice: null,
            id_user: p.id_user,
          },
          order: [['id', 'asc']],
          include: [{ association: 'sales_items',where:{id_status:2}, include: [{ association: 'offer' }] }],
        });
        console.log('quantidade de pedidos -> ', sales.length);
        if (sales.length === 0) continue;
        console.log(`id plugin`, p.id);

        for await (const sale of sales) {
          try {
            try {
              await delay(1000);
              const body = {
                dataEmissao: DateHelper(sale.created_at).format('YYYY-MM-DD'),
                contato: {
                  nome: capitalizeName(sale.full_name.trimEnd()),
                  numeroDocumento: sale.document_number,
                  email: sale.email,
                  telefone: sale.whatsapp,
                  endereco: {
                    endereco: sale.address.street.trimEnd(),
                    numero: sale.address.number,
                    complemento: sale.address.complement.trimEnd().substring(0, 29),
                    bairro: sale.address.neighborhood.trimEnd(),
                    cep: sale.address.zipcode,
                    municipio: sale.address.city.trimEnd(),
                    uf: sale.address.state,
                  },
                },
                data: DateHelper(sale.created_at).format('YYYY-MM-DD'),
                servicos: sale.sales_items.map((element) => ({
                  codigo: '03158',
                  descricao: element.offer.name.trimEnd(),
                  valor: element.price_product,
                })),
              };
              console.log(body);
              const response = await blingV3.generateServiceInvoice(body);
              console.log('Response invoice->', response);

              if (response && response.id) {
                console.log('atualizando com sale id', response.id);
                await Sales.update({ id_bling_invoice: response.id }, { where: { id: sale.id } });
              }
              const responseInvoice = await blingV3.confirmInvoice(response.id);
              const bodyWebhook = {
                invoice: responseInvoice,
                uuid_sale: sale.uuid,
                bling: response,
              };
              console.log('BODY WEB', bodyWebhook);
              try {
                const response = await axios.post(url, bodyWebhook, {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                console.log('Resposta:', response.data);
                try {
                  const filePath = path.join('./tmp', `${sale.id}.txt`);
                  const fileContent = `BODY WEBHOOK:\n${JSON.stringify(
                    bodyWebhook,
                    null,
                    2
                  )}\n\nRESPOSTA:\n${JSON.stringify(response.data, null, 2)}\n`;

                  fs.writeFileSync(filePath, fileContent, 'utf8');
                } catch (error) {
                  console.log('error on create file', error);
                }
              } catch (error) {
                console.error('Erro ao enviar POST:', error.response?.data || error.message);
              }
            } catch (error) {
              console.log('erro ao enviar nf -> ', sale.id_order_bling);

              if (error && error.response) {
                if (error.response.data) {
                  console.log('Erro detalhado v3', JSON.stringify(error.response.data));
                }
              } else {
                console.log('error 09: ', error);
              }
              continue;
            }
          } catch (error) {
            console.log('ERROR INSIDE LOOP');
            console.log(error);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  await database.closeConnection();
  console.log('FINALIZADO');

  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};

