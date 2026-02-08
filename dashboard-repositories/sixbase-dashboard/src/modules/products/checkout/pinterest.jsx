import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import api from '../../../providers/api';
import { useProduct } from '../../../providers/contextProduct';
import { notify } from '../../functions';

const Pinterest = ({ rows, title, titleModal, fetchData, companyId }) => {
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
        <ModalPinterest
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

const ModalPinterest = ({
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
      settings.pixel_id = `${settings.pixel_id}`;
      reset(settings);
    }

    return () => {
      setActivePixel(null);
    };
  }, []);

  const onSubmit = (data) => {
    let fields = data;
    fields.pixel_id = data.pixel_id;

    setRequesting(true);
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
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Nome *</label>
            <Form.Control
              ref={register({ required: true })}
              name='label'
              isInvalid={errors.label}
            />
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group>
            <label htmlFor=''>Pixel ID *</label>
            <Form.Control
              //   ref={register({ required: true, pattern: /^GTM-/ })}
              ref={register({ required: true })}
              name='pixel_id'
              isInvalid={errors.pixel_id}
            />
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

export default Pinterest;
