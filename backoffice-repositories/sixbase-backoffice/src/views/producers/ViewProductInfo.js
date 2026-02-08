import memoizeOne from 'memoize-one';
import moment from 'moment/moment';
import { useEffect } from 'react';
import { useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../../utility/hooks/useSkin';
import { Check, X, Edit2, Info } from 'react-feather';
import { Link, useParams, useHistory } from 'react-router-dom';
import { FormatBRL } from '@utils';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  Table,
  TabPane,
  Spinner,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { useAbility } from '@casl/react';
import { AbilityContext } from '@src/utility/context/Can';
import TooltipItem from '../reports/components/ToolTipItem';

const configNotify = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const columns = memoizeOne(() => [
  { name: 'Nome', cell: (row) => row.name },
  { name: 'E-mail', cell: (row) => row.email },
  {
    name: 'Status',
    cell: (row) => <Badge color={row.status?.color}>{row.status?.label}</Badge>,
  },
  {
    name: 'Comissão',
    cell: (row) => `${row.commission}%`,
  },
  {
    name: 'Adesão',
    cell: (row) => (
      <>
        {row.subscription_fee ? (
          <Check size={20} style={{ color: '#28c76f' }} />
        ) : (
          <X size={20} style={{ color: '#ea5455' }} />
        )}
      </>
    ),
  },
]);

const columnsCoproductions = memoizeOne(() => [
  {
    name: 'Nome',
    cell: (row) => (
      <Link to={`/producer/${row.user?.uuid}`}>{row.user?.full_name}</Link>
    ),
  },
  { name: 'E-mail', cell: (row) => row.user?.email },
  { name: 'Comissão', cell: (row) => row.commission_percentage + `%` },
  {
    name: 'Status',
    cell: (row) => <Badge color={row.status?.color}>{row.status?.name}</Badge>,
  },
  {
    name: 'Criado em',
    cell: (row) => moment(row.created_at).format('DD/MM/YYYY HH:mm'),
  },
  {
    name: 'Expira em',
    cell: (row) =>
      row.expires_at
        ? moment(row.expires_at).format('DD/MM/YYYY HH:mm')
        : 'Vitalício',
  },
]);

const columnsOffer = memoizeOne(
  (setOfferUuid, setHideCheckoutModal, setCheckoutActive, ability) => [
    {
      name: 'ID',
      cell: (row) => row.uuid,
    },
    {
      name: 'Nome',
      cell: (row) => row.name,
    },
    {
      name: 'Preço',
      cell: (row) => FormatBRL(row.price),
      width: 100,
    },
    {
      name: 'Afiliado',
      cell: (row) =>
        row.allow_affiliate ? (
          <Check size={20} style={{ color: '#28c76f' }} />
        ) : (
          <X size={20} style={{ color: '#ea5455' }} />
        ),
    },
    {
      name: 'Link',
      cell: (row) => (
        <a href={row.link} target="_blank" rel="noreferrer">
          {row.link}
        </a>
      ),
    },
    (ability.can('manage', 'Producers.activate-offer') ||
      ability.can('manage', 'Producers.deactivate-offer')) && {
      name: 'Status',
      cell: (row) =>
        !row.active ? (
          ability.can('manage', 'Producers.activate-offer') && (
            <Badge
              color="success"
              className="cursor-pointer"
              onClick={() => {
                setOfferUuid(row.uuid);
                setHideCheckoutModal(true);
                setCheckoutActive(true);
              }}
            >
              ATIVAR
            </Badge>
          )
        ) : (
          ability.can('manage', 'Producers.deactivate-offer') && (
            <Badge
              color="danger"
              className="cursor-pointer"
              onClick={() => {
                setOfferUuid(row.uuid);
                setHideCheckoutModal(true);
                setCheckoutActive(false);
              }}
            >
              DESATIVAR
            </Badge>
          )
        ),
    },
  ].filter(Boolean),
);

const columnsPages = memoizeOne(() => [
  {
    name: 'Título',
    cell: (row) => row.label,
  },
  {
    name: 'URL',
    cell: (row) => (
      <a href={row.url} target="_blank" rel="noreferrer">
        {row.url}
      </a>
    ),
  },
  {
    name: 'Tipo',
    cell: (row) => row.type,
  },
]);

const ViewProductInfo = () => {
  const { skin } = useSkin();
  let { userUuid, productUuid } = useParams();
  const history = useHistory();
  const [active, setActive] = useState('1');
  const [product, setProduct] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [recordsPages, setRecordsPages] = useState([]);
  const [recordsCountPages, setRecordsCountPages] = useState(0);
  const [recordsPerPagePages, setRecordsPerPagePages] = useState(10);
  const [recordsCoproductions, setRecordsCoproductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputFilter, setInputFilter] = useState('');
  const [alert, setAlert] = useState(false);
  const [removeMarket, setRemoveMarket] = useState(false);
  const [hideCheckoutModal, setHideCheckoutModal] = useState(false);
  const [offerUuid, setOfferUuid] = useState(null);
  const [checkoutActive, setCheckoutActive] = useState(false);
  const ability = useAbility(AbilityContext);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const toggle = (tab) => {
    if (active !== tab) {
      setActive(tab);
    }
  };

  useEffect(() => {
    if (!product) {
      fetchProduct();
    }
    fetchCoproductions();
    fetchPages();
    fetchSuppliers();
  }, []);

  const fetchProduct = () => {
    api
      .get(`/products/${productUuid}`)
      .then((r) => setProduct(r.data))
      .catch((e) => console.log(e));
  };

  const fetchSuppliers = () => {
    api
      .get(`/products/${productUuid}/suppliers`)
      .then((r) => setSuppliers(r.data))
      .catch((e) => console.log(e));
  };

  const fetchCoproductions = async () => {
    try {
      const response = await api.get(`/products/${productUuid}/coproductions`);
      setRecordsCoproductions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const submitRecommend = async () => {
    try {
      await api.put(`/products/${productUuid}/market`, {
        recommend: !product.recommended_market,
      });
    } catch (error) {
      console.log(error);
    }
    api
      .get(`/products/${productUuid}`)
      .then((r) => setProduct(r.data))
      .catch((e) => console.log(e));
  };

  const submitRemoveMarket = async () => {
    try {
      await api.put(`/products/${productUuid}/market/remove`);
    } catch (error) {
      console.log(error);
    }
    api
      .get(`/products/${productUuid}`)
      .then((r) => setProduct(r.data))
      .catch((e) => console.log(e));
  };

  const submitSecureEmail = async () => {
    setLoading(true);
    try {
      await api.put(`/products/${productUuid}/secure-email`);
    } catch (error) {
      console.log(error);
    }
    api
      .get(`/products/${productUuid}`)
      .then((r) => setProduct(r.data))
      .catch((e) => console.log(e));
    setLoading(false);
  };

  const submitRemoveOfferCheckout = async () => {
    try {
      await api.put(`/products/${productUuid}/checkout/hide`, { offerUuid });
    } catch (error) {
      console.log(error);
    }
    api
      .get(`/products/${productUuid}`)
      .then((r) => setProduct(r.data))
      .catch((e) => console.log(e));
    setHideCheckoutModal(false);
  };

  const fetchAffiliates = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('userUuid', userUuid);
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPage);
      const trimmedInput = inputFilter.trim();
      if (trimmedInput) query.append('input', trimmedInput);

      const response = await api.get(
        `/products/affiliates/${productUuid}?${query.toString()}`,
      );
      setRecordsCount(response.data.count);
      setRecords(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchPages = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('userUuid', userUuid);
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPage);
      const trimmedInput = inputFilter.trim();
      if (trimmedInput) query.append('input', trimmedInput);

      const response = await api.get(
        `/products/${productUuid}/pages?${query.toString()}`,
      );
      setRecordsCountPages(response.data.count);
      setRecordsPages(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChangePages = async (newPerPage, page) => {
    await fetchPages(page - 1, newPerPage);
    setRecordsPerPagePages(newPerPage);
  };

  const handleRecordsPageChangePages = (page) => {
    fetchPages(page - 1);
  };

  const handleRecordsPerPageChange = async (newPerPage, page) => {
    await fetchAffiliates(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page) => {
    fetchAffiliates(page - 1);
  };

  useEffect(() => {
    if (inputFilter.length === 0 || inputFilter.trim().length > 0)
      fetchAffiliates(0);
  }, [inputFilter]);

  const accessContent = () => {
    setLoading(true);
    api
      .get(`/products/${productUuid}/membership`)
      .then((r) => {
        window.open(`${r.data.url}`, '_blank');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const changePhone = (e) => {
    e.preventDefault();
    api
      .put(`/products/${productUuid}/number/update`, { number: phone })
      .then(() => {
        toast.success('Numero de suporte alterado com sucesso', configNotify);
        setProduct((prev) => ({
          ...prev,
          support_whatsapp: phone,
        }));
      })
      .catch((err) => {
        console.log(err);
        toast.error('Falha ao alterar numero de suporte', configNotify);
      })
      .finally(() => {
        setEditingPhone(false);
      });
  };

  return (
    <>
      {product && (
        <section id="pageProductInfo">
          <h2>{product.name}</h2>
          <Breadcrumb className="mb-1">
            <BreadcrumbItem>
              <Link to="/producers">Produtores</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link to={`/producer/${userUuid}`}>Produtor</Link>
            </BreadcrumbItem>
            <BreadcrumbItem active>
              <span>Produto</span>
            </BreadcrumbItem>
          </Breadcrumb>

          <Card>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    href="#"
                    active={active === '1'}
                    onClick={() => {
                      toggle('1');
                    }}
                  >
                    Geral
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    active={active === '2'}
                    onClick={() => {
                      toggle('2');
                    }}
                  >
                    Afiliados
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    active={active === '3'}
                    onClick={() => {
                      toggle('3');
                    }}
                  >
                    Coproduções
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    active={active === '4'}
                    onClick={() => {
                      toggle('4');
                    }}
                  >
                    Ofertas
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    active={active === '5'}
                    onClick={() => {
                      toggle('5');
                    }}
                  >
                    Páginas
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    active={active === '6'}
                    onClick={() => {
                      toggle('6');
                    }}
                  >
                    Fornecedores
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent className="py-50" activeTab={active}>
                <TabPane tabId="1">
                  <Table hover>
                    <thead>
                      <tr>
                        <div
                          className="title-table"
                          style={{ color: '#349888', fontSize: '21px' }}
                        >
                          Produto
                        </div>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">ID</th>
                        <td>{product.uuid}</td>
                      </tr>
                      <tr>
                        <th scope="row">Nome do produto</th>
                        <td>{product.name}</td>
                      </tr>
                      <tr>
                        <th scope="row">E-mail de suporte</th>
                        <td>
                          {product.support_email ? (
                            <a href={`mailto:${product.support_email}`}>
                              {product.support_email}
                            </a>
                          ) : (
                            'Não informado'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">WhatsApp de suporte</th>

                        {ability.can('manage', 'Producers.edit-support-number') ? (
                          <td>
                            {editingPhone ? (
                              <div className="d-flex justify-content-start align-items-center">
                                <Input
                                  style={{ width: '300px' }}
                                  value={phone}
                                  onChange={(e) => {
                                    e.preventDefault();
                                    setPhone(e.target.value);
                                  }}
                                />
                                <div className="d-flex ml-3 align-items-center">
                                  <Badge
                                    style={{ cursor: 'pointer' }}
                                    color="primary"
                                    onClick={changePhone}
                                  >
                                    <Check size={30} />
                                  </Badge>
                                  <Badge
                                    className="ml-2"
                                    style={{ cursor: 'pointer' }}
                                    color="danger"
                                    onClick={() => setEditingPhone(false)}
                                  >
                                    <X size={30} />
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <>
                                {product.support_whatsapp ? (
                                  <a
                                    href={`https://wa.me/55${product.support_whatsapp.replace(/ /g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {product.support_whatsapp}
                                  </a>
                                ) : (
                                  'Não informado'
                                )}
                                <Badge
                                  className="ml-3"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setEditingPhone(true)}
                                >
                                  <Edit2 size={20} />
                                </Badge>
                              </>
                            )}
                          </td>
                        ) : (
                          <td>
                            {product.support_whatsapp ? (
                              <a
                                href={`https://wa.me/55${product.support_whatsapp.replace(/ /g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {product.support_whatsapp}
                              </a>
                            ) : (
                              'Não informado'
                            )}
                          </td>
                        )}
                      </tr>
                      <tr>
                        <th scope="row">Tipo</th>
                        <td>{product.type}</td>
                      </tr>
                      <tr>
                        <th scope="row">Garantia</th>
                        <td>{`${product.warranty_days} dias`}</td>
                      </tr>
                      <tr>
                        <th scope="row">Porcentagem de reembolso</th>
                        <td>{`${product.refund_average} %`}</td>
                      </tr>
                      <tr>
                        <th scope="row">Data de criação do produto</th>
                        <td>
                          {moment(product.created_at).format(
                            'DD/MM/YYYY HH:mm',
                          )}
                        </td>
                      </tr>

                      <tr>
                        <th scope="row">Compra apenas com emails seguros</th>
                        <td>
                          <div className="d-flex w-100 align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                              <Badge
                                color={
                                  product.secure_email ? 'warning' : 'success'
                                }
                              >
                                {loading ? (
                                  <Spinner size="sm" color="light" />
                                ) : product.secure_email ? (
                                  'Sim'
                                ) : (
                                  'Não'
                                )}
                              </Badge>

                              <TooltipItem
                                item={{
                                  placement: 'right',
                                  text: `
                                  @hotmail.com<br/>
                                  @hotmail.com.br<br/>
                                  @outlook.com<br/>
                                  @outlook.com.br<br/>
                                  @gmail.com<br/>
                                  @yahoo.com<br/>
                                  @yahoo.com.br<br/>
                                  @icloud.com
                                  `,
                                }}
                                id={1}
                              >
                                <div className="d-flex justify-content-center">
                                  <Info size={14} />
                                </div>
                              </TooltipItem>
                            </div>
                            <Badge
                              color="success"
                              style={{
                                cursor: loading ? 'not-allowed' : 'pointer',
                              }}
                              onClick={() => !loading && submitSecureEmail()}
                            >
                              {loading ? (
                                <Spinner size="sm" color="light" />
                              ) : product.secure_email ? (
                                'Desativar'
                              ) : (
                                'Ativar'
                              )}
                            </Badge>
                          </div>
                        </td>
                      </tr>

                      {product.deleted_at && (
                        <tr>
                          <th scope="row">Produto deletado em</th>

                          <td style={{ color: '#ea5455' }}>
                            {moment(product.deleted_at).format(
                              'DD/MM/YYYY HH:mm',
                            )}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <div
                          className="title-table mt-2"
                          style={{ color: '#349888', fontSize: '21px' }}
                        >
                          Mercado de Afiliados
                        </div>
                      </tr>
                      <tr>
                        <th scope="row">Status</th>
                        <td>
                          <div className="d-flex w-100 justify-content-between">
                            <Badge color={product.market_status.color}>
                              {product.market_status.label}
                            </Badge>
                            {product.market_status.id === 3 && (
                              <Badge
                                color="danger"
                                onClick={() => setRemoveMarket(true)}
                              >
                                Remover
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Listado</th>
                        <td>
                          {product.list_on_market ? (
                            <Badge color="success">Sim</Badge>
                          ) : (
                            <Badge color="warning">Não</Badge>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">Recomendar</th>
                        <td>
                          <div className="d-flex w-100 justify-content-between align-items-center">
                            {product.recommended_market ? (
                              <>
                                <Badge color="success">Sim</Badge>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="d-flex align-items-center">
                                    <div className="mr-1">Posição:</div>
                                    <Badge color="info" className="mr-2">
                                      {product.recommend_market_position ||
                                        'Não definido'}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    color="primary"
                                    onClick={() => {
                                      history.push('/market?tab=3');
                                    }}
                                  >
                                    Gerenciar Posições
                                  </Button>
                                  <Badge
                                    color="danger"
                                    className="d-block"
                                    onClick={() => setAlert(true)}
                                  >
                                    Remover
                                  </Badge>
                                </div>
                              </>
                            ) : (
                              <>
                                <Badge color="warning">Não</Badge>
                                <Badge
                                  color="success"
                                  onClick={() => setAlert(true)}
                                >
                                  Recomendar
                                </Badge>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <div
                          className="title-table mt-2"
                          style={{ color: '#349888', fontSize: '21px' }}
                        >
                          Produtor
                        </div>
                      </tr>
                      <tr>
                        <th scope="row">Nome</th>
                        <td>{product.producer.full_name}</td>
                      </tr>
                      <tr>
                        <th scope="row">E-mail</th>
                        <td>{product.producer.email}</td>
                      </tr>
                    </tbody>
                  </Table>
                  <div className="d-flex justify-content-end">
                    <Button
                      color="primary"
                      className="mt-3"
                      onClick={() => accessContent()}
                    >
                      {loading ? 'Carregando...' : 'Acessar conteúdo'}
                    </Button>
                  </div>
                </TabPane>
                <TabPane tabId="2">
                  <FormGroup className="filters-affiliate mt-2">
                    <Label>Nome ou e-mail</Label>
                    <Input
                      onChange={({ target }) => {
                        setTimeout(() => {
                          setInputFilter(target.value);
                        }, 1000);
                      }}
                    />
                  </FormGroup>
                  <DataTable
                    columns={columns()}
                    data={records}
                    progressPending={loading}
                    pagination
                    paginationServer
                    paginationTotalRows={recordsCount}
                    onChangeRowsPerPage={handleRecordsPerPageChange}
                    onChangePage={handleRecordsPageChange}
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página:',
                      rangeSeparatorText: 'de',
                      noRowsPerPage: false,
                    }}
                    progressComponent={<Spinner />}
                    noDataComponent={
                      <>
                        {records.length === 0
                          ? 'Não há afiliados neste produto.'
                          : 'Sem conteúdo'}
                      </>
                    }
                    theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                  />
                  <h3 className="mb-2">Regras de afiliação</h3>
                  <div>
                    {product.allow_affiliate ? (
                      <Table hover>
                        <tbody>
                          <tr>
                            <th scope="row">Comissão</th>
                            <td>{product.affiliate_settings?.commission}%</td>
                          </tr>
                          <tr>
                            <th scope="row">Validade do cookie</th>
                            <td>
                              {product.affiliate_settings?.cookies_validity ||
                                'Não informado'}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Regra de comissionamento</th>
                            <td>
                              {
                                product.affiliate_settings?.click_attribution
                                  ?.label
                              }
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">E-mail suporte</th>
                            <td>
                              {product.affiliate_settings?.support_email ||
                                'Não Informado'}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">URL drive material</th>
                            <td>
                              {product.affiliate_settings
                                ?.url_promotion_material || 'Não Informado'}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Aprovação manual</th>
                            <td>
                              {product.affiliate_settings?.manual_approve ? (
                                <Check size={20} style={{ color: '#28c76f' }} />
                              ) : (
                                <X size={20} style={{ color: '#ea5455' }} />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">
                              Recebe comissão em todas as cobranças
                            </th>
                            <td>
                              {product.affiliate_settings
                                ?.commission_all_charges ? (
                                <Check size={20} style={{ color: '#28c76f' }} />
                              ) : (
                                <X size={20} style={{ color: '#ea5455' }} />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Adesão</th>
                            <td>
                              {product.affiliate_settings
                                ?.url_promotion_material ? (
                                <Check size={20} style={{ color: '#28c76f' }} />
                              ) : (
                                <X size={20} style={{ color: '#ea5455' }} />
                              )}
                            </td>
                          </tr>
                          {product.affiliate_settings
                            ?.url_promotion_material && (
                              <tr>
                                <th scope="row">Comissão de Adesão</th>
                                <td>
                                  {
                                    product.affiliate_settings
                                      ?.subscription_fee_commission
                                  }
                                  %
                                </td>
                              </tr>
                            )}
                          {product.affiliate_settings
                            ?.url_promotion_material && (
                              <tr>
                                <th scope="row">
                                  Afiliado recebe apenas na adesão
                                </th>
                                <td>
                                  {product.affiliate_settings
                                    ?.subscription_fee_only ? (
                                    <Check
                                      size={20}
                                      style={{ color: '#28c76f' }}
                                    />
                                  ) : (
                                    <X size={20} style={{ color: '#ea5455' }} />
                                  )}
                                </td>
                              </tr>
                            )}
                          <tr>
                            <th scope="row">Descrição</th>
                            <td>
                              {product.affiliate_settings?.description ||
                                'Não informado'}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Regras gerais</th>
                            <td>
                              {product.affiliate_settings?.general_rules ||
                                'Não informado'}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    ) : (
                      'Este produto não permite afiliações'
                    )}
                  </div>
                </TabPane>
                <TabPane tabId="3">
                  <DataTable
                    columns={columnsCoproductions()}
                    data={recordsCoproductions}
                    progressPending={loading}
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página:',
                      rangeSeparatorText: 'de',
                      noRowsPerPage: false,
                    }}
                    progressComponent={<Spinner />}
                    noDataComponent={<>Sem conteúdo</>}
                    theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                  />
                </TabPane>
                <TabPane tabId="4">
                  <DataTable
                    columns={columnsOffer(
                      setOfferUuid,
                      setHideCheckoutModal,
                      setCheckoutActive,
                      ability,
                    )}
                    data={product.offers}
                    progressPending={loading}
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página:',
                      rangeSeparatorText: 'de',
                      noRowsPerPage: false,
                    }}
                    progressComponent={<Spinner />}
                    noDataComponent={<>Sem conteúdo</>}
                    theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                  />
                </TabPane>
                <TabPane tabId="5">
                  <DataTable
                    columns={columnsPages()}
                    data={recordsPages}
                    progressPending={loading}
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página:',
                      rangeSeparatorText: 'de',
                      noRowsPerPage: false,
                    }}
                    progressComponent={<Spinner />}
                    noDataComponent={<>Sem conteúdo</>}
                    theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                    pagination
                    paginationServer
                    paginationTotalRows={recordsCountPages}
                    onChangeRowsPerPage={handleRecordsPerPageChangePages}
                    onChangePage={handleRecordsPageChangePages}
                  />
                </TabPane>
                <TabPane tabId="6">
                  <Table hover>
                    <th scope="row">Usuário</th>
                    <th scope="row">Oferta</th>
                    <th scope="row">Comissão</th>
                    <th scope="row">Status</th>
                    <tbody>
                      {suppliers.map((s) => (
                        <>
                          <td>{s.user.email}</td>
                          <td>{s.offer.name}</td>
                          <td>{FormatBRL(s.commission)}</td>
                          <td>
                            <Badge
                              style={{ padding: 5 }}
                              color={s.status.color}
                            >
                              {s.status.label}
                            </Badge>
                          </td>
                        </>
                      ))}
                    </tbody>
                  </Table>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
          <Modal isOpen={alert} centered size="sm">
            <ModalHeader>
              Deseja
              <b className="uppercase">
                {product.recommended_market
                  ? ' remover o produto do '
                  : ' recomendar o produto para '}
              </b>
              mercado de afiliados?
            </ModalHeader>
            <ModalBody>
              <div className="d-flex w-100 justify-content-between">
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => setAlert(false)}
                  disabled={loading}
                >
                  <div>
                    {loading ? <Spinner size="sm" /> : <span>Sair</span>}
                  </div>
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => {
                    submitRecommend();
                    setAlert(false);
                  }}
                  disabled={loading}
                >
                  <div>
                    {loading ? <Spinner size="sm" /> : <span>Confirmar</span>}
                  </div>
                </Button>
              </div>
            </ModalBody>
          </Modal>
          <Modal isOpen={removeMarket} centered size="sm">
            <ModalHeader>
              Deseja <b className="uppercase">Remover o produto</b> do mercado
              de afiliados?
            </ModalHeader>
            <ModalBody>
              <div className="d-flex w-100 justify-content-between">
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => setRemoveMarket(false)}
                  disabled={loading}
                >
                  <div>
                    {loading ? <Spinner size="sm" /> : <span>Sair</span>}
                  </div>
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => {
                    submitRemoveMarket();
                    setRemoveMarket(false);
                  }}
                  disabled={loading}
                >
                  <div>
                    {loading ? <Spinner size="sm" /> : <span>Confirmar</span>}
                  </div>
                </Button>
              </div>
            </ModalBody>
          </Modal>
          <Modal isOpen={hideCheckoutModal} centered size="sm">
            <ModalHeader>
              Deseja{' '}
              <b className="uppercase">
                {checkoutActive ? `ativar` : 'remover '} este checkout?{' '}
              </b>
            </ModalHeader>
            <ModalBody>
              <div className="d-flex w-100 justify-content-between">
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => setHideCheckoutModal(false)}
                  disabled={loading}
                >
                  <div>
                    {loading ? <Spinner size="sm" /> : <span>Sair</span>}
                  </div>
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={() => {
                    submitRemoveOfferCheckout();
                    setHideCheckoutModal(false);
                  }}
                  disabled={loading}
                >
                  <div>
                    {loading ? <Spinner size="sm" /> : <span>Confirmar</span>}
                  </div>
                </Button>
              </div>
            </ModalBody>
          </Modal>
        </section>
      )}
    </>
  );
};

export default ViewProductInfo;
