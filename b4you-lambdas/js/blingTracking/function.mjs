import { Sales } from './database/models/Sales.mjs';
import { Plugins } from './database/models/Plugins.mjs';
import { Integration_notifications } from './database/models/Integration_notifications.mjs';
import { Database } from './database/sequelize.mjs';
import { Op, Sequelize } from 'sequelize';
import { Sales_items } from './database/models/Sales_items.mjs';
import { trackingEmail, trackingEmailCompany } from './email/messages.mjs';
import { MailService } from './services/MailService.mjs';
import { BlingV3 } from './services/BlingShippingV3.mjs';
import aws from './queues/aws.mjs';

const TYPE_BLING_TRACKING_V3 = 16;
const BLING_NOTIFY_TYPE = 2

const capitalizeName = (name) => {
  if (!name) return '';
  name = name
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

  const PreposM = ['Da', 'De', 'Do', 'Das', 'Dos', 'A', 'E'];
  const prepos = ['da', 'de', 'do', 'das', 'dos', 'a', 'e'];

  for (let i = PreposM.length - 1; i >= 0; i -= 1) {
    name = name.replace(
      RegExp(
        `\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`,
        'g'
      ),
      prepos[i]
    );
  }

  return name;
};

const formatDate = (date) => {
  const d = new Date(date);

  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();

  const horas = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const seg = String(d.getSeconds()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${min}:${seg}`;
}



const findIntegrationsV3 = async () => {
  const bling = await Plugins.findAll({
    raw: true,
    where: {
      active: true,
      id_plugin: TYPE_BLING_TRACKING_V3,
    },
  });
  return bling;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


const logWithContext = (idUser, idSale, message, date = null, ...args) => {
  let prefix = `[id_user: ${idUser || 'N/A'}, id_sale: ${idSale || 'N/A'}`;

  if (date) {
    const dateToFormat = date instanceof Date ? date : new Date(date);
    prefix += `, data_pedido: ${formatDate(dateToFormat)}`;
  }

  prefix += ']';
  console.log(`${prefix} ${message}`, ...args);
};

export const handler = async () => {
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
    MAILJET_USERNAME,
    MAILJET_PASSWORD,
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

  const Mail = new MailService({
    userName: MAILJET_USERNAME,
    password: MAILJET_PASSWORD,
    emailSender: 'naoresponda@b4you.com.br',
    templateID: '3501751',
  });

  console.log('INICIANDO V3');

  let lastBlingApiRequestTime = 0;
  const sentEmails = [];


  const waitForRateLimit = async (context = '') => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastBlingApiRequestTime;
    if (timeSinceLastRequest < 2000 && lastBlingApiRequestTime > 0) {
      const waitTime = 2000 - timeSinceLastRequest;
      if (context) {
        console.log(`${context} Aguardando ${waitTime}ms para respeitar rate limit da API Bling...`);
      } else {
        console.log(`Aguardando ${waitTime}ms para respeitar rate limit da API Bling...`);
      }
      await delay(waitTime);
    }
  };

  try {
    const pluginsV3 = await findIntegrationsV3();
    if (pluginsV3.length > 0) {
      for await (const p of pluginsV3) {
        console.log(`[id_user: ${p.id_user}, plugin_id: ${p.id}] Iniciando processamento do plugin`);
        if (!p.settings.refresh_token || !p.settings.access_token) {
          console.log(`[id_user: ${p.id_user}, plugin_id: ${p.id}] Plugin sem autenticação de API`);
          // await Plugins.update({ active: 0 }, {
          //   where: {
          //     id: p.id,
          //   },
          // })
          // await Integration_notifications.create({
          //   id_user: p.id_user,
          //   id_type: BLING_NOTIFY_TYPE,
          //   read: false,
          //   params: {
          //     message: "Credencias bling inválidas/expiradas",
          //     action: "Atualize suas credenciais no painel da B4you em de Apps -> Bling"
          //   }
          // })
          continue;
        }
        const blingV3 = new BlingV3(
          p.settings.refresh_token,
          p.settings.access_token
        );

        try {
          await waitForRateLimit();
          const isValid = await blingV3.verifyCredentials();
          lastBlingApiRequestTime = Date.now();

          if (!isValid) {
            await waitForRateLimit();
            const tokenResponse = await blingV3.refreshToken();
            lastBlingApiRequestTime = Date.now();

            if (!tokenResponse || !tokenResponse.refresh_token || !tokenResponse.access_token) {
              console.log(
                `[id_user: ${p.id_user}, plugin_id: ${p.id}] Erro: refresh token retornou valores inválidos`,
                tokenResponse
              );
              continue;
            }

            const { refresh_token, access_token } = tokenResponse;
            console.log(
              `[id_user: ${p.id_user}, plugin_id: ${p.id}] Realizando refresh token - refresh_token: ${refresh_token ? 'OK' : 'NULL'}, access_token: ${access_token ? 'OK' : 'NULL'}`
            );

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
          lastBlingApiRequestTime = Date.now();
          if (error && error.response && error.response.data) {
            console.log(
              `[id_user: ${p.id_user}, plugin_id: ${p.id}] Erro na integração Bling V3 (dados):`,
              error.response.data
            );
            // if (error.response.data.error.type === "invalid_grant") {
            //   console.log(`[id_user: ${p.id_user}, plugin_id: ${p.id}] Desabilitando plugin devido a invalid_grant`)
            //   await Plugins.update({ active: 0 }, {
            //     where: {
            //       id: p.id,
            //     },
            //   })
            // }
          } else if (error && error.response) {
            console.log(
              `[id_user: ${p.id_user}, plugin_id: ${p.id}] Erro na integração Bling V3 (response):`,
              error.response
            );
          } else {
            console.log(
              `[id_user: ${p.id_user}, plugin_id: ${p.id}] Erro na integração Bling V3:`,
              error
            );
          }
          await delay(2000);
          continue;
        }
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
        const sales = await Sales.findAll({
          nest: true,
          limit: 10000,
          attributes: [
            'id',
            'id_user',
            'id_order_bling',
            'email',
            'full_name',
            'document_number',
            'created_at'
          ],
          where: {
            [Op.and]: [
              { id_order_bling: { [Op.ne]: null } },
              Sequelize.literal("LENGTH(id_order_bling) > 4")
            ],
            created_at: {
              [Op.gte]: fifteenDaysAgo,
            },
            id_user: p.id_user,
          },
          order: [['id', 'asc']],
          include: [
            {
              association: 'sales_items',
              attributes: ['id', 'id_product'],
              where: {
                tracking_code: null,
                tracking_url: null,
                id_status: 2,
              },
            },
          ],
        });
        if (sales.length === 0) continue;
        console.log(`[id_user: ${p.id_user}, plugin_id: ${p.id}] Processando ${sales.length} pedidos`);
        for await (const sale of sales) {
          try {
            const contextPrefix = `[id_user: ${sale.id_user}, id_sale: ${sale.id}]`;
            await waitForRateLimit(contextPrefix);
            let response = null;
            try {
              logWithContext(
                sale.id_user,
                sale.id,
                `Buscando pedido v3: ${sale.id_order_bling}`,
                sale.created_at
              );
              response = await blingV3.getOrder(sale.id_order_bling);
              lastBlingApiRequestTime = Date.now();
              logWithContext(
                sale.id_user,
                sale.id,
                `Pedido ${sale.id_order_bling} processado com sucesso`,
                sale.created_at
              );
            } catch (error) {
              lastBlingApiRequestTime = Date.now();
              logWithContext(
                sale.id_user,
                sale.id,
                `Erro ao buscar pedido v3: ${sale.id_order_bling}`,
                sale.created_at
              );

              if (error && error.response) {
                if (error.response.data) {
                  logWithContext(
                    sale.id_user,
                    sale.id,
                    'Erro detalhado v3:',
                    sale.created_at,
                    JSON.stringify(error.response.data)
                  );
                  // pedido ta como cancelado na bling (provavel cancelado manualmente pela empresa)
                  if (error.response.data.error.description === "O recurso requisitado não foi encontrado. Verifique se o endpoint solicitado está correto ou se o ID informado realmente existe no sistema.") {
                    logWithContext(
                      sale.id_user,
                      sale.id,
                      `Marcando como venda sem codigo de rastreio, devido a status no bling ser diferente de pago. id_order_bling: ${sale.id_order_bling}`,
                      sale.created_at
                    );
                    await Sales_items.update({ tracking_code: "-", tracking_url: "-" }, {
                      where: {
                        id_sale: sale.id
                      }
                    })
                    continue
                  }
                }
              } else {
                logWithContext(
                  sale.id_user,
                  sale.id,
                  'Erro global v3:',
                  sale.created_at,
                  error
                );
              }
              await delay(2000);
              continue;
            }

            if (!response) {
              logWithContext(
                sale.id_user,
                sale.id,
                `Pedido não encontrado v3. id_order_bling: ${sale.id_order_bling}`,
                sale.created_at
              );
              continue;
            }
            const {
              id: id_pedido_bling,
              transporte: { volumes, contato = null },
            } = response;
            if (volumes.length === 0) {
              logWithContext(
                sale.id_user,
                sale.id,
                `Pedido sem volume cadastrado v3. id_order_bling: ${sale.id_order_bling}`,
                sale.created_at
              );
              continue;
            }
            const rawSale = sale.toJSON();
            let { servico, codigoRastreamento } = volumes[0];
            let url = 'nao informado';
            logWithContext(
              sale.id_user,
              sale.id,
              `Contato transportadora:`,
              sale.created_at,
              contato ? contato.nome : 'N/A'
            );
            if (contato && contato.nome === 'J&T EXPRESS BRAZIL LTDA') {
              url = `https://www.jtexpress.com.br/trajectoryQuery?waybillNo=${id_pedido_bling}&type=0&cpf=${rawSale.document_number}`;
              logWithContext(sale.id_user, sale.id, `URL J&T: ${url}`, sale.created_at);
            }
            if (contato && contato.nome === 'FM TRANSPORTES') {
              url = `https://rastreio.alfatracking.com.br/#/`;
              logWithContext(sale.id_user, sale.id, `URL FM: ${url}`, sale.created_at);
            }
            if (rawSale.id_user === 1361) {
              url = 'https://melhorrastreio.com.br/';
            }



            logWithContext(
              sale.id_user,
              sale.id,
              `Código rastreamento: ${codigoRastreamento || 'N/A'}, Serviço: ${servico || 'N/A'}`,
              sale.created_at
            );
            if (codigoRastreamento && servico) {
              if (rawSale.id_user === 456269) {
                url = 'https://totalconecta.totalexpress.com.br/rastreamento'
                servico = "Total Express"
              }
              // felipemorenopro@gmail.com
              if (rawSale.id_user === 109396) {
                url = 'https://rastreio.fmtransportes.com.br/';
                servico = "FM Transportes"
              }
              logWithContext(
                sale.id_user,
                sale.id,
                `Atualizando rastreio - Serviço: ${servico}, Código: ${codigoRastreamento}`,
                sale.created_at
              );
              logWithContext(
                sale.id_user,
                sale.id,
                `Disparando email para ${rawSale.email} (${rawSale.full_name}) - Código: ${codigoRastreamento}, Serviço: ${servico}`,
                sale.created_at
              );
              let promises = [];
              for (const saleItem of sale.sales_items) {
                promises.push(
                  Sales_items.update(
                    {
                      tracking_url: url,
                      tracking_code: codigoRastreamento,
                      tracking_company: servico,
                    },
                    { where: { id: saleItem.id } }
                  )
                );
                promises.push(
                  aws.add('webhookEvent', {
                    id_product: saleItem.id_product,
                    id_sale_item: saleItem.id,
                    id_user: sale.id_user,
                    id_event: 11, // tracking
                  })
                );
              }
              await Promise.all(promises);
              if (url === 'nao informado') {
                logWithContext(
                  sale.id_user,
                  sale.id,
                  'Enviando email sem URL de rastreio',
                  sale.created_at
                );
                await Mail.sendMail({
                  subject: 'Código de rastreio atualizado',
                  toAddress: [
                    {
                      Email: rawSale.email,
                      Name: capitalizeName(rawSale.full_name),
                    },
                  ],
                  variables: trackingEmailCompany(
                    capitalizeName(rawSale.full_name),
                    codigoRastreamento,
                    servico
                  ),
                });
                sentEmails.push(rawSale.email);
                logWithContext(
                  sale.id_user,
                  sale.id,
                  'Email enviado com sucesso (sem URL)',
                  sale.created_at
                );
              } else {
                logWithContext(
                  sale.id_user,
                  sale.id,
                  `Enviando email com URL de rastreio: ${url}`,
                  sale.created_at
                );
                await Mail.sendMail({
                  subject: 'Código de rastreio atualizado',
                  toAddress: [
                    {
                      Email: rawSale.email,
                      Name: capitalizeName(rawSale.full_name),
                    },
                  ],
                  variables: trackingEmail(
                    capitalizeName(rawSale.full_name),
                    codigoRastreamento,
                    url
                  ),
                });
                sentEmails.push(rawSale.email);
                logWithContext(
                  sale.id_user,
                  sale.id,
                  'Email enviado com sucesso (com URL)',
                  sale.created_at
                );
              }
            }
          } catch (error) {
            logWithContext(
              sale.id_user,
              sale.id,
              'ERRO no processamento da venda',
              sale.created_at
            );
            if (error && error.response && error.response.data) {
              logWithContext(
                sale.id_user,
                sale.id,
                'Detalhes do erro:',
                sale.created_at,
                error.response.data
              );
            } else if (error && error.response) {
              logWithContext(
                sale.id_user,
                sale.id,
                'Erro na resposta:',
                sale.created_at,
                error.response
              );
            } else {
              logWithContext(
                sale.id_user,
                sale.id,
                'Erro:',
                sale.created_at,
                error
              );
            }
          }
        }
      }
    }
  } catch (error) {
    if (error && error.response && error.response.data) {
      console.log(error.response.data);
    } else if (error && error.response) {
      console.log(error.response);
    } else {
      console.log(error);
    }
  }

  // Resumo de emails enviados
  const totalEmailsSent = sentEmails.length;
  const uniqueEmails = [...new Set(sentEmails)];
  console.log('\n========== RESUMO DE EMAILS ENVIADOS ==========');
  console.log(`Total de emails enviados: ${totalEmailsSent}`);
  console.log(`Total de emails únicos: ${uniqueEmails.length}`);
  if (uniqueEmails.length > 0) {
    console.log('Emails enviados:');
    uniqueEmails.forEach((email, index) => {
      const count = sentEmails.filter(e => e === email).length;
      console.log(`  ${index + 1}. ${email}${count > 1 ? ` (${count} envios)` : ''}`);
    });
  } else {
    console.log('Nenhum email foi enviado nesta execução.');
  }
  console.log('===============================================\n');

  await database.closeConnection();
  console.log('FINALIZADO V3');

  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};
handler()