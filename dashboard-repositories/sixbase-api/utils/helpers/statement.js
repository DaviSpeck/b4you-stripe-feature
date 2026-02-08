const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { format } = require('@fast-csv/format');
const fs = require('fs');
const path = require('path');
const { findTransactionType, findTransactionTypeByKey } = require('../../types/transactionTypes');
const { findTransactionStatus } = require('../../status/transactionStatus');
const { findCommissionsStatus } = require('../../status/commissionsStatus');
const DateHelper = require('./date');

class StatementHelper {
    static formatCurrency(value) {
        if (!value) return 'R$ 0,00';
        return Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    }

    static formatDate(date) {
        if (!date) return '-';
        return DateHelper(date).format('DD/MM/YYYY');
    }

    static formatDateTime(date) {
        if (!date) return '-';
        return DateHelper(date).format('DD/MM/YYYY HH:mm:ss');
    }

    static getTransactionTypeName(id_type) {
        const type = findTransactionType(id_type);
        return type ? type.name : 'Desconhecido';
    }

    static getTransactionStatusName(id_status) {
        const status = findTransactionStatus(id_status);
        return status ? status.name : 'Desconhecido';
    }

    static generateCSV(statementData, res, startDate, endDate) {
        const csvData = [];
        const summaryData = [];

        if (!statementData) {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="extrato_${DateHelper(new Date()).format('YYYY-MM-DD')}.csv"`,
            );
            const csvStream = format({ headers: true });
            csvStream.pipe(res);
            csvStream.end();
            return;
        }

        const initialBalance = statementData.initialBalance || 0;
        let finalBalance = initialBalance;

        statementData.refunds?.forEach((transaction) => {
            csvData.push({
                Tipo: 'Reembolso',
                Data: this.formatDate(transaction.updated_at),
                Valor: this.formatCurrency(Math.abs(transaction.amount || 0)),
                Produto: transaction.sale_item?.product?.name || '-',
                Status: this.getTransactionStatusName(transaction.id_status),
                'Data de Liberação': '-',
            });
        });

        statementData.chargebacks?.forEach((transaction) => {
            csvData.push({
                Tipo: 'Chargeback',
                Data: this.formatDate(transaction.updated_at),
                Valor: this.formatCurrency(Math.abs(transaction.amount || 0)),
                Produto: transaction.sale_item?.product?.name || '-',
                Status: this.getTransactionStatusName(transaction.id_status),
                'Data de Liberação': '-',
            });
        });

        statementData.withdrawals?.forEach((transaction) => {
            csvData.push({
                Tipo: 'Saque',
                Data: this.formatDate(transaction.updated_at),
                Valor: this.formatCurrency(Math.abs(transaction.withdrawal_total || 0)),
                Produto: '-',
                Status: this.getTransactionStatusName(transaction.id_status),
                'Data de Liberação': '-',
            });
        });

        statementData.commissions?.forEach((transaction) => {
            csvData.push({
                Tipo: 'Comissão',
                Data: this.formatDate(transaction.created_at),
                Valor: this.formatCurrency(transaction.amount || 0),
                Produto: transaction.sale_item?.product?.name || '-',
                Status: this.getTransactionStatusName(transaction.id_status),
                'Data de Liberação': '-',
            });
        });

        statementData.pendingCommissions?.forEach((transaction) => {
            csvData.push({
                Tipo: 'Comissão',
                Data: this.formatDate(transaction.created_at),
                Valor: this.formatCurrency(transaction.amount || 0),
                Produto: transaction.sale_item?.product?.name || '-',
                Status: this.getTransactionStatusName(transaction.id_status),
                'Data de Liberação': '-',
            });
        });

        statementData.activity?.forEach((transaction) => {
            csvData.push({
                Tipo: 'Atividade',
                Data: this.formatDate(transaction.created_at),
                Valor: this.formatCurrency(transaction.amount || 0),
                Produto: transaction.reason || '-',
                Status: '-',
                'Data de Liberação': '-',
            });
        });

        csvData.sort((a, b) => {
            const dateA = new Date(a.Data.split('/').reverse().join('-'));
            const dateB = new Date(b.Data.split('/').reverse().join('-'));
            return dateA - dateB;
        });

        if (statementData.allTransactionsForBalance && statementData.allTransactionsForBalance.length > 0) {
            statementData.allTransactionsForBalance.forEach((t) => {
                let value = 0;

                if (t.id_status === findCommissionsStatus('refunded').id) {
                    value = -Math.abs(Number(t.amount || 0));
                } else if (
                    t.id_status === findCommissionsStatus('chargeback').id ||
                    t.id_status === findCommissionsStatus('chargeback_dispute').id
                ) {
                    value = -Math.abs(Number(t.amount || 0));
                } else if (t.id_type === findTransactionTypeByKey('withdrawal').id) {
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

        summaryData.push({
            Tipo: 'RESUMO DO PERÍODO',
            Data: '',
            Valor: '',
            Produto: '',
            Status: '',
            'Data de Liberação': '',
        });
        summaryData.push({
            Tipo: 'Saldo Inicial',
            Data: startDate ? this.formatDate(startDate) : '-',
            Valor: this.formatCurrency(initialBalance),
            Produto: '',
            Status: '',
            'Data de Liberação': '',
        });
        summaryData.push({
            Tipo: 'Saldo Final',
            Data: endDate ? this.formatDate(endDate) : '-',
            Valor: this.formatCurrency(finalBalance),
            Produto: '',
            Status: '',
            'Data de Liberação': '',
        });
        summaryData.push({
            Tipo: '',
            Data: '',
            Valor: '',
            Produto: '',
            Status: '',
            'Data de Liberação': '',
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="extrato_${DateHelper(new Date()).format('YYYY-MM-DD')}.csv"`,
        );

        const csvStream = format({ headers: true });
        csvStream.pipe(res);

        summaryData.forEach((item) => csvStream.write(item));
        csvData.forEach((item) => csvStream.write(item));
        csvStream.end();
    }

