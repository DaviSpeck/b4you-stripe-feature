import { Pagarme } from '../services/Pagarme.mjs';
import { Users } from '../database/models/Users.mjs';
// import consultarCNPJ from 'consultar-cnpj';
import consultarCNPJ from '../services/consultarCNPJ.mjs';
import { CnpjaOpen } from '@cnpja/sdk';

const getCompanyBankAccount = ({
  bank_code,
  account_number,
  agency,
  account_type,
  company_bank_code,
  company_account_number,
  company_agency,
  company_account_type,
  full_name,
}) => {
  if (
    company_bank_code &&
    company_account_type &&
    company_agency &&
    company_account_number
  ) {
    return {
      holder_name: full_name.substring(0, 30),
      bank_code: company_bank_code.replace(/\D/g, ''),
      agency: company_agency.replace(/\D/g, ''),
      account: company_account_number.replace(/\D/g, '').slice(0, -1),
      account_digit: company_account_number.replace(/\D/g, '').slice(-1),
      type: company_account_type === 'conta-corrente' ? 'checking' : 'savings',
    };
  }

  return {
    holder_name: full_name.substring(0, 30),
    bank_code: bank_code.replace(/\D/g, ''),
    agency: agency.replace(/\D/g, ''),
    account: account_number.replace(/\D/g, '').slice(0, -1),
    account_digit: account_number.replace(/\D/g, '').slice(-1),
    type: account_type === 'conta-corrente' ? 'checking' : 'savings',
  };
};

function isValidObj(obj) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (obj[key] === null) {
      return false;
    }
  }
  return true;
}
export class CreateSeller {
  #database;
  constructor(database) {
    this.#database = database;
  }

