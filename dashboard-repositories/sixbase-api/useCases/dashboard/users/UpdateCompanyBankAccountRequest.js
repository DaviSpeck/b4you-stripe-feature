const ApiError = require('../../../error/ApiError');
const Users = require('../../../database/models/Users');
const { createUserBankAccounts } = require('../../../database/controllers/user_bank_accounts');

module.exports = class UpdateCompanyBankAccountRequest {
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
            company_account_type: user?.company_account_type,
            company_bank_code: user?.company_bank_code,
            company_agency: user?.company_agency,
            company_account_number: user?.company_account_number,
        };

        const newData = {
            company_account_type: this.data?.company_account_type,
            company_bank_code: this.data?.company_bank_code,
            company_agency: this.data?.company_agency,
            company_account_number: this.data?.company_account_number,
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
            is_company: true,
            pending_approval: true,
            cnpj: user?.cnpj,
            // OLD
            company_account_type_old: oldData.company_account_type,
            company_agency_old: oldData.company_agency,
            company_account_number_old: oldData.company_account_number,
            company_bank_code_old: oldData.company_bank_code,
            // NEW
            company_account_type: newData.company_account_type,
            company_agency: newData.company_agency,
            company_account_number: newData.company_account_number,
            company_bank_code: newData.company_bank_code,
        });

        return bankAccount;
    }
};