    static async generatePDF(statementData, userInfo, startDate, endDate) {
        if (!statementData) {
            throw new Error('Dados do extrato não fornecidos');
        }

        const initialBalance = statementData.initialBalance || 0;

        const pdfDoc = await PDFDocument.create();
        const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const darkGray = rgb(0.3, 0.3, 0.3);
        const mediumGray = rgb(0.7, 0.7, 0.7);
        const black = rgb(0, 0, 0);

        let logoImage = null;
        let logoDims = null;
        try {
            const logoPath = path.resolve(__dirname, '../../images/logo.png');
            if (fs.existsSync(logoPath)) {
                const logoBytes = fs.readFileSync(logoPath);
                logoImage = await pdfDoc.embedPng(logoBytes);
                logoDims = logoImage.scale(1);
            }
        } catch (error) {
            // Logo não encontrado, continuar sem ele
        }

        const allTransactions = [];

        if (statementData.commissions) {
            statementData.commissions.forEach((t) => {
                allTransactions.push({
                    date: t.created_at,
                    value: Number(t.amount || 0),
                    type: 'Comissão',
                    description: (t.sale_item && t.sale_item.product && t.sale_item.product.name) || '-',
                    affectsBalance: true,
                });
            });
        }

        if (statementData.pendingCommissions) {
            statementData.pendingCommissions.forEach((t) => {
                allTransactions.push({
                    date: t.created_at,
                    value: Number(t.amount || 0),
                    type: 'Comissão',
                    description: (t.sale_item && t.sale_item.product && t.sale_item.product.name) || '-',
                    affectsBalance: true,
                });
            });
        }

        if (statementData.withdrawals) {
            statementData.withdrawals.forEach((t) => {
                allTransactions.push({
                    date: t.created_at || t.updated_at,
                    value: -Math.abs(Number(t.withdrawal_total || 0)),
                    type: 'Saque',
                    description: '-',
                    affectsBalance: true,
                });
            });
        }

        if (statementData.activity) {
            statementData.activity.forEach((t) => {
                allTransactions.push({
                    date: t.created_at,
                    value: Number(t.amount || 0),
                    type: 'Atividade',
                    description: t.reason || '-',
                    affectsBalance: true,
                });
            });
        }

        if (statementData.refunds) {
            statementData.refunds.forEach((t) => {
                allTransactions.push({
                    date: t.updated_at,
                    value: -Math.abs(Number(t.amount || 0)),
                    type: 'Reembolso',
                    description: (t.sale_item && t.sale_item.product && t.sale_item.product.name) || '-',
                    affectsBalance: true,
                });
            });
        }

        if (statementData.chargebacks) {
            statementData.chargebacks.forEach((t) => {
                allTransactions.push({
                    date: t.updated_at,
                    value: -Math.abs(Number(t.amount || 0)),
                    type: 'Chargeback',
                    description: (t.sale_item && t.sale_item.product && t.sale_item.product.name) || '-',
                    affectsBalance: true,
                });
            });
        }

        const allTransactionsForBalance = [];

        if (statementData.allTransactionsForBalance) {
            statementData.allTransactionsForBalance.forEach((t) => {
                let value = 0;
                let date = null;

                if (t.id_status === findCommissionsStatus('refunded').id) {
                    value = -Math.abs(Number(t.amount || 0));
                    date = t.updated_at;
                } else if (
                    t.id_status === findCommissionsStatus('chargeback').id ||
                    t.id_status === findCommissionsStatus('chargeback_dispute').id
                ) {
                    value = -Math.abs(Number(t.amount || 0));
                    date = t.updated_at;
                } else if (t.id_type === findTransactionTypeByKey('withdrawal').id) {
                    value = -Math.abs(Number(t.withdrawal_total || 0));
                    date = t.created_at || t.updated_at;
                } else if (t.id_status === findCommissionsStatus('released').id) {
                    value = Number(t.amount || 0);
                    date = t.created_at;
                } else if (t.id_status === findCommissionsStatus('waiting').id) {
                    value = Number(t.amount || 0);
                    date = t.created_at;
                } else if (t.reason !== undefined) {
                    value = Number(t.amount || 0);
                    date = t.created_at;
                }

                if (date) {
                    allTransactionsForBalance.push({
                        date,
                        value,
                    });
                }
            });
        }

        allTransactionsForBalance.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        allTransactions.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        let runningBalance = initialBalance;
        const balanceByDate = new Map();

        allTransactionsForBalance.forEach((t) => {
            runningBalance += t.value;
            const dateKey = new Date(t.date).getTime();
            balanceByDate.set(dateKey, runningBalance);
        });

        const transactionsWithBalance = allTransactions.map((t) => {
            const transactionDate = new Date(t.date).getTime();
            let balance = initialBalance;

            for (const [dateKey, bal] of balanceByDate.entries()) {
                if (dateKey <= transactionDate) {
                    balance = bal;
                } else {
                    break;
                }
            }

            return {
                ...t,
                balance,
            };
        });


        const pageWidth = 595.28;
        const pageHeight = 841.89;
        let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        const margin = 50;
        const topMargin = 80;
        const bottomMargin = 60;
        let currentY = pageHeight - topMargin;
        const rowHeight = 25;
        const headerHeight = 35;

        const createNewPage = () => {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - topMargin;
            return currentPage;
        };

        const drawFooter = (page, pageNumber, totalPages) => {
            const footerY = 30;
            const issueDate = DateHelper(new Date()).format('DD/MM/YYYY');

            page.drawText(`Página ${pageNumber} de ${totalPages}`, {
                x: margin,
                y: footerY,
                size: 9,
                font: normalFont,
                color: darkGray,
            });

            const siteText = 'b4you.com.br';
            const siteWidth = normalFont.widthOfTextAtSize(siteText, 9);
            page.drawText(siteText, {
                x: (pageWidth - siteWidth) / 2,
                y: footerY,
                size: 9,
                font: normalFont,
                color: darkGray,
            });

            const dateText = `Emitido em ${issueDate}`;
            const dateWidth = normalFont.widthOfTextAtSize(dateText, 9);
            page.drawText(dateText, {
                x: pageWidth - margin - dateWidth,
                y: footerY,
                size: 9,
                font: normalFont,
                color: darkGray,
            });
        };

        currentPage.drawText('Extrato', {
            x: margin,
            y: currentY,
            size: 28,
            font: boldFont,
            color: black,
        });

        if (logoImage && logoDims) {
            const maxHeight = 40;
            const aspectRatio = logoDims.width / logoDims.height;
            const logoHeight = maxHeight;
            const logoWidth = logoHeight * aspectRatio;

            currentPage.drawImage(logoImage, {
                x: pageWidth - margin - logoWidth,
                y: currentY - 5,
                width: logoWidth,
                height: logoHeight,
            });
        } else {
            const logoText = 'B4you';
            const logoTextWidth = boldFont.widthOfTextAtSize(logoText, 20);
            currentPage.drawText(logoText, {
                x: pageWidth - margin - logoTextWidth,
                y: currentY,
                size: 20,
                font: boldFont,
                color: black,
            });
        }

        currentY -= 50;

        const fieldPadding = 10;
        const fieldWidth = (pageWidth - 2 * margin - 20) / 2;

        const nameValue = (userInfo && userInfo.full_name) || 'N/A';
        currentPage.drawText('Nome', {
            x: margin + fieldPadding,
            y: currentY - 15,
            size: 9,
            font: normalFont,
            color: darkGray,
        });
        currentPage.drawText(nameValue, {
            x: margin + fieldPadding,
            y: currentY - 30,
            size: 11,
            font: boldFont,
            color: black,
        });

        // Campo Período
        const periodStart = startDate
            ? DateHelper(startDate).format('DD/MM/YYYY')
            : '-';
        const periodEnd = endDate
            ? DateHelper(endDate).format('DD/MM/YYYY')
            : '-';
        const periodValue = `${periodStart} a ${periodEnd}`;
        currentPage.drawText('Período', {
            x: margin + fieldWidth + 20 + fieldPadding,
            y: currentY - 15,
            size: 9,
            font: normalFont,
            color: darkGray,
        });
        currentPage.drawText(periodValue, {
            x: margin + fieldWidth + 20 + fieldPadding,
            y: currentY - 30,
            size: 11,
            font: boldFont,
            color: black,
        });

        currentY -= 70;

        const finalBalance = transactionsWithBalance.length > 0
            ? transactionsWithBalance[transactionsWithBalance.length - 1].balance
            : initialBalance;

        const summaryY = currentY;
        currentPage.drawText('Resumo do Período', {
            x: margin,
            y: summaryY,
            size: 14,
            font: boldFont,
            color: black,
        });

        currentY -= 25;

        currentPage.drawText('Saldo Inicial:', {
            x: margin,
            y: currentY,
            size: 10,
            font: normalFont,
            color: darkGray,
        });
        currentPage.drawText(this.formatCurrency(initialBalance), {
            x: margin + 120,
            y: currentY,
            size: 10,
            font: boldFont,
            color: black,
        });

        currentY -= 20;

        currentPage.drawText('Saldo Final:', {
            x: margin,
            y: currentY,
            size: 10,
            font: normalFont,
            color: darkGray,
        });
        currentPage.drawText(this.formatCurrency(finalBalance), {
            x: margin + 120,
            y: currentY,
            size: 10,
            font: boldFont,
            color: black,
        });

        currentY -= 30;

        currentPage.drawLine({
            start: { x: margin, y: currentY },
            end: { x: pageWidth - margin, y: currentY },
            thickness: 1,
            color: mediumGray,
        });

        currentY -= 20;

        const colDateWidth = 140;
        const colValueWidth = 120;
        const colTypeWidth = 120;
        const tableX = margin;

        const headerY = currentY;
        currentPage.drawText('Data', {
            x: tableX,
            y: headerY,
            size: 12,
            font: boldFont,
            color: black,
        });
        currentPage.drawText('Valor (R$)', {
            x: tableX + colDateWidth,
            y: headerY,
            size: 12,
            font: boldFont,
            color: black,
        });
        currentPage.drawText('Tipo', {
            x: tableX + colDateWidth + colValueWidth,
            y: headerY,
            size: 12,
            font: boldFont,
            color: black,
        });
        currentPage.drawText('Saldo', {
            x: tableX + colDateWidth + colValueWidth + colTypeWidth,
            y: headerY,
            size: 12,
            font: boldFont,
            color: black,
        });

        currentY -= headerHeight;

        currentPage.drawLine({
            start: { x: tableX, y: currentY },
            end: { x: pageWidth - margin, y: currentY },
            thickness: 1.5,
            color: mediumGray,
        });

        currentY -= 10;

        const pages = [];
        let pageNumber = 1;
        const minYForRow = bottomMargin + rowHeight + 20;

        if (transactionsWithBalance.length === 0) {
            currentPage.drawText('Nenhuma transação encontrada no período selecionado.', {
                x: tableX,
                y: currentY,
                size: 11,
                font: normalFont,
                color: darkGray,
            });
        }

        transactionsWithBalance.forEach((transaction) => {
            if (currentY < minYForRow) {
                drawFooter(currentPage, pageNumber, 0);
                pages.push({ page: currentPage, number: pageNumber });
                createNewPage();
                pageNumber += 1;
                currentY = pageHeight - topMargin;
            }

            currentPage.drawLine({
                start: { x: tableX, y: currentY },
                end: { x: pageWidth - margin, y: currentY },
                thickness: 1,
                color: mediumGray,
            });

            const rowY = currentY - 15;

            const dateText = this.formatDateTime(transaction.date);
            currentPage.drawText(dateText, {
                x: tableX,
                y: rowY,
                size: 9,
                font: normalFont,
                color: darkGray,
            });

            const valueText = this.formatCurrency(Math.abs(transaction.value));
            currentPage.drawText(valueText, {
                x: tableX + colDateWidth,
                y: rowY,
                size: 9,
                font: normalFont,
                color: darkGray,
            });

            currentPage.drawText(transaction.type, {
                x: tableX + colDateWidth + colValueWidth,
                y: rowY,
                size: 9,
                font: normalFont,
                color: darkGray,
            });

            const balanceText = this.formatCurrency(transaction.balance);
            currentPage.drawText(balanceText, {
                x: tableX + colDateWidth + colValueWidth + colTypeWidth,
                y: rowY,
                size: 9,
                font: normalFont,
                color: darkGray,
            });

            currentY -= rowHeight + 5;
        });

        pages.push({ page: currentPage, number: pageNumber });
        const totalPages = pageNumber;

        const allPages = pdfDoc.getPages();
        allPages.forEach((page, index) => {
            drawFooter(page, index + 1, totalPages);
        });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}

module.exports = StatementHelper;

