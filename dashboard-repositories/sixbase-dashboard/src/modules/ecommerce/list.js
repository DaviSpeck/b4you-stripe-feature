import { useEffect, useState } from 'react';
import { Card, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import PageTitle from '../../jsx/layouts/PageTitle';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import ModalShop from './modal-shop';
import ModalProductConfig from './modal-product-config';
import ModalOfferConfig from './modal-offer-config';
import ModalCatalogReports from './modal-catalog-reports';
import api from '../../providers/api';
import { notify } from '../functions';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

const PageAppsEcommerce = () => {
  const [requesting, setRequesting] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showProductConfigModal, setShowProductConfigModal] = useState(false);
  const [showOfferConfigModal, setShowOfferConfigModal] = useState(false);
  const [showCatalogReportsModal, setShowCatalogReportsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = () => {
    setRequesting(true);
    api
      .get('/integrations/ecommerce/shops')
      .then((response) => {
        const data = response?.data;
        setShops(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        notify({
          message: 'Falha ao carregar lojas',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const handleDelete = () => {
    if (!shopToDelete) return;

    setRequesting(true);
    api
      .delete(`/integrations/ecommerce/shops/${shopToDelete.uuid}`)
      .then(() => {
        fetchShops();
        setShowDeleteModal(false);
        setShopToDelete(null);
        notify({
          message: 'Loja removida com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover loja',
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };

  const handleOpenEdit = (shop) => {
    setSelectedShop(shop);
    setEditMode(true);
    setShowShopModal(true);
  };

  const handleOpenCreate = () => {
    setSelectedShop(null);
    setEditMode(false);
    setShowShopModal(true);
  };

  const handleOpenProductConfig = (shop) => {
    setSelectedShop(shop);
    setShowProductConfigModal(true);
  };

  const handleOpenOfferConfig = (shop) => {
    setSelectedShop(shop);
    setShowOfferConfigModal(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notify({
      message: 'Copiado para a área de transferência!',
      type: 'success',
    });
  };

  const getScriptCode = (shop) => {
    return `<script src="https://cdn.b4you.com.br/b4you-ecommerce-production/b4you-ecommerce-universal.min.js"></script>
<script>
  B4YouCheckout.init({
    shop_uuid: '${shop.uuid}',
    button_id: 'checkoutB4',
    checkout_url: 'https://checkout.b4you.com.br/',
    debug: false
  });
</script>`;
  };

  return (
    <>
      <PageTitle title='E-commerce' />

      {/* Modal - Nova/Editar Loja */}
      <ModalGeneric
        show={showShopModal}
        setShow={setShowShopModal}
        title={editMode ? 'Editar Loja' : 'Nova Loja'}
        centered
        size='lg'
      >
        <ModalShop
          setShow={setShowShopModal}
          fetchData={fetchShops}
          shop={selectedShop}
          editMode={editMode}
        />
      </ModalGeneric>

      {/* Modal - Configurar Produto */}
      <ModalGeneric
        show={showProductConfigModal}
        setShow={setShowProductConfigModal}
        title='Configurar Produto'
        centered
        size='xl'
      >
        <ModalProductConfig setShow={setShowProductConfigModal} shop={selectedShop} />
      </ModalGeneric>

      {/* Modal - Configurar Oferta */}
      <ModalGeneric
        show={showOfferConfigModal}
        setShow={setShowOfferConfigModal}
        title='Configurar Oferta'
        centered
        size='xl'
      >
        <ModalOfferConfig setShow={setShowOfferConfigModal} shop={selectedShop} />
      </ModalGeneric>

      {/* Modal - Relatórios do Catálogo - só monta o conteúdo quando aberto e com loja selecionada */}
      <ModalGeneric
        show={showCatalogReportsModal}
        setShow={setShowCatalogReportsModal}
        title='Relatórios do Catálogo'
        centered
        size='xl'
      >
        {showCatalogReportsModal && selectedShop ? (
          <ModalCatalogReports
            shop={selectedShop}
            setShow={setShowCatalogReportsModal}
          />
        ) : (
          <div className='text-center py-3 text-muted'>Carregando...</div>
        )}
      </ModalGeneric>

      <section id='page-apps'>
        <Card>
          <Card.Header className='d-flex justify-content-between align-items-center'>
            <span>Lojas Integradas</span>
            {shops.length === 0 && (
              <ButtonDS size='sm' onClick={handleOpenCreate}>
                <i className='bx bx-plus me-1'></i> Nova Loja
              </ButtonDS>
            )}
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th width='50' className='text-center'>
                    Status
                  </th>
                  <th>Loja</th>
                  <th>Domínio</th>
                  <th width='320' className='text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {!requesting &&
                  shops.map((shop) => (
                    <tr key={shop.uuid}>
                      <td className='text-center'>
                        {shop.active ? (
                          <Badge bg='success'>Ativo</Badge>
                        ) : (
                          <Badge bg='secondary'>Inativo</Badge>
                        )}
                      </td>
                      <td>
                        <strong>{shop.shop_name}</strong>
                        <br />
                        <small className='text-muted'>{shop.uuid}</small>
                      </td>
                      <td>{shop.shop_domain}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <ButtonDS
                            size='icon'
                            variant='outline-primary'
                            title='Copiar Script'
                            onClick={() => copyToClipboard(getScriptCode(shop))}
                          >
                            <i className='bx bx-code-alt'></i>
                          </ButtonDS>
                          <ButtonDS
                            size='icon'
                            variant='outline-success'
                            title='Relatórios do Catálogo'
                            onClick={() => {
                              if (shop?.uuid) {
                                setSelectedShop(shop);
                                setShowCatalogReportsModal(true);
                              }
                            }}
                          >
                            <i className='bx bx-bar-chart-alt-2'></i>
                          </ButtonDS>
                          <ButtonDS
                            size='icon'
                            variant='outline-info'
                            title='Configurar Produto'
                            onClick={() => handleOpenProductConfig(shop)}
                          >
                            <i className='bx bx-box'></i>
                          </ButtonDS>
                          <ButtonDS
                            size='icon'
                            variant='outline-primary'
                            title='Configurar Oferta'
                            onClick={() => handleOpenOfferConfig(shop)}
                          >
                            <i className='bx bx-purchase-tag'></i>
                          </ButtonDS>
                          <ButtonDS
                            size='icon'
                            variant='outline-warning'
                            title='Editar Loja'
                            onClick={() => handleOpenEdit(shop)}
                          >
                            <i className='bx bx-edit'></i>
                          </ButtonDS>
                          <ButtonDS
                            size='icon'
                            variant='outline-danger'
                            title='Remover'
                            onClick={() => {
                              setShopToDelete(shop);
                              setShowDeleteModal(true);
                            }}
                          >
                            <i className='bx bx-trash'></i>
                          </ButtonDS>
                        </div>
                      </td>
                    </tr>
                  ))}
                {shops.length === 0 && !requesting && (
                  <tr>
                    <td colSpan='4' className='text-center py-4'>
                      <i
                        className='bx bx-store'
                        style={{ fontSize: 48, opacity: 0.3 }}
                      ></i>
                      <p className='mb-0 mt-2'>Nenhuma loja integrada ainda.</p>
                      <small className='text-muted'>
                        Clique em &quot;Nova Loja&quot; para começar.
                      </small>
                    </td>
                  </tr>
                )}
                {requesting && (
                  <tr>
                    <td colSpan='4' className='text-center py-4'>
                      <i
                        className='bx bx-loader-alt bx-spin'
                        style={{ fontSize: 40 }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Card className='mt-4'>
          <Card.Header>
            <i className='bx bx-info-circle me-2'></i>
            Como Integrar
          </Card.Header>
          <Card.Body>
            <Tabs defaultActiveKey='install' className='mb-3'>
              <Tab eventKey='install' title='Instalação'>
                <ol>
                  <li className='mb-2'>
                    <strong>Crie uma loja</strong> clicando em &quot;Nova
                    Loja&quot; acima (limite de uma loja por usuário)
                  </li>
                  <li className='mb-2'>
                    <strong>Configure o Produto</strong> - nome, categoria, pixels,
                    afiliados e parcerias (icone <i className='bx bx-box'></i>)
                  </li>
                  <li className='mb-2'>
                    <strong>Configure a Oferta</strong> - pagamento, frete, cupons,
                    order bumps, upsell, contador (icone <i className='bx bx-purchase-tag'></i>)
                  </li>
                  <li className='mb-2'>
                    <strong>Copie o script</strong> e cole no tema do Shopify
                  </li>
                </ol>
              </Tab>
              <Tab eventKey='example' title='Exemplo de Código'>
                <pre
                  style={{
                    background: '#1e1e1e',
                    color: '#d4d4d4',
                    padding: 16,
                    borderRadius: 8,
                    overflow: 'auto',
                  }}
                >
                  {`<!-- Adicione antes de </body> -->
<script src="https://cdn.b4you.com.br/b4you-ecommerce-production/b4you-ecommerce-universal.min.js"></script>
<script>
  B4YouCheckout.init({
    shop_uuid: 'SEU_UUID_AQUI',
    button_id: 'checkoutB4',
    checkout_url: 'URL_DO_CHECKOUT',
    debug: false
  });
</script>`}
                </pre>
              </Tab>
              <Tab eventKey='features' title='Funcionalidades'>
                <Table size='sm' bordered>
                  <thead>
                    <tr>
                      <th>Configuração</th>
                      <th>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Badge bg='info'>
                          <i className='bx bx-box me-1'></i>Produto
                        </Badge>
                      </td>
                      <td>
                        Configurações do produto container: nome, categoria, garantia,
                        pixels de conversão, parcerias (afiliados, fornecedores, gerentes)
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Badge bg='primary'>
                          <i className='bx bx-purchase-tag me-1'></i>Oferta
                        </Badge>
                      </td>
                      <td>
                        Configurações da oferta padrão que serão herdadas: pagamento,
                        frete, cupons, contador, termos, popup, back redirect
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Badge bg='warning'>
                          <i className='bx bx-plus-circle me-1'></i>Order Bumps
                        </Badge>
                      </td>
                      <td>
                        Ofertas adicionais exibidas no checkout - aplicadas
                        automaticamente em todas as ofertas geradas
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Badge bg='success'>
                          <i className='bx bx-trending-up me-1'></i>Upsell
                        </Badge>
                      </td>
                      <td>
                        Ofertas de upgrade após a compra - redirecionamento
                        automático para página de upsell
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {showDeleteModal && (
          <ConfirmAction
            title='Remover Loja'
            show={showDeleteModal}
            setShow={setShowDeleteModal}
            handleAction={handleDelete}
            buttonText='Remover'
            centered
          >
            <p>
              Tem certeza que deseja remover a loja{' '}
              <strong>{shopToDelete?.shop_name}</strong>?
            </p>
            <p className='text-muted small'>
              Esta ação irá desativar a integração e todos os mapeamentos de
              SKU.
            </p>
          </ConfirmAction>
        )}
      </section>
    </>
  );
};

export default PageAppsEcommerce;
