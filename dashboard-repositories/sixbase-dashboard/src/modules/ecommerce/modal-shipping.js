import { useState, useEffect } from 'react';
import { Col, Form, Row, Alert } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';
import Loader from '../../utils/loader';

const ModalShipping = ({ setShow, shop, embedded = false }) => {
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);
  const [formData, setFormData] = useState({
    shipping_type: '0',
    shipping_price: 0,
    allow_shipping_region: '0',
    shipping_price_no: 0,
    shipping_price_ne: 0,
    shipping_price_co: 0,
    shipping_price_so: 0,
    shipping_price_su: 0,
    shipping_text: '',
  });

  useEffect(() => {
    if (shop?.id_default_offer) {
      fetchOffer();
    }
  }, [shop]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const offerUuid = shop.default_offer?.uuid;
      const productUuid = shop.container_product?.uuid;
      
      if (!offerUuid || !productUuid) {
        // Se não tiver oferta padrão, usar valores padrão
        setOffer({ uuid: offerUuid || 'temp' });
        setFormData({
          shipping_type: '0',
          shipping_price: 0,
          allow_shipping_region: '0',
          shipping_price_no: 0,
          shipping_price_ne: 0,
          shipping_price_co: 0,
          shipping_price_so: 0,
          shipping_price_su: 0,
          shipping_text: '',
        });
        setLoading(false);
        return;
      }
      
      // Buscar a oferta através do endpoint de produtos/offers
      // Primeiro, buscar todas as ofertas do produto
      try {
        const response = await api.get(`/products/${productUuid}/offers`);
        const offers = Array.isArray(response.data) ? response.data : (response.data?.offers || []);
        const offerData = offers.find(o => o.uuid === offerUuid);
        
        if (offerData) {
          setOffer(offerData);
          setFormData({
            shipping_type: offerData.shipping_type?.toString() || '0',
            shipping_price: offerData.shipping_price || 0,
            allow_shipping_region: offerData.allow_shipping_region?.toString() || '0',
            shipping_price_no: offerData.shipping_price_no || 0,
            shipping_price_ne: offerData.shipping_price_ne || 0,
            shipping_price_co: offerData.shipping_price_co || 0,
            shipping_price_so: offerData.shipping_price_so || 0,
            shipping_price_su: offerData.shipping_price_su || 0,
            shipping_text: offerData.shipping_text || '',
          });
        } else {
          // Se não encontrar, usar valores padrão
          setOffer({ uuid: offerUuid });
          setFormData({
            shipping_type: '0',
            shipping_price: 0,
            allow_shipping_region: '0',
            shipping_price_no: 0,
            shipping_price_ne: 0,
            shipping_price_co: 0,
            shipping_price_so: 0,
            shipping_price_su: 0,
            shipping_text: '',
          });
        }
      } catch (apiErr) {
        // Se o endpoint não existir ou falhar, usar valores padrão
        console.warn('Não foi possível buscar dados da oferta, usando valores padrão:', apiErr);
        setOffer({ uuid: offerUuid });
        setFormData({
          shipping_type: '0',
          shipping_price: 0,
          allow_shipping_region: '0',
          shipping_price_no: 0,
          shipping_price_ne: 0,
          shipping_price_co: 0,
          shipping_price_so: 0,
          shipping_price_su: 0,
          shipping_text: '',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar oferta:', err);
      // Não mostrar notificação de erro, apenas usar valores padrão
      setOffer({ uuid: shop.default_offer?.uuid || 'temp' });
      setFormData({
        shipping_type: '0',
        shipping_price: 0,
        allow_shipping_region: '0',
        shipping_price_no: 0,
        shipping_price_ne: 0,
        shipping_price_co: 0,
        shipping_price_so: 0,
        shipping_price_su: 0,
        shipping_text: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const offerUuid = shop.default_offer?.uuid;
    if (!offerUuid) {
      notify({ message: 'Oferta padrão não encontrada', type: 'error' });
      return;
    }

    setRequesting(true);
    try {
      const payload = {
        shipping_type: parseInt(formData.shipping_type, 10),
        shipping_price: formData.shipping_price || null,
        allow_shipping_region: parseInt(formData.allow_shipping_region, 10),
        shipping_price_no: formData.allow_shipping_region === '1' ? formData.shipping_price_no : null,
        shipping_price_ne: formData.allow_shipping_region === '1' ? formData.shipping_price_ne : null,
        shipping_price_co: formData.allow_shipping_region === '1' ? formData.shipping_price_co : null,
        shipping_price_so: formData.allow_shipping_region === '1' ? formData.shipping_price_so : null,
        shipping_price_su: formData.allow_shipping_region === '1' ? formData.shipping_price_su : null,
        shipping_text: formData.shipping_text || null,
      };

      const productUuid = shop.container_product?.uuid;
      if (!productUuid) {
        throw new Error('Produto container não encontrado');
      }
      await api.put(`/products/${productUuid}/offers/${offer.uuid}`, payload);
      notify({ message: 'Configurações de frete salvas!', type: 'success' });
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Falha ao salvar configurações';
      notify({ message: errorMessage, type: 'error' });
    } finally {
      setRequesting(false);
    }
  };

  const handleCurrencyChange = (field, value) => {
    setFormData({ ...formData, [field]: value || 0 });
  };

  if (loading) {
    return <Loader title='Carregando configurações de frete...' />;
  }

  if (!shop?.default_offer?.uuid) {
    return (
      <Alert variant='warning'>
        <Alert.Heading>Oferta Padrão Não Configurada</Alert.Heading>
        <p>Esta loja não possui uma oferta padrão configurada.</p>
      </Alert>
    );
  }

  return (
    <div>
      <Alert variant='info' className='mb-3'>
        <small>
          <i className='bx bx-info-circle me-1'></i>
          As configurações de frete aplicam-se a <strong>todas</strong> as ofertas geradas para esta loja.
        </small>
      </Alert>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Frete *</Form.Label>
            <Form.Control
              as='select'
              value={formData.shipping_type}
              onChange={(e) => setFormData({ ...formData, shipping_type: e.target.value })}
            >
              <option value='0'>Grátis</option>
              <option value='1'>Fixo - Dividido com afiliado</option>
              <option value='2'>Fixo - Dividido com co-produtor</option>
              <option value='3'>Fixo - Apenas para o produtor</option>
            </Form.Control>
          </Form.Group>
        </Col>

        {formData.shipping_type !== '0' && (
          <Col md={6}>
            <Form.Group className='mb-3'>
              <Form.Label>Frete por região</Form.Label>
              <Form.Control
                as='select'
                value={formData.allow_shipping_region}
                onChange={(e) => setFormData({ ...formData, allow_shipping_region: e.target.value })}
              >
                <option value='0'>Não</option>
                <option value='1'>Sim</option>
              </Form.Control>
            </Form.Group>
          </Col>
        )}
      </Row>

      {formData.shipping_type !== '0' && formData.allow_shipping_region !== '1' && (
        <Row>
          <Col md={6}>
            <Form.Group className='mb-3'>
              <Form.Label>Preço do frete *</Form.Label>
              <CurrencyInput
                className='form-control'
                decimalSeparator=','
                thousandSeparator='.'
                prefix='R$ '
                value={formData.shipping_price}
                onChangeEvent={(e, masked, floatValue) => {
                  handleCurrencyChange('shipping_price', floatValue);
                }}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {formData.shipping_type !== '0' && formData.allow_shipping_region === '1' && (
        <Row>
          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Região Norte *</Form.Label>
              <CurrencyInput
                className='form-control'
                decimalSeparator=','
                thousandSeparator='.'
                prefix='R$ '
                value={formData.shipping_price_no}
                onChangeEvent={(e, masked, floatValue) => {
                  handleCurrencyChange('shipping_price_no', floatValue);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Região Nordeste *</Form.Label>
              <CurrencyInput
                className='form-control'
                decimalSeparator=','
                thousandSeparator='.'
                prefix='R$ '
                value={formData.shipping_price_ne}
                onChangeEvent={(e, masked, floatValue) => {
                  handleCurrencyChange('shipping_price_ne', floatValue);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Centro Oeste *</Form.Label>
              <CurrencyInput
                className='form-control'
                decimalSeparator=','
                thousandSeparator='.'
                prefix='R$ '
                value={formData.shipping_price_co}
                onChangeEvent={(e, masked, floatValue) => {
                  handleCurrencyChange('shipping_price_co', floatValue);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Região Sudeste *</Form.Label>
              <CurrencyInput
                className='form-control'
                decimalSeparator=','
                thousandSeparator='.'
                prefix='R$ '
                value={formData.shipping_price_so}
                onChangeEvent={(e, masked, floatValue) => {
                  handleCurrencyChange('shipping_price_so', floatValue);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Região Sul *</Form.Label>
              <CurrencyInput
                className='form-control'
                decimalSeparator=','
                thousandSeparator='.'
                prefix='R$ '
                value={formData.shipping_price_su}
                onChangeEvent={(e, masked, floatValue) => {
                  handleCurrencyChange('shipping_price_su', floatValue);
                }}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={12}>
          <Form.Group className='mb-3'>
            <Form.Label>Texto para Prazo de Entrega</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={formData.shipping_text}
              onChange={(e) => setFormData({ ...formData, shipping_text: e.target.value })}
              placeholder='Seu produto chega em até 7 dias úteis.'
            />
          </Form.Group>
        </Col>
      </Row>

      <div className='d-flex justify-content-end gap-2 mt-4'>
        <ButtonDS onClick={handleSave} disabled={requesting}>
          {requesting ? 'Salvando...' : 'Salvar Configurações'}
        </ButtonDS>
      </div>

      {!embedded && setShow && (
        <div className='d-flex justify-content-end mt-4'>
          <ButtonDS variant='outline-secondary' onClick={() => setShow(false)}>
            Fechar
          </ButtonDS>
        </div>
      )}
    </div>
  );
};

export default ModalShipping;
