const ApiError = require('../../error/ApiError');
const SerializeTransactions = require('../../presentation/dashboard/transactions');
const SerializeTransactionsRefund = require('../../presentation/dashboard/transactionsRefund');
const SerializeTransactionDetails = require('../../presentation/dashboard/transactions/TransactionsDetails');

const {
  findBalanceTransactions,
  findBalanceRefundTransactions,
  findTransactionDetails,
  findStatementTransactions,
} = require('../../database/controllers/transactions');
const {
  transactionTypes,
  findTransactionTypeByKey,
} = require('../../types/transactionTypes');
const {
  transactionStatus,
  findTransactionStatus,
} = require('../../status/transactionStatus');
const { findCommissionsStatus } = require('../../status/commissionsStatus');
const StatementHelper = require('../../utils/helpers/statement');

const getTypeWithoutPayment = () =>
  transactionTypes.filter(
    ({ id }) =>
      id !== findTransactionTypeByKey(`payment`).id &&
      id !== findTransactionTypeByKey(`commission`).id,
  );

const findTransactionsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  try {
    const transactions = await findBalanceTransactions({ ...query, id_user });
    return res.status(200).send({
      count: transactions.count,
      rows: new SerializeTransactions(transactions.rows).adapt(),
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

const findTransactionsRefundController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { uuid },
  } = req;
  try {
    const where = {
      id_user,
      uuid,
    };
    const transactions = await findBalanceRefundTransactions(where);
    return res
      .status(200)
      .send(new SerializeTransactionsRefund(transactions).adapt());
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

const getPageFilterController = async (req, res, next) => {
  try {
    return res.status(200).send({
      types: getTypeWithoutPayment(),
      status: transactionStatus,
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

const getTransactionDetails = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { uuid },
  } = req;
  try {
    const transaction = await findTransactionDetails({ uuid, id_user });
    if (!transaction) throw ApiError.badRequest('Transação não encontrada');
    return res
      .status(200)
      .send(new SerializeTransactionDetails(transaction).adapt());
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

const buildStatementItems = (statementData) => {
  const items = [];

  const getCommissionStatusInfo = (idStatus) => {
    if (idStatus === undefined || idStatus === null) {
      return { key: null, label: null };
    }
    const status = findCommissionsStatus(idStatus);
    if (!status) return { key: null, label: null };
    return { key: status.key, label: status.label };
  };

  const getTransactionStatusInfo = (idStatus) => {
    if (idStatus === undefined || idStatus === null) {
      return { key: null, label: null };
    }
    const status = findTransactionStatus(idStatus);
    if (!status) return { key: null, label: null };
    return { key: status.key, label: status.name };
  };

  // Comissões liberadas
  (statementData.commissions || []).forEach((commission) => {
    const { key, label } = getCommissionStatusInfo(commission.id_status);
    items.push({
      date: commission.created_at,
      type: 'commission',
      type_label: 'Comissão',
      status: key,
      status_label: label,
      value: Number(commission.amount || 0),
    });
  });

  // Comissões pendentes
  (statementData.pendingCommissions || []).forEach((commission) => {
    const { key, label } = getCommissionStatusInfo(commission.id_status);
    items.push({
      date: commission.created_at,
      type: 'commission',
      type_label: 'Comissão',
      status: key,
      status_label: label,
      value: Number(commission.amount || 0),
    });
  });

  // Saques
  (statementData.withdrawals || []).forEach((transaction) => {
    const { key, label } = getTransactionStatusInfo(transaction.id_status);
    const amount = Number(transaction.withdrawal_total || 0);
    items.push({
      date: transaction.created_at || transaction.updated_at,
      type: 'withdrawal',
      type_label: 'Saque',
      status: key,
      status_label: label,
      value: -Math.abs(amount),
    });
  });

  // Reembolsos
  (statementData.refunds || []).forEach((transaction) => {
    const { key, label } = getCommissionStatusInfo(transaction.id_status);
    const amount = Number(transaction.amount || 0);
    items.push({
      date: transaction.updated_at,
      type: 'refund',
      type_label: 'Reembolso',
      status: key,
      status_label: label,
      value: -Math.abs(amount),
    });
  });

  // Chargebacks
  (statementData.chargebacks || []).forEach((transaction) => {
    const { key, label } = getCommissionStatusInfo(transaction.id_status);
    const amount = Number(transaction.amount || 0);
    items.push({
      date: transaction.updated_at,
      type: 'chargeback',
      type_label: 'Chargeback',
      status: key,
      status_label: label,
      value: -Math.abs(amount),
    });
  });

  // Atividades (ajustes manuais)
  (statementData.activity || []).forEach((activity) => {
    const amount = Number(activity.amount || 0);
    items.push({
      date: activity.created_at,
      type: 'activity',
      type_label: 'Atividade',
      status: null,
      status_label: null,
      value: amount,
    });
  });

  // Ordena por data (mais recente primeiro)
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  return items;
};

const generateStatementController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { format: fileFormat, startDate, endDate, types },
  } = req;

  try {
    if (!id_user) {
      throw ApiError.unauthorized('Usuário não autenticado');
    }

    const format = fileFormat?.toLowerCase() || 'pdf';
    if (format !== 'pdf' && format !== 'csv') {
      throw ApiError.badRequest('Formato deve ser PDF ou CSV');
    }

    // Processar tipos de transações (se fornecido)
    // Mapeamento: key do tipo de transação -> nome usado internamente
    const typeMapping = {
      payment: 'sale',
      sale: 'sale',
      sales: 'sale',
      refund: 'refund',
      refunds: 'refund',
      chargeback: 'chargeback',
      chargebacks: 'chargeback',
      withdrawal: 'withdrawal',
      withdrawals: 'withdrawal',
      commission: 'commission',
      commissions: 'commission',
    };

    let requestedTransactionTypes = null;
    if (types) {
      const inputTypes = types
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const mappedTypes = inputTypes
        .map((t) => typeMapping[t])
        .filter((t) => t !== undefined);

      if (mappedTypes.length === 0) {
        const validKeys = Object.keys(typeMapping).join(', ');
        throw ApiError.badRequest(
          `Tipos inválidos. Tipos válidos: ${validKeys}`,
        );
      }

      // Remover duplicatas
      requestedTransactionTypes = [...new Set(mappedTypes)];
    }

    // Usar informações do usuário autenticado (req.user já vem do middleware de auth)
    const { user } = req;

    if (!user || !user.id) {
      throw ApiError.unauthorized('Usuário não autenticado');
    }

    // Garantir que temos os dados necessários do usuário
    const { id, full_name, email, document_number } = user;
    const userInfo = {
      id,
      full_name,
      email,
      document_number,
    };

    // Buscar transações do extrato
    const statementData = await findStatementTransactions({
      id_user: Number(id_user),
      startDate,
      endDate,
      types: requestedTransactionTypes,
    });

    if (format === 'csv') {
      StatementHelper.generateCSV(statementData, res, startDate, endDate);
      // O stream CSV será finalizado dentro do método generateCSV
      return;
    }

    // Gerar PDF
    const pdfBuffer = await StatementHelper.generatePDF(
      statementData,
      userInfo,
      startDate,
      endDate,
    );

    res.contentType('application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="extrato_${id_user}_${new Date()
        .toISOString()
        .split('T')[0]}.pdf"`,
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).send(error);
      return;
    }
    next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getStatementListController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { startDate, endDate, types, page, pageSize },
  } = req;

  try {
    if (!id_user) {
      throw ApiError.unauthorized('Usuário não autenticado');
    }

    const typeMapping = {
      payment: 'sale',
      sale: 'sale',
      sales: 'sale',
      refund: 'refund',
      refunds: 'refund',
      chargeback: 'chargeback',
      chargebacks: 'chargeback',
      withdrawal: 'withdrawal',
      withdrawals: 'withdrawal',
      commission: 'commission',
      commissions: 'commission',
      activity: 'activity'
    };

    let requestedTransactionTypes = null;
    if (types) {
      const inputTypes = types
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const mappedTypes = inputTypes
        .map((t) => typeMapping[t])
        .filter((t) => t !== undefined);

      if (mappedTypes.length === 0) {
        const validKeys = Object.keys(typeMapping).join(', ');
        throw ApiError.badRequest(
          `Tipos inválidos. Tipos válidos: ${validKeys}`,
        );
      }

      requestedTransactionTypes = [...new Set(mappedTypes)];
    }

    const statementData = await findStatementTransactions({
      id_user: Number(id_user),
      startDate,
      endDate,
      types: requestedTransactionTypes,
    });

    // Saldo inicial e final do período (mesma lógica do StatementHelper)
    const initialBalance = statementData.initialBalance || 0;
    let finalBalance = initialBalance;

    if (
      statementData.allTransactionsForBalance &&
      statementData.allTransactionsForBalance.length > 0
    ) {
      statementData.allTransactionsForBalance.forEach((t) => {
        let value = 0;

        if (t.id_status === findCommissionsStatus('refunded').id) {
          value = -Math.abs(Number(t.amount || 0));
        } else if (
          t.id_status === findCommissionsStatus('chargeback').id ||
          t.id_status === findCommissionsStatus('chargeback_dispute').id
        ) {
          value = -Math.abs(Number(t.amount || 0));
        } else if (
          t.id_type === findTransactionTypeByKey('withdrawal').id
        ) {
          value = -Math.abs(Number(t.withdrawal_total || 0));
        } else if (t.id_status === findCommissionsStatus('released').id) {
          value = Number(t.amount || 0);
        } else if (t.id_status === findCommissionsStatus('waiting').id) {
          value = Number(t.amount || 0);
        } else if (t.reason !== undefined) {
          value = Number(t.amount || 0);
        }

        finalBalance += value;
      });
    }

    const allItems = buildStatementItems(statementData);
    const totalItems = allItems.length;

    const size = Number(pageSize) > 0 ? Number(pageSize) : 20;
    const currentPage = Number(page) > 0 ? Number(page) : 1;

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
    const safePage = Math.min(currentPage, Math.max(totalPages, 1));

    const startIndex = (safePage - 1) * size;
    const paginatedItems = allItems.slice(startIndex, startIndex + size);

    return res.status(200).send({
      items: paginatedItems,
      page: safePage,
      pageSize: size,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      initialBalance,
      finalBalance,
      message:
        totalItems === 0
          ? 'Nenhuma transação encontrada para o período informado.'
          : undefined,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
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

module.exports = {
  findTransactionsController,
  findTransactionsRefundController,
  getPageFilterController,
  getTransactionDetails,
  generateStatementController,
  getStatementListController,
};
