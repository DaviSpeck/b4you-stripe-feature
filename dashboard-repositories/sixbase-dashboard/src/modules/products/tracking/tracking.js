import api from '../../../providers/api';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { notify } from '../../functions';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useProduct } from '../../../providers/contextProduct';
import { useEffect, useState } from 'react';

export default function PageTracking() {
  const { uuidProduct } = useParams();
  const { product, setProduct } = useProduct();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, errors, reset } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    reset(product);
  }, []);

  const onSubmit = (data) => {
    setLoading(true);
    api
      .put(`/products/${uuidProduct}/tracking`, data)
      .then((response) => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
        setProduct(response.data);
      })
      .catch(() => {
        notify({ message: 'Erro', type: 'error' });
      })
      .finally(() => setLoading(false));
  };

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
              você utilize mais de uma transportadora, insira as URL’s
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
}
