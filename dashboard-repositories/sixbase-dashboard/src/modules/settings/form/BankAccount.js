import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { Controller, useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { useUser } from '../../../providers/contextUser';
import { notify } from '../../functions';
import ModalGeneric from '../../../jsx/components/ModalGeneric';

const BankAccount = ({
  data,
  setData,
  dataCNPJ,
  documentNumber = null,
  companyNumber = null,
  bank_account_pending_approval,
}) => {
  const [requesting, setRequesting] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [selectedAccountType, setSelectedAccountType] = useState('fisica');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localPending, setLocalPending] = useState(
    Boolean(bank_account_pending_approval)
  );

  const { register, handleSubmit, control, formState, reset } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;
  const { user } = useUser();

  const isAccountLocked =
    user?.verified_company_pagarme === 3 ||
    user?.verified_pagarme === 3 ||
    user?.verified_company_pagarme_3 === 3 ||
    user?.verified_pagarme_3 === 3;

  const isPending = Boolean(
    localPending ||
    bank_account_pending_approval ||
    user?.bank_account_pending_approval ||
    false
  );

  const disablePF = isPending;
  const disablePJ = isPending;

  useEffect(() => {
    setLocalPending(Boolean(bank_account_pending_approval));
  }, [bank_account_pending_approval]);

  const onSubmit = (data) => {
    if (data.account_number) {
      data.account_number = data.account_number.replace('-', '');
    }
    setRequesting(true);
    api
      .put('/users/profile/bankaccount', data)
      .then((response) => {
        setRequesting(false);
        setData(response.data);
        setLocalPending(true);
        notify({
          message: 'Conta bancária salva com sucesso',
          type: 'success',
        });
        setShowConfirmModal(true);
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message || 'Falha ao salvar a conta bancária';
        notify({
          message,
          type: 'error',
        });
        setRequesting(false);
      });
  };

  const onSubmitCnpj = (data) => {
    if (data.company_account_number) {
      data.company_account_number = data.company_account_number.replace(/\D/g, '');
    }

    setRequesting(true);

    api
      .put('/users/profile/bankaccount/cnpj', data)
      .then((response) => {
        setRequesting(false);
        setData(response.data);
        setLocalPending(true);
        notify({
          message: 'Conta bancária salva com sucesso',
          type: 'success',
        });
        setShowConfirmModal(true);
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message || 'Falha ao salvar a conta bancária';
        notify({
          message,
          type: 'error',
        });
        setRequesting(false);
      });
  };

  useEffect(() => {
    if (selectedAccountType === 'fisica') {
      if (data) {
        const documentNumberFormatter = documentNumber
          ? String(documentNumber).replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            '$1.$2.$3-$4'
          )
          : null;

        reset({ ...data, document_number: documentNumberFormatter });
      }
    }
    if (selectedAccountType === 'juridica' && companyNumber) {
      if (dataCNPJ) {
        const companyNumberFormatter = companyNumber
          ? String(companyNumber).replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            '$1.$2.$3/$4-$5'
          )
          : null;

        reset({ ...dataCNPJ, cnpj: companyNumberFormatter });
      }
    }
  }, [selectedAccountType, data, dataCNPJ]);

  useEffect(() => {
    api.get('/banks').then(({ data }) =>
      setBankList(
        data.map((d) => ({
          ...d,
          label: ` ${d.value} - ${d.label.toUpperCase()}`,
        }))
      )
    );
  }, []);

  useEffect(() => {
    if (!companyNumber) return;
    setSelectedAccountType('juridica');
  }, [companyNumber]);

  const isCompany = Boolean(user?.verified_company_pagarme && user?.cnpj);

  return (
    <>
      {(selectedAccountType === 'fisica' || !user?.cnpj) && (
        <>
          <h4>
            Conta Bancária - {isCompany ? 'Pessoa jurídica' : 'Pessoa Física'}
          </h4>

          {isPending && (
            <span
              style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '5px',
                borderRadius: '5px',
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
              }}
            >
              Solicitação de alteração em análise
            </span>
          )}

          {!user.birth_date && (
            <span
              style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '5px',
                borderRadius: '5px',
                display: 'block',
                marginBottom: '10px',
              }}
            >
              Você precisa atualizar sua data de nascimento para cadastrar uma
              conta bancária.
            </span>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col xs={7}>
                <BankAccount.CpfOrCnpj
                  type={isCompany ? 'jurídica' : 'física'}
                  value={isCompany ? companyNumber : user.document_number}
                />
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Banco</label>
                  <Controller
                    name='bank_code'
                    control={control}
                    render={({ onChange, value, ref }) => {
                      return (
                        <Select
                          inputRef={ref}
                          placeholder='Selecione o banco...'
                          isMulti={false}
                          options={bankList}
                          value={bankList.find((c) => c.value === value)}
                          onChange={(val) => onChange(val.value)}
                          isDisabled={disablePF || !user.birth_date}
                        />
                      );
                    }}
                  />
                </div>
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Agência (sem dígito)</label>
                  <input
                    style={{
                      backgroundColor:
                        disablePF || !user.birth_date
                          ? '#f2f2f2'
                          : 'transparent',
                    }}
                    ref={register({ required: true })}
                    type='text'
                    className='form-control input-default '
                    name='agency'
                    maxLength='4'
                    disabled={disablePF || !user.birth_date}
                  />
                </div>
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Conta (com dígito)</label>
                  <input
                    style={{
                      backgroundColor:
                        disablePF || !user.birth_date
                          ? '#f2f2f2'
                          : 'transparent',
                    }}
                    ref={register({ required: true })}
                    type='text'
                    className='form-control input-default '
                    name='account_number'
                    disabled={disablePF || !user.birth_date}
                  />
                </div>
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Tipo de Conta</label>
                  <select
                    style={{
                      backgroundColor:
                        disablePF || !user.birth_date
                          ? '#f2f2f2'
                          : 'transparent',
                    }}
                    ref={register}
                    className='form-control'
                    name='account_type'
                    disabled={disablePF || !user.birth_date}
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
                </div>
              </Col>
            </Row>
            {
              <Row>
                <Col className='mt-3'>
                  <ButtonDS
                    variant='primary'
                    size='sm'
                    type='submit'
                    disabled={
                      !isValid || requesting || !user.birth_date || disablePF
                    }
                    outline
                  >
                    {!requesting ? 'Solicitar alteração' : 'Solicitando...'}
                  </ButtonDS>
                </Col>
              </Row>
            }
          </form>
        </>
      )}

      {selectedAccountType === 'juridica' && (
        <>
          <h4>Conta Bancária - Pessoa Jurídica</h4>
          {isPending && (
            <span
              style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '5px',
                borderRadius: '5px',
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
              }}
            >
              Solicitação de alteração em análise
            </span>
          )}

          <form onSubmit={handleSubmit(onSubmitCnpj)}>
            <Row>
              <Col xs={7}>
                <BankAccount.CpfOrCnpj type={'juridica'} value={user?.cnpj} />
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Banco</label>
                  <Controller
                    name='company_bank_code'
                    control={control}
                    render={({ onChange, value, ref }) => {
                      return (
                        <Select
                          inputRef={ref}
                          placeholder='Selecione o banco...'
                          isMulti={false}
                          options={bankList}
                          value={bankList.find((c) => c.value === value)}
                          onChange={(val) => onChange(val.value)}
                          isDisabled={disablePJ || !user.birth_date}
                        />
                      );
                    }}
                  />
                </div>
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Agência (sem dígito)</label>
                  <input
                    style={{
                      backgroundColor:
                        disablePJ || !user.birth_date
                          ? '#f2f2f2'
                          : 'transparent',
                    }}
                    ref={register({ required: true })}
                    type='text'
                    className='form-control input-default '
                    name='company_agency'
                    maxLength='4'
                    disabled={disablePJ || !user.birth_date}
                  />
                </div>
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Conta (com dígito)</label>
                  <input
                    style={{
                      backgroundColor:
                        disablePJ || !user.birth_date
                          ? '#f2f2f2'
                          : 'transparent',
                    }}
                    ref={register({ required: true })}
                    type='text'
                    className='form-control input-default '
                    name='company_account_number'
                    disabled={disablePJ || !user.birth_date}
                  />
                </div>
              </Col>
              <Col xs={7}>
                <div className='form-group'>
                  <label>Tipo de Conta</label>
                  <select
                    style={{
                      backgroundColor:
                        disablePJ || !user.birth_date
                          ? '#f2f2f2'
                          : 'transparent',
                    }}
                    ref={register}
                    className='form-control'
                    name='company_account_type'
                    disabled={disablePJ || !user.birth_date}
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
                </div>
              </Col>
            </Row>
            {
              <Row>
                <Col className='mt-3'>
                  <ButtonDS
                    variant='primary'
                    size='sm'
                    type='submit'
                    disabled={requesting || disablePJ || !user.birth_date}
                    outline
                  >
                    {!requesting ? 'Solicitar alteração' : 'Solicitando...'}
                  </ButtonDS>
                </Col>
              </Row>
            }
          </form>
        </>
      )}
      <ModalGeneric
        show={showConfirmModal}
        setShow={setShowConfirmModal}
        title='Conta bancária'
        centered
      >
        <Row>
          <Col md={12} className='mb-3 text-center'>
            <b>Em breve sua conta será alterada.</b>
          </Col>
          <Col md={12} className='d-flex justify-content-center'>
            <ButtonDS
              variant='primary'
              onClick={() => setShowConfirmModal(false)}
            >
              Ok
            </ButtonDS>
          </Col>
        </Row>
      </ModalGeneric>
    </>
  );
};

// eslint-disable-next-line react/display-name
BankAccount.CpfOrCnpj = function (props) {
  const { type, value } = props;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      <span style={{ fontWeight: '500', display: 'block' }}>
        Documento verificado:
      </span>
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          padding: '6px 8px',
          borderRadius: '4px',
        }}
      >
        <span style={{ display: 'block' }}>
          {type === 'física'
            ? value && /^\d{11}$/.test(value)
              ? value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
              : 'Não informado'
            : value && /^\d{14}$/.test(value)
              ? value.replace(
                /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                '$1.$2.$3/$4-$5'
              )
              : 'Não informado'}
        </span>
        <IoMdCheckmarkCircleOutline size={'20px'} color='#19c921' />
      </div>
    </div>
  );
};

export default BankAccount;
