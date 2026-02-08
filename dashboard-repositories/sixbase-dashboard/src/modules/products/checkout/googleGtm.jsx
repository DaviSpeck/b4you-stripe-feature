import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import Switch from 'react-switch';
import api from '../../../providers/api';
import { useProduct } from '../../../providers/contextProduct';
import { notify } from '../../functions';

const GoogleTagManager = ({
  rows,
  title,
  titleModal,
  fetchData,
  companyId,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activePixel, setActivePixel] = useState(null);
  const { product } = useProduct();

  useEffect(() => {
    if (showModal === false) {
      fetchData();
    }
  }, [showModal]);

  return (
    <>
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title={`Pixel - ${titleModal}`}
        centered
      >
        <ModalGtm
          activePixel={activePixel}
          setActivePixel={setActivePixel}
          setShow={setShowModal}
          companyId={companyId}
          uuidProduct={product.uuid}
        />
      </ModalGeneric>
      {title && <h4>{title}</h4>}
      <div>
        <table className='table table-sm'>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Pixel</th>
              <th width='70' className='center'>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.settings.label}</td>
                  <td>{item.settings.pixel_id}</td>
                  <td className='text-center'>
                    <ButtonDS
                      size='icon'
                      onClick={() => {
                        setActivePixel(item);
                        setShowModal(true);
                      }}
                    >
                      <i className='fa fa-pencil' />
                    </ButtonDS>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan='100' className='text-center'>
                  Nenhum pixel registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ButtonDS
          variant='primary'
          size={'xs'}
          onClick={() => {
            setShowModal(true);
          }}
        >
          Novo
        </ButtonDS>
      </div>
    </>
  );
};

const ModalGtm = ({
  uuidProduct,
  activePixel,
  setActivePixel,
  setShow,
  companyId,
}) => {
  const [requesting, setRequesting] = useState(false);
  const { register, reset, formState, errors, handleSubmit, control } = useForm(
    {
      mode: 'onChange',
    }
  );
  const { isValid } = formState;

  useEffect(() => {
    if (activePixel) {
      let settings = activePixel.settings;
      settings.pixel_id = `${settings.pixel_id}`;
      settings.trigger_boleto = settings.trigger_boleto ? true : false;
      settings.trigger_pix = settings.trigger_pix ? true : false;
      settings.initiate_checkout = settings.initiate_checkout ? true : false;
      settings.purchase = settings.purchase ? true : false;
      if (!settings.initiate_checkout) settings.trigger = 'purchase';
      if (!settings.purchase) settings.trigger = 'initiate_checkout';
      reset(settings);
    }

    return () => {
      setActivePixel(null);
    };
  }, []);

  const onSubmit = (data) => {
    let fields = data;
    fields.is_affiliate = false;
    fields.pixel_id = data.pixel_id;
    fields.initiate_checkout = true;
    fields.purchase = true;
    if (data.trigger === 'initiate_checkout') {
      fields.purchase = false;
    }
    if (data.trigger === 'purchase') {
      fields.initiate_checkout = false;
    }

    setRequesting(true);
    if (!activePixel) {
      api
        .post(`/products/pixels/${uuidProduct}/google-tag-manager`, fields)
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
          `/products/pixels/${uuidProduct}/google-tag-manager/${activePixel.uuid}`,
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
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Nome*</label>
            <Form.Control
              ref={register({ required: true })}
              name='label'
              isInvalid={errors.label}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Pixel ID*</label>
            <Form.Control
              ref={register({ required: true, pattern: /^GTM-/ })}
              name='pixel_id'
              isInvalid={errors.pixel_id}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Disparar os eventos</label>
            <div className='d-flex'>
              <Form.Control
                ref={register()}
                as='select'
                id='trigger'
                name='trigger'
                className='pointer'
                defaultValue='both'
              >
                <option
                  value='initiate_checkout'
                  key='initiate_checkout'
                  label='Disparar apenas ao iniciar checkout'
                ></option>
                <option
                  value='purchase'
                  key='purchase'
                  label='Disparar apenas na compra'
                ></option>
                <option
                  value='both'
                  key='both'
                  label='Disparar em ambos'
                ></option>
              </Form.Control>
            </div>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group as={Row}>
            <Form.Label column>Disparar ao gerar Pix</Form.Label>
            <Col className='d-flex align-items-center'>
              <Controller
                name='trigger_pix'
                control={control}
                defaultValue={true}
                render={(field) => {
                  return (
                    <Switch
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                      checked={field.value}
                      name={field.name}
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
                  );
                }}
              ></Controller>
            </Col>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group as={Row}>
            <Form.Label column>Disparar ao gerar Boleto</Form.Label>
            <Col className='d-flex align-items-center'>
              <Controller
                name='trigger_boleto'
                control={control}
                defaultValue={true}
                render={(field) => {
                  return (
                    <Switch
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                      checked={field.value}
                      name={field.name}
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
                  );
                }}
              ></Controller>
            </Col>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col className='d-flex align-items-center'>
          {activePixel && (
            <Button
              variant='danger'
              size='xs'
              disabled={requesting === 'delete'}
              onClick={handleRemove}
            >
              <i className='fa fa-trash mr-2'></i>
              <span className='pointer'>
                {requesting === 'delete' ? 'Removendo...' : 'Remover pixel'}
              </span>
            </Button>
          )}
        </Col>
        <Col>
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || requesting}
            className='ml-auto'
          >
            {requesting === true ? 'Salvando...' : 'Salvar'}
          </ButtonDS>
        </Col>
      </Row>
    </>
  );
};

export default GoogleTagManager;
