import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Badge,
  Tabs,
  Tab,
  Alert,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';
import Loader from '../../utils/loader';

const ModalCatalogReports = ({ shop, setShow }) => {
  const [activeTab, setActiveTab] = useState('top-skus');
  const [loading, setLoading] = useState(false);
  const [topSkus, setTopSkus] = useState([]);
  const [byVendor, setByVendor] = useState([]);
  const [byType, setByType] = useState([]);
  const [recent, setRecent] = useState([]);
  const [catalog, setCatalog] = useState({ data: [], total: 0 });
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogLimit] = useState(20);
  const [topSkusBy, setTopSkusBy] = useState('times_seen');
  const [recentDays, setRecentDays] = useState(30);

  const fetchReport = useCallback(
    async (reportType) => {
      if (!shop?.uuid) return;

      setLoading(true);
      try {
        switch (reportType) {
          case 'top-skus': {
            const topResponse = await api.get(
              `/integrations/ecommerce/shops/${shop.uuid}/catalog/reports`,
              { params: { report: 'top-skus', limit: 20, by: topSkusBy } }
            );
            const topData = topResponse?.data?.data;
            setTopSkus(Array.isArray(topData) ? topData : []);
            break;
          }

          case 'by-vendor': {
            const vendorResponse = await api.get(
              `/integrations/ecommerce/shops/${shop.uuid}/catalog/reports`,
              { params: { report: 'by-vendor' } }
            );
            const vendorData = vendorResponse?.data?.data;
            setByVendor(Array.isArray(vendorData) ? vendorData : []);
            break;
          }

          case 'by-type': {
            const typeResponse = await api.get(
              `/integrations/ecommerce/shops/${shop.uuid}/catalog/reports`,
              { params: { report: 'by-type' } }
            );
            const typeData = typeResponse?.data?.data;
            setByType(Array.isArray(typeData) ? typeData : []);
            break;
          }

          case 'recent': {
            const recentResponse = await api.get(
              `/integrations/ecommerce/shops/${shop.uuid}/catalog/reports`,
              { params: { report: 'recent', limit: 20, days: recentDays } }
            );
            const recentData = recentResponse?.data?.data;
            setRecent(Array.isArray(recentData) ? recentData : []);
            break;
          }

          case 'catalog': {
            try {
              const response = await api.get(
                `/integrations/ecommerce/shops/${shop.uuid}/catalog`,
                {
                  params: {
                    limit: catalogLimit,
                    offset: (catalogPage - 1) * catalogLimit,
                    order: 'last_seen_at',
                  },
                }
              );
              const catalogData = response?.data;
              setCatalog({
                data: Array.isArray(catalogData?.data) ? catalogData.data : [],
                total:
                  typeof catalogData?.total === 'number'
                    ? catalogData.total
                    : 0,
              });
            } catch (err) {
              console.error('Erro ao carregar catálogo:', err);
              notify({
                message: 'Falha ao carregar catálogo',
                type: 'error',
              });
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('Erro ao carregar relatório:', err);
        notify({
          message: 'Falha ao carregar relatório',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [shop?.uuid, topSkusBy, recentDays, catalogLimit, catalogPage]
  );

  useEffect(() => {
    if (shop?.uuid && activeTab) {
      fetchReport(activeTab);
    }
  }, [shop?.uuid, activeTab, fetchReport]);

  const fetchCatalog = async () => {
    if (!shop?.uuid) return;
    try {
      const response = await api.get(
        `/integrations/ecommerce/shops/${shop.uuid}/catalog`,
        {
          params: {
            limit: catalogLimit,
            offset: (catalogPage - 1) * catalogLimit,
            order: 'last_seen_at',
          },
        }
      );
      const catalogData = response?.data;
      setCatalog({
        data: Array.isArray(catalogData?.data) ? catalogData.data : [],
        total: typeof catalogData?.total === 'number' ? catalogData.total : 0,
      });
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
      notify({
        message: 'Falha ao carregar catálogo',
        type: 'error',
      });
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(value));
  };

  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  if (!shop?.uuid) {
    return (
      <Alert variant='warning'>
        <p className='mb-0'>Loja não encontrada</p>
      </Alert>
    );
  }

  return (
    <div>
      <div className='mb-3'>
        <h5 className='mb-2'>
          <i className='bx bx-bar-chart-alt-2 me-3'></i> Relatórios do Catálogo
          Shopify
        </h5>
        <p className='text-muted small mb-0'>
          Dados coletados automaticamente dos carrinhos de compra
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => {
          setActiveTab(k || 'top-skus');
          fetchReport(k || 'top-skus');
        }}
        className='mb-3'
        variant='pills'
      >
        {/* Top SKUs */}
        <Tab eventKey='top-skus' title='Top SKUs'>
          <div className='mb-3'>
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Ordenar por:
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  as='select'
                  value={topSkusBy}
                  onChange={(e) => {
                    setTopSkusBy(e.target.value);
                    if (activeTab === 'top-skus' && shop?.uuid) {
                      setTimeout(() => fetchReport('top-skus'), 100);
                    }
                  }}
                  size='sm'
                >
                  <option value='times_seen'>Mais Vistos</option>
                  <option value='times_purchased'>Mais Comprados</option>
                  <option value='total_quantity_sold'>
                    Maior Quantidade Vendida
                  </option>
                  <option value='total_revenue'>Maior Receita</option>
                </Form.Control>
              </Col>
            </Form.Group>
          </div>

          {loading ? (
            <Loader title='Carregando relatório...' />
          ) : topSkus.length === 0 ? (
            <Alert variant='info'>
              <i className='bx bx-info-circle me-2'></i>
              Nenhum produto encontrado ainda. Os dados aparecerão conforme os
              clientes adicionarem itens ao carrinho.
            </Alert>
          ) : (
            <Table responsive hover size='sm'>
              <thead>
                <tr>
                  <th width='50'>#</th>
                  <th>Produto</th>
                  <th className='text-end'>Preço</th>
                  <th className='text-center'>Visto</th>
                  <th className='text-center'>Comprado</th>
                  <th className='text-end'>Qtd Vendida</th>
                  <th className='text-end'>Receita</th>
                </tr>
              </thead>
              <tbody>
                {topSkus.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className='d-flex align-items-center'>
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.full_title}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 4,
                              marginRight: 8,
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <strong>
                            {item.full_title ||
                              item.product_title ||
                              'Sem título'}
                          </strong>
                          {item.sku && (
                            <div>
                              <small className='text-muted'>
                                SKU: {item.sku}
                              </small>
                            </div>
                          )}
                          {item.vendor && (
                            <div>
                              <Badge bg='secondary' className='me-1'>
                                {item.vendor}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='text-end'>{formatCurrency(item.price)}</td>
                    <td className='text-center'>
                      <Badge bg='info'>{formatNumber(item.times_seen)}</Badge>
                    </td>
                    <td className='text-center'>
                      <Badge bg='success'>
                        {formatNumber(item.times_purchased)}
                      </Badge>
                    </td>
                    <td className='text-end'>
                      {formatNumber(item.total_quantity_sold)}
                    </td>
                    <td className='text-end'>
                      <strong>{formatCurrency(item.total_revenue)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* Por Vendor */}
        <Tab eventKey='by-vendor' title='Por Marca'>
          {loading ? (
            <Loader title='Carregando relatório...' />
          ) : byVendor.length === 0 ? (
            <Alert variant='info'>
              <i className='bx bx-info-circle me-2'></i>
              Nenhuma marca encontrada ainda.
            </Alert>
          ) : (
            <Table responsive hover size='sm'>
              <thead>
                <tr>
                  <th>Marca</th>
                  <th className='text-center'>Variantes</th>
                  <th className='text-center'>Total Visto</th>
                  <th className='text-center'>Total Comprado</th>
                  <th className='text-end'>Qtd Vendida</th>
                  <th className='text-end'>Receita Total</th>
                </tr>
              </thead>
              <tbody>
                {byVendor.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.vendor}</strong>
                    </td>
                    <td className='text-center'>
                      <Badge bg='secondary'>
                        {formatNumber(item.variant_count)}
                      </Badge>
                    </td>
                    <td className='text-center'>
                      {formatNumber(item.total_seen)}
                    </td>
                    <td className='text-center'>
                      <Badge bg='success'>
                        {formatNumber(item.total_purchased)}
                      </Badge>
                    </td>
                    <td className='text-end'>
                      {formatNumber(item.total_qty_sold)}
                    </td>
                    <td className='text-end'>
                      <strong>{formatCurrency(item.total_revenue)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* Por Tipo */}
        <Tab eventKey='by-type' title='Por Tipo'>
          {loading ? (
            <Loader title='Carregando relatório...' />
          ) : byType.length === 0 ? (
            <Alert variant='info'>
              <i className='bx bx-info-circle me-2'></i>
              Nenhum tipo de produto encontrado ainda.
            </Alert>
          ) : (
            <Table responsive hover size='sm'>
              <thead>
                <tr>
                  <th>Tipo de Produto</th>
                  <th className='text-center'>Variantes</th>
                  <th className='text-center'>Total Visto</th>
                  <th className='text-center'>Total Comprado</th>
                  <th className='text-end'>Qtd Vendida</th>
                  <th className='text-end'>Receita Total</th>
                </tr>
              </thead>
              <tbody>
                {byType.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.productType || 'Sem tipo'}</strong>
                    </td>
                    <td className='text-center'>
                      <Badge bg='secondary'>
                        {formatNumber(item.variant_count)}
                      </Badge>
                    </td>
                    <td className='text-center'>
                      {formatNumber(item.total_seen)}
                    </td>
                    <td className='text-center'>
                      <Badge bg='success'>
                        {formatNumber(item.total_purchased)}
                      </Badge>
                    </td>
                    <td className='text-end'>
                      {formatNumber(item.total_qty_sold)}
                    </td>
                    <td className='text-end'>
                      <strong>{formatCurrency(item.total_revenue)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* Recentes */}
        <Tab eventKey='recent' title='Produtos Recentes'>
          <div className='mb-3'>
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Últimos dias:
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  as='select'
                  value={recentDays}
                  onChange={(e) => {
                    setRecentDays(parseInt(e.target.value, 10));
                    if (activeTab === 'recent' && shop?.uuid) {
                      setTimeout(() => fetchReport('recent'), 100);
                    }
                  }}
                  size='sm'
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </Form.Control>
              </Col>
            </Form.Group>
          </div>

          {loading ? (
            <Loader title='Carregando relatório...' />
          ) : recent.length === 0 ? (
            <Alert variant='info'>
              <i className='bx bx-info-circle me-2'></i>
              Nenhum produto novo encontrado no período selecionado.
            </Alert>
          ) : (
            <Table responsive hover size='sm'>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th className='text-end'>Preço</th>
                  <th className='text-center'>Visto</th>
                  <th>Primeira Vez</th>
                  <th>Última Vez</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className='d-flex align-items-center'>
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.full_title}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 4,
                              marginRight: 8,
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <strong>
                            {item.full_title ||
                              item.product_title ||
                              'Sem título'}
                          </strong>
                          {item.sku && (
                            <div>
                              <small className='text-muted'>
                                SKU: {item.sku}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='text-end'>{formatCurrency(item.price)}</td>
                    <td className='text-center'>
                      <Badge bg='info'>{formatNumber(item.times_seen)}</Badge>
                    </td>
                    <td>
                      {item.first_seen_at
                        ? new Date(item.first_seen_at).toLocaleDateString(
                            'pt-BR'
                          )
                        : '-'}
                    </td>
                    <td>
                      {item.last_seen_at
                        ? new Date(item.last_seen_at).toLocaleDateString(
                            'pt-BR'
                          )
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* Catálogo Completo */}
        <Tab eventKey='catalog' title='Catálogo Completo'>
          {loading ? (
            <Loader title='Carregando catálogo...' />
          ) : catalog.data.length === 0 ? (
            <Alert variant='info'>
              <i className='bx bx-info-circle me-2'></i>
              Catálogo vazio. Os produtos aparecerão conforme forem adicionados
              aos carrinhos.
            </Alert>
          ) : (
            <>
              <div className='mb-3'>
                <Badge bg='secondary'>
                  Total: {formatNumber(catalog.total)} produtos
                </Badge>
              </div>
              <Table responsive hover size='sm'>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th className='text-end'>Preço</th>
                    <th className='text-center'>Visto</th>
                    <th className='text-center'>Comprado</th>
                    <th>Última Vez</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className='d-flex align-items-center'>
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.full_title}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: 'cover',
                                borderRadius: 4,
                                marginRight: 8,
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <strong>
                              {item.full_title ||
                                item.product_title ||
                                'Sem título'}
                            </strong>
                            {item.sku && (
                              <div>
                                <small className='text-muted'>
                                  SKU: {item.sku}
                                </small>
                              </div>
                            )}
                            {item.vendor && (
                              <div>
                                <Badge bg='secondary' className='me-1'>
                                  {item.vendor}
                                </Badge>
                                {item.product_type && (
                                  <Badge bg='info'>{item.product_type}</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='text-end'>{formatCurrency(item.price)}</td>
                      <td className='text-center'>
                        <Badge bg='info'>{formatNumber(item.times_seen)}</Badge>
                      </td>
                      <td className='text-center'>
                        <Badge bg='success'>
                          {formatNumber(item.times_purchased)}
                        </Badge>
                      </td>
                      <td>
                        {item.last_seen_at
                          ? new Date(item.last_seen_at).toLocaleDateString(
                              'pt-BR'
                            )
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {catalog.total > catalogLimit && (
                <div className='d-flex justify-content-between align-items-center mt-3'>
                  <small className='text-muted'>
                    Página {catalogPage} de{' '}
                    {Math.ceil(catalog.total / catalogLimit)}
                  </small>
                  <div>
                    <ButtonDS
                      size='sm'
                      variant='outline-secondary'
                      disabled={catalogPage === 1}
                      onClick={() => {
                        setCatalogPage((p) => p - 1);
                        setTimeout(() => fetchCatalog(), 100);
                      }}
                    >
                      Anterior
                    </ButtonDS>
                    <ButtonDS
                      size='sm'
                      variant='outline-secondary'
                      disabled={
                        catalogPage >= Math.ceil(catalog.total / catalogLimit)
                      }
                      onClick={() => {
                        setCatalogPage((p) => p + 1);
                        setTimeout(() => fetchCatalog(), 100);
                      }}
                      className='ms-2'
                    >
                      Próxima
                    </ButtonDS>
                  </div>
                </div>
              )}
            </>
          )}
        </Tab>
      </Tabs>

      <div className='d-flex justify-content-end mt-3'>
        <ButtonDS variant='outline-secondary' onClick={() => setShow(false)}>
          Fechar
        </ButtonDS>
      </div>
    </div>
  );
};

export default ModalCatalogReports;
