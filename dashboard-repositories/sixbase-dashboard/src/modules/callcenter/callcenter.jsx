import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Col, Row, Form } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import { notify } from '../functions';
import { useUser } from '../../providers/contextUser';
import Select from 'react-select';
const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const PageCallcenter = () => {
  const [saleId, setSaleId] = useState('');
  const [inputSaleId, setInputSaleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [student, setStudent] = useState(null);
  const [affiliate, setAffiliate] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [isThreeSteps, setIsThreeSteps] = useState(true);
  const [sck, setSck] = useState('');
  const { user } = useUser();
  const emails = ['vinixp.vp@gmail.com', 'diretoria@attracione.com.br'];

  if (
    !emails.includes(user.email) &&
    !user.collaborations.find((c) => emails.includes(c.email))
  ) {
    return (
      <section
        className='d-flex flex-column justify-content-center align-items-center'
        style={{ height: '80vh', textAlign: 'center' }}
      >
        <h1 className='display-4 mb-3'>🚧 Página em Construção</h1>
        <p className='lead'>Esta área ainda está sendo preparada para você.</p>
        <p className='text-muted'>
          Entre em contato com o administrador se precisar de acesso.
        </p>
      </section>
    );
  }

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromQuery = params.get('sale_id');
    if (idFromQuery) {
      setSaleId(idFromQuery);
      setInputSaleId(idFromQuery);
    }
  }, [location.search]);

  useEffect(() => {
    if (saleId) {
      fetchSaleData(saleId);
    }
  }, [saleId]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchSaleData = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/callcenter/sale/${id}`);

      const {
        checkoutUrl,
        offers = [],
        student,
        affiliate,
        id_product,
      } = res.data;

      setCheckoutUrl(checkoutUrl);
      setStudent(student);
      setAffiliate(affiliate || null);
      setOffers(offers);
      setSaleId(id);

      if (id_product) {
        setSelectedProduct(id_product);
        await fetchProductDetails(id_product, affiliate);
      }
    } catch (err) {
      notify({
        message: err?.response?.data?.message || 'Erro ao buscar a venda',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/callcenter/products');
      setProducts(res.data || []);
    } catch {
      notify({ message: 'Erro ao carregar produtos', type: 'error' });
    }
  };

  const fetchProductDetails = async (productId, currentAffiliate) => {
    try {
      const res = await api.get(`/callcenter/product/${productId}`);
      setOffers(res.data.offers || []);
      setCoupons(res.data.coupons || []);
      setAffiliates(res.data.affiliates || []);
      if (currentAffiliate && res.data.affiliates.length > 0) {
        const affiliate = res.data.affiliates.find(
          (a) => a.uuid === currentAffiliate.uuid
        );
        if (affiliate) {
          setSelectedAffiliate(affiliate.uuid);
        }
      }
    } catch {
      notify({ message: 'Erro ao buscar dados do produto', type: 'error' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(checkoutUrl);
    notify({ message: 'Link copiado!', type: 'success' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputSaleId) {
      setSaleId(inputSaleId);
    }
  };

  const handleCopyFinalLink = () => {
    if (!selectedOffer || !student || !selectedAffiliate) {
      notify({
        message:
          'Preencha oferta, afiliado e dados do cliente antes de copiar o link.',
        type: 'warning',
      });
      return;
    }

    let link = `https://checkout.b4you.com.br/${selectedOffer}`;
    if (isThreeSteps) {
      link += '/3steps';
    }

    const url = new URL(link);
    url.searchParams.append('full_name', student.full_name);
    url.searchParams.append('phone', student.whatsapp);
    url.searchParams.append('email', student.email);
    url.searchParams.append('cpf', student.cpf);
    url.searchParams.append('cupom', selectedCoupon);
    url.searchParams.append('b4f', selectedAffiliate);
    if (sck) {
      url.searchParams.append('sck', sck);
    }

    navigator.clipboard.writeText(url.toString());
    notify({ message: 'Link final copiado com sucesso!', type: 'success' });
  };

  return (
    <section id='page-callcenter'>
      <PageTitle title='Callcenter' />
      <Row>
        <Col md={6}>
          <form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>ID da Venda</Form.Label>
              <Form.Control
                type='text'
                placeholder='Digite ou informe o sale_id'
                value={inputSaleId}
                onChange={(e) => setInputSaleId(e.target.value)}
              />
            </Form.Group>
            <ButtonDS
              type='submit'
              variant='primary'
              className='mt-2'
              disabled={loading}
            >
              Buscar Venda
            </ButtonDS>
          </form>
        </Col>
      </Row>

      {student && (
        <>
          <Row className='mt-4'>
            <Col md={6}>
              <h5>👤 Cliente</h5>
              <p>
                <strong>Nome:</strong> {student.full_name}
              </p>
              <p>
                <strong>Email:</strong> {student.email}
              </p>
              <p>
                <strong>WhatsApp:</strong> {student.whatsapp}
              </p>
              <p>
                <strong>CPF:</strong> {student.cpf}
              </p>
            </Col>
          </Row>

          {student.address && Object.keys(student.address).length > 0 && (
            <Row className='mt-4'>
              <Col md={6}>
                <h5>📍 Endereço</h5>
                <p>
                  <strong>Rua:</strong> {student.address.street}
                </p>
                <p>
                  <strong>Número:</strong> {student.address.number}
                </p>
                <p>
                  <strong>Cidade:</strong> {student.address.city}
                </p>
                <p>
                  <strong>Estado:</strong> {student.address.state}
                </p>
                <p>
                  <strong>CEP:</strong> {student.address.zipcode}
                </p>
              </Col>
            </Row>
          )}
        </>
      )}

      {affiliate && (
        <Row className='mt-3'>
          <Col md={6}>
            <h5>🤝 Afiliado</h5>
            <p>
              <strong>Nome:</strong> {affiliate.full_name}
            </p>
            <p>
              <strong>Email:</strong> {affiliate.email}
            </p>
          </Col>
        </Row>
      )}

      <Row className='mt-4'>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Selecionar Produto</Form.Label>
            <Form.Control
              as='select'
              value={selectedProduct}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedProduct(value);
                setSelectedOffer('');
                if (value) {
                  fetchProductDetails(value);
                }
              }}
            >
              <option value=''>Selecione um produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {offers.length > 0 && (
        <Row className='mt-3'>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Selecionar Oferta</Form.Label>
              <Form.Control
                as='select'
                value={selectedOffer}
                onChange={(e) => setSelectedOffer(e.target.value)}
              >
                <option value=''>Selecione uma oferta</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.uuid}>
                    {offer.name} - {formatCurrency(offer.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      )}

      {affiliates.length > 0 && (
        <Row className='mt-3'>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Selecionar Afiliado</Form.Label>

              <Select
                placeholder='Buscar afiliado por nome ou email'
                options={affiliates.map((a) => ({
                  value: a.uuid,
                  label: `${a.full_name} (${a.email})`, // used for display matching
                  full_name: a.full_name,
                  email: a.email,
                }))}
                value={affiliates
                  .map((a) => ({
                    value: a.uuid,
                    label: `${a.full_name} (${a.email})`,
                  }))
                  .find((opt) => opt.value === selectedAffiliate)}
                onChange={(option) => setSelectedAffiliate(option.value)}
                isSearchable
                filterOption={(option, input) => {
                  const normalizedInput = input.toLowerCase();
                  return (
                    option.data.full_name
                      .toLowerCase()
                      .includes(normalizedInput) ||
                    option.data.email.toLowerCase().includes(normalizedInput)
                  );
                }}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {coupons.length > 0 && (
        <Row className='mt-3'>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Selecionar Cupom</Form.Label>
              <Form.Control
                as='select'
                value={selectedCoupon}
                onChange={(e) => setSelectedCoupon(e.target.value)}
              >
                <option value=''>Selecione um cupom</option>
                {coupons.map((a) => (
                  <option key={a.coupon} value={a.coupon}>
                    {a.coupon}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      )}
      {checkoutUrl && (
        <Row className='mt-4'>
          <Col md={8}>
            <Form.Group>
              <Form.Label>Link do Checkout</Form.Label>
              <Form.Control type='text' readOnly value={checkoutUrl} />
            </Form.Group>
          </Col>
          <Col md={4} className='d-flex align-items-end'>
            <ButtonDS variant='secondary' onClick={handleCopy}>
              Copiar Link
            </ButtonDS>
          </Col>
        </Row>
      )}

      <Row className='mt-3'>
        <Col md={6}>
          <Form.Group>
            <Form.Label>SCK</Form.Label>
            <Form.Control
              type='text'
              placeholder='Digite o valor do SCK'
              value={sck}
              onChange={(e) => setSck(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='mt-2'>
        <Col md={6}>
          <Form.Check
            type='checkbox'
            label='3 etapas'
            checked={isThreeSteps}
            onChange={(e) => setIsThreeSteps(e.target.checked)}
          />
        </Col>
      </Row>

      <Row className='d-flex justify-content-center mt-3'>
        <Col md={12} className='d-flex'>
          <ButtonDS
            variant='success'
            onClick={handleCopyFinalLink}
            disabled={!selectedOffer || !selectedAffiliate || !student}
          >
            Copiar link personalizado
          </ButtonDS>
        </Col>
      </Row>
    </section>
  );
};

export default PageCallcenter;
