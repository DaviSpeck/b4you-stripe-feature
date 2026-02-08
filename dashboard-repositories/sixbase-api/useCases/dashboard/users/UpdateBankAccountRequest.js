const ApiError = require('../../../error/ApiError');
const Users = require('../../../database/models/Users');
const { createUserBankAccounts } = require('../../../database/controllers/user_bank_accounts');

module.exports = class UpdateBankAccountRequest {
    constructor(id_user, data) {
        this.id_user = id_user;
        this.data = data;
    }

    async execute() {
        const user = await Users.findOne({
            raw: true,
            where: { id: this.id_user },
        });

        if (!user) throw ApiError.badRequest('Usuário não encontrado.');

        const oldData = {
            account_type: user?.account_type,
            bank_code: user?.bank_code,
            agency: user?.agency,
            account_number: user?.account_number,
        };

        const newData = {
            account_type: this.data?.account_type,
            bank_code: this.data?.bank_code,
            agency: this.data?.agency,
            account_number: this.data?.account_number,
        };

        const hasOldData = Object.values(oldData).some(v => !!v);
        if (!hasOldData) {
            return null;
        }

        const hasChanges = Object.keys(newData).some(
            key => newData[key] && newData[key] !== oldData[key]
        );
        if (!hasChanges) {
            return null;
        }

        const bankAccount = await createUserBankAccounts({
            id_user: this.id_user,
            is_company: false,
            pending_approval: true,
            document_number: user?.document_number,
            // OLD
            account_type_old: oldData.account_type,
            bank_code_old: oldData.bank_code,
            agency_old: oldData.agency,
            account_number_old: oldData.account_number,
            // NEW
            account_type: newData.account_type,
            bank_code: newData.bank_code,
            agency: newData.agency,
            account_number: newData.account_number,
        });

        return bankAccount;
    }
};
