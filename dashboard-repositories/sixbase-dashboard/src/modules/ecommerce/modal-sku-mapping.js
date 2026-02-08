import { useState, useEffect } from 'react';
import { Col, Form, Row, Table, Badge } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';

const ModalSkuMapping = ({ setShow, shop }) => {
  const [requesting, setRequesting] = useState(false);
  const [mappings, setMappings] = useState([]);
  const [newMapping, setNewMapping] = useState({
    sku: '',
    variant_id: '',
    id_product_offer: '',
  });
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    if (shop?.uuid) {
      fetchMappings();
      fetchOffers();
    }
  }, [shop]);

  const fetchMappings = () => {
    setRequesting(true);
    api
      .get(`/integrations/ecommerce/shops/${shop.uuid}/sku-mappings`)
      .then((response) => {
        setMappings(response.data);
      })
      .catch((err) => {
        console.error(err);
        notify({
          message: 'Falha ao carregar mapeamentos',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const fetchOffers = () => {
    setLoadingOffers(true);
    api
      .get('/products/with-offers')
      .then((response) => {
        const allOffers = [];
        response.data.forEach((product) => {
          if (product.offers) {
            product.offers.forEach((offer) => {
              allOffers.push({
                id: offer.id,
                name: offer.name,
                product_name: product.name,
                price: offer.price,
              });
            });
          }
        });
        setOffers(allOffers);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoadingOffers(false);
      });
  };

  const handleAddMapping = () => {
    if (!newMapping.sku || !newMapping.id_product_offer) {
      notify({
        message: 'SKU e Oferta são obrigatórios',
        type: 'error',
      });
      return;
    }

    setRequesting(true);
    api
      .post(`/integrations/ecommerce/shops/${shop.uuid}/sku-mappings`, {
        mappings: [
          {
            sku: newMapping.sku,
            variant_id: newMapping.variant_id || null,
            id_product_offer: parseInt(newMapping.id_product_offer),
          },
        ],
      })
      .then(() => {
        fetchMappings();
        setNewMapping({ sku: '', variant_id: '', id_product_offer: '' });
        notify({
          message: 'Mapeamento adicionado com sucesso!',
          type: 'success',
        });
      })
      .catch((err) => {
        console.error(err);
        notify({
          message: 'Falha ao adicionar mapeamento',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const handleDeleteMapping = (sku) => {
    if (!window.confirm(`Remover mapeamento do SKU "${sku}"?`)) return;

    setRequesting(true);
    api
      .delete(
        `/integrations/ecommerce/shops/${
          shop.uuid
        }/sku-mappings/${encodeURIComponent(sku)}`
      )
      .then(() => {
        fetchMappings();
        notify({
          message: 'Mapeamento removido com sucesso!',
          type: 'success',
        });
      })
      .catch((err) => {
        console.error(err);
        notify({
          message: 'Falha ao remover mapeamento',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const getOfferName = (offerId) => {
    const offer = offers.find((o) => o.id === offerId);
    return offer ? `${offer.name} (R$ ${offer.price})` : `Oferta #${offerId}`;
  };

  return (
    <div>
      <div className='mb-4 p-3 bg-light rounded'>
        <h6 className='mb-3'>
          <i className='bx bx-plus-circle me-2'></i>
          Adicionar Novo Mapeamento
        </h6>
        <Row>
          <Col md={3}>
            <Form.Group className='mb-2'>
              <Form.Label>SKU *</Form.Label>
              <Form.Control
                placeholder='PROD-001'
                value={newMapping.sku}
                onChange={(e) =>
                  setNewMapping({ ...newMapping, sku: e.target.value })
                }
              />
              <Form.Text className='text-muted'>
                SKU do produto na loja
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className='mb-2'>
              <Form.Label>Variant ID</Form.Label>
              <Form.Control
                placeholder='123456789'
                value={newMapping.variant_id}
                onChange={(e) =>
                  setNewMapping({ ...newMapping, variant_id: e.target.value })
                }
              />
              <Form.Text className='text-muted'>Opcional (Shopify)</Form.Text>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className='mb-2'>
              <Form.Label>Oferta B4You *</Form.Label>
              <Form.Select
                value={newMapping.id_product_offer}
                onChange={(e) =>
                  setNewMapping({
                    ...newMapping,
                    id_product_offer: e.target.value,
                  })
                }
                disabled={loadingOffers}
              >
                <option value=''>
                  {loadingOffers
                    ? 'Carregando ofertas...'
                    : 'Selecione uma oferta'}
                </option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name} - R$ {offer.price}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} className='d-flex align-items-end'>
            <ButtonDS
              className='mb-2 w-100'
              onClick={handleAddMapping}
              disabled={
                requesting || !newMapping.sku || !newMapping.id_product_offer
              }
            >
              <i className='bx bx-plus me-1'></i> Adicionar
            </ButtonDS>
          </Col>
        </Row>
      </div>

      <h6 className='mb-3'>
        <i className='bx bx-link me-2'></i>
        Mapeamentos Existentes ({mappings.length})
      </h6>

      <Table responsive hover size='sm'>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Variant ID</th>
            <th>Oferta B4You</th>
            <th className='text-center'>Status</th>
            <th width='80' className='text-center'>
              Ação
            </th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping) => (
            <tr key={mapping.id}>
              <td>
                <code>{mapping.sku}</code>
              </td>
              <td>
                {mapping.variant_id ? (
                  <code>{mapping.variant_id}</code>
                ) : (
                  <span className='text-muted'>-</span>
                )}
              </td>
              <td>{getOfferName(mapping.id_product_offer)}</td>
              <td className='text-center'>
                {mapping.active ? (
                  <Badge bg='success'>Ativo</Badge>
                ) : (
                  <Badge bg='secondary'>Inativo</Badge>
                )}
              </td>
              <td className='text-center'>
                <ButtonDS
                  size='icon'
                  variant='outline-danger'
                  onClick={() => handleDeleteMapping(mapping.sku)}
                  disabled={requesting}
                >
                  <i className='bx bx-trash'></i>
                </ButtonDS>
              </td>
            </tr>
          ))}
          {mappings.length === 0 && !requesting && (
            <tr>
              <td colSpan='5' className='text-center py-4'>
                <i
                  className='bx bx-link'
                  style={{ fontSize: 32, opacity: 0.3 }}
                ></i>
                <p className='mb-0 mt-2 text-muted'>
                  Nenhum SKU mapeado ainda.
                </p>
              </td>
            </tr>
          )}
          {requesting && (
            <tr>
              <td colSpan='5' className='text-center py-3'>
                <i
                  className='bx bx-loader-alt bx-spin'
                  style={{ fontSize: 24 }}
                />
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className='mt-4 p-3 bg-light rounded'>
        <h6>
          <i className='bx bx-info-circle me-2'></i>
          Como funciona o mapeamento?
        </h6>
        <ul className='mb-0 small text-muted'>
          <li>
            O <strong>SKU</strong> é o identificador do produto na sua loja
            (Shopify/WooCommerce)
          </li>
          <li>
            O <strong>Variant ID</strong> é opcional, usado para diferenciar
            variações do mesmo produto
          </li>
          <li>
            A <strong>Oferta B4You</strong> é o produto que será vendido quando
            esse SKU for adicionado ao carrinho
          </li>
          <li>
            Quando o cliente clicar em checkout, o sistema buscará a oferta
            correspondente ao SKU
          </li>
        </ul>
      </div>

      <div className='d-flex justify-content-end mt-4'>
        <ButtonDS variant='outline-secondary' onClick={() => setShow(false)}>
          Fechar
        </ButtonDS>
      </div>
    </div>
  );
};

export default ModalSkuMapping;
