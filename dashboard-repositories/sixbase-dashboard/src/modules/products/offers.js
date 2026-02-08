/* eslint-disable react/jsx-no-target-blank */
import { useEffect, useState } from 'react';
import {
  Card,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Popover,
  Row,
} from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import Currency from '../../jsx/components/Currency';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import api from '../../providers/api';
import { useProduct } from '../../providers/contextProduct';
import Loader from '../../utils/loader';
import { notify, offerName } from '../functions';
import '../market/style.scss';
import NoDataComponentContent from '../NoDataComponentContent';
import ModalSelect3Steps from './offers/modal-3steps';
import ModalAbandoned from './offers/modal-abandoned';
import ModalBumps from './offers/modal-bumps';
import ModalOffer from './offers/modal-offer';
import PageProductsEditPlans from './plans';
import './styles.scss';

const popoverBottom = (
  item,
  handleEdit,
  handleModalBumps,
  handleCopyLink,
  abandonedCart,
  handleDuplicateOffer,
  uuidProduct,
  fetchData,
  searchValue,
  selectedStatus = 'all'
) => (
  <Popover
    id='popover-trigger-hover-focus'
    className='popoverReserve-offers'
    title='Detalhes'
  >
    <ul>
      <li
        onClick={() => {
          handleEdit(item);
        }}
      >
        <i className='bx bx-pencil' />
        Editar
      </li>
      <li
        onClick={() => {
          handleModalBumps(item);
        }}
      >
        <i className='bx bx-plus-circle' />
        Order Bumps
      </li>

      <a href={item.url_checkout} target='_blank'>
        <li>
          <i className='bx bx-link-alt' />
          Abrir checkout
        </li>
      </a>
      <li
        onClick={() => {
          handleDuplicateOffer(
            item,
            uuidProduct,
            fetchData,
            searchValue,
            selectedStatus
          );
        }}
      >
        <i className='bx bx-duplicate'></i>
        Duplicar oferta
      </li>

      <li
        onClick={() => {
          handleCopyLink(item.url_checkout);
        }}
      >
        <i className='bx bx-copy-alt' />
        Copiar link checkout
      </li>
      <li
        onClick={() => {
          handleCopyLink(item.uuid);
        }}
      >
        <i className='bx bx-copy-alt'></i>
        Copiar código da oferta
      </li>
      {/* <li
        onClick={() => {
          abandonedCart(item);
        }}
      >
        <i className='bx bx-cart'></i>
        Carrinhos abandonados
      </li> */}
    </ul>
  </Popover>
);

const handleDuplicateOffer = async (
  item,
  uuidProduct,
  fetchData,
  searchValue,
  selectedStatus
) => {
  api
    .post(`/products/offers/${uuidProduct}/duplicate/${item.uuid}`)
    .then(() => {
      fetchData(searchValue, selectedStatus);
      notify({ message: 'Duplicado com sucesso', type: 'success' });
    })
    .catch(() => {
      notify({ message: 'Erro ao duplicar oferta', type: 'error' });
    });
};

