const cron = require('node-cron');
const ExcelJS = require('exceljs');
const DateHelper = require('../utils/helpers/date');
const UsersRepository = require('../repositories/sequelize/UsersRepository');
const { sendMail } = require('../services/NodeMailerService');

// PARA TESTES, CRON DE 1 EM 1MIN
// cron.schedule('*/1 * * * *', async () => {

// Agenda: todo dia 1 às 00:05 (minuto hora dia mês diaDaSemana)
cron.schedule('5 0 1 * *', async () => {
    console.info('[Cron] Iniciando tarefa mensal de reativação')

    try {
        const rows = await UsersRepository.getPreviousMonthReactivationReport()
        console.info(`[Cron] Encontrados ${rows.length} registros para relatório`)

        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet('Reativação de Produtores')
        sheet.columns = [
            { header: 'UUID', key: 'uuid', width: 36 },
            { header: 'Nome', key: 'name', width: 30 },
            { header: 'E-mail', key: 'email', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Vendas Mês Ant.', key: 'lastMonthSales', width: 15 },
            { header: 'Última Venda', key: 'lastSaleDate', width: 20 },
        ]

        const statusMap = {
            contacting: 'sem_sucesso',
            not_contacted: 'não_contatado',
            success: 'sucesso',
        }

        rows.forEach(r => {
            sheet.addRow({
                uuid: r.uuid,
                name: r.name,
                email: r.email,
                status: statusMap[r.reactivation_status] || 'desconhecido',
                lastMonthSales: r.lastMonthSales,
                lastSaleDate: r.lastSaleDate
                    ? DateHelper(r.lastSaleDate).format('DD/MM/YYYY')
                    : null
            })
        })
        console.info('[Cron] Planilha populada')

        console.info('[Cron] Gerando buffer XLSX…')
        const buffer = await workbook.xlsx.writeBuffer()
        console.info(`[Cron] Buffer gerado (${buffer.byteLength} bytes)`)

        console.info('[Cron] Resetando status para iniciar novo ciclo…')
        await UsersRepository.resetAllReactivationStatuses()
        await UsersRepository.assignNotContactedToPrevMonth()
        console.info('[Cron] Tarefa mensal concluída')

        const prev = DateHelper().utc().subtract(1, 'month')
        const fileName = `reativacao_produtores_${prev.format('YYYY_MM')}.xlsx`
        console.info('[Cron] Enviando e-mail…')
        await sendMail({
            to: 'gabriel.b4you@gmail.com',
            subject: `Relatório Reativação Produtores – ${prev.format('YYYY_MM')}`,
            text: 'Segue em anexo o relatório mensal de reativação de produtores.',
            attachments: [
                { filename: fileName, content: buffer }
            ]
        })
        console.info('[Cron] E-mail enviado com sucesso')
    }
    catch (err) {
        console.error('[Cron] Erro na tarefa mensal de reativação:', err)
    }
});