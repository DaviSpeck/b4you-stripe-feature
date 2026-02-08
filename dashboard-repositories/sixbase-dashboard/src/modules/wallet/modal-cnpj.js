import cepPromise from 'cep-promise';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller, useForm } from 'react-hook-form';
import {
  default as InputMask,
  default as ReactInputMask,
} from 'react-input-mask';
import { PatternFormat } from 'react-number-format';
import ReactSelect from 'react-select';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import { notify } from '../functions';

export default function ModalCnpj({ show, handleClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [state, setState] = useState(null);
  const [cep, setCep] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [anualRevenue, setAnualRevenue] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [type, setType] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bankCode, setBankCode] = useState(null);
  const [agency, setAgency] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const {
    register,
    handleSubmit,
    errors,
    control,
    setValue,
    getValues,
    reset,
  } = useForm({
    mode: 'onChange',
  });

  const isStepValid = () => {
    const requiredFields = {
      1: ['cnpj', 'company_name', 'type', 'whatsapp', 'birth_date'],
      2: ['agency', 'account_number', 'account_type'],
      3: [
        'zipcode',
        'state',
        'city',
        'street',
        'number',
        'complement',
        'neighborhood',
        'confirm',
      ],
    };

    if (!anualRevenue) {
      return false;
    } else {
      const newValue = parseFloat(
        anualRevenue.replaceAll('.', '').replace(',', '.')
      );

      if (newValue < 500) {
        return false;
      }
    }

    if (bankCode && !bankCode.value) {
      return false;
    }

    const stepFields = requiredFields[step];
    return stepFields.every((field) => getValues(field));
  };

  const onSubmit = async (data) => {
    data.account_number = data.account_number.replace('-', '');
    data.state = state;
    data.zipcode = cep;
    data.annual_revenue = anualRevenue;
    data.bank_code = bankCode.value;

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
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const getDelivery = (cep) => {
    cepPromise(cep)
      .then((r) => {
        setValue('street', r.street);
        setValue('city', r.city);
        setValue('neighborhood', r.neighborhood);
        setState(r.state);

        setStreet(r.street);
        setCity(r.city);
        setNeighborhood(r.neighborhood);
      })
      .catch((err) => err);
  };

  const handleCloseModal = () => {
    handleClose();
    setStep(1);
    setRequesting(false);
    setConfirm(false);
    setCnpj('');
    setAnualRevenue('');
    setTradingName('');
    setCompanyName('');
    setType('');
    setWhatsapp('');
    setBirthDate('');
    setBankCode(null);
    setAgency('');
    setAccountNumber('');
    setAccountType('');
    setCep('');
    setCity('');
    setStreet('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    reset();
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
    setLoading(true);

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

          setCep(response.data.address.zipcode);
          setAgency(response.data.bank_account.agency);
          setAccountNumber(response.data.bank_account.account_number);
          setAccountType(response.data.bank_account.account_type);

          if (bankList.length > 0) {
            const selectedBank = bankList.find(
              (bank) => bank.value === response.data.bank_account.bank_code
            );
            if (selectedBank) {
              setValue('bank_code', selectedBank.value);
              setBankCode(selectedBank);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [bankList]);

  useEffect(() => {
    setValue('state', state);
  }, [state]);

  useEffect(() => {
    if (cep) {
      getDelivery(cep);
    }
  }, [cep]);

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
      centered
      size='xl'
      className='modal-generic'
    >
      <Modal.Header closeButton className='d-flex flex-column modal-cnpj'>
        <Modal.Title>Alterar a minha conta para CNPJ</Modal.Title>

        <p className='mt-4'>
          As vendas realizadas através da sua conta Pessoa Física deverão ser
          sacadas para sua conta bancária Pessoa Física. As novas vendas serão
          creditadas em sua conta bancária CNPJ. Esta alteração é irreversível.
        </p>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {step === 1 && (
            <Row>
              <Col md={12} className='mb-2'>
                <label>DADOS DA EMPRESA</label>
              </Col>

              {loading ? (
                <div className='d-flex justify-content-center w-100'>
                  <Loader title='Carregando...' />
                </div>
              ) : (
                <>
                  <Col md={6}>
                    <div className='form-group'>
                      <label>
                        CNPJ <span style={{ color: 'red' }}>*</span>
                      </label>
                      <InputMask
                        name='cnpj'
                        ref={register({
                          required: 'Campo obrigatório',
                        })}
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
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
                      <label>
                        Receita Anual da Empresa{' '}
                        <span style={{ color: 'red' }}>*</span>
                      </label>

                      <Controller
                        control={control}
                        name='annual_revenue'
                        rules={{
                          required: 'Campo obrigatório',
                          validate: (value) => {
                            let newValue = parseFloat(
                              value.replaceAll('.', '').replace(',', '.')
                            );

                            return newValue < 500
                              ? 'Valor mínimo de R$ 500,00'
                              : true;
                          },
                        }}
                        render={({ onChange }) => (
                          <CurrencyInput
                            value={anualRevenue}
                            onChangeEvent={(e, maskedvalue) => {
                              onChange(maskedvalue);
                              setAnualRevenue(maskedvalue);
                            }}
                            className={'form-control'}
                            decimalSeparator=','
                            thousandSeparator='.'
                          />
                        )}
                      />

                      <div className='form-error' id='cpf_help'>
                        {errors.annual_revenue && (
                          <span>{errors.annual_revenue.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className='form-group'>
                      <label>Nome Fantasia</label>
                      <input
                        name='trading_name'
                        ref={register()}
                        className={'form-control'}
                        value={tradingName}
                        onChange={(e) => setTradingName(e.target.value)}
                      />
                      <div className='form-error' id='cpf_help'>
                        {errors.trading_name && (
                          <span>{errors.trading_name.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className='form-group'>
                      <label>
                        Razão Social da Empresa{' '}
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        name='company_name'
                        ref={register({ required: 'Campo obrigatório' })}
                        className={'form-control'}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                      <div className='form-error' id='cpf_help'>
                        {errors.company_name && (
                          <span>{errors.company_name.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col md={3}>
                    <div className='form-group'>
                      <label>
                        Tipo da Empresa <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        name='type'
                        ref={register({ required: 'Campo obrigatório' })}
                        className={'form-control'}
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value=''>Selecione</option>
                        <option value='MEI'>MEI</option>
                        <option value='LTDA'>LTDA</option>
                        <option value='EIRELI'>EIRELI</option>
                        <option value='S/A'>S/A</option>
                        <option value='SIMPLES'>SIMPLES</option>
                        <option value='MATRIZ'>MATRIZ</option>
                        <option value='EPP'>EPP</option>
                        <option value='ME'>ME</option>
                      </select>
                      <div className='form-error' id='cpf_help'>
                        {errors.type && <span>{errors.type.message}</span>}
                      </div>
                    </div>
                  </Col>

                  <Col md={3}>
                    <div className='form-group'>
                      <label>
                        Telefone <span style={{ color: 'red' }}>*</span>
                      </label>
                      <ReactInputMask
                        ref={register({
                          required: 'Campo obrigatório',
                          validate: (value) => value !== '(99) 99999-9999',
                        })}
                        className='form-control'
                        mask='(99) 99999-9999'
                        name='whatsapp'
                        placeholder='(00) 00000-0000'
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                      />
                      <div className='form-error' id='cpf_help'>
                        {errors.whatsapp && (
                          <span>{errors.whatsapp.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className='form-group'>
                      <label>
                        Data de nasc. do sócio majoritário{' '}
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className='d-flex'>
                        <ReactInputMask
                          ref={register({
                            required: 'Campo obrigatório',
                            validate: (value) => {
                              if (value) {
                                const date = moment(value, 'DD/MM/YYYY');
                                return (
                                  date.isValid() && date.isBefore(moment())
                                );
                              }
                              return false;
                            },
                          })}
                          className='form-control'
                          mask='99/99/9999'
                          name='birth_date'
                          placeholder='__/__/____'
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                        />
                      </div>
                      <div className='form-error' id='cpf_help'>
                        {errors.birth_date && (
                          <span>{errors.birth_date.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>
                </>
              )}
            </Row>
          )}

          {step === 2 && (
            <Row>
              <Col md={12} className='mb-2'>
                <label>DADOS BANCÁRIOS DA EMPRESA</label>
              </Col>

              {loading ? (
                <div className='d-flex justify-content-center w-100'>
                  <Loader title='Carregando...' />
                </div>
              ) : (
                <>
                  <Col md={6}>
                    <div className='form-group'>
                      <label>
                        Banco <span style={{ color: 'red' }}>*</span>
                      </label>
                      <Controller
                        name='bank_code'
                        control={control}
                        className={`form-control input-default`}
                        rules={{
                          required: 'Campo obrigatório',
                          validate: (value) => value !== 'Selecione o banco...',
                        }}
                        render={({ onChange, ref }) => (
                          <ReactSelect
                            inputRef={ref}
                            placeholder='Selecione o banco...'
                            isMulti={false}
                            options={bankList}
                            value={bankCode}
                            onChange={(val) => {
                              onChange(val.value);
                              setBankCode(val);
                            }}
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
                      <label>
                        Agência (sem dígito){' '}
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
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
                      <label>
                        Conta (com dígito){' '}
                        <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
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
                        maxLength='13'
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
                      <label>
                        Tipo de Conta <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        ref={register({ required: 'Campo obrigatório' })}
                        className={`form-control `}
                        name='account_type'
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
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
                </>
              )}
            </Row>
          )}

          {step === 3 && (
            <Row>
              <Col md={12} className='mb-4'>
                <label>ENDEREÇO DA EMPRESA</label>
              </Col>

              {loading ? (
                <div className='d-flex justify-content-center w-100'>
                  <Loader title='Carregando...' />
                </div>
              ) : (
                <>
                  <Col md={4}>
                    <div className='form-group'>
                      <label>
                        CEP <span style={{ color: 'red' }}>*</span>
                      </label>

                      <div className='d-flex'>
                        <Controller
                          name='zipcode'
                          control={control}
                          ref={register({ required: 'Campo obrigatório' })}
                          render={({ field }) => (
                            <PatternFormat
                              {...field}
                              onValueChange={(values) => {
                                if (values.value.length === 8) {
                                  getDelivery(values.value);
                                  setCep(values.value);
                                }
                              }}
                              value={cep}
                              type='text'
                              placeholder='CEP'
                              format='#####-###'
                              valueIsNumericString={true}
                              className={
                                errors.zipcode
                                  ? 'form-control is-invalid'
                                  : 'form-control'
                              }
                            />
                          )}
                        />
                      </div>
                      <div className='form-error' id='cep_help'>
                        {errors.zipcode && (
                          <span>{errors.zipcode.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className='form-group'>
                      <label>
                        Estado <span style={{ color: 'red' }}>*</span>
                      </label>
                      <select
                        ref={register({ required: 'Campo obrigatório' })}
                        type='text'
                        className='form-control'
                        name='state'
                        id='state'
                        disabled={true}
                        value={state}
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

                  <Col md={4}>
                    <div className='form-group'>
                      <label>
                        Cidade <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        ref={register({ required: 'Campo obrigatório' })}
                        type='text'
                        className='form-control'
                        name='city'
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      <div className='form-error' id='cpf_help'>
                        {errors.city && <span>{errors.city.message}</span>}
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className='form-group'>
                      <label>
                        Rua <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        ref={register({ required: 'Campo obrigatório' })}
                        type='text'
                        className='form-control'
                        name='street'
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                      <div className='form-error' id='cpf_help'>
                        {errors.street && <span>{errors.street.message}</span>}
                      </div>
                    </div>
                  </Col>

                  <Col md={3}>
                    <div className='form-group'>
                      <label>
                        Número <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
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
                      <label>
                        Complemento <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        ref={register({ required: 'Campo obrigatório' })}
                        type='text'
                        className='form-control'
                        name='complement'
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
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
                      <label>
                        Bairro <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        ref={register({ required: 'Campo obrigatório' })}
                        type='text'
                        className='form-control'
                        name='neighborhood'
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                      />
                      <div className='form-error' id='cpf_help'>
                        {errors.neighborhood && (
                          <span>{errors.neighborhood.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col md={12}>
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
                      <span>
                        Confirmo que sou o sócio administrador deste CNPJ
                      </span>
                    </label>
                  </Col>
                </>
              )}
            </Row>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <div className='d-flex w-100 justify-content-end'>
          {step > 1 && (
            <ButtonDS
              className='mr-2'
              variant='light'
              disabled={requesting}
              onClick={prevStep}
              style={{
                minWidth: '100px',
              }}
            >
              Anterior
            </ButtonDS>
          )}

          {step < 3 ? (
            <ButtonDS
              variant='primary'
              disabled={requesting}
              onClick={() => {
                if (isStepValid()) {
                  nextStep();
                } else {
                  notify({
                    message:
                      'Preencha todos os campos obrigatórios antes de continuar.',
                    type: 'error',
                  });
                }
              }}
              style={{
                minWidth: '100px',
              }}
            >
              Próximo
            </ButtonDS>
          ) : (
            <ButtonDS
              type='submit'
              variant='success'
              disabled={requesting}
              onClick={handleSubmit(onSubmit)}
              style={{
                minWidth: '100px',
              }}
            >
              {requesting ? (
                <>
                  Salvando... <i className='bx bx-loader-alt bx-spin'></i>
                </>
              ) : (
                'Salvar'
              )}
            </ButtonDS>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
