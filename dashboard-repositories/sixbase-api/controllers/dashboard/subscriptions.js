const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const SQS = require('../../queues/aws');
const ApiError = require('../../error/ApiError');
const SerializeSubscriptions = require('../../presentation/dashboard/subscriptions');
const SerializeChargesSubscriptions = require('../../presentation/dashboard/subscriptionsCharges');
const dateHelper = require('../../utils/helpers/date');
const { findRulesTypesByKey } = require('../../types/integrationRulesTypes');
const {
  DATABASE_DATE,
  FRONTEND_DATE_WITHOUT_TIME,
} = require('../../types/dateTypes');
const {
  subscriptionStatus,
  findSubscriptionStatus,
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');
const { paymentMethods } = require('../../types/paymentMethods');
const {
  findSubscriptionCharge,
  updateSubscription,
  findAllSubscriptionsFiltered,
  findAllSubscriptionsFilteredExport,
} = require('../../database/controllers/subscriptions');
const {
  deleteStudentProduct,
} = require('../../database/controllers/student_products');
const { findProducstWithPlan } = require('../../database/controllers/products');
const Sales_items = require('../../database/models/Sales_items');
const Sales = require('../../database/models/Sales');
const SubscriptionsModel = require('../../database/models/Subscriptions');
const Product_plans = require('../../database/models/Product_plans');
const Charges = require('../../database/models/Charges');
const { capitalizeName, formatBRL } = require('../../utils/formatters');
const CardUpdateLink = require('../../services/email/student/cardUpdateLink');
const StudentCanceledSubscriptionByProducer = require('../../services/email/StudentCanceledSubscriptionByProducer');
const { findChargeStatusByKey } = require('../../status/chargeStatus');
const redis = require('../../config/redis');
const ChargeSubscriptionUseCase = require('../../useCases/subscriptions/ChargeSubscriptionUseCase');

const formatQuery = ({
  end_date,
  input,
  page = 0,
  plan_uuid,
  product_uuid,
  size = 10,
  start_date,
  status,
  next_charge = false,
  payment_method,
  cancellation_type,
}) => {
  const where = { page, size };
  if (status && status !== 'all') {
    where.id_status = status
      .split(',')
      .map((element) => findSubscriptionStatusByKey(element).id);
  }
  if (product_uuid && product_uuid !== 'all') where.product_uuid = product_uuid;
  if (input) where.input = input;
  if (plan_uuid && plan_uuid !== 'all') where.plan_uuid = plan_uuid;
  if (payment_method && payment_method !== 'all') {
    where.payment_method = payment_method;
  }
  if (start_date && end_date) {
    where.start_date = start_date;
    where.end_date = end_date;
  }
  where.next_charge = next_charge;

  if (cancellation_type && cancellation_type !== 'all') {
    where.cancellation_type = cancellation_type;
  }

  return where;
};

const findSubscriptionsPaginatedController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  try {
    const where = formatQuery(query);
    where.id_user = id_user;
    const subscriptions = await findAllSubscriptionsFiltered(where);

    const today = dateHelper().format('YYYY-MM-DD');
    const paidChargeStatus = findChargeStatusByKey('paid');

    const subscriptionsWithCanReprocess = await Promise.all(
      subscriptions.rows.map(async (subscription) => {
        const subscriptionId = subscription.id || subscription.dataValues?.id;

        if (!subscriptionId) {
          subscription.can_reprocess = false;
          return subscription;
        }

        const nextChargeDate = dateHelper(subscription.next_charge).format(
          'YYYY-MM-DD',
        );
        const isAfterDueDate = !dateHelper(today).isBefore(nextChargeDate);

        if (!isAfterDueDate) {
          subscription.can_reprocess = false;
          return subscription;
        }

        let paidChargesCount = await Charges.count({
          where: {
            id_subscription: subscriptionId,
            id_status: paidChargeStatus.id,
          },
        });

        if (paidChargesCount === 0) {
          const paidSalesItems = await Sales_items.findAll({
            raw: true,
            nest: true,
            where: { id_subscription: subscriptionId },
            attributes: ['id'],
            include: [
              {
                association: 'charges',
                attributes: ['id'],
                where: {
                  id_status: paidChargeStatus.id,
                },
                required: true,
              },
            ],
          });
          paidChargesCount = paidSalesItems.length;
        }

        subscription.can_reprocess = paidChargesCount > 0;
        return subscription;
      }),
    );

    return res.status(200).send({
      count: subscriptions.count,
      rows: new SerializeSubscriptions(subscriptionsWithCanReprocess).adapt(),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const findSubscriptionsMetricsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const now = dateHelper().utc();
    const startOfMonth = now.clone().startOf('month');
    const endOfMonth = now.clone().endOf('month');
    const startOfLastMonth = now.clone().subtract(1, 'month').startOf('month');
    const endOfLastMonth = now.clone().subtract(1, 'month').endOf('month');
    const next7Days = now.clone().add(7, 'days');
    const next30Days = now.clone().add(30, 'days');

    const activeSubscriptions = await SubscriptionsModel.findAll({
      where: {
        id_user,
        active: true,
        id_status: findSubscriptionStatusByKey('active').id,
      },
      include: [
        {
          model: Product_plans,
          as: 'plan',
          paranoid: false,
        },
      ],
    });

    const activeLastMonth = await SubscriptionsModel.count({
      where: {
        id_user,
        active: true,
        id_status: findSubscriptionStatusByKey('active').id,
        created_at: {
          [Op.between]: [
            startOfLastMonth.format(DATABASE_DATE),
            endOfLastMonth.format(DATABASE_DATE),
          ],
        },
      },
    });

    const activeCurrentMonth = await SubscriptionsModel.count({
      where: {
        id_user,
        active: true,
        id_status: findSubscriptionStatusByKey('active').id,
        created_at: {
          [Op.between]: [
            startOfMonth.format(DATABASE_DATE),
            endOfMonth.format(DATABASE_DATE),
          ],
        },
      },
    });

    const activeTotal = activeSubscriptions.length;
    let activeVariation = 0;
    if (activeLastMonth > 0) {
      activeVariation =
        ((activeCurrentMonth - activeLastMonth) / activeLastMonth) * 100;
    } else if (activeCurrentMonth > 0) {
      activeVariation = 100;
    }

    const renewingNext7Days = await SubscriptionsModel.count({
      where: {
        id_user,
        active: true,
        id_status: findSubscriptionStatusByKey('active').id,
        next_charge: {
          [Op.between]: [
            now.format('YYYY-MM-DD'),
            next7Days.format('YYYY-MM-DD'),
          ],
        },
      },
    });

    const renewingNext30Days = await SubscriptionsModel.count({
      where: {
        id_user,
        active: true,
        id_status: findSubscriptionStatusByKey('active').id,
        next_charge: {
          [Op.between]: [
            now.format('YYYY-MM-DD'),
            next30Days.format('YYYY-MM-DD'),
          ],
        },
      },
    });

    const planDistribution = {
      mensal: { count: 0, revenue: 0 },
      bimestral: { count: 0, revenue: 0 },
      trimestral: { count: 0, revenue: 0 },
      semestral: { count: 0, revenue: 0 },
      anual: { count: 0, revenue: 0 },
    };

    activeSubscriptions.forEach((sub) => {
      const frequency = sub.plan?.frequency_label?.toLowerCase() || '';
      const planPrice = parseFloat(sub.plan?.price || 0);
      let planType = 'mensal';

      if (frequency.includes('bimestral') || frequency === '2 meses') {
        planType = 'bimestral';
      } else if (frequency.includes('trimestral') || frequency === '3 meses') {
        planType = 'trimestral';
      } else if (frequency.includes('semestral') || frequency === '6 meses') {
        planType = 'semestral';
      } else if (
        frequency.includes('anual') ||
        frequency === '12 meses' ||
        frequency.includes('ano')
      ) {
        planType = 'anual';
      }

      planDistribution[planType].count += 1;
      planDistribution[planType].revenue += planPrice;
    });

    const totalPlans = Object.values(planDistribution).reduce(
      (a, b) => a + b.count,
      0,
    );

    const totalRevenue = Object.values(planDistribution).reduce(
      (a, b) => a + b.revenue,
      0,
    );

    const planDistributionWithPercentage = Object.entries(planDistribution)
      .filter(([, data]) => data.count > 0)
      .map(([type, data]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: data.count,
        revenue: parseFloat(data.revenue.toFixed(2)),
        percentage:
          totalPlans > 0
            ? parseFloat(((data.count / totalPlans) * 100).toFixed(1))
            : 0,
        revenue_percentage:
          totalRevenue > 0
            ? parseFloat(((data.revenue / totalRevenue) * 100).toFixed(1))
            : 0,
      }));

    const canceledThisMonth = await SubscriptionsModel.count({
      where: {
        id_user,
        id_status: {
          [Op.in]: [
            findSubscriptionStatusByKey('warning').id,
            findSubscriptionStatusByKey('canceled').id,
          ],
        },
        canceled_at: {
          [Op.between]: [
            startOfMonth.format(DATABASE_DATE),
            endOfMonth.format(DATABASE_DATE),
          ],
        },
      },
    });

    const involuntaryChurn = await SubscriptionsModel.count({
      where: {
        id_user,
        id_status: {
          [Op.in]: [
            findSubscriptionStatusByKey('warning').id,
            findSubscriptionStatusByKey('canceled').id,
          ],
        },
        canceled_at: {
          [Op.between]: [
            startOfMonth.format(DATABASE_DATE),
            endOfMonth.format(DATABASE_DATE),
          ],
        },
        attempt_count: {
          [Op.gte]: 4,
        },
      },
    });

    const voluntaryChurn = await SubscriptionsModel.count({
      where: {
        id_user,
        id_status: findSubscriptionStatusByKey('canceled').id,
        canceled_at: {
          [Op.between]: [
            startOfMonth.format(DATABASE_DATE),
            endOfMonth.format(DATABASE_DATE),
          ],
        },
        [Op.or]: [{ attempt_count: 0 }, { attempt_count: null }],
      },
    });
    const activeAtStartOfMonth = await SubscriptionsModel.count({
      where: {
        id_user,
        active: true,
        id_status: findSubscriptionStatusByKey('active').id,
        created_at: {
          [Op.lt]: startOfMonth.format(DATABASE_DATE),
        },
      },
    });

    const churnRate =
      activeAtStartOfMonth > 0
        ? parseFloat(
            ((canceledThisMonth / activeAtStartOfMonth) * 100).toFixed(2),
          )
        : 0;

    const salesItemsThisMonth = await Sales_items.findAll({
      where: {
        id_status: 2,
        paid_at: {
          [Op.between]: [
            startOfMonth.format(DATABASE_DATE),
            endOfMonth.format(DATABASE_DATE),
          ],
        },
        id_subscription: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: Sales,
          as: 'sale',
          where: {
            id_user,
          },
          attributes: [],
          required: true,
        },
      ],
      attributes: ['price_base'],
    });

    const monthlyRevenue = salesItemsThisMonth.reduce((acc, item) => {
      const price = item.get ? item.get('price_base') : item.price_base;
      return acc + parseFloat(price || 0);
    }, 0);

    return res.status(200).send({
      activeSubscriptions: {
        total: activeTotal,
        variation: parseFloat(activeVariation.toFixed(2)),
        currentMonth: activeCurrentMonth,
        lastMonth: activeLastMonth,
      },
      renewing: {
        next7Days: renewingNext7Days,
        next30Days: renewingNext30Days,
      },
      planDistribution: planDistributionWithPercentage,
      churn: {
        total: canceledThisMonth,
        rate: churnRate,
        voluntary: voluntaryChurn,
        involuntary: involuntaryChurn,
      },
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const findSubscriptionChargesPaginatedController = async (req, res, next) => {
  const {
    params: { subscription_uuid: uuid },
    user: { id: id_user },
  } = req;
  try {
    const subscription = await findSubscriptionCharge({ uuid, id_user });
    if (!subscription)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Assinatura não encontrada',
        }),
      );

    const salesItems = await Sales_items.findAll({
      raw: true,
      nest: true,
      where: { id_subscription: subscription.id },
      attributes: ['id', 'uuid'],
      include: [
        {
          association: 'charges',
          attributes: [
            'uuid',
            'price',
            'created_at',
            'paid_at',
            'id_status',
            'billet_url',
            'pix_code',
            'payment_method',
          ],
        },
      ],
    });

    const charges = salesItems.map(({ charges: ch, uuid: uuid_sale_item }) => ({
      ...ch,
      uuid_sale_item,
    }));
    return res.status(200).send({
      count: charges.length,
      subscription: {
        uuid: subscription.uuid,
        product_name: subscription.product.name,
        student_name: subscription.student.full_name,
        plan_name: subscription.plan.label,
        plan_price: subscription.plan.price,
        plan_start_date: dateHelper(subscription.created_at).format(
          FRONTEND_DATE_WITHOUT_TIME,
        ),
        status: findSubscriptionStatus(subscription.id_status),
      },
      rows: new SerializeChargesSubscriptions(charges).adapt(),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const calculateValidUntil = (next_charge) =>
  dateHelper(next_charge).format(DATABASE_DATE);

const cancelSubscriptionController = async (req, res, next) => {
  const {
    subscription: {
      id,
      id_student,
      id_product,
      next_charge,
      id_sale_item,
      id_user,
      student,
      product,
      plan,
    },
    body: { now = false },
  } = req;
  try {
    let validUntilDate;

    if (now) {
      await Promise.all([
        updateSubscription(
          { id },
          { active: false, id_status: findSubscriptionStatus('Cancelado').id },
        ),
        deleteStudentProduct({ id_student, id_product }),
      ]);
      validUntilDate = dateHelper().format(FRONTEND_DATE_WITHOUT_TIME);
    } else {
      validUntilDate = dateHelper(next_charge).format(
        FRONTEND_DATE_WITHOUT_TIME,
      );
      await updateSubscription(
        { id },
        {
          valid_until: calculateValidUntil(next_charge),
          id_status: findSubscriptionStatus('Cancelado').id,
        },
      );
    }

    if (student && product && plan) {
      await new StudentCanceledSubscriptionByProducer({
        student_name: student.full_name,
        product_name: product.name,
        amount: plan.price,
        valid_date_until: validUntilDate,
        support_email: product.support_email,
        email: student.email,
      }).send();
    }

    await SQS.add('webhookEvent', {
      id_product,
      id_sale_item,
      id_user,
      id_event: findRulesTypesByKey('canceled-subscription').id,
    });

    try {
      console.log('subscription trying shopify refund', id_sale_item);
      SQS.add('shopify', {
        id_sale_item,
        status: 'refunded',
      });
    } catch (error) {
      console.log('subscription error on cancel shopify', error);
    }
    return res.status(200).send({
      success: true,
      message: 'Assinatura cancelada',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const sendCardUpdateLinkController = async (req, res, next) => {
  const {
    subscription: { student, product, uuid: subscriptionUuid },
  } = req;
  try {
    const url = `${process.env.URL_SIXBASE_MEMBERSHIP}/assinaturas?subscription_uuid=${subscriptionUuid}&action=update_card`;
    await new CardUpdateLink({
      email: student.email,
      student_name: student.full_name,
      product_name: product.name,
      url,
    }).send();
    return res.status(200).send({
      success: true,
      message: 'Email com link de atualização de cartão enviado com sucesso',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const reprocessChargeController = async (req, res, next) => {
  const {
    subscription: { id: id_subscription, next_charge: subscriptionNextCharge },
  } = req;

  const lockKey = `charging:${id_subscription}`;
  let lock = null;

  try {
    const today = dateHelper().format('YYYY-MM-DD');
    const nextChargeDate = dateHelper(subscriptionNextCharge).format(
      'YYYY-MM-DD',
    );

    if (dateHelper(today).isBefore(nextChargeDate)) {
      return next(
        ApiError.badRequest({
          success: false,
          message:
            'A cobrança ainda não está vencida. O reprocessamento só é permitido após a data de vencimento.',
        }),
      );
    }

    const paidChargeStatus = findChargeStatusByKey('paid');
    let paidChargesCount = await Charges.count({
      where: {
        id_subscription,
        id_status: paidChargeStatus.id,
      },
    });

    if (paidChargesCount === 0) {
      const paidSalesItems = await Sales_items.findAll({
        raw: true,
        nest: true,
        where: { id_subscription },
        attributes: ['id'],
        include: [
          {
            association: 'charges',
            attributes: ['id'],
            where: {
              id_status: paidChargeStatus.id,
            },
            required: true,
          },
        ],
      });
      paidChargesCount = paidSalesItems.length;
    }

    if (paidChargesCount === 0) {
      return next(
        ApiError.badRequest({
          success: false,
          message:
            'Reprocessamento disponível apenas após a primeira cobrança paga.',
        }),
      );
    }

    const redisKey = `reprocess_charge:${id_subscription}:${today}`;
    const lastAttempt = await redis.get(redisKey);

    if (lastAttempt) {
      return next(
        ApiError.badRequest({
          success: false,
          message:
            'Você já reprocessou esta cobrança hoje. Tente novamente amanhã.',
        }),
      );
    }

    lock = await redis.set(lockKey, '1', 'EX', 300, 'NX');
    if (!lock) {
      return next(
        ApiError.badRequest({
          success: false,
          message:
            'Esta cobrança já está sendo processada. Aguarde e tente novamente.',
        }),
      );
    }

    const subscription = await SubscriptionsModel.findOne({
      where: { id: id_subscription },
      include: [
        {
          association: 'product',
          attributes: ['id', 'content_delivery'],
          paranoid: true,
        },
      ],
    });

    const lastSaleItem = await Sales_items.findOne({
      nest: true,
      where: { id_status: 2, id_subscription },
      order: [['id', 'desc']],
      attributes: [
        'id',
        'price_product',
        'price_total',
        'id_product',
        'id_sale',
        'id_offer',
        'id_classroom',
        'customer_paid_interest',
        'credit_card',
        'shipping_price',
      ],
      include: [
        {
          association: 'charges',
          order: [['id', 'desc']],
          where: { id_status: 2 },
          attributes: ['installments', 'provider'],
        },
        {
          association: 'offer',
          attributes: ['shipping_type', 'quantity'],
        },
      ],
    });

    if (!lastSaleItem) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Nenhuma venda anterior encontrada para esta assinatura.',
        }),
      );
    }

    const plan = await Product_plans.findOne({
      raw: true,
      where: { id: subscription.id_plan },
      paranoid: false,
    });

    if (!plan) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Plano não encontrado.',
        }),
      );
    }

    const chargeUseCase = new ChargeSubscriptionUseCase({
      sequelize: SubscriptionsModel.sequelize,
      isManualReprocess: true,
    });

    const result = await chargeUseCase.execute({
      subscription,
      lastSaleItem,
      plan,
    });

    const now = dateHelper();
    const tomorrow = dateHelper().add(1, 'day').startOf('day');
    const ttlSeconds = Math.round(tomorrow.diff(now, 'seconds'));
    await redis.set(redisKey, '1', 'EX', ttlSeconds);

    await redis.del(lockKey);

    if (!result.success) {
      return res.status(400).send({
        success: false,
        message: result.message || 'Falha ao reprocessar cobrança',
        data: result,
      });
    }

    return res.status(200).send({
      success: true,
      message: 'Cobrança reprocessada com sucesso',
      data: result,
    });
  } catch (error) {
    console.error('Error reprocessing charge:', error);

    if (lock) {
      try {
        await redis.del(lockKey);
      } catch (redisError) {
        console.error('Error removing lock:', redisError);
      }
    }

    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const findSubscriptionPageFiltersController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const products = await findProducstWithPlan(id_user);
    return res.status(200).send({
      subscriptionStatus,
      products,
      paymentMethods: paymentMethods.map((method) => ({
        key: method.key,
        name: method.label,
      })),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
// eslint-disable-next-line
const exportController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', 'attachment; filename=assinaturas.xlsx');
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    useStyles: true,
    useSharedStrings: true,
    filename: 'assinaturas.xlsx',
    stream: res,
  });
  const worksheet = workbook.addWorksheet();
  try {
    worksheet.columns = [
      {
        header: 'Produto',
        key: 'product_name',
        width: 30,
      },
      {
        header: 'Cliente',
        width: 25,
        key: 'client_name',
      },
      {
        header: 'Método de Pagamento',
        width: 20,
        key: 'payment_method',
      },
      {
        header: 'Plano',
        width: 25,
        key: 'plan',
      },
      {
        header: 'Preço',
        width: 10,
        key: 'price',
      },
      {
        header: 'Proxima Cobrança',
        width: 20,
        key: 'next_charge',
      },
      {
        header: 'Status',
        width: 25,
        key: 'status',
      },
    ];
    const where = formatQuery(query);
    where.id_user = id_user;

    let offset = 0;
    let total = 100;
    while (total !== 0) {
      // eslint-disable-next-line
      const subscriptions = await findAllSubscriptionsFilteredExport(
        where,
        offset,
      );
      offset += 100;
      total = subscriptions.length;
      if (total < 100) {
        total = 0;
      }

      for (const {
        next_charge,
        id_status,
        payment_method,
        product: { name: product_name },
        student: { full_name: client_name },
        plan: { price, label },
      } of subscriptions) {
        const resolvePaymentMethod = (method) => {
          if (method === 'card') return 'Cartão de crédito';
          if (method === 'billet') return 'Boleto';
          if (method === 'pix') return 'Pix';
          return 'Cartão de crédito';
        };
        const statusName = id_status
          ? findSubscriptionStatus(id_status)?.name || 'Desconhecido'
          : 'Desconhecido';
        worksheet
          .addRow({
            product_name: capitalizeName(product_name),
            client_name: capitalizeName(client_name),
            payment_method: resolvePaymentMethod(payment_method || 'card'),
            plan: label,
            price: formatBRL(price),
            next_charge: dateHelper(next_charge).format(
              FRONTEND_DATE_WITHOUT_TIME,
            ),
            status: statusName,
          })
          .commit();
      }
    }
    worksheet.commit();
    await workbook.commit();
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  cancelSubscriptionController,
  findSubscriptionChargesPaginatedController,
  findSubscriptionPageFiltersController,
  findSubscriptionsMetricsController,
  findSubscriptionsPaginatedController,
  exportController,
  sendCardUpdateLinkController,
  reprocessChargeController,
};
