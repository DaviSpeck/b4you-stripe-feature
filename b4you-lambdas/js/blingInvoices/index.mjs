import { Sales } from './database/models/Sales.mjs';
import { Plugins } from './database/models/Plugins.mjs';
import { Database } from './database/sequelize.mjs';
import { Op, literal, Sequelize } from 'sequelize';
import { BlingV3 } from './services/BlingShippingV3.mjs';
import { date as DateHelper } from './utils/date.mjs';

const TYPE_BLING_TRACKING_V3 = 16;

const findIntegrationsV3 = async () => {
  const bling = await Plugins.findAll({
    raw: true,
    where: {
      active: true,
      id_plugin: TYPE_BLING_TRACKING_V3,
      [Op.or]: [
        literal("JSON_UNQUOTE(JSON_EXTRACT(settings, '$.issue_invoice')) = 1"),
        literal("JSON_UNQUOTE(JSON_EXTRACT(settings, '$.issue_invoice')) = 2"),
      ],
    },
  });
  return bling;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const handler = async () => {
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

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

  console.log('INICIANDO BLING INVOICES NFE');
  try {
    const pluginsV3 = await findIntegrationsV3();
    const pluginsWarranty = pluginsV3.filter((p) => p.settings.issue_invoice === 1);
    const pluginsApproved = pluginsV3.filter((p) => p.settings.issue_invoice === 2);
    console.log(pluginsApproved.length);
    console.log(pluginsWarranty.length);

    console.log('(START) -> PEDIDOS COM CONFIGURAÇÃO APÓS PAGAMENTO APROVADO');
    if (pluginsApproved.length > 0) {
      for await (const p of pluginsApproved) {
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
          limit: 300,
          attributes: ['id', 'id_user', 'id_order_bling', 'id_bling_invoice'],
          where: {
            id_bling_invoice: null,
            [Op.and]: [
              { id_order_bling: { [Op.ne]: null } },
              Sequelize.literal('LENGTH(id_order_bling) > 4'),
            ],
            created_at: {
              [Op.gte]: '2025-12-01 00:00:00',
            },
            id_user: p.id_user,
          },
          order: [['id', 'asc']],
        });
        console.log('quantidade de pedidos -> ', sales.length);
        if (sales.length === 0) continue;
        console.log(`id plugin`, p.id);

        for await (const sale of sales) {
          try {
            try {
              await delay(1000);
              const response = await blingV3.generateInvoice(sale.id_order_bling);

              if (response && response.idNotaFiscal) {
                await Sales.update(
                  { id_bling_invoice: response.idNotaFiscal },
                  { where: { id: sale.id } }
                );
              }
            } catch (error) {
              console.log('erro ao enviar nf -> ', sale.id_order_bling);

              if (error && error.response) {
                if (error.response.data) {
                  console.log('Erro detalhado v3', JSON.stringify(error.response.data));
                  const fields = error.response.data?.error?.fields;
                  if (Array.isArray(fields)) {
                    const erroCancelado = fields.find(
                      (field) =>
                        field.msg ===
                        'O pedido de venda está cancelado ou a situação personalizada é baseada no cancelamento.'
                    );

                    if (erroCancelado) {
                      console.log('pedido de venda cancelado');
                      await Sales.update({ id_bling_invoice: '0000' }, { where: { id: sale.id } });
                    }
                  }
                  if (
                    error.response.data.error.description ===
                    'O recurso requisitado não foi encontrado. Verifique se o endpoint solicitado está correto ou se o ID informado realmente existe no sistema.'
                  ) {
                    await Sales.update({ id_bling_invoice: '0000' }, { where: { id: sale.id } });
                  }
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
    console.log('(END) -> PEDIDOS COM CONFIGURAÇÃO APÓS PAGAMENTO APROVADO');

    // console.log('(START) -> PEDIDOS COM CONFIGURAÇÃO APÓS GARANTIA');
    // if (pluginsWarranty.length > 0) {
    //   for await (const p of pluginsWarranty) {
    //     if (!p.settings.refresh_token || !p.settings.access_token) {
    //       console.log(`bling id ${p.id} sem autenticação de API`);
    //       continue;
    //     }
    //     const blingV3 = new BlingV3(p.settings.refresh_token, p.settings.access_token);

    //     try {
    //       if (!(await blingV3.verifyCredentials())) {
    //         const { refresh_token, access_token } = await blingV3.refreshToken();

    //         await Plugins.update(
    //           {
    //             settings: {
    //               ...p.settings,
    //               refresh_token,
    //               access_token,
    //             },
    //           },
    //           {
    //             where: {
    //               id: p.id,
    //             },
    //           }
    //         );
    //       }
    //     } catch (error) {
    //       console.log(
    //         `error on integration bling v3 integration id:  ${p.id} ->`,
    //         error?.response?.data
    //       );
    //     }
    //     const sales = await Sales.findAll({
    //       nest: true,
    //       limit: 100,
    //       attributes: ['id', 'id_user', 'id_order_bling'],
    //       where: {
    //         id_bling_invoice: null,
    //         created_at: {
    //           [Op.gte]: '2025-03-15 00:00',
    //         },
    //         id_user: p.id_user,
    //       },
    //       order: [['id', 'asc']],
    //       include: [{ association: 'sales_items', attributes: ['valid_refund_until'] }],
    //     });
    //     if (sales.length === 0) continue;
    //     console.log(`id plugin`, p.id);
    //     console.log('quantidade de pedidos em garantia-> ', sales.length);
    //     for await (const sale of sales) {
    //       try {
    //         try {
    //           await delay(1000);
    //           if (DateHelper(sale.sales_items[0].valid_refund_until).diff(DateHelper(), 'd') <= 0) {
    //             const response = await blingV3.generateInvoice(sale.id_order_bling);
    //             console.log('response', response);
    //             if (response && response.idNotaFiscal) {
    //               await Sales.update(
    //                 { id_bling_invoice: response.data.idNotaFiscal },
    //                 { where: { id: sale.id } }
    //               );
    //             }
    //           } else {
    //             console.log('esse nao vai ser emitido', sale.id);
    //           }
    //         } catch (error) {
    //           console.log(error);
    //           console.log('erro ao enviar nf -> ', sale.id_order_bling);
    //           if (error && error.response) {
    //             if (error.response.data) {
    //               console.log('Erro detalhado v3', JSON.stringify(error.response.data));
    //             }
    //           }
    //           continue;
    //         }
    //       } catch (error) {
    //         console.log('ERROR INSIDE LOOP');
    //         console.log(error);
    //       }
    //     }
    //   }
    // }
    // console.log('(END) -> PEDIDOS COM CONFIGURAÇÃO APÓS GARANTIA');
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