  async create({ id_user, is_company, data }) {
    console.log(
      `CREATING SELLER - ID_USER ${id_user} - is_company ${is_company}}`
    );
    const user = await Users.findByPk(id_user);
    if (
      is_company &&
      user.pagarme_recipient_id_cnpj &&
      user.verified_company_pagarme === 3 &&
      user.pagarme_recipient_id_cnpj_3 &&
      user.verified_company_pagarme_3 === 3
    ) {
      return;
    }
    if (
      !is_company &&
      user.pagarme_recipient_id &&
      user.verified_pagarme === 3 &&
      user.pagarme_recipient_id_3 &&
      user.verified_pagarme_3 === 3
    ) {
      return;
    }

    await this.#database.sequelize.transaction(async (t) => {
      try {
        if (is_company) {
          // const token = 'NR4GH1TByrQp2OsjnCxcxph8IpsBz9vZafGlli4RFyWH';
          // const empresa = await consultarCNPJ(user.cnpj, null);
          // const empresa = await consultarCNPJ(user.cnpj, null);
          const cnpja = new CnpjaOpen();
          const empresa = await cnpja.office.read({ taxId: user.cnpj });
          console.log('empresa', empresa);
          const {
            alias: nome_fantasia,
            founded: data_inicio_atividade,
            mainActivity: { text },
            company: {
              name: razao_social,
              size: {
                acronym: tipo
              }
            },
            address: {
              street: logradouro,
              number: numero,
              details: complemento,
              district: bairro,
              zip: cep,
              city: city_name,
              state: state_name,
            }
          } = empresa
          const annual_revenue = parseInt(
            user.annual_revenue.replace(/\./g, '').replace(',', '.')
          );
          const monthly_income = annual_revenue / 12;
          const professional_occupation = text;
          const bodyPagarme = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            cpf: user.document_number,
            cnpj: user.cnpj,
            address: {
              street: logradouro,
              street_number: numero,
              complementary: complemento ?? 'sem complemento',
              neighborhood: bairro,
              city: city_name,
              state: state_name,
              zip_code: cep,
              reference_point: state_name ?? 'sem referencia',
            },
            company_name: nome_fantasia ?? razao_social,
            trading_name: razao_social,
            annual_revenue: annual_revenue > 0 ? annual_revenue : 15000,
            phone: user.whatsapp,
            birthdate: user.birth_date,
            monthly_income: monthly_income > 0 ? monthly_income : 15000,
            company_type: tipo,
            tipo,
            founding_date: data_inicio_atividade,
            professional_occupation,
            bank_account: getCompanyBankAccount(user),
          };
          console.log(JSON.stringify(bodyPagarme, null, 2));
          if (isValidObj(bodyPagarme)) {
            console.log('INICIANDO CADASTRO SELLER CNPJ');
            if (
              !user.pagarme_recipient_id_cnpj &&
              user.verified_company_pagarme !== 3
            ) {
              try {
                const pagarmeInstance = new Pagarme('B4YOU_PAGARME_2');
                const id = await pagarmeInstance.createSellerCNPJ(bodyPagarme);
                if (id) {
                  await Users.update(
                    { pagarme_recipient_id_cnpj: id },
                    { where: { id: user.id }, transaction: t }
                  );
                }
              } catch (error) {
                console.log('erro ao cadastrar cnpj chave 2 ->', error);
              }
            }
            if (
              !user.pagarme_recipient_id_cnpj_3 &&
              user.verified_company_pagarme_3 !== 3
            ) {
              try {
                const pagarmeInstance = new Pagarme('B4YOU_PAGARME_3');
                const id = await pagarmeInstance.createSellerCNPJ(bodyPagarme);
                if (id) {
                  await Users.update(
                    { pagarme_recipient_id_cnpj_3: id },
                    { where: { id: user.id }, transaction: t }
                  );
                }
              } catch (error) {
                console.log('erro ao cadastrar cnpj chave 3 ->', error);
              }
            }
          }
        } else {
          const body = {
            email: user.email,
            document: user.document_number,
            phone: user.whatsapp,
            full_name: `${user.first_name} ${user.last_name}`,
            birthdate: user.birth_date,
            revenue: data.revenue,
            occupation: data.occupation ?? 'Vendedor',
            bank_account: {
              holder_name: `${user.first_name} ${user.last_name}`,
              bank_code: user.bank_code.replace(/\D/g, ''),
              agency: user.agency.replace(/\D/g, ''),
              account: user.account_number.replace(/\D/g, '').slice(0, -1),
              account_digit: user.account_number.replace(/\D/g, '').slice(-1),
              type:
                user.account_type === 'conta-corrente' ? 'checking' : 'savings',
            },
            address: {
              street: user.street,
              street_number: user.number,
              complementary: user.complement ?? 'sem complemento',
              neighborhood: user.neighborhood,
              city: user.city,
              state: user.state,
              zip_code: user.zipcode,
              reference_point: user.complement ?? 'sem referencia',
            },
          };
          if (!user.pagarme_recipient_id && user.verified_pagarme !== 3) {
            try {
              const pagarmeInstance = new Pagarme('B4YOU_PAGARME_2');
              const id = await pagarmeInstance.createSellerCPF(body);
              await Users.update(
                { pagarme_recipient_id: id },
                {
                  where: {
                    id: user.id,
                  },
                  transaction: t,
                }
              );
            } catch (error) {
              console.log('erro ao cadastrar cpf chave 2 ->', error);
            }
          }

          if (!user.pagarme_recipient_id_3 && user.verified_pagarme_3 !== 3) {
            try {
              const pagarmeInstance = new Pagarme('B4YOU_PAGARME_3');
              const id = await pagarmeInstance.createSellerCPF(body);
              await Users.update(
                { pagarme_recipient_id_3: id },
                {
                  where: {
                    id: user.id,
                  },
                  transaction: t,
                }
              );
            } catch (error) {
              console.log('erro ao cadastrar cpf chave 3 ->', error);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
      console.log(`CREATE SELLER - COMPLETE`);
    });
    return user;
  }
}
