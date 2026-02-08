/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react';
import { Col, Form, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../providers/api';
import { notify } from '../../../../modules/functions';
import AlertDS from '../../../../jsx/components/design-system/AlertDS';

const ModalFacebook = ({
  uuidProduct,
  activePixel,
  setActivePixel,
  setShow,
  companyId,
}) => {
  const {
    register,
    reset,
    formState,
    errors,
    handleSubmit,
    control,
    setValue,
    getValues,
  } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;
  const [requesting, setRequesting] = useState(false);
  const [domain, setDomain] = useState(getValues('domain'));

  useEffect(() => {
    if (activePixel) {
      reset(activePixel.settings);
    }
    return () => {
      setActivePixel(null);
    };
  }, []);

  const onSubmit = (data) => {
    setRequesting(true);
    let fields = data;
    fields.is_affiliate = false;
    if (!activePixel) {
      api
        .post(`/products/pixels/${uuidProduct}/${companyId}`, fields)
        .then(() => {
          setRequesting(false);
          setShow(false);
          notify({ message: `Pixel criado com sucesso`, type: 'success' });
        })
        .catch(() => {
          setRequesting(false);
          notify({ message: `Falha ao criar pixel`, type: 'error' });
        });
    } else {
      api
        .put(
          `/products/pixels/${uuidProduct}/${companyId}/${activePixel.uuid}`,
          fields
        )
        .then(() => {
          setRequesting(false);
          setShow(false);
          notify({ message: `Pixel atualizado com sucesso`, type: 'success' });
        })
        .catch(() => {
          setRequesting(false);
          notify({ message: `Falha ao atualizar pixel`, type: 'error' });
        });
    }
  };

  const handleRemove = () => {
    setRequesting('delete');
    api
      .delete(`/products/pixels/${uuidProduct}/${activePixel.uuid}`)
      .then(() => {
        setShow(false);
        notify({ message: `Pixel removido com sucesso`, type: 'success' });
      })
      .catch(() => {
        notify({ message: `Falha ao remover pixel`, type: 'error' });
      });
  };

  return (
    <>
      <Row>
        <Col md={6}>
          <Form.Group>
            <label htmlFor=''>Nome *</label>
            <Form.Control
              ref={register({ required: true })}
              name='label'
              isInvalid={errors.label}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <label htmlFor=''>Pixel ID *</label>
            <Form.Control
              ref={register({ required: true })}
              name='pixel_id'
              isInvalid={errors.label}
              placeholder='Ex: 1029487244237'
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <label htmlFor=''>Dominio</label>
            <Form.Control
              ref={register({ required: false })}
              name='domain'
              isInvalid={errors.label}
              placeholder='https://seusite.com'
              onChange={(e) => {
                e.preventDefault();
                setDomain(e.target.value);
              }}
            />
          </Form.Group>
        </Col>
        {domain && (
          <Col md={6} className='d-flex align-items-center'>
            <AlertDS
              text={
                <div>
                  Adicione o domínio <b>b4you.com.br</b> na lista de domínios
                  permitidos do facebook
                </div>
              }
              icon=''
              variant='warning'
              className='p-1'
            />
          </Col>
        )}
        <Col md={12}>
          <Form.Group>
            <div className='d-flex align-items-center mb-2'>
              <label htmlFor='' className='mb-0'>
                Token (Conversion API)
              </label>
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    Ao ativar o token e domínio a confirmação de pagamento
                    aciona a confirmação do evento "Purchase" nos métodos Pix e
                    boleto.
                  </Tooltip>
                }
              >
                <i className='bx bx-info-circle ml-2 pointer'></i>
              </OverlayTrigger>
            </div>
            <Form.Control
              ref={register({ required: false })}
              as='textarea'
              rows={4}
              name='token'
              isInvalid={errors.label}
              placeholder='ClAr42jYxPb8n9SgP0fXrDmLsHtUqKoBwV6T1zGnYsD5aZ1bHwV3yMnGpQtRcLxKj7rA8X6sP9oBfU2zTm...'
            />
          </Form.Group>
        </Col>

        <Col md={12}>
          <div className='mb-2'>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Pix *</Form.Label>
                <Form.Group controlId='formBasicCheckbox'>
                  <Controller
                    name='generated_pix'
                    control={control}
                    defaultValue={true}
                    render={(field) => {
                      return (
                        <Form.Check
                          type='radio'
                          label='Disparar com compra gerada'
                          id='generated_pix'
                          inline
                          onChange={(e) => {
                            if (e.target.checked) {
                              setValue('paid_pix', false);
                            }
                            field.onChange(e.target.checked);
                          }}
                          checked={field.value}
                        />
                      );
                    }}
                  />
                  <Controller
                    name='paid_pix'
                    control={control}
                    defaultValue={false}
                    render={(field) => {
                      return (
                        <Form.Check
                          type='radio'
                          label='Disparar com compra aprovada'
                          id='paid_pix'
                          inline
                          onChange={(e) => {
                            if (e.target.checked) {
                              setValue('generated_pix', false);
                            }
                            field.onChange(e.target.checked);
                          }}
                          checked={field.value}
                        />
                      );
                    }}
                  />
                </Form.Group>
              </Form.Group>
            </Col>
          </div>
        </Col>
      </Row>

      <Row>
        <Col className='d-flex align-items-center'>
          {activePixel && (
            <ButtonDS
              variant='danger'
              size='xs'
              disabled={requesting === 'delete'}
              onClick={handleRemove}
            >
              <i className='fa fa-trash mr-2'></i>
              <span className='pointer'>
                {requesting === 'delete' ? 'Removendo...' : 'Remover pixel'}
              </span>
            </ButtonDS>
          )}
        </Col>
        <Col className='text-right'>
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || requesting}
            className='ml-auto'
          >
            {requesting === true ? 'salvando...' : 'Salvar'}
          </ButtonDS>
        </Col>
      </Row>
    </>
  );
};

export default ModalFacebook;
