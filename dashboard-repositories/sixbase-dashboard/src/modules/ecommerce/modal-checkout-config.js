import { useState, useEffect } from 'react';
import { Card, Col, Form, Row, Tab, Tabs } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import { useForm } from 'react-hook-form';
import api from '../../providers/api';
import { notify } from '../functions';
import Facebook from '../products/checkout/facebook';
import Tiktok from '../products/checkout/tiktok';
import Analytics from '../products/checkout/analytics';
import Ads from '../products/checkout/ads';
import Kwai from '../products/checkout/kwai';
import GoogleTagManager from '../products/checkout/googleGtm';
import Pinterest from '../products/checkout/pinterest';

const PixelsWrapper = ({ uuidProduct }) => {
  const [pixels, setPixels] = useState({
    facebook: [],
    googleAds: [],
    googleAnalytics: [],
    outbrain: [],
    taboola: [],
    tiktok: [],
    kwai: [],
    pinterest: [],
  });

  const fetchData = () => {
    if (!uuidProduct) return;
    api
      .get(`products/pixels/${uuidProduct}`)
      .then((response) => {
        setPixels(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, [uuidProduct]);

  return (
    <Tabs defaultActiveKey='facebook' className='mb-4 mt-4 tabs-pixels'>
      <Tab eventKey='facebook' title='Facebook'>
        <Facebook
          title={null}
          titleModal='Facebook'
          companyId='facebook'
          rows={pixels.facebook}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='tiktok' title='Tiktok'>
        <Tiktok
          titleModal='Tiktok'
          companyId='tiktok'
          rows={pixels.tiktok}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='google-analytics' title='Google Analytics'>
        <Analytics
          titleModal='Google Analytics'
          companyId='google-analytics'
          rows={pixels.googleAnalytics.filter(
            (item) => item.settings?.pixel_id?.slice(0, 3) !== 'GTM'
          )}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='ads' title='Google Ads'>
        <Ads
          titleModal='Google Ads'
          companyId='google-ads'
          rows={pixels.googleAds}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='gtm' title='Google GTM'>
        <GoogleTagManager
          titleModal='Google GTM'
          companyId='google-tag-manager'
          rows={pixels.googleAds
            .concat(pixels.googleAnalytics)
            .filter((item) => item.settings?.pixel_id?.slice(0, 3) === 'GTM')}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='kwai' title='Kwai'>
        <Kwai
          titleModal='Kwai'
          companyId='kwai'
          rows={pixels.kwai}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='Pinterest' title='Pinterest'>
        <Pinterest
          titleModal='Pinterest'
          companyId='pinterest'
          rows={pixels.pinterest}
          fetchData={fetchData}
        />
      </Tab>
    </Tabs>
  );
};

const CheckoutConfigTab = ({ productUuid, product, setProduct }) => {
  const [requesting, setRequesting] = useState(false);

  const { register, handleSubmit, errors, reset } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (product) {
      reset(product);
    }
  }, [product]);

  const onSubmit = (data) => {
    if (!productUuid) {
      notify({ message: 'Produto container não encontrado', type: 'error' });
      return;
    }

    setRequesting(true);
    let fields = data;
    fields.hex_color = product?.hex_color;

    api
      .put(`/products/${productUuid}/checkout`, fields)
      .then((response) => {
        setProduct((p) => ({ ...p, ...response.data }));
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch((err) => {
        notify({
          message:
            err.response?.data?.body?.errors?.[0]?.creditcard_descriptor ||
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
                defaultValue={product?.creditcard_descriptor}
                ref={register({
                  required: 'Campo obrigatório.',
                  pattern: {
                    value: /^[\sa-zA-Z0-9]{0,13}$/,
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
                  Rastreie suas conversões utilizando os pixels. Entenda como
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
              <PixelsWrapper uuidProduct={productUuid} />
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

export default CheckoutConfigTab;
