import { useState, useEffect } from 'react';
import { Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import api from '../../providers/api';
import { notify } from '../functions';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import Loader from '../../utils/loader';

const ModalOfferAdditionalInfo = ({ shop, embedded = false }) => {
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [offer, setOffer] = useState(null);

  const productUuid = shop?.container_product?.uuid;
  const offerUuid = shop?.default_offer?.uuid;

  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '',
    weight: '',
  });

  useEffect(() => {
    if (productUuid && offerUuid) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [productUuid, offerUuid]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const offersResponse = await api.get(`/products/${productUuid}/offers`);
      const offersArray = Array.isArray(offersResponse.data)
        ? offersResponse.data
        : (offersResponse.data?.offers || []);

      const offerData = offersArray.find(o => o.uuid === offerUuid);
      if (offerData) {
        setOffer(offerData);

        setDimensions({
          length: offerData.length || '',
          width: offerData.width || '',
          height: offerData.height || '',
          weight: offerData.weight || '',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setDimensions((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setRequesting(true);
    try {
      const payload = {
        length: dimensions.length ? parseFloat(dimensions.length) : null,
        width: dimensions.width ? parseFloat(dimensions.width) : null,
        height: dimensions.height ? parseFloat(dimensions.height) : null,
        weight: dimensions.weight ? parseFloat(dimensions.weight) : null,
      };

      await api.put(`/products/${productUuid}/offers/${offerUuid}`, payload);
      notify({ message: 'Informações salvas com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Erro ao salvar:', err);
      notify({ message: 'Falha ao salvar informações', type: 'error' });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando informações adicionais...' />;
  }

  if (!productUuid || !offerUuid) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Oferta padrão não encontrada</p>
      </div>
    );
  }

  return (
    <div>
      {/* Dimensões */}
      <Card className='mb-4'>
        <Card.Body>
          <h4>Dimensões</h4>
          <p className='text-muted'>
            Usado para calcular as taxas de frete no checkout.
          </p>
          <Row className='mb-3 g-2'>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>Comprimento</Form.Label>
                <InputGroup>
                  <Form.Control
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    name='length'
                    value={dimensions.length}
                    onChange={handleDimensionChange}
                  />
                  <InputGroup.Text>cm</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>Largura</Form.Label>
                <InputGroup>
                  <Form.Control
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    name='width'
                    value={dimensions.width}
                    onChange={handleDimensionChange}
                  />
                  <InputGroup.Text>cm</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>Altura</Form.Label>
                <InputGroup>
                  <Form.Control
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    name='height'
                    value={dimensions.height}
                    onChange={handleDimensionChange}
                  />
                  <InputGroup.Text>cm</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>Peso</Form.Label>
                <InputGroup>
                  <Form.Control
                    name='weight'
                    type='number'
                    placeholder='0.00'
                    step='0.01'
                    value={dimensions.weight}
                    onChange={handleDimensionChange}
                  />
                  <InputGroup.Text>kg</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className='d-flex justify-content-end mt-4'>
        <ButtonDS onClick={handleSave} disabled={requesting}>
          {requesting ? 'Salvando...' : 'Salvar Informações'}
        </ButtonDS>
      </div>
    </div>
  );
};

export default ModalOfferAdditionalInfo;
