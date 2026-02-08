import { useEffect, useState } from 'react';
import { Col, Form, Row, Badge } from 'react-bootstrap';
import api from '../../providers/api';
import './style.scss';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import { Controller, useForm } from 'react-hook-form';
import ReactInputMask from 'react-input-mask';
import moment from 'moment';
import ReactSelect from 'react-select';
import occupations from './occupations';
import { useUser } from '../../providers/contextUser';

const SendDocuments = () => {
  const [requesting, setRequesting] = useState(false);
  const [bankList, setBankList] = useState([]);

  const { user } = useUser();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    errors,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    data.account_number = data.account_number.replace('-', '');

    setRequesting(true);
    api
      .post('/users/verify-id', data)
      .then(() => {
        setTimeout(() => {
          window.location.reload();
          setRequesting(false);
        }, 60000);
      })
      .catch(() => {
        setRequesting(false);
      });
  };

  useEffect(() => {
    api.get('/banks').then(({ data }) => {
      const formattedBankList = data.map((d) => ({
        ...d,
        label: ` ${d.value} - ${d.label.toUpperCase()}`,
      }));
      setBankList(formattedBankList);
    });
  }, []);

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
          if (occupations.length > 0) {
            const selectedOccupation = occupations.find(
              (occupation) => occupation.label === response.data.occupation
            );
            if (selectedOccupation) {
              setValue('occupation', selectedOccupation.value);
            }
          }
        }
      })
      .catch(() => { });
  }, [bankList, occupations]);

  return (
    <>
      <section id='page-identity'>
        <Form>
          <Row>
            {user?.verified_pagarme === 4 && (
              <>
                <Col>
                  <h4 className='text-danger' style={{ fontWeight: 'bold' }}>
                    Algo parece estar incorreto com as informações do seu CPF.
                  </h4>
                  <p>
                    Por favor, revise os dados e tente novamente. Os principais
                    motivos para a recusa podem ser:
                  </p>
                  <ul>
                    <li>● Conta bancária incompleta</li>
                    <li>● Endereço incompleto</li>
                  </ul>
                </Col>
              </>
            )}

            <Col md={12}>
              <span style={{ color: 'red' }}>
                *Você deve informar uma conta bancária vinculada ao seu CPF para
                conta pessoa física
              </span>
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
                  {errors.bank_code && <span>{errors.bank_code.message}</span>}
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
            <Col md={4}>
              <div className='form-group'>
                <label>Data de nascimento</label>
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
            <Col md={4}>
              <div className='form-group'>
                <label>Telefone</label>
                <ReactInputMask
                  ref={register({
                    required: 'Campo obrigatório',
                    validate: (value) => value !== '(99) 99999-9999',
                  })}
                  className='form-control'
                  mask='(99) 99999-9999'
                  name='whatsapp'
                  placeholder='(00) 00000-0000'
                />
                <div className='form-error' id='cpf_help'>
                  {errors.whatsapp && <span>{errors.whatsapp.message}</span>}
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className='form-group'>
                <label>Ocupação</label>
                <Controller
                  name='occupation'
                  control={control}
                  rules={{
                    required: 'Campo obrigatório',
                    validate: (value) => value !== 'Selecione uma ocupação...',
                  }}
                  render={({ onChange, value, ref }) => (
                    <ReactSelect
                      inputRef={ref}
                      placeholder='Selecione uma ocupação...'
                      isMulti={false}
                      options={occupations}
                      value={occupations.find((c) => c.value === value)}
                      onChange={(val) => onChange(val.label)}
                    />
                  )}
                />
                <div className='form-error' id='cpf_help'>
                  {errors.occupation && (
                    <span>{errors.occupation.message}</span>
                  )}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className='form-group'>
                <label>Rua</label>
                <input
                  ref={register({ required: 'Campo obrigatório' })}
                  type='text'
                  className='form-control'
                  name='street'
                />
                <div className='form-error' id='cpf_help'>
                  {errors.street && <span>{errors.street.message}</span>}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className='form-group'>
                <label>Número</label>
                <input
                  ref={register({
                    required: 'Campo obrigatório',
                    minLength: {
                      value: 1,
                      message: 'O nome deve ter no mínimo 1 caracteres',
                    },
                    maxLength: {
                      value: 8,
                      message: 'O nome deve ter no máximo 8 caracteres',
                    },
                    pattern: {
                      value: /^[0-9]+$/i,
                      message: 'O campo deve conter apenas números',
                    },
                  })}
                  type='text'
                  className='form-control'
                  name='number'
                />
                <div className='form-error' id='cpf_help'>
                  {errors.number && <span>{errors.number.message}</span>}
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className='form-group'>
                <label>Complemento</label>
                <input
                  ref={register({ required: 'Campo obrigatório' })}
                  type='text'
                  className='form-control'
                  name='complement'
                />
                <div className='form-error' id='cpf_help'>
                  {errors.complement && (
                    <span>{errors.complement.message}</span>
                  )}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className='form-group'>
                <label>Bairro</label>
                <input
                  ref={register({ required: 'Campo obrigatório' })}
                  type='text'
                  className='form-control'
                  name='neighborhood'
                />
                <div className='form-error' id='cpf_help'>
                  {errors.neighborhood && (
                    <span>{errors.neighborhood.message}</span>
                  )}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className='form-group'>
                <label>Cidade</label>
                <input
                  ref={register({ required: 'Campo obrigatório' })}
                  type='text'
                  className='form-control'
                  name='city'
                />
                <div className='form-error' id='cpf_help'>
                  {errors.city && <span>{errors.city.message}</span>}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className='form-group'>
                <label>Estado</label>
                <select
                  ref={register({ required: 'Campo obrigatório' })}
                  type='text'
                  className='form-control'
                  name='state'
                  id='state'
                >
                  <option value='AC'>AC</option>
                  <option value='AL'>AL</option>
                  <option value='AP'>AP</option>
                  <option value='AM'>AM</option>
                  <option value='BA'>BA</option>
                  <option value='CE'>CE</option>
                  <option value='DF'>DF</option>
                  <option value='ES'>ES</option>
                  <option value='GO'>GO</option>
                  <option value='MA'>MA</option>
                  <option value='MT'>MT</option>
                  <option value='MS'>MS</option>
                  <option value='MG'>MG</option>
                  <option value='PA'>PA</option>
                  <option value='PB'>PB</option>
                  <option value='PR'>PR</option>
                  <option value='PE'>PE</option>
                  <option value='PI'>PI</option>
                  <option value='RJ'>RJ</option>
                  <option value='RN'>RN</option>
                  <option value='RS'>RS</option>
                  <option value='RO'>RO</option>
                  <option value='RR'>RR</option>
                  <option value='SC'>SC</option>
                  <option value='SP'>SP</option>
                  <option value='SE'>SE</option>
                  <option value='TO'>TO</option>
                </select>
                <div className='form-error' id='cpf_help'>
                  {errors.state && <span>{errors.state.message}</span>}
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className='form-group'>
                <label>CEP</label>
                <ReactInputMask
                  ref={register({ required: 'Campo obrigatório' })}
                  className='form-control'
                  mask='99999-999'
                  name='zipcode'
                  placeholder='00000-000'
                />
                <div className='form-error' id='cpf_help'>
                  {errors.zipcode && <span>{errors.zipcode.message}</span>}
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col className='text-left mt-4'>
              <div className='d-flex justify-content-end'>
                <ButtonDS
                  size='sm'
                  type='submit'
                  disabled={requesting}
                  onClick={handleSubmit(onSubmit)}
                >
                  <div className='d-flex align-items-center'>
                    {requesting ? (
                      <>
                        <i className='bx bx-loader-alt bx-spin'></i>
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
      </section>
    </>
  );
};

export default SendDocuments;
