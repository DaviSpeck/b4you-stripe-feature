import React, { useEffect, useState, FC, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
  Table,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { api } from '../../services/api';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import {
  Info,
  ThumbsDown,
  ThumbsUp,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Minus,
} from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import CBanner from './CBanner';
import DragDropTable from 'components/DragDropTable';
import SortableRecommendedRow from 'components/SortableRecommendedRow';
import {
  MarketRecord,
  ProductHistory,
  ProductDetail,
  ApiResponse,
  Column,
  ProductImage,
  RecommendedApiResponse,
  RecommendedProductItem,
  MarketFilter,
} from '../../interfaces/market.interface';
import { useSkin } from '../../utility/hooks/useSkin';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';

const productMarketVerifyStatus = [
  { id: 1, label: 'Pendente' },
  { id: 2, label: 'Aceito' },
  { id: 3, label: 'Recusado' },
];

const columns = memoizeOne(
  (
    toggleAction: (id: number) => void,
    setModalApprove: (show: boolean) => void,
    setSelectedItem: (item: MarketRecord) => void,
    setModalReprove: (show: boolean) => void,
  ): Column[] => [
      {
        name: 'ID',
        cell: (row: MarketRecord) => row.id,
        width: '70px',
      },
      {
        name: 'Produto',
        cell: (row: MarketRecord) => (
          <Link to={`/producer/${row.users.uuid}/product/${row.products.uuid}`}>
            {row.products.name}
          </Link>
        ),
      },
      {
        name: 'Produtor',
        cell: (row: MarketRecord) => (
          <Link to={`/producer/${row.users.uuid}`}>{row.users.full_name}</Link>
        ),
      },
      {
        name: 'Solicitado em',
        cell: (row: MarketRecord) =>
          moment(row?.requested_at).format('DD/MM/YYYY HH:mm:ss'),
      },
      {
        name: 'Ações',
        center: true,
        cell: (row: MarketRecord) => {
          return (
            <div className="w-100 d-flex justify-content-around">
              <Button
                size="sm"
                color="light"
                onClick={() => {
                  setSelectedItem(row);
                  setModalApprove(true);
                }}
              >
                <ThumbsUp color="green" size={14}></ThumbsUp>
              </Button>
              <Button
                size="sm"
                color="light"
                onClick={() => {
                  setSelectedItem(row);
                  setModalReprove(true);
                }}
              >
                <ThumbsDown color="red" size={14}></ThumbsDown>
              </Button>
              <Button
                size="sm"
                color="light"
                onClick={() => toggleAction(row.id_product)}
              >
                <Info color="#4DD0BB" size={14}></Info>
              </Button>
            </div>
          );
        },
      },
    ],
);

const columnsProducts = memoizeOne(
  (
    toggleAction: (id: number) => void,
    setModalApprove: (show: boolean) => void,
    setSelectedItem: (item: MarketRecord) => void,
    setModalReprove: (show: boolean) => void,
  ): Column[] => [
      {
        name: 'ID',
        cell: (row: MarketRecord) => row.id,
        width: '70px',
      },
      {
        name: 'Produto',
        cell: (row: MarketRecord) => (
          <Link to={`/producer/${row.users.uuid}/product/${row.products.uuid}`}>
            {row.products.name}
          </Link>
        ),
      },
      {
        name: 'Produtor',
        cell: (row: MarketRecord) => (
          <Link to={`/producer/${row.users.uuid}`}>{row.users.full_name}</Link>
        ),
      },
      {
        name: 'Status',
        cell: (row: MarketRecord) => (
          <Badge color={row.status.color}>{row.status.label}</Badge>
        ),
      },
      {
        name: 'Solicitado em',
        cell: (row: MarketRecord) =>
          row.requested_at &&
          moment(row?.requested_at).format('DD/MM/YYYY HH:mm:ss'),
      },
      {
        name: 'Aceito em',
        cell: (row: MarketRecord) =>
          row.accepted_at &&
          moment(row?.accepted_at).format('DD/MM/YYYY HH:mm:ss'),
      },
      {
        name: 'Rejeitado em',
        cell: (row: MarketRecord) =>
          row.rejected_at &&
          moment(row?.rejected_at).format('DD/MM/YYYY HH:mm:ss'),
      },
    ],
);

const HomeMarket: FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || '1';

  const [active, setActive] = useState<string>(initialTab);
  const toggle = (tab: string): void => {
    if (active !== tab) {
      setActive(tab);
    }
  };
  const { skin } = useSkin();
  const [records, setRecords] = useState<MarketRecord[]>([]);
  const [count, setCount] = useState<number>(0);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
  const [modalInfo, setModalInfo] = useState<boolean>(false);
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([
    {} as ProductHistory,
  ]);
  const [modalApprove, setModalApprove] = useState<boolean>(false);
  const [modalReprove, setModalReprove] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MarketRecord | null>(null);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [managerLink, setManagerLink] = useState<string>('');

  const [images, setImages] = useState<ProductImage[] | null>(null);
  const [cover, setCover] = useState<ProductImage[] | null>(null);
  const [productsRows, setProductsRows] = useState<MarketRecord[]>([]);
  const [productsCount, setProductsCount] = useState<number>(0);

  const [activeImage, setActiveImage] = useState<number>(0);

  const [inputFilter, setInputFilter] = useState<string>('');
  const [inputFilterRequests, setInputFilterRequests] = useState<string>('');
  const [filter, setFilter] = useState<MarketFilter>({
    calendar: [moment().subtract(90, 'days').toDate(), moment().toDate()],
    status: '',
  });

  const [countProducts, setCountProducts] = useState<number>(0);
  const [recordsPerPageProducts, setRecordsPerPageProducts] =
    useState<number>(10);

  const [dateRange, setDateRange] = useState(() => {
    const now = moment();
    const startOfMonth = moment().startOf('month');

    return {
      start: startOfMonth.format('YYYY-MM-DD'),
      end: now.format('YYYY-MM-DD'),
    };
  });

  const [calendar, setCalendar] = useState(() => [
    moment().startOf('month').toDate(),
    moment().toDate(),
  ]);

  const [recommended, setRecommended] = useState<RecommendedProductItem[]>([]);
  const [filteredRecommended, setFilteredRecommended] = useState<
    RecommendedProductItem[]
  >([]);
  const [loadingRecommended, setLoadingRecommended] = useState<boolean>(false);
  const [recommendedSearchTerm, setRecommendedSearchTerm] =
    useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] =
    useState<RecommendedProductItem | null>(null);
  const [newPosition, setNewPosition] = useState<number | string>(1);
  const [savingPosition, setSavingPosition] = useState<boolean>(false);
  const [recommendedPage, setRecommendedPage] = useState<number>(0);
  const [recommendedPerPage] = useState<number>(10);
  const [totalRecommendedCount, setTotalRecommendedCount] = useState<number>(0);
  const [isEditModeRecommended, setIsEditModeRecommended] =
    useState<boolean>(false);
  const [isDirtyRecommended, setIsDirtyRecommended] = useState<boolean>(false);
  const [isSavingRecommended, setIsSavingRecommended] =
    useState<boolean>(false);
  const [allRecommendedProducts, setAllRecommendedProducts] = useState<
    RecommendedProductItem[]
  >([]);

  const toggleAction = async (id_product: number): Promise<void> => {
    setModalInfo(true);
    setLoadingInfo(true);
    try {
      const response = await api.get<ProductDetail>(`market/${id_product}`);
      setProductHistory(response.data.data);
      setImages(response.data.images);
      setCover(response.data.cover);
    } catch (error) {
      console.log(error);
    }
    setLoadingInfo(false);
  };

  const fetchData = async (
    page: number,
    newPerPage: number | null = null,
  ): Promise<void> => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append(
        'size',
        (newPerPage ? newPerPage : recordsPerPage).toString(),
      );
      if (inputFilterRequests.trim()) {
        query.append('input', inputFilterRequests);
      }
      if (filter.calendar && filter.calendar.length === 2) {
        query.append('start_date', filter.calendar[0].toISOString());
        query.append('end_date', filter.calendar[1].toISOString());
      }
      const response = await api.get<ApiResponse>(`market?${query.toString()}`);

      setCount(response.data.count);
      setRecords(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchDataProducts = async (
    page: number,
    newPerPage: number | null = null,
  ): Promise<void> => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append(
        'size',
        (newPerPage ? newPerPage : recordsPerPage).toString(),
      );
      if (inputFilter.trim()) {
        query.append('input', inputFilter);
      }
      if (filter.calendar && filter.calendar.length === 2) {
        query.append('start_date', filter.calendar[0].toISOString());
        query.append('end_date', filter.calendar[1].toISOString());
      }
      if (filter.status) {
        query.append('status', filter.status);
      }
      const response = await api.get<ApiResponse>(
        `market/all?${query.toString()}`,
      );
      setProductsCount(response.data.count);
      setProductsRows(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (
    newPerPage: number,
    page: number,
  ): Promise<void> => {
    await fetchData(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page: number): void => {
    fetchData(page - 1);
  };

  const handleRecordsPerPageChangeProducts = async (
    newPerPage: number,
    page: number,
  ): Promise<void> => {
    await fetchDataProducts(page - 1, newPerPage);
    setRecordsPerPageProducts(newPerPage);
  };

  const handleRecordsPageChangeProducts = (page: number): void => {
    fetchDataProducts(page - 1);
  };

  const fetchRecommended = async (page: number = 0): Promise<void> => {
    setLoadingRecommended(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('size', recommendedPerPage.toString());
      if (inputFilterRequests) {
        query.append('input', inputFilterRequests);
      }
      if (filter.calendar && filter.calendar.length === 2) {
        query.append('start_date', filter.calendar[0].toISOString());
        query.append('end_date', filter.calendar[1].toISOString());
      }
      const { data } = await api.get<RecommendedApiResponse>(
        `market/recommended?${query.toString()}`,
      );
      const rows = data.rows || [];
      setRecommended(rows);
      setFilteredRecommended(rows);
      setTotalRecommendedCount(data.count || 0);
    } catch (error) {
      console.log(error);
    }
    setLoadingRecommended(false);
  };

  const fetchAllRecommended = async (): Promise<void> => {
    setLoadingRecommended(true);
    try {
      const query = new URLSearchParams();
      query.append('page', '0');
      query.append('size', '1000'); 
      const { data } = await api.get<RecommendedApiResponse>(
        `market/recommended?${query.toString()}`,
      );
      const rows = data.rows || [];
      setAllRecommendedProducts(rows);
    } catch (error) {
      console.log(error);
    }
    setLoadingRecommended(false);
  };

  useEffect(() => {
    fetchData(0);
  }, [inputFilterRequests]);

  useEffect(() => {
    if (filter.calendar.length === 2) {
      fetchData(0);
    }
  }, [filter.calendar]);

  useEffect(() => {
    if (filter.calendar.length === 2) {
      fetchDataProducts(0);
    }
  }, [filter.calendar]);

  useEffect(() => {
    fetchDataProducts(0);
  }, [inputFilter]);

  useEffect(() => {
    fetchDataProducts(0);
  }, [filter.status]);

  useEffect(() => {
    if (active === '3') {
      fetchRecommended(recommendedPage);
    }
  }, [active, recommendedPage]);

  useEffect(() => {
    if (recommendedSearchTerm.trim()) {
      setIsSearching(true);
    }

    const timeoutId = setTimeout(() => {
      if (!recommendedSearchTerm.trim()) {
        setFilteredRecommended(recommended);
      } else {
        const filtered = recommended.filter((item) =>
          item.product.name
            .toLowerCase()
            .includes(recommendedSearchTerm.toLowerCase()),
        );
        setFilteredRecommended(filtered);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [recommendedSearchTerm, recommended]);

  const handlePositionChange = (product: RecommendedProductItem): void => {
    setSelectedProduct(product);
    setNewPosition(product.position || 1);
    setModalPosition(true);
  };

  const savePosition = async (): Promise<void> => {
    if (!selectedProduct) return;

    const positionValue = typeof newPosition === 'string' ? parseInt(newPosition) : newPosition;
    if (!positionValue || positionValue < 1 || positionValue > totalRecommendedCount) {
      alert(`Por favor, insira uma posição válida entre 1 e ${totalRecommendedCount}`);
      return;
    }

    setSavingPosition(true);
    try {
      const allProductsQuery = new URLSearchParams();
      allProductsQuery.append('page', '0');
      allProductsQuery.append('size', '1000');
      const { data: allProductsData } = await api.get<RecommendedApiResponse>(
        `market/recommended?${allProductsQuery.toString()}`,
      );
      const allProducts = (allProductsData.rows || []).sort(
        (a, b) => (a.position || 1) - (b.position || 1),
      );
      const uuids = allProducts.map((p) => p.product.uuid);
      const fromIdx = uuids.findIndex(
        (u) => u === selectedProduct.product.uuid,
      );
      if (fromIdx === -1) {
        setModalPosition(false);
        return;
      }
      const toIdx = Math.max(0, Math.min(uuids.length - 1, positionValue - 1));
      const [moved] = uuids.splice(fromIdx, 1);
      uuids.splice(toIdx, 0, moved);
      await api.put(`market/recommended/reorder`, { uuids });

      await fetchRecommended(recommendedPage);
      setModalPosition(false);
    } catch (error) {
      console.log(error);
    } finally {
      setSavingPosition(false);
    }
  };

  const handleRecommendedPageChange = (page: number): void => {
    setRecommendedPage(page - 1);
  };

  const handleReorderRecommended = (
    reorderedProducts: RecommendedProductItem[],
  ): void => {
    setAllRecommendedProducts(reorderedProducts);
    setIsDirtyRecommended(true);
  };

  const saveRecommendedOrder = async (): Promise<void> => {
    try {
      if (!isDirtyRecommended) return;
      setIsSavingRecommended(true);

      const uuids = allRecommendedProducts.map((p) => p.product.uuid);
      await api.put(`market/recommended/reorder`, { uuids });
      await fetchRecommended(recommendedPage);
      setIsDirtyRecommended(false);
      setIsEditModeRecommended(false);
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
    } finally {
      setIsSavingRecommended(false);
    }
  };

  const enterEditMode = async (): Promise<void> => {
    setIsEditModeRecommended(true);
    await fetchAllRecommended();
  };

  const exitEditMode = (): void => {
    setIsEditModeRecommended(false);
    setIsDirtyRecommended(false);
    setAllRecommendedProducts([]);
  };

  const renderApprove = (): React.ReactNode => {
    const submit = async (): Promise<void> => {
      if (!selectedItem) return;

      setLoadingAction(true);
      try {
        await api.post(`market/approve/${selectedItem.id}`, {
          id_producer: selectedItem.users.id,
          reason,
          internal_descriptions: description,
          product_name: selectedItem.products.name,
          id_product: selectedItem.products.id,
          manager_link: managerLink,
        });
        await fetchData(0);
        setModalApprove(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAction(false);
      }
    };
    return (
      <>
        <ModalHeader toggle={() => setModalApprove(!modalApprove)}>
          Deseja
          <b className="uppercase"> aprovar {selectedItem?.products?.name}</b>
        </ModalHeader>
        <ModalBody>
          <div className="d-flex">
            <div className="details">
              <b>Esta ação não é reversível!</b>
              <br />
              <br />
              Ao aprovar este produto para o mercado de afiliados, o mesmo
              ficará visível publicamente no mercado da B4you.
            </div>
          </div>
          <div className="mt-2">
            <Input
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
                setReason(target.value);
              }}
              placeholder="Motivo de aprovação"
            />
          </div>
          <div className="mt-2">
            <Input
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
                setDescription(target.value);
              }}
              placeholder="Anotações Internas (uso exclusivo suporte)"
            />
          </div>
          <div className="mt-2">
            <Input
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
                setManagerLink(target.value);
              }}
              placeholder="Link alternativo para Gerencia (opcional)"
            />
          </div>
          <div className="d-flex justify-content-end align-items-end mt-2">
            <Button color="primary" onClick={submit} disabled={loadingAction}>
              <div>
                <span>Aceitar </span>
                {loadingAction && <Spinner size="sm" />}
              </div>
            </Button>
          </div>
        </ModalBody>
      </>
    );
  };

  const renderReprove = (): React.ReactNode => {
    const submit = async (): Promise<void> => {
      if (!selectedItem) return;

      setLoadingAction(true);
      try {
        await api.post(`market/reprove/${selectedItem.id}`, {
          id_producer: selectedItem.users.id,
          reason,
          internal_descriptions: description,
          product_name: selectedItem.products.name,
          id_product: selectedItem.products.id,
        });
        await fetchData(0);
        setModalReprove(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAction(false);
      }
    };
    return (
      <>
        <ModalHeader toggle={() => setModalReprove(!modalReprove)}>
          Deseja
          <b className="uppercase"> reprovar {selectedItem?.products?.name}</b>
        </ModalHeader>
        <ModalBody>
          <div className="d-flex">
            <div className="details">
              <b>Esta ação não é reversível!</b>
              <br />
              <br />
              Ao reprovar este produto para o mercado de afiliados, o mesmo não
              ficará visível publicamente no mercado da B4you.
            </div>
          </div>
          <div className="mt-2">
            <Input
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
                setReason(target.value);
              }}
              placeholder="Motivo de reprovação"
            />
          </div>
          <div className="mt-2">
            <Input
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => {
                setDescription(target.value);
              }}
              placeholder="Anotações Internas (uso exclusivo suporte)"
            />
          </div>
          <div className="d-flex justify-content-end align-items-end mt-2">
            <Button color="danger" onClick={submit} disabled={loadingAction}>
              <div>
                <span>Reprovar </span>
                {loadingAction && <Spinner size="sm" />}
              </div>
            </Button>
          </div>
        </ModalBody>
      </>
    );
  };

  return (
    <>
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
            Banner
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
            Recomendados
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={active}>
        <TabPane tabId="1">
          {
            <section id="pageHomeLogs">
              <h2 className="mb-2">Requisições para Mercado de Afiliados</h2>
              <Row>
                <Col md={12}>
                  <Card>
                    <CardBody>
                      <Row>
                        <Col md={6}>
                          <FormGroup className="filters">
                            <Label>Nome do Produto e afiliados</Label>
                            <Input
                              onChange={({ target }) => {
                                setTimeout(() => {
                                  setInputFilterRequests(target.value);
                                }, 1000);
                              }}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          <Label className="form-label" for="range-picker"></Label>
                          <div className="d-flex align-items-center">
                            <Calendar size={15} />
                            <Flatpickr
                              value={filter.calendar}
                              id="range-picker"
                              className="form-control border-0 shadow-none bg-transparent"
                              onChange={(date) =>
                                setFilter((prev) => ({ ...prev, calendar: date }))
                              }
                              options={{
                                mode: 'range',
                                dateFormat: 'd/m/Y',
                              }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Card>
                <CardBody>
                  <DataTable
                    columns={columns(
                      toggleAction,
                      setModalApprove,
                      setSelectedItem,
                      setModalReprove,
                    )}
                    data={records}
                    progressPending={loading}
                    pagination
                    paginationServer
                    paginationTotalRows={count}
                    onChangeRowsPerPage={handleRecordsPerPageChange}
                    onChangePage={handleRecordsPageChange}
                    noDataComponent={
                      'Não existem produtos para aprovação no mercado de afiliados no momento'
                    }
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página:',
                      rangeSeparatorText: 'de',
                      noRowsPerPage: false,
                    }}
                    theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                  />
                </CardBody>
              </Card>
              <Modal isOpen={modalInfo} centered size="lg">
                <ModalHeader
                  toggle={() => {
                    setModalInfo(false);
                  }}
                >
                  Histórico do produto
                </ModalHeader>
                <ModalBody>
                  <div>
                    <div className="details">
                      {loadingInfo ? (
                        <div className="d-flex justify-content-center align-items-center p-2">
                          <div className="me-2">Carregando histórico</div>
                          <Spinner />
                        </div>
                      ) : (
                        <div>
                          <Table responsive>
                            <thead>
                              <tr>
                                <th>#ID</th>
                                <th>Status</th>
                                <th>Criado em</th>
                                <th>Atualizado em</th>
                                <th>Motivo</th>
                                <th>Detalhes Internos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productHistory.map((element, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{element.id}</td>
                                    <td>{element?.status?.label}</td>
                                    <td>
                                      {moment(element.created_at).format(
                                        'DD/MM/YYYY HH:mm',
                                      )}
                                    </td>
                                    <td>
                                      {moment(element.updated).format(
                                        'DD/MM/YYYY HH:mm',
                                      )}
                                    </td>
                                    <td>{element?.reason}</td>
                                    <td>{element?.internal_descriptions}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                </ModalBody>
                <ModalBody>
                  <div>
                    <div className="details">
                      {loadingInfo ? (
                        <div className="d-flex justify-content-center align-items-center p-2">
                          <div className="me-2">Carregando imagens</div>
                          <Spinner />
                        </div>
                      ) : (
                        <div>
                          <h4>Imagens capa vitrine</h4>
                          <div
                            id="carouselExampleControls"
                            className="carousel slide"
                            data-ride="carousel"
                          >
                            <div className="carousel-inner">
                              {cover && cover.length > 0 ? (
                                cover.map((image, index) => (
                                  <div
                                    key={index}
                                    className={`carousel-item ${index === activeImage && ' active'
                                      }`}
                                  >
                                    <img
                                      className="d-block w-100"
                                      src={image.file}
                                      alt="First slide"
                                    />
                                  </div>
                                ))
                              ) : (
                                <div>
                                  O produto não tem imagens de carrossel.
                                </div>
                              )}
                            </div>
                            {cover && cover.length > 0 && (
                              <>
                                <a
                                  className="carousel-control-prev"
                                  href="#carouselExampleControls"
                                  role="button"
                                  data-slide="prev"
                                  onClick={() => {
                                    cover[activeImage - 1]
                                      ? setActiveImage(activeImage - 1)
                                      : setActiveImage(cover.length - 1);
                                  }}
                                >
                                  <span
                                    className="carousel-control-prev-icon"
                                    aria-hidden="true"
                                  ></span>
                                  <span className="sr-only">Previous</span>
                                </a>
                                <a
                                  className="carousel-control-next"
                                  href="#carouselExampleControls"
                                  role="button"
                                  data-slide="next"
                                  onClick={() => {
                                    cover[activeImage + 1]
                                      ? setActiveImage(activeImage + 1)
                                      : setActiveImage(0);
                                  }}
                                >
                                  <span
                                    className="carousel-control-next-icon"
                                    aria-hidden="true"
                                  ></span>
                                  <span className="sr-only">Next</span>
                                </a>
                              </>
                            )}
                          </div>

                          <h4 className="mt-2">Imagens carrossel</h4>
                          <div
                            id="carouselExampleControls2"
                            className="carousel slide"
                            data-ride="carousel"
                          >
                            <div className="carousel-inner">
                              {images && images.length > 0 ? (
                                images.map((image, index) => (
                                  <div
                                    key={index}
                                    className={`carousel-item ${index === activeImage && ' active'
                                      }`}
                                  >
                                    <img
                                      className="d-block w-100"
                                      src={image.file}
                                      alt="First slide"
                                    />
                                  </div>
                                ))
                              ) : (
                                <div>
                                  O produto não tem imagens de carrossel.
                                </div>
                              )}
                            </div>
                            {images && images.length > 0 && (
                              <>
                                <a
                                  className="carousel-control-prev"
                                  href="#carouselExampleControls2"
                                  role="button"
                                  data-slide="prev"
                                  onClick={() => {
                                    images[activeImage - 1]
                                      ? setActiveImage(activeImage - 1)
                                      : setActiveImage(images.length - 1);
                                  }}
                                >
                                  <span
                                    className="carousel-control-prev-icon"
                                    aria-hidden="true"
                                  ></span>
                                  <span className="sr-only">Previous</span>
                                </a>
                                <a
                                  className="carousel-control-next"
                                  href="#carouselExampleControls2"
                                  role="button"
                                  data-slide="next"
                                  onClick={() => {
                                    images[activeImage + 1]
                                      ? setActiveImage(activeImage + 1)
                                      : setActiveImage(0);
                                  }}
                                >
                                  <span
                                    className="carousel-control-next-icon"
                                    aria-hidden="true"
                                  ></span>
                                  <span className="sr-only">Next</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ModalBody>
              </Modal>
              <Modal isOpen={modalApprove} centered size={'md'}>
                {renderApprove()}
              </Modal>
              <Modal isOpen={modalReprove} centered size={'md'}>
                {renderReprove()}
              </Modal>

              <h2 className="mb-2">Produtos</h2>
              <Row>
                <Col md={12}>
                  <Card>
                    <CardBody>
                      <Row>
                        <Col md={4}>
                          <FormGroup className="filters">
                            <Label>Nome do produto</Label>
                            <Input
                              onChange={({ target }) => {
                                setTimeout(() => {
                                  setInputFilter(target.value);
                                }, 1000);
                              }}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup className="filters">
                            <Label>Status</Label>
                            <Input
                              type="select"
                              value={filter.status}
                              onChange={({ target }) =>
                                setFilter((prev) => ({ ...prev, status: target.value }))
                              }
                            >
                              <option value="">Todos os status</option>
                              {productMarketVerifyStatus.map((status) => (
                                <option key={status.id} value={status.id}>
                                  {status.label}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <Label className="form-label" for="range-picker-products"></Label>
                          <div className="d-flex align-items-center">
                            <Calendar size={15} />
                            <Flatpickr
                              value={filter.calendar}
                              id="range-picker-products"
                              className="form-control border-0 shadow-none bg-transparent"
                              onChange={(date) =>
                                setFilter((prev) => ({ ...prev, calendar: date }))
                              }
                              options={{
                                mode: 'range',
                                dateFormat: 'd/m/Y',
                                // defaultDate: ["2020-02-01", "2020-02-15"],
                              }}
                            />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <Card>
                <CardBody>
                  <DataTable
                    columns={columnsProducts(
                      toggleAction,
                      setModalApprove,
                      setSelectedItem,
                      setModalReprove,
                    )}
                    data={productsRows}
                    progressPending={loading}
                    pagination
                    paginationServer
                    paginationTotalRows={productsCount}
                    onChangeRowsPerPage={handleRecordsPerPageChangeProducts}
                    onChangePage={handleRecordsPageChangeProducts}
                    noDataComponent={'Não existem produtos nessa listagem'}
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página:',
                      rangeSeparatorText: 'de',
                      noRowsPerPage: false,
                    }}
                    theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                  />
                </CardBody>
              </Card>
            </section>
          }
        </TabPane>
        <TabPane tabId="2">
          {
            <CBanner
              apiEndpoint="market/images/banner"
              bannerTypeOptions={[
                { id: 1, name: 'Desktop' },
                { id: 2, name: 'Mobile' },
              ]}
            />
          }
        </TabPane>
        <TabPane tabId="3">
          {
            <section id="pageHomeRecommended">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="mb-0">Produtos Recomendados</h2>
                {!isEditModeRecommended ? (
                  <Button color="primary" onClick={enterEditMode} size="sm">
                    <i className="bx bx-edit me-1"></i>
                    Editar com Drag & Drop
                  </Button>
                ) : (
                  <div className="d-flex gap-2">
                    <Button color="secondary" onClick={exitEditMode} size="sm">
                      <i className="bx bx-x me-1"></i>
                      Cancelar
                    </Button>
                    <Button
                      color="success"
                      onClick={saveRecommendedOrder}
                      disabled={!isDirtyRecommended || isSavingRecommended}
                      size="sm"
                    >
                      {isSavingRecommended ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-check me-1"></i>
                          Confirmar Ordem
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              <Card>
                <CardBody>
                  <div className="mb-2">
                    <FormGroup>
                      <Label>Filtrar por nome do produto</Label>
                      <div className="position-relative">
                        <Input
                          type="text"
                          placeholder="Digite o nome do produto..."
                          value={recommendedSearchTerm}
                          onChange={(e) =>
                            setRecommendedSearchTerm(e.target.value)
                          }
                        />
                        {isSearching && (
                          <div
                            className="position-absolute"
                            style={{
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          >
                            <Spinner size="sm" />
                          </div>
                        )}
                      </div>
                    </FormGroup>
                  </div>
                  {loadingRecommended ? (
                    <div className="d-flex justify-content-center p-2">
                      <Spinner />
                    </div>
                  ) : isEditModeRecommended ? (
                    // Modo de edição com drag and drop
                    <div>
                      <div className="alert alert-info mb-3">
                        <small>
                          <strong>Modo de Edição:</strong> Arraste os produtos
                          usando os 3 pontinhos para reordenar. Clique em
                          "Confirmar Ordem" para salvar as alterações.
                        </small>
                      </div>
                      <DragDropTable
                        items={allRecommendedProducts}
                        onReorder={handleReorderRecommended}
                        getItemId={(product) => product.product.uuid}
                        renderItem={(product, index) => (
                          <SortableRecommendedRow
                            key={product.product.uuid}
                            product={product}
                            index={index}
                          />
                        )}
                        renderDragOverlay={(product) => (
                          <div
                            className="p-2 d-flex align-items-center"
                            style={{
                              background: '#161d31',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              borderRadius: 4,
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              {product.product.cover &&
                              product.product.cover.length > 0 ? (
                                <img
                                  src={product.product.cover[0].file}
                                  alt={product.product.name}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 4,
                                    background: '#2b2e3b',
                                  }}
                                />
                              )}
                              <span style={{ color: '#4dd0bb' }}>
                                {product.product.name}
                              </span>
                            </div>
                          </div>
                        )}
                      >
                        <thead>
                          <tr>
                            <th style={{ width: 40 }}></th>
                            <th style={{ width: 80 }}>Ordem</th>
                            <th>Produto</th>
                          </tr>
                        </thead>
                        {allRecommendedProducts.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center text-muted">
                              Nenhum produto recomendado encontrado
                            </td>
                          </tr>
                        )}
                      </DragDropTable>
                    </div>
                  ) : filteredRecommended.length === 0 ? (
                    <div className="text-center text-muted p-2">
                      {recommendedSearchTerm.trim()
                        ? 'Nenhum produto encontrado com o termo de busca'
                        : 'Não existem produtos recomendados'}
                    </div>
                  ) : (
                    <>
                      <Table responsive>
                        <thead>
                          <tr>
                            <th style={{ width: 80 }}>Ordem</th>
                            <th>Produto</th>
                            <th style={{ width: 100 }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecommended.map((item, index) => (
                            <tr key={item.product.uuid}>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: '#343d55',
                                    color: 'white',
                                  }}
                                >
                                  {item.position ||
                                    recommendedPage * recommendedPerPage +
                                    index +
                                    1}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1">
                                  {item.product.cover &&
                                    item.product.cover.length > 0 ? (
                                    <img
                                      src={item.product.cover[0].file}
                                      alt={item.product.name}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        objectFit: 'cover',
                                        borderRadius: 4,
                                        marginRight: 8,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 4,
                                        marginRight: 8,
                                        background: '#2b2e3b',
                                      }}
                                    />
                                  )}
                                  <Link
                                    to={`/producer/${item.product.producer?.uuid || 'unknown'
                                      }/product/${item.product.uuid}`}
                                    style={{
                                      color: '#4dd0bb',
                                      textDecoration: 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                      (
                                        e.target as HTMLElement
                                      ).style.textDecoration = 'underline';
                                    }}
                                    onMouseLeave={(e) => {
                                      (
                                        e.target as HTMLElement
                                      ).style.textDecoration = 'none';
                                    }}
                                  >
                                    {item.product.name}
                                  </Link>
                                </div>
                              </td>
                              <td>
                                <Badge
                                  color="primary"
                                  className="cursor-pointer"
                                  onClick={() => handlePositionChange(item)}
                                >
                                  <Edit2 size={20} />
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <div className="d-flex justify-content-center align-items-center mt-3">
                        <ChevronLeft
                          size={20}
                          style={{
                            color:
                              recommendedPage === 0 ? '#202739' : '#121620',
                            cursor:
                              recommendedPage === 0 ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => {
                            if (recommendedPage > 0) {
                              setRecommendedPage(recommendedPage - 1);
                            }
                          }}
                        />
                        <span className="mx-4">
                          Página {recommendedPage + 1}
                        </span>
                        {(() => {
                          const totalPages = Math.ceil(
                            totalRecommendedCount / recommendedPerPage,
                          );
                          const hasNext = recommendedPage + 1 < totalPages;
                          return hasNext ? (
                            <ChevronRight
                              size={20}
                              style={{ color: '#121620', cursor: 'pointer' }}
                              onClick={() =>
                                setRecommendedPage(recommendedPage + 1)
                              }
                            />
                          ) : null;
                        })()}
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Modal de alteração de posição */}
              <Modal isOpen={modalPosition} centered size="md">
                <ModalHeader toggle={() => setModalPosition(false)}>
                  Alterar Posição do Produto
                </ModalHeader>
                <ModalBody>
                  {selectedProduct && (
                    <div>
                      <div className="mb-3">
                        <strong>Produto:</strong> {selectedProduct.product.name}
                      </div>
                      <div className="mb-3">
                        <strong>Posição atual:</strong>{' '}
                        {selectedProduct.position || 1}
                      </div>
                      <div className="alert alert-info mb-3">
                        <small>
                          <strong>Como funciona:</strong> Ao alterar a posição,
                          os outros produtos serão automaticamente reorganizados
                          para evitar posições duplicadas.
                        </small>
                      </div>
                      <FormGroup>
                        <Label>Nova posição</Label>
                        <div className="d-flex align-items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max={totalRecommendedCount}
                            value={newPosition}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                setNewPosition('');
                                return;
                              }
                              const numValue = parseInt(inputValue);
                              if (!isNaN(numValue)) {
                                const maxPos = totalRecommendedCount;
                                setNewPosition(
                                  Math.min(Math.max(numValue, 1), maxPos),
                                );
                              }
                            }}
                            className="flex-grow-1"
                          />
                          <div className="d-flex gap-2 flex-shrink-0">
                            <Badge
                              color="primary"
                              className="cursor-pointer"
                              onClick={() => {
                                const currentValue = typeof newPosition === 'string' ? parseInt(newPosition) : newPosition;
                                if (!isNaN(currentValue)) {
                                  const newValue = Math.min(currentValue + 1, totalRecommendedCount);
                                  setNewPosition(newValue);
                                } else {
                                  setNewPosition(1);
                                }
                              }}
                            >
                              <Plus size={20} />
                            </Badge>
                            <Badge
                              color="primary"
                              className="cursor-pointer"
                              onClick={() => {
                                const currentValue = typeof newPosition === 'string' ? parseInt(newPosition) : newPosition;
                                if (!isNaN(currentValue)) {
                                  const newValue = Math.max(currentValue - 1, 1);
                                  setNewPosition(newValue);
                                } else {
                                  setNewPosition(1);
                                }
                              }}
                            >
                              <Minus size={20} />
                            </Badge>
                          </div>
                        </div>
                        <small className="text-muted mt-2 d-block">
                          Posição deve estar entre 1 e {totalRecommendedCount}
                        </small>
                      </FormGroup>
                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button
                          color="secondary"
                          onClick={() => setModalPosition(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          color="primary"
                          onClick={savePosition}
                          disabled={savingPosition || newPosition === '' || newPosition === null}
                        >
                          {savingPosition ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Salvando...
                            </>
                          ) : (
                            'Salvar'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </ModalBody>
              </Modal>
            </section>
          }
        </TabPane>
      </TabContent>
    </>
  );
};

export default HomeMarket;
