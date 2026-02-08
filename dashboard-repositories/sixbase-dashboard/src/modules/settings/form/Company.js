import { cnpj } from 'cpf-cnpj-validator';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Badge, Col, Form, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller, useForm } from 'react-hook-form';
import {
  default as InputMask,
  default as ReactInputMask,
} from 'react-input-mask';

import ReactSelect from 'react-select';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { notify } from '../../../modules/functions';
import api from '../../../providers/api';
import { useUser } from '../../../providers/contextUser';

const Company = () => {
  const [requesting, setRequesting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [bankList, setBankList] = useState([]);

  const { register, handleSubmit, errors, control, setValue } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    api
      .get('auth/me')
      .then((response) => {
        if (response.data !== null) {
          if (response.data.birth_date) {
            setValue(
              'birth_date',
              moment(response.data.birth_date).format('DD/MM/YYYY')
            );
          }
          setValue('zipcode', response.data.address.zipcode);
          setValue('city', response.data.address.city);
          setValue('neighborhood', response.data.address.neighborhood);
          setValue('complement', response.data.address.complement);
          setValue('number', response.data.address.number);
          setValue('street', response.data.address.street);
          setValue('whatsapp', response.data.whatsapp);
          setValue('agency', response.data.bank_account.agency);
          setValue('account_number', response.data.bank_account.account_number);
          setValue('account_type', response.data.bank_account.account_type);
          setValue('state', response.data.address.state);

          if (bankList.length > 0) {
            const selectedBank = bankList.find(
              (bank) => bank.value === response.data.bank_account.bank_code
            );
            if (selectedBank) {
              setValue('bank_code', selectedBank.value);
            }
          }
        }
      })
      .catch(() => {});
  }, [bankList]);

  useEffect(() => {
    api.get('/banks').then(({ data }) => {
      const formattedBankList = data.map((d) => ({
        ...d,
        label: ` ${d.value} - ${d.label.toUpperCase()}`,
      }));
      setBankList(formattedBankList);
    });
  }, []);

  const onSubmit = async (data) => {
    data.account_number = data.account_number.replace('-', '');

    setRequesting(true);
    api
      .put('/users/company', data)
      .then(() => {
        setTimeout(() => {
          window.location.href = 'https://dash.b4you.com.br/configuracoes';
        }, 20000);
      })
      .catch((error) => {
        notify({
          message: error.response.data.message,
          type: 'error',
          time: 20000,
        });
        setRequesting(false);
      });
  };

  return (
    <>
      <h4>Dados Gerais</h4>
      {useUser().user.verified_company_pagarme === 4 && (
        <>
          <Col md={12} className='mb-3 mt-3 text-center'>
            <Badge
              variant='danger'
              className='px-3 py-2'
              style={{ fontSize: '0.8rem' }}
            >
              CNPJ RECUSADO
            </Badge>
          </Col>
          <Col className='mb-4 text-center'>
            <h4 className='text-danger' style={{ fontWeight: 'bold' }}>
              Algo parece estar incorreto com as informações do seu CNPJ.
            </h4>
            <p className='mt-3'>
              Por favor, revise os dados e tente novamente. Os principais
              motivos para a recusa podem ser:
            </p>
            <ul className='list-unstyled mt-3'>
              <li className='mb-2'>
                <i className='bi bi-x-circle-fill text-danger'></i> ●
                Faturamento anual
              </li>
              <li className='mb-2'>
                <i className='bi bi-x-circle-fill text-danger'></i> ● Data de
                Nascimento do sócio divergente
              </li>
              <li className='mb-2'>
                <i className='bi bi-x-circle-fill text-danger'></i> ● CPF do
                sócio
              </li>
              <li className='mb-2'>
                <i className='bi bi-x-circle-fill text-danger'></i> ● Conta da
                empresa
              </li>
            </ul>
          </Col>
        </>
      )}

      {useUser().user.verified_company_pagarme === 3 ? (
        <div>
          <Row>
            <Col md={4}>
              <div className='form-group'>
                <label>CNPJ</label>
                <InputMask
                  name='cnpj'
                  value={useUser().user.cnpj}
                  ref={register({
                    required: true,
                    validate: (value) => {
                      let crop = value.substring(0, 18);

                      return cnpj.isValid(crop);
                    },
                  })}
                  className={
                    errors.company_name
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  mask='99.999.999/9999-99'
                  disabled={true}
                />
              </div>
            </Col>
            <Col md={12}>
              <Badge variant='success light'>Seu CNPJ está aprovado</Badge>
            </Col>
         
          </Row>
        </div>
      ) : (
        <>
          <Form>
            <Row>
              <Col md={12}>
                <span style={{ color: '#3A539B', fontWeight: 'bold' }}>
                  *** Todas as informações fornecidas a seguir devem ser
                  verdadeiras. Caso qualquer dado seja divergente, seu cadastro
                  será negado. Os dados informados devem corresponder à empresa
                  vinculada ao CNPJ fornecido.
                </span>
              </Col>
              <hr />
              <Col md={12}>
                <hr />
                <label>DADOS DA EMPRESA</label>
              </Col>
              <Col md={6}>
                <div className='form-group'>
                  <label>CNPJ</label>
                  <InputMask
                    name='cnpj'
                    ref={register({
                      required: 'Campo obrigatório',
                    })}
                    className={'form-control'}
                    mask='99.999.999/9999-99'
                  />
                  <div className='form-error' id='cpf_help'>
                    {errors.cnpj && <span>{errors.cnpj.message}</span>}
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className='form-group'>
                  <label>Receita Anual da Empresa</label>
                  <Controller
                    as={CurrencyInput}
                    control={control}
                    name='annual_revenue'
                    decimalSeparator=','
                    thousandSeparator='.'
                    className={'form-control'}
                    rules={{
                      required: 'Campo obrigatório',
                      validate: (value) => {
                        let newValue = parseFloat(
                          value.replaceAll('.', '').replace(',', '.')
                        );
                        return newValue < 500
                          ? 'Informa um valor mínimo'
                          : true;
                      },
                    }}
                  />
                  <div className='form-error' id='cpf_help'>
                    {errors.annual_revenue && (
                      <span>{errors.annual_revenue.message}</span>
                    )}
                  </div>
                </div>
              </Col>

              <Col md={5}>
                <div className='form-group'>
                  <label>Data de nasc. do sócio majoritário</label>
                  <div className='d-flex'>
                    <ReactInputMask
                      ref={register({
                        required: 'Campo obrigatório',
                        validate: (value) => {
                          if (value) {
                            const date = moment(value, 'DD/MM/YYYY');
                            return date.isValid() && date.isBefore(moment());
                          }
                          return false;
                        },
                      })}
                      className='form-control'
                      mask='99/99/9999'
                      name='birth_date'
                      placeholder='__/__/____'
                    />
                  </div>
                  <div className='form-error' id='cpf_help'>
                    {errors.birth_date && (
                      <span>{errors.birth_date.message}</span>
                    )}
                  </div>
                </div>
              </Col>

              <Col md={12}>
                <hr />
                <label>DADOS BANCÁRIOS DA EMPRESA</label>
              </Col>
              <Col md={6}>
                <div className='form-group'>
                  <label>Banco</label>
                  <Controller
                    name='bank_code'
                    control={control}
                    className={`form-control input-default`}
                    rules={{
                      required: 'Campo obrigatório',
                      validate: (value) => value !== 'Selecione o banco...',
                    }}
                    render={({ onChange, value, ref }) => (
                      <ReactSelect
                        inputRef={ref}
                        placeholder='Selecione o banco...'
                        isMulti={false}
                        options={bankList}
                        value={bankList.find((c) => c.value === value)}
                        onChange={(val) => onChange(val.value)}
                      />
                    )}
                  />
                  <div className='form-error' id='cpf_help'>
                    {errors.bank_code && (
                      <span>{errors.bank_code.message}</span>
                    )}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className='form-group'>
                  <label>Agência (sem dígito)</label>
                  <input
                    ref={register({
                      required: 'Campo obrigatório',
                      minLength: {
                        value: 4,
                        message: 'O nome deve ter no mínimo 4 caracteres',
                      },
                      maxLength: {
                        value: 4,
                        message: 'O nome deve ter no máximo 4 caracteres',
                      },
                      pattern: {
                        value: /^[0-9]+$/i,
                        message: 'O campo deve conter apenas números',
                      },
                    })}
                    type='text'
                    className={`form-control input-default }`}
                    name='agency'
                    maxLength='4'
                  />
                  <div className='form-error' id='cpf_help'>
                    {errors.agency && <span>{errors.agency.message}</span>}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className='form-group'>
                  <label>Conta (com dígito)</label>
                  <input
                    ref={register({
                      required: 'Campo obrigatório',
                      minLength: {
                        value: 4,
                        message: 'O nome deve ter no mínimo 4 caracteres',
                      },
                      maxLength: {
                        value: 13,
                        message: 'O nome deve ter no máximo 13 caracteres',
                      },
                      pattern: {
                        value: /^[0-9]+$/i,
                        message: 'O campo deve conter apenas números',
                      },
                    })}
                    type='text'
                    className={`form-control `}
                    name='account_number'
                  />
                  <div className='form-error' id='cpf_help'>
                    {errors.account_number && (
                      <span>{errors.account_number.message}</span>
                    )}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className='form-group'>
                  <label>Tipo de Conta</label>
                  <select
                    ref={register({ required: 'Campo obrigatório' })}
                    className={`form-control `}
                    name='account_type'
                  >
                    <option value='conta-corrente'>Conta Corrente</option>
                    <option value='conta-poupanca'>Conta Poupança</option>
                    <option value='conta-corrente-conjunta'>
                      Conta Corrente Conjunta
                    </option>
                    <option value='conta-poupanca-conjunta'>
                      Conta Poupança Conjunta
                    </option>
                  </select>
                  <div className='form-error' id='cpf_help'>
                    {errors.account_type && (
                      <span>{errors.account_type.message}</span>
                    )}
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <label htmlFor='confirm' className='pointer mt-4'>
                  <input
                    ref={register({ required: 'Campo obrigatório' })}
                    id='confirm'
                    type='checkbox'
                    checked={confirm}
                    name='confirm'
                    onChange={() => {
                      setConfirm(!confirm);
                    }}
                    className='mr-2'
                  />
                  <span>Confirmo que sou o sócio administrador deste CNPJ</span>
                </label>
              </Col>
            </Row>
              <hr /> 
             <Row>
              <Col md={12}>
                <span style={{ color: '#3A539B', fontWeight: 'bold' }}>
                  As vendas realizadas após adição do cnpj, terão seus depósitos feitos obrigatoriamente em uma conta pessoa jurídica.
                </span>
              </Col>
              <hr />
              </Row>
            <Row>
              <Col className='text-left mt-4'>
                <div className='d-flex justify-content-end'>
                  <ButtonDS
                    size='sm'
                    type='submit'
                    disabled={requesting || !confirm}
                    onClick={handleSubmit(onSubmit)}
                  >
                    <div className='d-flex align-items-center'>
                      {requesting ? (
                        <>
                          Aguarde <i className='bx bx-loader-alt bx-spin'></i>
                        </>
                      ) : (
                        'Cadastrar'
                      )}
                    </div>
                  </ButtonDS>
                </div>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </>
  );
};

export default Company;
