import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Input,
  Label,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { Eye, Calendar } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import useDebounce from '../../hooks/useDebounce';
import DataTable from 'react-data-table-component';
import LoadingSpinner from '../LoadingSpinner';
import { useSkin } from '../../utility/hooks/useSkin';
import {
  getFormLogs,
  FormLog,
} from '../../services/forms.service';
import { type FormLogsTabProps, type EventType } from '../../interfaces/formseditor.interface';

const tableRowStyles = {
  rows: {
    style: {
      fontSize: '1.05rem',
      fontWeight: 600,
    },
  },
};

const FormLogsTab: React.FC<FormLogsTabProps> = ({ formId }) => {
  const { skin } = useSkin();
  const [logs, setLogs] = useState<FormLog[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [dateRange, setDateRange] = useState<Date[]>(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return [startOfMonth, now];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Hook para detectar tamanho da tela
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [detailModal, setDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FormLog | null>(null);

  useEffect(() => {
    if (formId) {
      loadLogs();
      loadEventTypes();
    } else {
      setLogs([]);
    }
  }, [
    formId,
    currentPage,
    debouncedSearchTerm,
    selectedEventType,
    dateRange,
    itemsPerPage,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
  };

  const columns = [
    {
      name: 'Data/Hora',
      selector: (row: FormLog) => formatDate(row.created_at),
    },
    {
      name: 'Usuário',
      cell: (row: FormLog) => (
        <div>
          <strong>{row.user?.full_name || 'N/A'}</strong>
          <br />
          <small className="text-muted">{row.user?.email || 'N/A'}</small>
        </div>
      ),
    },
    {
      name: 'Evento',
      cell: (row: FormLog) => (
        <Badge color={getEventBadgeColor(row.event_key)}>
          {getEventLabel(row)}
        </Badge>
      ),
    },
    {
      name: 'Detalhes',
      cell: (row: FormLog) => (
        <small>{formatParams(row.params, row.event_key)}</small>
      ),
    },
    {
      name: 'Ações',
      cell: (row: FormLog) => (
        <Button
          size="sm"
          color="primary"
          onClick={() => handleViewDetails(row)}
        >
          <Eye size={14} />
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const loadLogs = async () => {
    if (!formId) return;

    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedEventType) params.event_type = selectedEventType;
      if (dateRange && dateRange.length > 0) {
        const startDate = dateRange[0].toISOString().split('T')[0];
        params.start_date = startDate;
        if (dateRange.length > 1) {
          const endDate = dateRange[1].toISOString().split('T')[0];
          params.end_date = endDate;
        }
      }

      const response = await getFormLogs(formId, params);
      setLogs(response.logs);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      toast.error('Erro ao carregar logs do formulário');
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const response = await api.get('/backoffice/logs/event-types');
      // Filtrar apenas eventos relacionados a formulários
      const formEvents = response.data.data.filter((event: EventType) =>
        event.key.includes('form'),
      );
      setEventTypes(formEvents);
    } catch (error) {
      toast.error('Erro ao carregar tipos de eventos');
    }
  };

  const handleViewDetails = (log: FormLog) => {
    setSelectedLog(log);
    setDetailModal(true);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setDateRange([today, today]);
  };

  const handle7DaysClick = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    setDateRange([sevenDaysAgo, today]);
  };

  const handle15DaysClick = () => {
    const today = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(today.getDate() - 15);
    setDateRange([fifteenDaysAgo, today]);
  };

  const handle30DaysClick = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setDateRange([thirtyDaysAgo, today]);
  };

  const handle60DaysClick = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 60);
    setDateRange([thirtyDaysAgo, today]);
  };

  const handle90DaysClick = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 90);
    setDateRange([thirtyDaysAgo, today]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getEventBadgeColor = (eventKey?: string) => {
    if (!eventKey) return 'light';

    const colors: { [key: string]: string } = {
      'form-create': 'success',
      'form-update': 'info',
      'form-delete': 'danger',
      'form-publish': 'success',
      'form-activate': 'success',
      'form-deactivate': 'warning',
      'question-create': 'success',
      'question-update': 'info',
      'question-delete': 'danger',
      'question-reorder': 'secondary',
    };
    return colors[eventKey] || 'light';
  };

  const getEventLabel = (log: FormLog) => {
    return log.event_label || log.event?.name || 'Evento não encontrado';
  };

  const formatParams = (params: any, eventKey?: string) => {
    if (!params) return 'Nenhum parâmetro';
    if (!eventKey) return 'Ver detalhes';

    switch (eventKey) {
      case 'form-create':
        return `Criou o formulário "${params.form_title || 'N/A'}"`;

      case 'form-update':
        const changes: string[] = [];
        if (params.old_title !== params.new_title) {
          changes.push(`título: "${params.old_title}" → "${params.new_title}"`);
        }
        if (params.old_form_type !== params.new_form_type) {
          changes.push(
            `tipo: ${params.old_form_type} → ${params.new_form_type}`,
          );
        }
        if (params.old_is_active !== params.new_is_active) {
          const oldStatus = params.old_is_active ? 'ativo' : 'inativo';
          const newStatus = params.new_is_active ? 'ativo' : 'inativo';
          changes.push(`status: ${oldStatus} → ${newStatus}`);
        }
        return changes.length
          ? `Alterou: ${changes.join(', ')}`
          : 'Alterou o formulário';

      case 'form-delete':
        return `Excluiu o formulário "${params.form_title || 'N/A'}"`;

      case 'form-publish':
        return `Publicou versão ${params.version || 'N/A'} do formulário "${
          params.form_title || 'N/A'
        }"`;

      case 'form-activate':
        return `Ativou o formulário "${params.form_title || 'N/A'}"`;

      case 'form-deactivate':
        return `Desativou o formulário "${params.form_title || 'N/A'}"`;

      case 'question-create':
        return `Criou a pergunta "${params.question_label || 'N/A'}" (${
          params.question_key || 'N/A'
        })`;

      case 'question-update':
        const questionChanges: string[] = [];
        if (params.old_label !== params.new_label) {
          questionChanges.push(
            `label: "${params.old_label}" → "${params.new_label}"`,
          );
        }
        if (params.old_type !== params.new_type) {
          questionChanges.push(`tipo: ${params.old_type} → ${params.new_type}`);
        }
        return questionChanges.length
          ? `Alterou pergunta: ${questionChanges.join(', ')}`
          : `Alterou a pergunta "${params.question_label || 'N/A'}"`;

      case 'question-delete':
        return `Excluiu a pergunta "${params.question_label || 'N/A'}"`;

      case 'question-reorder':
        return `Reordenou as perguntas do formulário`;

      default:
        return 'Ver detalhes';
    }
  };

  const isDark = skin === 'dark';
  const containerGradient = isDark
    ? 'linear-gradient(135deg, #272f45 0%, #1e2538 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';

  if (!formId) {
    return (
      <Card style={{ border: 0, background: 'transparent' }}>
        <CardBody
          style={{
            background: containerGradient,
            padding: 16,
            border: 'none',
          }}
        >
          <div className="text-center text-muted">
            <p>Selecione um formulário para visualizar os logs</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <Card style={{ border: 0, background: 'transparent' }}>
        <CardBody
          style={{
            background: containerGradient,
            padding: isMobile ? 12 : 16,
            border: 'none',
            marginBottom: 16,
          }}
        >
          <Row className="align-items-end">
            <Col md="5" sm="12" className="mb-2 mb-md-0">
              <div className="mb-2">
                <div
                  className="d-flex flex-wrap align-items-center"
                  style={{ gap: '6px' }}
                >
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handleTodayClick}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Hoje
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handle7DaysClick}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    7 dias
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handle15DaysClick}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    15 dias
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handle30DaysClick}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    30 dias
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handle60DaysClick}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    60 dias
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={handle90DaysClick}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    90 dias
                  </Button>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <Calendar size={15} className="me-2" />
                <Flatpickr
                  id="dateRange"
                  className="form-control border-0 shadow-none bg-transparent"
                  style={{ width: '100%', minWidth: 200 }}
                  value={dateRange}
                  onChange={(date) => setDateRange(date)}
                  options={{
                    mode: 'range',
                    dateFormat: 'd/m/Y',
                    locale: {
                      firstDayOfWeek: 1,
                      weekdays: {
                        shorthand: [
                          'Dom',
                          'Seg',
                          'Ter',
                          'Qua',
                          'Qui',
                          'Sex',
                          'Sáb',
                        ],
                        longhand: [
                          'Domingo',
                          'Segunda',
                          'Terça',
                          'Quarta',
                          'Quinta',
                          'Sexta',
                          'Sábado',
                        ],
                      },
                      months: {
                        shorthand: [
                          'Jan',
                          'Fev',
                          'Mar',
                          'Abr',
                          'Mai',
                          'Jun',
                          'Jul',
                          'Ago',
                          'Set',
                          'Out',
                          'Nov',
                          'Dez',
                        ],
                        longhand: [
                          'Janeiro',
                          'Fevereiro',
                          'Março',
                          'Abril',
                          'Maio',
                          'Junho',
                          'Julho',
                          'Agosto',
                          'Setembro',
                          'Outubro',
                          'Novembro',
                          'Dezembro',
                        ],
                      },
                    },
                  }}
                  placeholder="Selecione o período"
                />
              </div>
            </Col>

            {/* Coluna direita: dois filtros ocupando o restante */}
            <Col md="7" sm="12">
              <Row>
                <Col md="6" sm="12" className="mb-2 mb-md-0">
                  <Label for="search">Buscar por usuário</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md="6" sm="12">
                  <Label for="eventType">Tipo de evento</Label>
                  <Input
                    id="eventType"
                    type="select"
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                  >
                    <option value="">Todos os eventos</option>
                    {eventTypes.map((event) => (
                      <option key={event.id} value={event.key}>
                        {event.label}
                      </option>
                    ))}
                  </Input>
                </Col>
              </Row>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Tabela de logs */}
      <Card style={{ border: 0, background: 'transparent' }}>
        <CardBody
          style={{
            background: containerGradient,
            padding: isMobile ? 12 : 16,
            border: 'none',
            borderTop: 'none',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Logs do Formulário ({totalItems})
            </h5>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <DataTable
              columns={columns}
              data={logs}
              progressPending={loading}
              customStyles={tableRowStyles}
              pagination
              paginationServer
              paginationTotalRows={totalItems}
              paginationDefaultPage={currentPage}
              paginationPerPage={itemsPerPage}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página:',
                rangeSeparatorText: 'de',
              }}
              progressComponent={<LoadingSpinner />}
              noDataComponent={<>Não há logs encontrados</>}
              theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              responsive
            />
          </div>
        </CardBody>
      </Card>

      {/* Modal de detalhes */}
      <Modal
        isOpen={detailModal}
        toggle={() => setDetailModal(false)}
        size={isMobile ? undefined : 'lg'}
        centered
      >
        <ModalHeader
          toggle={() => setDetailModal(false)}
          style={{
            background: containerGradient,
            borderRadius: '12px 12px 0 0',
            borderBottom: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
            padding: isMobile ? '1rem' : '1.5rem',
            fontSize: isMobile ? '1.1rem' : '1.25rem',
          }}
        >
          Detalhes do Log
        </ModalHeader>
        <ModalBody
          style={{
            background: containerGradient,
            padding: isMobile ? '1rem' : '20px',
            borderLeft: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
            borderRight: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          }}
        >
          {selectedLog && (
            <div>
              <Row>
                <Col md="6" sm="12" className="mb-3 mb-md-0">
                  <h6 style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>Informações Básicas</h6>
                  <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>ID:</strong> {selectedLog.id}
                  </p>
                  <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                    <strong>Data/Hora:</strong>{' '}
                    {formatDate(selectedLog.created_at)}
                  </p>
                  <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Evento:</strong> {getEventLabel(selectedLog)}
                  </p>
                  <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                    <strong>IP:</strong> {selectedLog.ip_address}
                  </p>
                </Col>
                <Col md="6" sm="12">
                  <h6 style={{ fontSize: isMobile ? '0.95rem' : '1rem' }}>Usuário Responsável</h6>
                  <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                    <strong>Nome:</strong>{' '}
                    {selectedLog.user?.full_name || 'N/A'}
                  </p>
                  <p style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                    <strong>Email:</strong> {selectedLog.user?.email || 'N/A'}
                  </p>
                </Col>
              </Row>

              <hr />

              <h6 style={{ fontSize: isMobile ? '0.95rem' : '1rem', marginBottom: '0.75rem' }}>Parâmetros da Ação</h6>
              <pre 
                className="bg-light p-3 rounded"
                style={{
                  fontSize: isMobile ? '0.75rem' : '0.85rem',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(selectedLog.params, null, 2)}
              </pre>
            </div>
          )}
        </ModalBody>
        <ModalFooter
          style={{
            background: containerGradient,
            borderRadius: '0 0 12px 12px',
            borderTop: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
            padding: isMobile ? '1rem' : '1.5rem',
          }}
        >
          <Button
            color="light"
            onClick={() => setDetailModal(false)}
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default FormLogsTab;