const PageProductsEditOffers = () => {
  const [showSelect3Steps, setShowSelect3Steps] = useState(false);
  const [showModalOffer, setShowModalOffer] = useState(false);
  const [showModalAbandoned, setShowModalAbandoned] = useState(false);
  const [showModalBumps, setShowModalBumps] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [urlCheckout, setUrlCheckout] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState({
    value: 'all',
    label: 'Todas as ofertas',
  });

  const { uuidProduct } = useParams();
  const { product } = useProduct();

  const [isErrorServeCausedByFilter, setisErrorServeCausedByFilter] =
    useState(false);

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    notify({ message: 'Link copiado!', type: 'success' });
  };

  const fetchData = (offerName, offerStatus = 'all') => {
    setLoading(true);

    let url = `/products/offers/${uuidProduct}/paginated?size=${perPage}&page=${currentPage}&status=${offerStatus}`;

    if (offerName && offerName.length > 0) {
      url = `${url}&name=${offerName}`;
    }

    api
      .get(url)
      .then((response) => {
        setOffers(response.data.rows);
        setTotalRows(response.data.count);
      })
      .catch(() => {
        setisErrorServeCausedByFilter(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEdit = (offer) => {
    const url = new URL(window.location);
    url.searchParams.set('offerId', offer.uuid);
    window.history.pushState({}, '', url);
    setShowModalOffer(true);
    setActiveOffer(offer);
  };

  const handleModalBumps = (offer) => {
    setActiveOffer(offer);
    setShowModalBumps(true);
  };

  const abandonedCart = (offer) => {
    setShowModalAbandoned(true);
    setActiveOffer(offer);
  };

  const handleModal3Steps = (url) => {
    setUrlCheckout(url);
    setShowSelect3Steps(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    if (!showModalOffer && !showModalBumps) {
      fetchData(searchValue, selectedStatus.value);
    }
  }, [showModalOffer, showModalBumps]);

  return (
    <>
      {showSelect3Steps && (
        <ModalGeneric
          title={'Selecione o modelo de Checkout'}
          Oferta
          id='modal-select-3steps'
          centered
          show={showSelect3Steps}
          setShow={setShowSelect3Steps}
          size='md'
        >
          <ModalSelect3Steps
            urlCheckout={urlCheckout}
            handleCopyLink={handleCopyLink}
            product={product}
          />
        </ModalGeneric>
      )}

      {showModalOffer && (
        <Modal
          id='modal-offer'
          show={showModalOffer}
          centered
          size='lg'
          onHide={() => {
            setShowModalOffer(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {activeOffer === null ? 'Adicionar' : 'Editar'} Oferta
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ModalOffer
              activeOffer={activeOffer}
              setActiveOffer={setActiveOffer}
              uuidProduct={uuidProduct}
              setShowModal={setShowModalOffer}
              notify={notify}
            />
          </Modal.Body>
        </Modal>
      )}

      {showModalAbandoned && (
        <Modal
          id='modal-abandoned'
          show={showModalAbandoned}
          centered
          size='xl'
          onHide={() => {
            setShowModalAbandoned(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Carrinhos abandonados</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ModalAbandoned activeOffer={activeOffer} />
          </Modal.Body>
        </Modal>
      )}

      {showModalBumps === true && (
        <ModalGeneric
          title={'Order Bumps'}
          Oferta
          id='modal-bump'
          centered
          show={showModalBumps}
          setShow={setShowModalBumps}
          size='md'
        >
          <ModalBumps
            activeOffer={activeOffer}
            setActiveOffer={setActiveOffer}
            uuidProduct={uuidProduct}
            setShowModal={setShowModalOffer}
            setShowModalBumps={setShowModalBumps}
            notify={notify}
          />
        </ModalGeneric>
      )}

      {product.payment_type === 'subscription' && (
        <div>
          <h3 className='mb-3'>Ofertas</h3>
        </div>
      )}

      <section id='offers'>
        <Row>
          <Col>
            <PageProductsEditOffers.InputSearch
              onChange={(offerName, offerStatus) =>
                fetchData(offerName, offerStatus)
              }
              loading={loading}
              isErrorServer={isErrorServeCausedByFilter}
              currentPage={currentPage}
              perPage={perPage}
              handlePageChange={handlePageChange}
              setCurrentPage={setCurrentPage}
              setSelectedStatus={setSelectedStatus}
              selectedStatus={selectedStatus}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card>
              {offers.length === 0 && !loading && (
                <Card.Body>
                  <span>
                    Nenhuma oferta encontrada para os critérios selecionados.
                  </span>
                </Card.Body>
              )}
              {offers.length > 0 && (
                <Card.Body>
                  <DataTable
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página',
                      rangeSeparatorText: 'de',
                      selectAllRowsItem: true,
                      selectAllRowsItemText: 'Todos',
                    }}
                    columns={[
                      {
                        name: 'Oferta',
                        selector: 'name',
                        // sortable: true,
                        minWidth: '300px',
                        maxWidth: '100%',
                        cell: (item) =>
                          offerName(
                            item.index,
                            item.name,
                            item.thankyou_page_upsell,
                            item.order_bumps,
                            item.has_supplier,
                            item.has_native_upsell,
                            item.has_native_upsell_product
                          ),
                      },
                      {
                        name:
                          product.payment_type === 'single'
                            ? 'Preço'
                            : 'Planos',
                        selector: 'price',
                        minWidth: '120px',
                        cell: (item) =>
                          product.payment_type === 'single' ? (
                            <Currency amount={item.price} />
                          ) : (
                            <BadgeDS variant='primary'>
                              {item.plans.length}
                            </BadgeDS>
                          ),
                      },
                      {
                        name: 'URL',
                        selector: 'url_checkout',
                        minWidth: '350px',
                        cell: (item) => (
                          <div className='d-flex'>
                            <Form.Control
                              defaultValue={item.url_checkout}
                              readOnly
                              style={{
                                borderRadius: '5px 0 0 5px',
                                minWidth: 270,
                              }}
                              onClick={() =>
                                handleModal3Steps(item.url_checkout)
                              }
                            />
                            <ButtonDS
                              size='md'
                              className='ml-2'
                              onClick={() =>
                                handleModal3Steps(item.url_checkout)
                              }
                            >
                              <i className='bx bx-copy-alt'></i>
                            </ButtonDS>
                          </div>
                        ),
                      },

                      {
                        name: 'Status',
                        selector: 'active',
                        minWidth: '100px',
                        cell: (item) =>
                          item.active ? (
                            <BadgeDS variant='success'>Ativa</BadgeDS>
                          ) : (
                            <BadgeDS variant='light'>Inativa</BadgeDS>
                          ),
                      },
                      {
                        name: 'Ações',
                        minWidth: '100px',
                        cell: (item) => (
                          <div className='d-flex justify-content-center'>
                            <ButtonDS
                              title={'Editar'}
                              variant='primary'
                              size='icon'
                              onClick={() => handleEdit(item)}
                              style={{ marginRight: '5px' }}
                            >
                              <i className='bx bxs-pencil'></i>
                            </ButtonDS>
                            <OverlayTrigger
                              trigger={['click']}
                              rootClose
                              placement='bottom'
                              overlay={popoverBottom(
                                item,
                                handleEdit,
                                handleModalBumps,
                                handleCopyLink,
                                abandonedCart,
                                handleDuplicateOffer,
                                uuidProduct,
                                fetchData,
                                searchValue,
                                selectedStatus.value
                              )}
                            >
                              <ButtonDS
                                title={'Mais opções'}
                                variant='primary'
                                outline
                                size='icon'
                              >
                                <i className='bx bx-cog'></i>
                              </ButtonDS>
                            </OverlayTrigger>
                          </div>
                        ),
                      },
                    ]}
                    data={offers}
                    striped
                    progressComponent={
                      <Loader
                        title='Carregando ofertas...'
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          minHeight: 500,
                          minWidth: 1200,
                        }}
                      />
                    }
                    progressPending={loading}
                    noDataComponent={<NoDataComponentContent />}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={perPage}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                  />
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <ButtonDS
              onClick={() => {
                setActiveOffer(null);
                setShowModalOffer(true);
              }}
              size='sm'
            >
              Nova Oferta
            </ButtonDS>
          </Col>
        </Row>
      </section>

      {product.payment_type === 'subscription' && (
        <div className='mt-4'>
          <h3 className='mb-3'>Planos</h3>
          <PageProductsEditPlans />
        </div>
      )}
    </>
  );
};

// eslint-disable-next-line react/display-name
PageProductsEditOffers.InputSearch = (props) => {
  const [valueSearched, setValueSearched] = useState('');
  const [isError, setIsError] = useState(false);

  const {
    onChange,
    loading,
    isErrorServer,
    currentPage,
    perPage,
    handlePageChange,
    setCurrentPage,
    setSelectedStatus,
    selectedStatus,
    searchValue,
    setSearchValue,
  } = props;

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '10px',
      height: '40px',
      borderColor: state.isFocused ? '#222' : '#dadce0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#222' : '#dadce0',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#aaa',
      fontSize: '14px',
      fontWeight: '400',
    }),
  };

  const options = [
    {
      value: 'all',
      label: 'Todas as ofertas',
    },
    {
      value: 'active',
      label: 'Apenas ofertas ativas',
    },
    {
      value: 'inactive',
      label: 'Apenas ofertas inativas',
    },
  ];

  const handleChange = (searchValue) => {
    const regex = /[!@#$%^&*(),.?":{}|<>]/;

    setIsError(regex.test(searchValue) ? true : false);

    setSearchValue(searchValue);
  };

  const handleFilter = (value) => {
    if (value === valueSearched) return;

    setValueSearched(value);
    onChange(value, selectedStatus.value);
  };

  const handleClear = () => {
    handleFilter('');
    setSearchValue('');
    setValueSearched('');
    setIsError(false);
  };

  useEffect(() => {
    onChange(valueSearched, selectedStatus.value);
  }, [selectedStatus, currentPage, perPage]);

  return (
    <Row className='mb-3'>
      <Col md={12}>
        <div className='d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between'>
          <Select
            options={options}
            className='select-responsive'
            placeholder='Selecione o filtro de status...'
            value={selectedStatus}
            onChange={(option) => {
              handlePageChange(1);
              setCurrentPage(0);
              setSelectedStatus(option);
            }}
            styles={customStyles}
          />

          <Form.Group className='w-100 d-flex flex-column flex-md-row mb-0'>
            <Form.Control
              disabled={loading}
              type='text'
              value={searchValue}
              placeholder='Digite o nome da oferta...'
              onChange={(e) => handleChange(e.target.value)}
              style={{ borderRadius: '8px', background: '#fff' }}
            />

            <ButtonDS
              onClick={() => handleFilter(searchValue)}
              size='sm'
              disabled={searchValue.length === 0 || isError || loading}
              style={{
                minWidth: '150px',
              }}
              className='mt-2 mt-md-0 ml-md-2'
            >
              Pesquisar
            </ButtonDS>

            {searchValue.length > 0 && (
              <ButtonDS
                onClick={handleClear}
                variant='danger'
                disabled={loading}
                size='sm'
                style={{
                  minWidth: '150px',
                }}
                className='mt-2 mt-md-0 ml-md-2'
              >
                Limpar busca
              </ButtonDS>
            )}
          </Form.Group>
        </div>

        {isError && (
          <span
            style={{
              fontSize: '0.833rem',
              paddingLeft: '8px',
              color: '#ee6352',
            }}
          >
            {isErrorServer
              ? 'Erro ao carregar filtros. Tente novamente mais tarde.'
              : 'Caracteres inválidos na pesquisa. Tente novamente.'}
          </span>
        )}
      </Col>
    </Row>
  );
};

export default PageProductsEditOffers;
