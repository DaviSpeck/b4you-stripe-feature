import { useState, useEffect } from 'react';
import { Col, Form, Row, Alert } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';
import Loader from '../../utils/loader';

const ModalPayment = ({ setShow, shop, embedded = false }) => {
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState(null);
  const [formData, setFormData] = useState({
    payment_methods: 'credit_card,billet,pix',
    installments: '12',
    student_pays_interest: 'false',
    discount_card: 0,
    discount_pix: 0,
    discount_billet: 0,
    allow_coupon: 'true',
    enable_two_cards_payment: 'false',
  });

  const discounts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  useEffect(() => {
    if (shop?.default_offer?.uuid && shop?.container_product?.uuid) {
      fetchOffer();
    } else {
      setLoading(false);
    }
  }, [shop]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const offerUuid = shop.default_offer?.uuid;
      const productUuid = shop.container_product?.uuid;

      // Fetch offer data from API
      const response = await api.get(`/products/${productUuid}/offers`);
      const offers = Array.isArray(response.data) ? response.data : (response.data?.offers || []);
      const offerData = offers.find(o => o.uuid === offerUuid);

      if (offerData) {
        setOffer(offerData);
        setFormData({
          payment_methods: offerData.payment_methods || 'credit_card,billet,pix',
          installments: offerData.installments?.toString() || '12',
          student_pays_interest: offerData.student_pays_interest ? 'true' : 'false',
          discount_card: offerData.discount_card || 0,
          discount_pix: offerData.discount_pix || 0,
          discount_billet: offerData.discount_billet || 0,
          allow_coupon: offerData.allow_coupon !== false ? 'true' : 'false',
          enable_two_cards_payment: offerData.enable_two_cards_payment ? 'true' : 'false',
        });
      } else {
        setOffer({ uuid: offerUuid });
      }
    } catch (err) {
      console.warn('Erro ao carregar dados da oferta:', err);
      setOffer({ uuid: shop.default_offer?.uuid });
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
        payment_methods: formData.payment_methods,
        installments: parseInt(formData.installments, 10),
        student_pays_interest: formData.student_pays_interest === 'true',
        discount_card: formData.discount_card,
        discount_pix: formData.discount_pix,
        discount_billet: formData.discount_billet,
        allow_coupon: formData.allow_coupon === 'true',
        enable_two_cards_payment: formData.enable_two_cards_payment === 'true',
      };

      const productUuid = shop.container_product?.uuid;
      if (!productUuid) {
        throw new Error('Produto container não encontrado');
      }
      await api.put(`/products/${productUuid}/offers/${offerUuid}`, payload);
      notify({ message: 'Configurações de pagamento salvas!', type: 'success' });
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Falha ao salvar configurações';
      notify({ message: errorMessage, type: 'error' });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações de pagamento...' />;
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
          As configurações de pagamento aplicam-se a <strong>todas</strong> as ofertas geradas para esta loja.
        </small>
      </Alert>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Método de Pagamento *</Form.Label>
            <Form.Control
              as='select'
              value={formData.payment_methods}
              onChange={(e) => setFormData({ ...formData, payment_methods: e.target.value })}
            >
              <option value='credit_card,billet,pix'>Cartão de crédito, boleto e Pix</option>
              <option value='credit_card,billet'>Cartão de crédito e boleto</option>
              <option value='credit_card,pix'>Cartão de crédito e Pix</option>
              <option value='credit_card'>Apenas cartão de crédito</option>
              <option value='pix'>Apenas Pix</option>
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Parcelamento no Cartão *</Form.Label>
            <Form.Control
              as='select'
              value={formData.installments}
              onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
            >
              <option value='1'>Apenas à vista</option>
              <option value='2'>Até 2x</option>
              <option value='3'>Até 3x</option>
              <option value='4'>Até 4x</option>
              <option value='5'>Até 5x</option>
              <option value='6'>Até 6x</option>
              <option value='7'>Até 7x</option>
              <option value='8'>Até 8x</option>
              <option value='9'>Até 9x</option>
              <option value='10'>Até 10x</option>
              <option value='11'>Até 11x</option>
              <option value='12'>Até 12x</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Juros do Parcelamento *</Form.Label>
            <Form.Control
              as='select'
              value={formData.student_pays_interest}
              onChange={(e) => setFormData({ ...formData, student_pays_interest: e.target.value })}
            >
              <option value='true'>Cliente Paga</option>
              <option value='false'>Produtor Paga</option>
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Permitir Cupom</Form.Label>
            <Form.Control
              as='select'
              value={formData.allow_coupon}
              onChange={(e) => setFormData({ ...formData, allow_coupon: e.target.value })}
            >
              <option value='true'>Sim</option>
              <option value='false'>Não</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>Permitir Compra com Dois Cartões</Form.Label>
            <Form.Control
              as='select'
              value={formData.enable_two_cards_payment}
              onChange={(e) => setFormData({ ...formData, enable_two_cards_payment: e.target.value })}
            >
              <option value='true'>Sim</option>
              <option value='false'>Não</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className='mb-3'>
            <Form.Label>Desconto Cartão</Form.Label>
            <Form.Control
              as='select'
              value={formData.discount_card}
              onChange={(e) => setFormData({ ...formData, discount_card: parseInt(e.target.value, 10) })}
            >
              {discounts.map((d) => (
                <option key={`discount_card_${d}`} value={d}>
                  {d === 0 ? 'Sem desconto' : `${d}%`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className='mb-3'>
            <Form.Label>Desconto PIX</Form.Label>
            <Form.Control
              as='select'
              value={formData.discount_pix}
              onChange={(e) => setFormData({ ...formData, discount_pix: parseInt(e.target.value, 10) })}
            >
              {discounts.map((d) => (
                <option key={`discount_pix_${d}`} value={d}>
                  {d === 0 ? 'Sem desconto' : `${d}%`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className='mb-3'>
            <Form.Label>Desconto Boleto</Form.Label>
            <Form.Control
              as='select'
              value={formData.discount_billet}
              onChange={(e) => setFormData({ ...formData, discount_billet: parseInt(e.target.value, 10) })}
            >
              {discounts.map((d) => (
                <option key={`discount_billet_${d}`} value={d}>
                  {d === 0 ? 'Sem desconto' : `${d}%`}
                </option>
              ))}
            </Form.Control>
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

export default ModalPayment;
