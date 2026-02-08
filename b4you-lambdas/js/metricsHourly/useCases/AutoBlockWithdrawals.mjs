import { Products } from '../database/models/Products.mjs';
import { Withdrawal_notes } from '../database/models/Withdrawal_notes.mjs';
import { findSalesStatusByKey } from '../status/salesStatus.mjs';
import { date } from '../utils/helpers/date.mjs';
import { Op } from 'sequelize';

export class AutoBlockWithdrawals {
    constructor(UsersRepository, SalesItemsRepository, WithdrawalSettingsRepository) {
        this.UsersRepository = UsersRepository;
        this.SalesItemsRepository = SalesItemsRepository;
        this.WithdrawalSettingsRepository = WithdrawalSettingsRepository;
    }

    async execute(userId) {
        const user = await this.UsersRepository.findByID(userId);
        if (!user) throw new Error('Usuário não encontrado.');

        const thirtyDaysAgo = date().subtract(30, 'days');
        const now = date();

        const creditCardPurchases = await this.SalesItemsRepository.findAll({
            where: {
                payment_method: 'card',
                id_status: {
                    [Op.in]: [
                        findSalesStatusByKey('paid').id,
                        findSalesStatusByKey('chargeback').id,
                    ],
                },
                created_at: {
                    [Op.between]: [
                        thirtyDaysAgo.format('YYYY-MM-DD HH:mm:ss'),
                        now.format('YYYY-MM-DD HH:mm:ss'),
                    ],
                },
            },
            include: [
                {
                    model: Products,
                    as: 'product',
                    required: true,
                    where: { id_user: user.id },
                },
            ],
            attributes: ['id_status'],
        });

        const totalPurchases = creditCardPurchases.length;
        if (!totalPurchases)
            return {
                user,
                chargebackMetrics: {
                    totalPurchases: 0,
                    paidPurchases: 0,
                    chargebackPurchases: 0,
                    chargebackPercentage: 0,
                },
                withdrawalBlocked: false,
                withdrawalNoteCreated: false,
                withdrawalUnblocked: false,
                isAlreadyBlocked: false,
                period: {
                    start: thirtyDaysAgo.format('YYYY-MM-DD'),
                    end: now.format('YYYY-MM-DD'),
                },
            };

        const paidId = findSalesStatusByKey('paid').id;
        const chargebackId = findSalesStatusByKey('chargeback').id;

        let paidPurchases = 0;
        let chargebackPurchases = 0;

        for (const purchase of creditCardPurchases) {
            if (purchase.id_status === paidId) paidPurchases++;
            else if (purchase.id_status === chargebackId) chargebackPurchases++;
        }

        const chargebackPercentage = (chargebackPurchases / totalPurchases) * 100;
        const roundedChargebackPercentage = Math.round(chargebackPercentage * 100) / 100;

        const withdrawalSettings = await this.WithdrawalSettingsRepository.find({ id_user: user.id });
        const isAlreadyBlocked = !!withdrawalSettings?.blocked;
        const autoBlockEnabled = !!withdrawalSettings?.auto_block_enabled;

        const lastNote = await Withdrawal_notes.findOne({
            where: { id_user: user.id },
            order: [['created_at', 'DESC']],
            attributes: ['text'],
        });

        const isAutomaticBlockNote = !!lastNote?.text?.includes('Bloqueio automático');

        let withdrawalBlocked = false;
        let withdrawalNoteCreated = false;
        let withdrawalUnblocked = false;

        if (roundedChargebackPercentage > 1.9 && !isAlreadyBlocked && autoBlockEnabled) {
            await this.WithdrawalSettingsRepository.update(
                { id_user: user.id },
                { blocked: true },
            );

            await Withdrawal_notes.create({
                id_user: user.id,
                id_type: 0,
                text: `Bloqueio automático por chargeback alto: ${roundedChargebackPercentage}% (${chargebackPurchases}/${totalPurchases} compras) nos últimos 30 dias. Limite permitido: 1,9%`,
            });

            withdrawalBlocked = true;
            withdrawalNoteCreated = true;
        }

        if (isAlreadyBlocked && roundedChargebackPercentage <= 1.9 && isAutomaticBlockNote && autoBlockEnabled) {
            await this.WithdrawalSettingsRepository.update(
                { id_user: user.id },
                { blocked: false },
            );

            await Withdrawal_notes.create({
                id_user: user.id,
                id_type: 1,
                text: `Desbloqueio automático por chargeback baixo: ${roundedChargebackPercentage}% (${chargebackPurchases}/${totalPurchases} compras) nos últimos 30 dias. Limite permitido: 1,9%`,
            });

            withdrawalUnblocked = true;
        }

        return {
            user,
            chargebackMetrics: {
                totalPurchases,
                paidPurchases,
                chargebackPurchases,
                chargebackPercentage: roundedChargebackPercentage,
            },
            withdrawalBlocked,
            withdrawalNoteCreated,
            withdrawalUnblocked,
            isAlreadyBlocked,
            period: {
                start: thirtyDaysAgo.format('YYYY-MM-DD'),
                end: now.format('YYYY-MM-DD'),
            },
        };
    }
}