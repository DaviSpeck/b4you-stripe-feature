import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import api from '../../../providers/api';
import { useProduct } from '../../../providers/contextProduct';
import { notify } from '../../functions';

const Tiktok = ({ rows, title, titleModal, fetchData, companyId }) => {
  const [showModal, setShowModal] = useState(false);
  const [activePixel, setActivePixel] = useState(null);
  const { product } = useProduct();

  const setShow = (value) => {
    if (value === false) {
      fetchData();
    }
    setShowModal(value);
  };

  return (
    <>
      <ModalGeneric
        show={showModal}
        setShow={setShow}
        title={`Pixel - ${titleModal}`}
        centered
      >
        <ModalAds
          activePixel={activePixel}
          setActivePixel={setActivePixel}
          setShow={setShow}
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

const ModalAds = ({
  uuidProduct,
  activePixel,
  setActivePixel,
  setShow,
  companyId,
}) => {
  const [requesting, setRequesting] = useState(false);
  const { register, reset, formState, errors, handleSubmit } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  useEffect(() => {
    if (activePixel) {
      let settings = activePixel.settings;
      settings.trigger_purchase_boleto = settings.trigger_purchase_boleto
        ? 'true'
        : 'false';

      reset(settings);
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
        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>Nome *</label>
            <Form.Control
              ref={register({ required: true })}
              name='label'
              isInvalid={errors.label}
            />
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>Pixel ID *</label>
            <Form.Control
              ref={register({ required: true })}
              name='pixel_id'
              isInvalid={errors.pixel_id}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Disparar ao gerar boleto</label>
            <div className='d-flex'>
              <Form.Check
                ref={register()}
                type='radio'
                id='trigger_purchase_boleto1'
                name='trigger_purchase_boleto'
                value='true'
                className='pointer'
                defaultChecked
              />
              <label htmlFor='trigger_purchase_boleto1' className='pointer'>
                Sim
              </label>
              <Form.Check
                ref={register()}
                type='radio'
                id='trigger_purchase_boleto2'
                name='trigger_purchase_boleto'
                value='false'
                className='ml-4 pointer'
              />
              <label htmlFor='trigger_purchase_boleto2' className='pointer'>
                Não
              </label>
            </div>
          </Form.Group>
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
        <Col>
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

export default Tiktok;
