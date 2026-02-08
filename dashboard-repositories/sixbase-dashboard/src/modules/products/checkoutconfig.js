import { useState } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import Pixels from './checkout/pixels';
import { useForm } from 'react-hook-form';
import api from '../../providers/api';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useProduct } from '../../providers/contextProduct';
import { notify } from '../functions';

const CheckoutConfig = () => {
  const [requesting, setRequesting] = useState(false);

  const { register, handleSubmit, errors } = useForm({
    mode: 'onChange',
  });
  const { uuidProduct } = useParams();
  const { product, setProduct } = useProduct();

  const onSubmit = (data) => {
    setRequesting('post');
    let fields = data;

    fields.hex_color = product.hex_color;

    api
      .put(`/products/${uuidProduct}/checkout`, fields)
      .then((response) => {
        setProduct((p) => ({ ...p, ...response.data }));
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch((err) => {
        notify({
          message:
            err.response.data.body.errors[0].creditcard_descriptor ||
            'Erro ao salvar',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <div>
      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className='mb-3'>
                <h4>* Descrição na fatura</h4>
                <small>
                  Crie a descrição de como vai aparecer a cobrança do seu
                  produto na fatura para o seu cliente (limite de 13
                  caracteres).
                </small>
              </div>
              <Form.Control
                name='creditcard_descriptor'
                className='form-control'
                maxLength={13}
                defaultValue={product.creditcard_descriptor}
                ref={register({
                  required: 'Campo obrigatório.',
                  pattern: {
                    value: /^[\\sa-zA-Z0-9]{0,13}$/,
                    message:
                      'A descrição da fatura do cartão de crédito do produto não pode exceder 13 caracteres. Não são permitidos acentuação gráfica e caracteres especiais.',
                  },
                })}
              />
              <div className='form-error mt-2'>
                {errors.creditcard_descriptor && (
                  <span>{errors.creditcard_descriptor.message}</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <h4>Pixels de Conversão</h4>
              <div className='d-flex'>
                <small>
                  Rastreie sus conversões utilizando os pixels. Entenda como
                  configurar no artigo:
                  <ButtonDS
                    size='xs'
                    variant='link'
                    iconRight={'bx-right-arrow-alt'}
                  >
                    <a
                      href='https://ajuda.b4you.com.br/post/380/como-configurar-o-pixel-no-seu-produto'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Saiba mais
                    </a>
                  </ButtonDS>
                </small>
              </div>
              <Pixels />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='mt-4'>
        <Col className=' d-flex justify-content-end'>
          <ButtonDS onClick={handleSubmit(onSubmit)} disabled={requesting}>
            {!requesting ? 'Salvar' : 'salvando...'}
          </ButtonDS>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutConfig;
