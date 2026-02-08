import { useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller, useForm } from 'react-hook-form';
import Switch from 'react-switch';
import api from '../../providers/api';

const Actions = ({ activeAffiliate, uuidProduct }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [studentAccess, setStudentAccess] = useState(
    activeAffiliate.has_access
  );
  const [requesting, setRequesting] = useState(false);

  const { getValues, control, errors, formState } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  const handleChangeCommission = () => {
    setRequesting('put');

    let fields = {
      commission: parseInt(getValues('commission')),
    };

    api
      .put(`/affiliates/commission/${activeAffiliate.uuid}`, fields)
      .then((response) => {
        setRequesting(null);
      })
      .catch((err) => {
        console.error(err.response.data);
        setRequesting(null);
      });
  };

  const handleManageAccess = () => {
    let newValue = !studentAccess;
    setStudentAccess(newValue);

    api
      .put('/affiliates/active/' + uuidProduct)
      .then((response) => {})
      .catch((err) => {
        console.error(err.response.data);
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
            <Button
              onClick={() => {
                setActiveAction('change-commission');
              }}
            >
              Alterar Comissão
            </Button>
            <Button
              onClick={() => {
                setActiveAction('revoke-access');
              }}
            >
              Gerenciar Afiliação
            </Button>
          </div>
        </>
      )}
      {activeAction === 'change-commission' && (
        <>
          <h4 className='mb-4'>Alterar Comissão</h4>
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
                    errors.comission
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  rules={{
                    required: true,
                    validate: (value) => {
                      if (isNaN(value)) {
                        if (
                          parseFloat(value.replace('%', '')) > 0 &&
                          parseFloat(value.replace('%', '')) <= 80
                        ) {
                          return true;
                        } else {
                          return false;
                        }
                      } else {
                        return false;
                      }
                    },
                  }}
                  precision='0'
                  maxLength={3}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <small className='mt-4 d-block'>
                Comissão mínima de 1% e máxima de 80%.
              </small>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex justify-content-between mt-4'>
              <Button
                size={'sm'}
                variant='light'
                onClick={() => {
                  setActiveAction(null);
                }}
              >
                Voltar
              </Button>
              <Button
                size={'sm'}
                variant='primary'
                onClick={handleChangeCommission}
                disabled={!isValid || requesting === 'put'}
              >
                {requesting !== 'put' ? 'Confirmar Alteração' : 'alterando...'}
              </Button>
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
                  checked={studentAccess}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  onColor='#0f1b35'
                  onHandleColor='#fff'
                  boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                  activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                  handleDiameter={24}
                  height={30}
                  width={56}
                  className='react-switch'
                />
                <span className='ml-4'>Ativar / Bloquear afiliado</span>
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
              <Button
                size={'sm'}
                variant='light'
                onClick={() => {
                  setActiveAction(null);
                }}
              >
                Voltar
              </Button>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Actions;
