import api from '../../providers/api';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { notify } from '../functions';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Loader from '../../utils/loader';

const ModalRastreio = ({ setShow, shop, embedded = false }) => {
  const productUuid = shop?.container_product?.uuid;
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const { register, handleSubmit, errors, reset } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (productUuid) {
      fetchProduct();
    }
  }, [productUuid]);

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(`/products/product/${productUuid}`);
      setProduct(response.data);
      reset(response.data);
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      notify({ message: 'Falha ao carregar produto', type: 'error' });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = (data) => {
    if (!productUuid) {
      notify({ message: 'Produto container não encontrado', type: 'error' });
      return;
    }

    setLoading(true);
    api
      .put(`/products/${productUuid}/tracking`, data)
      .then((response) => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
        setProduct(response.data);
      })
      .catch(() => {
        notify({ message: 'Erro', type: 'error' });
      })
      .finally(() => setLoading(false));
  };

  if (initialLoading) {
    return <Loader title='Carregando configurações de rastreio...' />;
  }

  if (!productUuid || !product) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Produto container não encontrado</p>
      </div>
    );
  }

  return (
    <>
      <section>
        <Row>
          <Col md={12} className='mb-3'>
            <h4>Rastreio do produto</h4>
            <small>
              Insira abaixo a URL da transportadora que você utiliza. É de
              extrema importância que você coloque a URL para enviarmos aos
              clientes juntamente com os códigos de rastreio por e-mail. Caso
              você utilize mais de uma transportadora, insira as URL&apos;s
              diretamente na planilha.
            </small>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <div className='form-group'>
                      <label>URL Padrão de rastreio</label>
                      <Form.Control
                        type='url'
                        name='default_url_tracking'
                        ref={register({ required: 'Campo Obrigatório' })}
                        isInvalid={errors.default_url_tracking}
                        placeholder='https://www.correios.com.br/'
                        className={
                          !errors.default_url_tracking
                            ? 'form-control'
                            : 'form-control is-invalid'
                        }
                      />
                      <div className='form-error'>
                        {errors.default_url_tracking && (
                          <span>{errors.default_url_tracking.message}</span>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col className='d-flex justify-content-start'>
                    <ButtonDS
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                    >
                      {!loading ? 'Salvar' : 'salvando...'}
                    </ButtonDS>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default ModalRastreio;
