const router = require('express').Router();
const { Op } = require('sequelize');
const exceljs = require('exceljs');
const {  findTransactionsWithdrawalTypeByKey } = require('../utils/transactionsWithdrawalType');
const Transactions = require('../database/models/Transactions');
const { FRONTEND_DATE } = require('../types/dateTypes');
const { findBank } = require('../utils/banks');
const date = require('../utils/helpers/date');
const { formatDocument } = require('../utils/formatters');

router.get('/', async (req, res) => {
  const {
    query: { page = 0, size = 10 },
  } = req;
  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * limit;
    const withdrawals = await Transactions.findAndCountAll({
      nest: true,
      attributes: ['id', 'id_user', 'withdrawal_amount', 'created_at'],
      limit,
      offset,
      where: {
        id_type: 1,
        id_status: 1,
        psp_id: {
          [Op.ne]: 0,
        },
      },
      order: ['id'],
      include: [
        {
          association: 'user',
          attributes: [
            'uuid',
            'is_company',
            'bank_code',
            'agency',
            'account_number',
            'account_type',
            'document_number',
            'company_bank_code',
            'company_agency',
            'company_account_number',
            'company_account_type',
            'email',
            'full_name',
            'cnpj',
          ],
        },
      ],
    });
    return res.send({
      count: withdrawals.count,
      rows: withdrawals.rows.map((w) => {
        let ba = {
          code: w.user.bank_code,
          bank: findBank(w.user.bank_code),
          number: w.user.account_number,
          agency: w.user.agency,
          type: w.user.account_type,
          document: formatDocument(w.user.document_number),
        };
        if (w.is_company) {
          ba = {
            code: w.user.company_bank_code,
            bank: findBank(w.user.company_bank_code),
            number: w.user.company_account_number,
            agency: w.user.company_agency,
            type: w.user.company_account_type,
            document: formatDocument(w.user.cnpj),
          };
        }
        return {
          id: w.id,
          amount: w.withdrawal_amount,
          bank_account: ba,
          email: w.user.email,
          full_name: w.user.full_name,
          producer_uuid: w.user.uuid,
          created_at: date(w.created_at).format(FRONTEND_DATE),
        };
      }),
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post('/:id', async (req, res) => {
  const {
    body: { status, type },
    params: { id },
  } = req;
  try {
    const withdrawal = await Transactions.findOne({
      raw: true,
      where: { id, id_type: 1, id_status: 1 },
      attributes: ['id'],
    });

    if (!withdrawal)
      return res.status(400).send({ message: 'Saque não encontrado' });

    const id_status = status === 1 ? 2 : 4;
    const withdrawal_type_id = findTransactionsWithdrawalTypeByKey(type)?.id || null;
    
    const data = {
      id_status,
      withdrawal_type: withdrawal_type_id,
    };

    if (id_status === 4) {
      // change method to hide for user but still visible on backoffice
      data.method = 'manual';
    }

    await Transactions.update(data, { where: { id } });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.get('/approved', async (req, res) => {
  const {
    query: { page = 0, size = 10 },
  } = req;
  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * limit;
    const withdrawals = await Transactions.findAndCountAll({
      nest: true,
      attributes: [
        'id',
        'id_user',
        'withdrawal_amount',
        'created_at',
        'updated_at',
      ],
      limit,
      offset,
      where: {
        id_type: 1,
        id_status: 2,
        created_at: {
          [Op.gte]: '2024-10-15 03:00:00',
        },
        psp_id: {
          [Op.ne]: 0,
        },
      },
      order: ['id'],
      include: [
        {
          association: 'user',
          attributes: [
            'uuid',
            'is_company',
            'bank_code',
            'agency',
            'account_number',
            'account_type',
            'document_number',
            'company_bank_code',
            'company_agency',
            'company_account_number',
            'company_account_type',
            'email',
            'full_name',
            'cnpj',
          ],
        },
      ],
    });
    return res.send({
      count: withdrawals.count,
      rows: withdrawals.rows.map((w) => {
        let ba = {
          code: w.user.bank_code,
          bank: findBank(w.user.bank_code),
          number: w.user.account_number,
          agency: w.user.agency,
          type: w.user.account_type,
          document: formatDocument(w.user.document_number),
        };
        if (w.is_company) {
          ba = {
            code: w.user.company_bank_code,
            bank: findBank(w.user.company_bank_code),
            number: w.user.company_account_number,
            agency: w.user.company_agency,
            type: w.user.company_account_type,
            document: formatDocument(w.user.cnpj),
          };
        }
        return {
          id: w.id,
          amount: w.withdrawal_amount,
          bank_account: ba,
          email: w.user.email,
          full_name: w.user.full_name,
          producer_uuid: w.user.uuid,
          created_at: date(w.created_at).format(FRONTEND_DATE),
          updated_at: date(w.updated_at).format(FRONTEND_DATE),
        };
      }),
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.get('/denied', async (req, res) => {
  const {
    query: { page = 0, size = 10 },
  } = req;
  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * limit;
    const withdrawals = await Transactions.findAndCountAll({
      nest: true,
      attributes: [
        'id',
        'id_user',
        'withdrawal_amount',
        'created_at',
        'updated_at',
      ],
      limit,
      offset,
      where: {
        id_type: 1,
        id_status: 4,
        created_at: {
          [Op.gte]: '2024-10-15 03:00:00',
        },
        psp_id: {
          [Op.ne]: 0,
        },
      },
      order: ['id'],
      include: [
        {
          association: 'user',
          attributes: [
            'uuid',
            'is_company',
            'bank_code',
            'agency',
            'account_number',
            'account_type',
            'document_number',
            'company_bank_code',
            'company_agency',
            'company_account_number',
            'company_account_type',
            'email',
            'full_name',
            'cnpj',
          ],
        },
      ],
    });
    return res.send({
      count: withdrawals.count,
      rows: withdrawals.rows.map((w) => {
        let ba = {
          code: w.user.bank_code,
          bank: findBank(w.user.bank_code),
          number: w.user.account_number,
          agency: w.user.agency,
          type: w.user.account_type,
          document: formatDocument(w.user.document_number),
        };
        if (w.is_company) {
          ba = {
            code: w.user.company_bank_code,
            bank: findBank(w.user.company_bank_code),
            number: w.user.company_account_number,
            agency: w.user.company_agency,
            type: w.user.company_account_type,
            document: formatDocument(w.user.cnpj),
          };
        }
        return {
          id: w.id,
          amount: w.withdrawal_amount,
          bank_account: ba,
          email: w.user.email,
          full_name: w.user.full_name,
          producer_uuid: w.user.uuid,
          created_at: date(w.created_at).format(FRONTEND_DATE),
          updated_at: date(w.updated_at).format(FRONTEND_DATE),
        };
      }),
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.get('/export', async (_req, res) => {
  const { active = '1' } = _req.query;
  let filename = null;
  let where = {
    id_type: 1,
    id_status: 2,
    created_at: {
      [Op.gte]: '2024-10-15 03:00:00',
    },
    psp_id: {
      [Op.ne]: 0,
    },
  };
  if (active === '1') {
    filename = `pendentes.xlsx`;
    where = {
      id_type: 1,
      id_status: 1,
      psp_id: {
        [Op.ne]: 0,
      },
    };
  } else if (active === '2') {
    filename = `aprovados.xlsx`;
  } else {
    filename = `negados.xlsx`;
    where = {
      id_type: 1,
      id_status: 4,
      created_at: {
        [Op.gte]: '2024-10-15 03:00:00',
      },
      psp_id: {
        [Op.ne]: 0,
      },
    };
  }
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  const workbook = new exceljs.stream.xlsx.WorkbookWriter({
    useStyles: true,
    useSharedStrings: true,
    filename,
    stream: res,
  });

  const worksheet = workbook.addWorksheet();
  worksheet.columns = [
    {
      header: 'ID',
      key: 'id',
      width: 20,
    },
    {
      header: 'Nome',
      key: 'full_name',
      width: 50,
    },
    {
      header: 'Email',
      key: 'email',
      width: 30,
    },
    {
      header: 'Valor',
      key: 'amount',
      width: 30,
      style: {
        numFmt: 'R$#0.#0',
      },
    },
    {
      header: 'Documento',
      key: 'document',
      width: 30,
    },
    {
      header: 'Código Banco',
      key: 'code',
      width: 30,
    },
    {
      header: 'Agencia',
      key: 'agency',
      width: 30,
    },
    {
      header: 'Conta',
      key: 'number',
      width: 30,
    },
    {
      header: 'Tipo',
      key: 'type',
      width: 30,
    },
    {
      header: 'Data solicitação',
      key: 'created_at',
      width: 30,
    },
    {
      header: 'Atualizado em',
      key: 'updated_at',
      width: 30,
    },
  ];

  let offset = 0;
  let total = 100;
  // eslint-disable-next-line
  while (total !== 0) {
    try {
      // eslint-disable-next-line
      const withdrawals = await Transactions.findAll({
        nest: true,
        attributes: [
          'id',
          'id_user',
          'withdrawal_amount',
          'created_at',
          'updated_at',
        ],
        limit: 100,
        offset,
        where,
        order: ['id'],
        include: [
          {
            association: 'user',
            attributes: [
              'is_company',
              'bank_code',
              'agency',
              'account_number',
              'account_type',
              'document_number',
              'company_bank_code',
              'company_agency',
              'company_account_number',
              'company_account_type',
              'email',
              'full_name',
              'cnpj',
            ],
          },
        ],
      });
      offset += 100;
      total = withdrawals.length;
      if (total < 100) {
        total = 0;
      }
      for (const w of withdrawals) {
        let ba = {
          code: w.user.bank_code,
          bank: findBank(w.user.bank_code),
          number: w.user.account_number,
          agency: w.user.agency,
          type: w.user.account_type,
          document: formatDocument(w.user.document_number),
        };
        if (w.is_company) {
          ba = {
            code: w.user.company_bank_code,
            bank: findBank(w.user.company_bank_code),
            number: w.user.company_account_number,
            agency: w.user.company_agency,
            type: w.user.company_account_type,
            document: formatDocument(w.user.cnpj),
          };
        }

        worksheet
          .addRow({
            id: w.id,
            amount: w.withdrawal_amount,
            email: w.user.email,
            full_name: w.user.full_name,
            created_at: date(w.created_at).format(FRONTEND_DATE),
            updated_at: date(w.updated_at).format(FRONTEND_DATE),
            code: ba.code,
            number: ba.number,
            agency: ba.agency,
            type: ba.type,
            document: ba.document,
          })
          .commit();
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(500);
    }
  }
  worksheet.commit();
  await workbook.commit();
});

module.exports = router;
