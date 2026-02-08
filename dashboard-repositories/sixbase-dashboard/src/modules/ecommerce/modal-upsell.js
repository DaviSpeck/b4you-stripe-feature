import { useState, useEffect } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';
import Loader from '../../utils/loader';
import regexUrl from '../../utils/regex-url';

const ModalUpsell = ({ setShow, shop, embedded = false }) => {
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);
  const [products, setProducts] = useState([]);
  const [upsellOffers, setUpsellOffers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const productUuid = shop?.container_product?.uuid;
  const offerUuid = shop?.default_offer?.uuid;

  const {
    register,
    handleSubmit,
    errors,
    reset,
    watch,
    setValue,
  } = useForm({
    mode: 'onChange',
  });

  const upsell_product = watch('upsell_product');

  useEffect(() => {
    if (productUuid && offerUuid) {
      fetchOffer();
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [productUuid, offerUuid]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productUuid}/offers`);
      const offers = Array.isArray(response.data) ? response.data : (response.data?.offers || []);
      const offerData = offers.find(o => o.uuid === offerUuid);

      if (offerData) {
        setOffer(offerData);
        reset({
          thankyou_page_upsell: offerData.thankyou_page_upsell || '',
          thankyou_page_card: offerData.thankyou_page_card || '',
          thankyou_page_pix: offerData.thankyou_page_pix || '',
          thankyou_page_billet: offerData.thankyou_page_billet || '',
        });

        // Se tiver upsell configurado, buscar o produto
        if (offerData.id_upsell) {
          // TODO: Buscar dados do upsell existente
        }
      }
    } catch (err) {
      console.error('Erro ao carregar oferta:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/with-offers');
      const containerProductId = shop?.id_product || shop?.container_product?.id;

      // Filtrar o produto container
      const filteredProducts = response.data.filter((product) => {
        if (containerProductId) {
          const productId = Number(product.id);
          const containerId = Number(containerProductId);
          return productId !== containerId;
        }
        return true;
      });

      setProducts(filteredProducts);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const handleProductChange = (e) => {
    const productUuid = e.target.value;
    const product = products.find((p) => p.uuid === productUuid);

    if (product) {
      setSelectedProduct(product);
      setUpsellOffers(product.offers || []);
    } else {
      setSelectedProduct(null);
      setUpsellOffers([]);
    }
    setValue('upsell_offer', '');
  };

  const onSubmit = async (data) => {
    if (!productUuid || !offerUuid) {
      notify({ message: 'Oferta padrão não encontrada', type: 'error' });
      return;
    }

    setRequesting(true);

    const fields = {
      thankyou_page_upsell: data.thankyou_page_upsell || null,
      thankyou_page_card: data.thankyou_page_card || null,
      thankyou_page_pix: data.thankyou_page_pix || null,
      thankyou_page_billet: data.thankyou_page_billet || null,
    };

    try {
      await api.put(`/products/${productUuid}/offers/${offerUuid}`, fields);
      notify({ message: 'Configurações de upsell salvas!', type: 'success' });
    } catch (err) {
      console.error('Erro ao salvar:', err);
      notify({ message: 'Erro ao salvar configurações', type: 'error' });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações de upsell...' />;
  }

  if (!productUuid || !offerUuid) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Produto container não encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <Alert variant='info' className='mb-3'>
        <small>
          <i className='bx bx-info-circle me-1'></i>
          Configure as páginas de redirecionamento após a compra. Estas configurações
          serão aplicadas a <strong>todas</strong> as ofertas geradas para esta loja.
        </small>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        <h6 className='mb-3'>
          <i className='bx bx-link-external me-2'></i>
          URLs de Redirecionamento (Thank You Pages)
        </h6>

        <Row>
          <Col md={12} className='mb-3'>
            <Form.Group>
              <label htmlFor='thankyou_page_upsell'>
                URL Página de Upsell
                <small className='text-muted ms-2'>
                  (página exibida após compra para oferecer produtos adicionais)
                </small>
              </label>
              <Form.Control
                name='thankyou_page_upsell'
                type='url'
                placeholder='https://www.seusite.com/upsell'
                ref={register({
                  validate: (value) => {
                    if (!value || value === '') return true;
                    return regexUrl(value) || 'URL inválida';
                  },
                })}
                isInvalid={errors.thankyou_page_upsell}
              />
              {errors.thankyou_page_upsell && (
                <Form.Control.Feedback type='invalid'>
                  {errors.thankyou_page_upsell.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>

          <Col md={12} className='mb-3'>
            <Form.Group>
              <label htmlFor='thankyou_page_card'>
                URL Página de Obrigado - Cartão
              </label>
              <Form.Control
                name='thankyou_page_card'
                type='url'
                placeholder='https://www.seusite.com/obrigado-cartao'
                ref={register({
                  validate: (value) => {
                    if (!value || value === '') return true;
                    return regexUrl(value) || 'URL inválida';
                  },
                })}
                isInvalid={errors.thankyou_page_card}
              />
              <small className='text-muted'>
                Redireciona o cliente após pagamento aprovado com cartão
              </small>
            </Form.Group>
          </Col>

          <Col md={12} className='mb-3'>
            <Form.Group>
              <label htmlFor='thankyou_page_pix'>
                URL Página de Obrigado - Pix
              </label>
              <Form.Control
                name='thankyou_page_pix'
                type='url'
                placeholder='https://www.seusite.com/obrigado-pix'
                ref={register({
                  validate: (value) => {
                    if (!value || value === '') return true;
                    return regexUrl(value) || 'URL inválida';
                  },
                })}
                isInvalid={errors.thankyou_page_pix}
              />
              <small className='text-muted'>
                Redireciona o cliente após pagamento aprovado com Pix
              </small>
            </Form.Group>
          </Col>

          <Col md={12} className='mb-3'>
            <Form.Group>
              <label htmlFor='thankyou_page_billet'>
                URL Página de Obrigado - Boleto
              </label>
              <Form.Control
                name='thankyou_page_billet'
                type='url'
                placeholder='https://www.seusite.com/obrigado-boleto'
                ref={register({
                  validate: (value) => {
                    if (!value || value === '') return true;
                    return regexUrl(value) || 'URL inválida';
                  },
                })}
                isInvalid={errors.thankyou_page_billet}
              />
              <small className='text-muted'>
                Redireciona o cliente após geração do boleto
              </small>
            </Form.Group>
          </Col>
        </Row>

        <hr className='my-4' />

        <div className='d-flex justify-content-end'>
          <ButtonDS type='submit' disabled={requesting}>
            {requesting ? 'Salvando...' : 'Salvar Configurações'}
          </ButtonDS>
        </div>
      </form>
    </div>
  );
};

export default ModalUpsell;
