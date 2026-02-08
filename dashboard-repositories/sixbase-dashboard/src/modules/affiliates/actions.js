import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller, useForm } from 'react-hook-form';
import Switch from 'react-switch';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';

const Actions = ({ activeAffiliate, setShow }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [affiliateStatus, setAffiliateStatus] = useState(
    activeAffiliate.status.id === 2
  );

  const { getValues, control, errors, formState, register } = useForm({
    mode: 'onChange',
    defaultValues: {
      commission: activeAffiliate.commission,
      subscription_fee_commission: activeAffiliate.subscription_fee_commission,
      subscription_fee_only: activeAffiliate.subscription_fee_only || '1',
    },
  });
  const { isValid } = formState;

  const handleChangeCommission = () => {
    setRequesting(true);

    let fields = {
      commission: parseFloat(
        String(getValues('commission'))
          .replace('%', '')
          .replace(/\./g, (m, i, s) => (s.includes(',') ? '' : m))
          .replace(',', '.')
      ),
    };

    if (activeAffiliate.subscription_fee) {
      fields.subscription_fee_commission = parseFloat(
        String(getValues('subscription_fee_commission'))
          .replace('%', '')
          .replace(/\./g, (m, i, s) => (s.includes(',') ? '' : m))
          .replace(',', '.')
      );
      fields.subscription_fee_only = parseInt(
        getValues('subscription_fee_only')
      );
    }

    api
      .put(`/affiliates/commission/${activeAffiliate.uuid}`, fields)
      .then(() => {
        notify({ message: 'Comissão salva com sucesso', type: 'success' });

        setShow(false);
        setRequesting(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao salvar comissão', type: 'error' });
        setRequesting(false);
      });
  };

  const handleManageAccess = () => {
    setAffiliateStatus(!affiliateStatus);
    api
      .put(
        `/affiliates/${!affiliateStatus ? 'active' : 'block'}/${activeAffiliate.uuid
        }`
      )
      .then(() => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Falha ao salvar', type: 'error' });
      });
  };

  return (
    <div>
      {activeAction === null && (
        <>
          <div className='mb-4'>
            <h4 className='mb-4'>{activeAffiliate.full_name}</h4>
          </div>
          <div className='d-flex justify-content-between'>
            <ButtonDS
              onClick={() => {
                setActiveAction('change-commission');
              }}
            >
              Alterar Comissão
            </ButtonDS>
            <ButtonDS
              onClick={() => {
                setActiveAction('revoke-access');
              }}
            >
              Gerenciar Afiliação
            </ButtonDS>
          </div>
        </>
      )}
      {activeAction === 'change-commission' && (
        <>
          <Row>
            <Col>
              <div className='mb-2'>
                <b>Comissão Atual:</b>
              </div>
              <div>{activeAffiliate.commission}%</div>
            </Col>
            <Col>
              <div className='mb-2'>
                <b>Nova Comissão:</b>
              </div>
              <div>
                <Controller
                  as={CurrencyInput}
                  control={control}
                  name='commission'
                  suffix='%'
                  selectAllOnFocus
                  className={
                    errors.commission
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  rules={{
                    required: 'Campo obrigatório',
                    validate: (value) => {
                      const newValue = parseFloat(
                        String(value)
                          .replace('%', '')
                          .replace(/\./g, (m, i, s) => (s.includes(',') ? '' : m))
                          .replace(',', '.')
                      );
                      if (newValue < 1) {
                        return 'A comissão deve ser maior ou igual a 1%';
                      }
                      if (newValue > 98) {
                        return 'A comissão deve ser menor ou igual a 98%';
                      }
                      if (isNaN(newValue)) {
                        return 'Isto não é um número';
                      }
                      return true;
                    },
                  }}
                  precision='2'
                  maxLength={6}
                />
                {errors.commission && (
                  <div className='text-danger small mt-1'>
                    {errors.commission.message}
                  </div>
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <small className='mt-2 d-block'>
                Comissão mínima de 1% e máxima de 98%.
              </small>
            </Col>
          </Row>
          {!!activeAffiliate.subscription_fee && (
            <>
              <h4 className='mt-4 mb-2'>Alterar Comissão da Adesão</h4>
              <Row>
                <Col>
                  <div className='mt-2'>
                    <b>Comissão adesão atual:</b>
                  </div>
                  <div>{activeAffiliate.subscription_fee_commission}%</div>
                </Col>
                <Col>
                  <div className='mt-2'>
                    <b>Nova Comissão:</b>
                  </div>
                  <div>
                    <Controller
                      as={CurrencyInput}
                      control={control}
                      name='subscription_fee_commission'
                      suffix='%'
                      selectAllOnFocus
                      className={
                        errors.subscription_fee_commission
                          ? 'form-control is-invalid'
                          : 'form-control'
                      }
                      rules={{
                        required: 'Campo obrigatório',
                        validate: (value) => {
                          const newValue = parseFloat(
                            String(value)
                              .replace('%', '')
                              .replace(/\./g, (m, i, s) => (s.includes(',') ? '' : m))
                              .replace(',', '.')
                          );
                          if (newValue < 1) {
                            return 'A comissão deve ser maior ou igual a 1%';
                          }
                          if (newValue > 98) {
                            return 'A comissão deve ser menor ou igual a 98%';
                          }
                          if (isNaN(newValue)) {
                            return 'Isto não é um número';
                          }
                          return true;
                        },
                      }}
                      precision='2'
                      maxLength={6}
                    />
                    {errors.subscription_fee_commission && (
                      <div className='text-danger small mt-1'>
                        {errors.subscription_fee_commission.message}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <small className='mt-2 d-block'>
                    Comissão mínima de 1% e máxima de 98%.
                  </small>
                </Col>
              </Row>
              <h4 className='mt-4 mb-2'>Alterar Regra de Comissão</h4>
              <Row>
                <Col>
                  <div className='mt-2'>
                    <b>Regra atual:</b>
                  </div>
                  <div>
                    {activeAffiliate.subscription_fee_only
                      ? 'Recebe apenas da adesão'
                      : 'Adesão + Recorrência'}
                  </div>
                </Col>
                <Col>
                  <div className='mt-2'>
                    <b>Nova Regra:</b>
                  </div>
                  <div>
                    <Form.Control
                      ref={register}
                      as='select'
                      name='subscription_fee_only'
                    >
                      <option value='1'>Recebe apenas na adesão</option>
                      <option value='0'>Adesão + Recorrência</option>
                    </Form.Control>
                  </div>
                </Col>
              </Row>
            </>
          )}
          <Row>
            <Col className='d-flex justify-content-between mt-4'>
              <ButtonDS
                size={'sm'}
                variant='light'
                onClick={() => {
                  setActiveAction(null);
                }}
              >
                Voltar
              </ButtonDS>
              <ButtonDS
                size={'sm'}
                variant='primary'
                onClick={handleChangeCommission}
                disabled={!isValid || requesting}
              >
                {requesting !== true ? 'Confirmar Alteração' : 'alterando...'}
              </ButtonDS>
            </Col>
          </Row>
        </>
      )}
      {activeAction === 'revoke-access' && (
        <>
          <h4 className='mb-4'>Gerenciar Afiliação</h4>

          <Row>
            <Col>
              <div className='d-flex align-items-center'>
                <Switch
                  onChange={handleManageAccess}
                  checked={affiliateStatus}
                  checkedIcon={affiliateStatus}
                  uncheckedIcon={!affiliateStatus}
                  onColor='#0f1b35'
                  onHandleColor='#fff'
                  boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                  activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                  handleDiameter={24}
                  height={30}
                  width={56}
                  className='react-switch'
                />
                <span className='ml-4'>
                  {affiliateStatus ? 'Bloquear' : 'Ativar'} afiliado
                </span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <small className='mt-4 d-block'>
                Se bloqueado, o afiliado não poderá mais vender o seu produto e
                os links de divulgação dele deixarão de funcionar.
              </small>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex justify-content-between mt-4'>
              <ButtonDS
                size={'sm'}
                variant='light'
                onClick={() => {
                  setActiveAction(null);
                }}
              >
                Voltar
              </ButtonDS>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Actions;
