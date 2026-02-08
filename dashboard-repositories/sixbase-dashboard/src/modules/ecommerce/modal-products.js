import { useState, useEffect } from 'react';
import { Col, Form, Row, Table, Badge } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';

const ModalProducts = ({ setShow, shop }) => {
  const [requesting, setRequesting] = useState(false);
  const [shopProducts, setShopProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedOffer, setSelectedOffer] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (shop?.uuid) {
      fetchShopProducts();
      fetchAvailableProducts();
    }
  }, [shop]);

  const fetchShopProducts = () => {
    setRequesting(true);
    api
      .get(`/integrations/ecommerce/shops/${shop.uuid}/products`)
      .then((response) => {
        setShopProducts(response.data);
      })
      .catch((err) => {
        console.error(err);
        notify({ message: 'Falha ao carregar produtos', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  const fetchAvailableProducts = () => {
    setLoadingProducts(true);
    api
      .get('/products/with-offers')
      .then((response) => {
        setAvailableProducts(response.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoadingProducts(false));
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      notify({ message: 'Selecione um produto', type: 'error' });
      return;
    }

    setRequesting(true);
    api
      .post(`/integrations/ecommerce/shops/${shop.uuid}/products`, {
        id_product: parseInt(selectedProduct),
        id_default_offer: selectedOffer ? parseInt(selectedOffer) : null,
      })
      .then(() => {
        fetchShopProducts();
        setSelectedProduct('');
        setSelectedOffer('');
        notify({ message: 'Produto adicionado com sucesso!', type: 'success' });
      })
      .catch((err) => {
        console.error(err);
        notify({ message: err.response?.data?.error || 'Falha ao adicionar produto', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  const handleRemoveProduct = (productId) => {
    if (!window.confirm('Remover este produto da loja?')) return;

    setRequesting(true);
    api
      .delete(`/integrations/ecommerce/shops/${shop.uuid}/products/${productId}`)
      .then(() => {
        fetchShopProducts();
        notify({ message: 'Produto removido com sucesso!', type: 'success' });
      })
      .catch((err) => {
        console.error(err);
        notify({ message: 'Falha ao remover produto', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  const getOffersForProduct = (productId) => {
    const product = availableProducts.find((p) => p.id === parseInt(productId));
    return product?.offers || [];
  };

  return (
    <div>
      <div className='mb-4 p-3 bg-light rounded'>
        <h6 className='mb-3'>
          <i className='bx bx-plus-circle me-2'></i>
          Adicionar Produto
        </h6>
        <Row>
          <Col md={5}>
            <Form.Group className='mb-2'>
              <Form.Label>Produto B4You *</Form.Label>
              <Form.Select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value);
                  setSelectedOffer('');
                }}
                disabled={loadingProducts}
              >
                <option value=''>
                  {loadingProducts ? 'Carregando...' : 'Selecione um produto'}
                </option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={5}>
            <Form.Group className='mb-2'>
              <Form.Label>Oferta Padrão</Form.Label>
              <Form.Select
                value={selectedOffer}
                onChange={(e) => setSelectedOffer(e.target.value)}
                disabled={!selectedProduct}
              >
                <option value=''>Nenhuma (usar primeira oferta)</option>
                {getOffersForProduct(selectedProduct).map((offer) => (
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
              onClick={handleAddProduct}
              disabled={requesting || !selectedProduct}
            >
              <i className='bx bx-plus me-1'></i> Adicionar
            </ButtonDS>
          </Col>
        </Row>
      </div>

      <h6 className='mb-3'>
        <i className='bx bx-box me-2'></i>
        Produtos na Loja ({shopProducts.length})
      </h6>

      <Table responsive hover size='sm'>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Oferta Padrão</th>
            <th className='text-center'>Status</th>
            <th width='80' className='text-center'>Ação</th>
          </tr>
        </thead>
        <tbody>
          {shopProducts.map((sp) => (
            <tr key={sp.id}>
              <td>
                <strong>{sp.product?.name || sp.custom_name || `Produto #${sp.id_product}`}</strong>
              </td>
              <td>
                {sp.default_offer ? (
                  <span>{sp.default_offer.name} - R$ {sp.default_offer.price}</span>
                ) : (
                  <span className='text-muted'>Primeira oferta</span>
                )}
              </td>
              <td className='text-center'>
                {sp.active ? (
                  <Badge bg='success'>Ativo</Badge>
                ) : (
                  <Badge bg='secondary'>Inativo</Badge>
                )}
              </td>
              <td className='text-center'>
                <ButtonDS
                  size='icon'
                  variant='outline-danger'
                  onClick={() => handleRemoveProduct(sp.id)}
                  disabled={requesting}
                >
                  <i className='bx bx-trash'></i>
                </ButtonDS>
              </td>
            </tr>
          ))}
          {shopProducts.length === 0 && !requesting && (
            <tr>
              <td colSpan='4' className='text-center py-4'>
                <i className='bx bx-box' style={{ fontSize: 32, opacity: 0.3 }}></i>
                <p className='mb-0 mt-2 text-muted'>Nenhum produto adicionado ainda.</p>
              </td>
            </tr>
          )}
          {requesting && (
            <tr>
              <td colSpan='4' className='text-center py-3'>
                <i className='bx bx-loader-alt bx-spin' style={{ fontSize: 24 }} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className='d-flex justify-content-end mt-4'>
        <ButtonDS variant='outline-secondary' onClick={() => setShow(false)}>
          Fechar
        </ButtonDS>
      </div>
    </div>
  );
};

export default ModalProducts;
