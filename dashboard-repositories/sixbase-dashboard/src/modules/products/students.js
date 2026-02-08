import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  Col,
  Dropdown,
  NavItem,
  NavLink,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useHistory, useParams } from 'react-router-dom';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import FilterListing from '../../jsx/components/FilterListing';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import api from '../../providers/api';
import { useProduct } from '../../providers/contextProduct';
import Loader from '../../utils/loader';
import { notify } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';
import Actions from './students/actions';
import Import from './students/import';
import ImportArchive from './students/importArchive';
import Invite from './students/invite';

export default function PageProductsEditStudents() {
  const { uuidProduct } = useParams();
  const history = useHistory();
  const { product } = useProduct();

  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalInviteShow, setModalInviteShow] = useState(false);
  const [modalImportShow, setModalImportShow] = useState(false);
  const [modalSendEmailShow, setModalSendEmailShow] = useState(false);
  const [modalRemoveShow, setModalRemoveShow] = useState(false);

  const [modalImportArchiveShow, setModalImportArchiveShow] = useState(false);

  const [classrooms, setClassrooms] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);

  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterParams, setFilterParams] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCancel, setShowCancel] = useState(false);

  const [records, setRecords] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    averageProgress: 0,
    completionRate: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [hasEditChanges, setHasEditChanges] = useState(false);
  const [hasInviteChanges, setHasInviteChanges] = useState(false);
  const [hasImportChanges, setHasImportChanges] = useState(false);

  const custumer = useMemo(
    () => (product.type === 'physical' ? 'Cliente' : 'Aluno'),
    [product.type]
  );

  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [filterParams]);

  useEffect(() => {
    api
      .get(`/products/classrooms/${uuidProduct}`)
      .then((response) => {
        setClassrooms(response.data || []);
      })
      .catch(() => {
        setClassrooms([]);
      });
  }, [uuidProduct]);

  const fetchMetrics = useCallback(() => {
    const normalizedFilters =
      filterParams instanceof URLSearchParams
        ? Object.fromEntries(filterParams.entries())
        : filterParams || {};

    const params = {
      ...normalizedFilters,
    };

    setMetricsLoading(true);

    api
      .get(`/products/students/${uuidProduct}/summary`, {
        params,
      })
      .then((response) => {
        const summary = response.data || {};
        const totalStudents = summary.total_students ?? 0;
        const averageProgress = summary.average_progress ?? 0;
        const completionRate = summary.completion_rate ?? 0;

        setMetrics({
          totalStudents,
          averageProgress: Number.isFinite(averageProgress)
            ? averageProgress
            : 0,
          completionRate: Number.isFinite(completionRate) ? completionRate : 0,
        });
      })
      .catch(() => {
        setMetrics({
          totalStudents: 0,
          averageProgress: 0,
          completionRate: 0,
        });
      })
      .finally(() => {
        setMetricsLoading(false);
      });
  }, [filterParams, uuidProduct]);

  const fetchData = useCallback(() => {
    const normalizedFilters =
      filterParams instanceof URLSearchParams
        ? Object.fromEntries(filterParams.entries())
        : filterParams || {};

    const params = {
      size: perPage,
      page: currentPage,
      ...normalizedFilters,
    };

    if (sortField) {
      params.order_field = sortField;
      params.order_direction = sortDirection;
    }

    setTableLoading(true);

    api
      .get(`/products/students/${uuidProduct}`, {
        params,
      })
      .then((response) => {
        const rows = response.data?.rows || [];
        const countValue = response.data?.count;
        const totalCount = Array.isArray(countValue)
          ? countValue.length
          : Number(countValue) || 0;

        setRecords(rows);
        setTotalRows(totalCount);
      })
      .catch(() => {
        setRecords([]);
        setTotalRows(0);
      })
      .finally(() => {
        setTableLoading(false);
      });
  }, [
    uuidProduct,
    filterParams,
    currentPage,
    perPage,
    sortField,
    sortDirection,
  ]);

  useEffect(() => {
    const shouldReload =
      (modalEditShow === false && hasEditChanges) ||
      (modalInviteShow === false && hasInviteChanges) ||
      (modalImportShow === false && hasImportChanges);

    if (shouldReload) {
      fetchData();
      fetchMetrics();
      setHasEditChanges(false);
      setHasInviteChanges(false);
      setHasImportChanges(false);
    }
  }, [
    modalEditShow,
    modalInviteShow,
    modalImportShow,
    hasEditChanges,
    hasInviteChanges,
    hasImportChanges,
    fetchData,
    fetchMetrics,
  ]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchData();
  }, [filterParams, currentPage, perPage, sortField, sortDirection, fetchData]);

  const renderActions = useCallback(
    (student) => (
      <div className='d-flex gap-2'>
        {product.type !== 'ebook' && (
          <OverlayTrigger
            placement='top'
            overlay={<Tooltip>Gerenciar cliente</Tooltip>}
          >
            <ButtonDS
              size={'icon'}
              variant='primary'
              className='mr-2'
              onClick={() => {
                setActiveStudent(student);
                setModalEditShow(true);
              }}
            >
              <i className='bx bx-group'></i>
            </ButtonDS>
          </OverlayTrigger>
        )}

        <OverlayTrigger
          placement='top'
          overlay={<Tooltip>Reenviar acesso</Tooltip>}
        >
          <ButtonDS
            size={'icon'}
            variant='success'
            className='mr-2'
            onClick={() => {
              setActiveStudent(student);
              setModalSendEmailShow(true);
            }}
          >
            <i className='bx bx-send'></i>
          </ButtonDS>
        </OverlayTrigger>

        <OverlayTrigger
          placement='top'
          overlay={<Tooltip>Remover acesso</Tooltip>}
        >
          <ButtonDS
            size={'icon'}
            variant='danger'
            className='mr-2'
            disabled={!student.imported}
            onClick={() => {
              setActiveStudent(student);
              setModalRemoveShow(true);
            }}
          >
            <i className='bx bx-trash'></i>
          </ButtonDS>
        </OverlayTrigger>
      </div>
    ),
    [custumer]
  );

  const formatDate = useCallback((value) => {
    if (!value) return 'Sem registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const formatDateTime = useCallback((value) => {
    if (!value) return 'Sem registro';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        name: <RenderNameDataTable name='Turma' iconClassName='bx bx-group' />,
        selector: (item) => item.classroom?.label || '-',
        sortable: true,
        sortField: 'classroom',
        omit: product.type === 'ebook' || product.type === 'physical',
        minWidth: '140px',
        maxWidth: '180px',
        wrap: true,
      },
      {
        name: (
          <RenderNameDataTable name={custumer} iconClassName='bx bx-user' />
        ),
        selector: (item) => item.full_name,
        sortable: true,
        sortField: 'student',
        minWidth: '200px',
        cell: (item) => (
          <div style={{ minWidth: '200px' }}>
            <span
              className='fw-semibold d-block'
              style={{ wordBreak: 'break-word' }}
            >
              {item.full_name}
            </span>
            <span
              className='text-muted small'
              style={{ wordBreak: 'break-word' }}
            >
              {item.email}
            </span>
          </div>
        ),
        wrap: true,
      },
      {
        name: (
          <RenderNameDataTable
            name='Último acesso'
            iconClassName='bx bx-time-five'
          />
        ),
        selector: (item) => item.last_access_at || item.last_access,
        sortable: true,
        sortField: 'last_access',
        minWidth: '150px',
        maxWidth: '180px',
        cell: (item) => formatDateTime(item.last_access_at || item.last_access),
        wrap: true,
      },
      {
        name: (
          <RenderNameDataTable
            name='Data de liberação'
            iconClassName='bx bx-calendar'
          />
        ),
        selector: (item) => item.released_at || item.created_at,
        sortable: true,
        sortField: 'released_at',
        minWidth: '150px',
        maxWidth: '180px',
        cell: (item) => formatDate(item.released_at || item.created_at),
        wrap: true,
      },
      {
        name: (
          <RenderNameDataTable
            name='Progresso'
            iconClassName='bx bx-trending-up'
          />
        ),
        selector: (item) => item.progress_percentage || 0,
        sortable: true,
        sortField: 'progress',
        minWidth: '140px',
        omit: product.type === 'ebook' || product.type === 'physical',
        cell: (item) => {
          const progress = Number(item.progress_percentage || 0);
          const progressValue = Math.min(100, Math.max(0, progress));
          return (
            <div style={{ width: '100%' }}>
              <div className='d-flex justify-content-between align-items-center mb-1'>
                <span className='fw-semibold small'>
                  {Math.round(progressValue)}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progressValue}%`,
                    height: '100%',
                    backgroundColor:
                      progressValue >= 100 ? '#00A94F' : '#000129',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        },
      },
      {
        name: (
          <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />
        ),
        selector: (item) => item.id,
        sortable: false,
        center: true,
        minWidth: '100px',
        maxWidth: '120px',
        cell: (item) => renderActions(item),
      },
    ];

    return baseColumns;
  }, [product.type, custumer, formatDate, formatDateTime, renderActions]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page - 1);
  }, []);

  const handlePerRowsChange = useCallback((newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  }, []);

  const handleDeleteImport = useCallback(() => {
    api
      .put(`/products/students/${uuidProduct}/remove`, { id: activeStudent.id })
      .then(() => {
        setHasImportChanges(true);
        fetchData();
      })
      .catch(() => {})
      .finally(() => setShowCancel(false));
  }, [uuidProduct, activeStudent, fetchData]);

  const handleImportArchiveSuccess = useCallback(() => {
    setHasImportChanges(true);
    fetchData();
  }, [fetchData]);

  const handleSort = useCallback((column, direction) => {
    if (!column || !column.sortField) {
      setSortField(null);
      setSortDirection(null);
      return;
    }
    setSortField(column.sortField);
    setSortDirection(direction.toUpperCase());
    setCurrentPage(0);
  }, []);

  const formatNumber = useCallback(
    (value) =>
      Number(value || 0).toLocaleString('pt-BR', {
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatPercentage = useCallback(
    (value) => `${Math.round(Number(value || 0))}%`,
    []
  );

  const sendEmail = useCallback(
    (studentUuid) => {
      setLoading(true);
      api
        .post(`/products/students/${uuidProduct}/${studentUuid}/email`)
        .then(() => {
          notify({
            type: 'success',
            message: 'E-mail enviado com sucesso',
          });
          setModalSendEmailShow(false);
        })
        .catch((error) => {
          notify({
            type: 'error',
            message: 'Falha ao enviar e-mail',
          });
          return error;
        })
        .finally(() => {
          setLoading(false);
          setModalSendEmailShow(false);
        });
    },
    [uuidProduct]
  );

  const removeAccess = useCallback(
    (studentUuid) => {
      setLoading(true);
      api
        .delete(`/products/students/${uuidProduct}/${studentUuid}/remove`)
        .then(() => {
          notify({
            type: 'success',
            message: 'Acesso removido com sucesso',
          });
          setModalSendEmailShow(false);
          setHasEditChanges(true);
        })
        .catch((error) => {
          notify({
            type: 'error',
            message: 'Falha ao remover acesso',
          });
          return error;
        })
        .finally(() => {
          setLoading(false);
          setModalRemoveShow(false);
          fetchData();
        });
    },
    [uuidProduct, fetchData]
  );

  const formattedMetrics = useMemo(
    () => ({
      totalStudents: formatNumber(metrics.totalStudents),
      averageProgress: formatPercentage(metrics.averageProgress),
      completionRate: formatPercentage(metrics.completionRate),
    }),
    [metrics, formatNumber, formatPercentage]
  );

  return (
    <>
      {showCancel && (
        <ConfirmAction
          title={'Remover acesso do usuário importado'}
          show={showCancel}
          setShow={setShowCancel}
          handleAction={handleDeleteImport}
          buttonText={'Remover'}
          centered
        />
      )}
      {modalEditShow && (
        <ModalGeneric
          show={modalEditShow}
          setShow={setModalEditShow}
          title={'Ações de ' + activeStudent.full_name}
          centered
        >
          <Actions
            activeStudent={activeStudent}
            setActiveStudent={setActiveStudent}
            classrooms={classrooms}
            uuidProduct={uuidProduct}
            productType={product.type}
            defaultEction={'change-classroom'}
            setShow={setModalEditShow}
            onSuccess={() => setHasEditChanges(true)}
          />
        </ModalGeneric>
      )}
      {modalInviteShow && (
        <ModalGeneric
          show={modalInviteShow}
          setShow={setModalInviteShow}
          title={`Convidar Aluno`}
          centered
        >
          <Invite
            show={modalInviteShow}
            setShow={setModalInviteShow}
            uuidProduct={uuidProduct}
            classrooms={classrooms}
            onSuccess={() => setHasInviteChanges(true)}
          />
        </ModalGeneric>
      )}
      {modalImportShow && (
        <ModalGeneric
          show={modalImportShow}
          setShow={setModalImportShow}
          title={`Importar Alunos`}
          centered
        >
          <Import
            show={modalInviteShow}
            setShow={setModalInviteShow}
            classrooms={classrooms}
            uuidProduct={uuidProduct}
            onSuccess={() => setHasImportChanges(true)}
          />
        </ModalGeneric>
      )}
      {modalImportArchiveShow && (
        <ImportArchive
          getStudents={handleImportArchiveSuccess}
          show={modalImportArchiveShow}
          setShow={setModalImportArchiveShow}
          classrooms={classrooms}
        />
      )}
      {modalSendEmailShow && (
        <ConfirmAction
          title={'Reenviar e-mail de acesso?'}
          show={modalSendEmailShow}
          setShow={setModalSendEmailShow}
          handleAction={() => sendEmail(activeStudent.uuid)}
          buttonText={'Enviar'}
          variant='warning'
          variantButton='primary'
          centered
        />
      )}
      {modalRemoveShow && (
        <ConfirmAction
          title={'Deseja remover o acesso?'}
          show={modalRemoveShow}
          setShow={setModalRemoveShow}
          handleAction={() => removeAccess(activeStudent.uuid)}
          buttonText={'Confirmar'}
          centered
        />
      )}
      <section id='students' style={{ overflowX: 'hidden', width: '100%' }}>
        <Row className='g-3 mb-4'>
          <Col xs={12} sm={6} md={3} className='mb-2 mb-md-0'>
            <Card className='h-100 shadow-sm border-0'>
              <Card.Body>
                <small className='text-uppercase text-muted fw-semibold'>
                  Nº de alunos
                </small>
                {metricsLoading ? (
                  <div className='mt-2'>
                    <Spinner animation='border' size='sm' variant='primary' />
                  </div>
                ) : (
                  <h3 className='mt-2 mb-0'>
                    {formattedMetrics.totalStudents}
                  </h3>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3} className='mb-2 mb-md-0'>
            <Card className='h-100 shadow-sm border-0'>
              <Card.Body>
                <small className='text-uppercase text-muted fw-semibold'>
                  Progresso médio
                </small>
                {metricsLoading ? (
                  <div className='mt-2'>
                    <Spinner animation='border' size='sm' variant='primary' />
                  </div>
                ) : (
                  <h3 className='mt-2 mb-0'>
                    {formattedMetrics.averageProgress}
                  </h3>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3} className='mb-2 mb-md-0'>
            <Card className='h-100 shadow-sm border-0'>
              <Card.Body>
                <small className='text-uppercase text-muted fw-semibold'>
                  % de conclusão
                </small>
                {metricsLoading ? (
                  <div className='mt-2'>
                    <Spinner animation='border' size='sm' variant='primary' />
                  </div>
                ) : (
                  <h3 className='mt-2 mb-0'>
                    {formattedMetrics.completionRate}
                  </h3>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={3} className='mb-2 mb-md-0'>
            <Card className='h-100 shadow-sm border-0'>
              <Card.Body className='d-flex flex-column justify-content-center align-items-center'>
                <small className='text-uppercase text-muted fw-semibold mb-2'>
                  Builder de Página
                </small>
                <ButtonDS
                  variant='primary'
                  size='sm'
                  onClick={() => {
                    history.push(
                      `/produtos/editar/${uuidProduct}/conteudo-builder`
                    );
                  }}
                  className='w-100'
                >
                  <i className='bx bx-layout me-2' />
                  Abrir Builder
                </ButtonDS>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className='g-3 align-items-center mb-4'>
          <Col xs={12}>
            <div
              className='d-flex flex-wrap align-items-center'
              style={{ gap: '0.5rem' }}
            >
              <ButtonDS
                size='xs'
                variant='primary'
                onClick={() => {
                  setModalInviteShow(true);
                }}
              >
                Convidar Aluno
              </ButtonDS>
              <Dropdown as={NavItem}>
                <Dropdown.Toggle as={NavLink} className='d-flex p-0 no-arrow'>
                  <ButtonDS
                    size='xs'
                    variant='primary'
                    outline
                    iconRight='bx-chevron-down'
                  >
                    Importar Alunos
                  </ButtonDS>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      setModalImportShow(true);
                    }}
                  >
                    Email
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setModalImportArchiveShow(true);
                    }}
                  >
                    Arquivo CSV, XLSX
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <ButtonDS
                size='xs'
                variant='primary'
                outline
                onClick={async () => {
                  setLoading(true);

                  try {
                    const response = await api.get(
                      `/products/students/${uuidProduct}/export`,
                      {
                        responseType: 'blob',
                      }
                    );

                    const url = window.URL.createObjectURL(response.data);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'alunos.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                  } catch (error) {
                    console.error('Erro ao exportar alunos:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Aguarde...' : 'Exportar alunos'}
              </ButtonDS>
            </div>
          </Col>
        </Row>

        <FilterListing
          setFilterParams={setFilterParams}
          pageFilter='students'
          placeHolder='Buscar por nome, e-mail ou documento'
        />

        <Row>
          <Col xs={12}>
            <div
              className='container-datatable card'
              style={{ overflowX: 'auto', width: '100%' }}
            >
              <DataTable
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                columns={columns}
                data={records}
                striped
                highlightOnHover
                progressComponent={<Loader title='Carregando alunos...' />}
                noDataComponent={<NoDataComponentContent />}
                progressPending={tableLoading}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                onSort={handleSort}
                sortServer
              />
            </div>
          </Col>
        </Row>
      </section>
    </>
  );
}
