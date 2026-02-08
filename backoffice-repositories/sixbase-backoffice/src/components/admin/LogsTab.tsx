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
import { Log } from 'interfaces/admin.interface';

interface EventType {
  id: number;
  key: string;
  label: string;
}

const tableRowStyles = {
  rows: {
    style: {
      fontSize: '1.05rem',
      fontWeight: 600,
    },
  },
};

const LogsTab: React.FC = () => {
  const { skin } = useSkin();
  const [logs, setLogs] = useState<Log[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
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

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [detailModal, setDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  useEffect(() => {
    loadLogs();
    loadEventTypes();
    loadRoles();
  }, [
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
      selector: (row: Log) => formatDate(row.created_at),
    },
    {
      name: 'Usuário',
      cell: (row: Log) => (
        <div>
          <strong>{row.user?.full_name || 'N/A'}</strong>
          <br />
          <small className="text-muted">{row.user?.email || 'N/A'}</small>
        </div>
      ),
    },
    {
      name: 'Evento',
      cell: (row: Log) => (
        <Badge color={getEventBadgeColor(row.event_key)}>
          {row.event_label || 'N/A'}
        </Badge>
      ),
    },
    {
      name: 'Detalhes',
      cell: (row: Log) => (
        <small>{formatParams(row.params, row.event_key)}</small>
      ),
    },
    {
      name: 'Ações',
      cell: (row: Log) => (
        <Button
          size="sm"
          color="info"
          outline
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
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedEventType) params.append('event_type', selectedEventType);
      if (dateRange && dateRange.length > 0) {
        const startDate = dateRange[0].toISOString().split('T')[0];
        params.append('start_date', startDate);
        if (dateRange.length > 1) {
          const endDate = dateRange[1].toISOString().split('T')[0];
          params.append('end_date', endDate);
        }
      }

      const response = await api.get(`/backoffice/logs?${params}`);
      setLogs(response.data.data.logs);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotalItems(response.data.data.pagination.totalItems);
    } catch (error) {
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const response = await api.get('/backoffice/logs/event-types');
      setEventTypes(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar tipos de eventos');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/backoffice/roles');
      setRoles(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar roles');
    }
  };

  const handleViewDetails = (log: Log) => {
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
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    setDateRange([sixtyDaysAgo, today]);
  };

  const handle90DaysClick = () => {
    const today = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);
    setDateRange([ninetyDaysAgo, today]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getEventBadgeColor = (eventKey: string) => {
    const colors: { [key: string]: string } = {
      'update-user-role': 'primary',
      'update-user-status': 'warning',
      'create-role': 'success',
      'update-role': 'info',
      'delete-role': 'danger',
      'update-role-menus': 'secondary',
      'create-menu-item': 'success',
      'update-menu-item': 'info',
      'delete-menu-item': 'danger',
      'create-menu-action': 'success',
      'update-menu-action': 'info',
      'delete-menu-action': 'danger',
      'update-role-actions': 'secondary'
    };
    return colors[eventKey] || 'light';
  };

  const formatParams = (params: any, eventKey: string) => {
    if (!params) return 'Nenhum parâmetro';

    switch (eventKey) {
      case 'update-user-role':
        let oldRoleName = params.old_role_name;
        let newRoleName = params.new_role_name;

        if (!oldRoleName && params.old_role_id) {
          const oldRole = roles.find((role) => role.id === params.old_role_id);
          oldRoleName = oldRole?.name || `Role ${params.old_role_id}`;
        }

        if (!newRoleName && params.new_role_id) {
          const newRole = roles.find((role) => role.id === params.new_role_id);
          newRoleName = newRole?.name || `Role ${params.new_role_id}`;
        }

        return `Alterou role de "${params.user_name}" (${params.user_email}) de ${oldRoleName} para ${newRoleName}`;

      case 'update-user-status':
        const oldStatus = params.old_status ? 'Ativo' : 'Inativo';
        const newStatus = params.new_status ? 'Ativo' : 'Inativo';
        return `Alterou status de "${params.user_name}" (${params.user_email}) de ${oldStatus} para ${newStatus}`;

      case 'create-role':
        return `Criou a role "${params.role_name}"`;

      case 'update-role':
        return `Atualizou a role "${params.role_name}"`;

      case 'delete-role':
        return `Removeu a role "${params.role_name}"`;

      case 'update-role-menus':
        return `Atualizou menus da role "${params.role_name}"`;

      case 'create-menu-item':
        return `Criou o item de menu "${params.menu_key}" (${params.menu_route})`;

      case 'update-menu-item':
        return `Atualizou o item de menu "${params.menu_key}" (${params.menu_route})`;

      case 'delete-menu-item':
        return `Removeu o item de menu "${params.menu_key}" (${params.menu_route})`;

      case 'create-menu-action':
        return `Criou a ação "${params.action_key}" (${params.action_label}) no menu "${params.menu_key}"`;

      case 'update-menu-action':
        return `Atualizou a ação "${params.action_key}" (${params.action_label}) no menu "${params.menu_key}"`;

      case 'delete-menu-action':
        return `Removeu a ação "${params.action_key}" (${params.action_label}) do menu "${params.menu_key}"`;

      case 'update-role-actions':
        return `Atualizou ações vinculadas à role "${params.role_name}"`;

      default:
        return 'Ver detalhes';
    }
  };

  return (
    <div>
      {/* Filtros */}
      <Card>
        <CardBody>
          {/* Botões de data rápida */}
          <Row>
            <Col md="12">
              <div className="d-flex" style={{ gap: '5px' }}>
                <Button size="sm" color="primary" onClick={handleTodayClick}>
                  Hoje
                </Button>
                <Button size="sm" color="primary" onClick={handle7DaysClick}>
                  7 dias
                </Button>
                <Button size="sm" color="primary" onClick={handle15DaysClick}>
                  15 dias
                </Button>
                <Button size="sm" color="primary" onClick={handle30DaysClick}>
                  30 dias
                </Button>
                <Button size="sm" color="primary" onClick={handle60DaysClick}>
                  60 dias
                </Button>
                <Button size="sm" color="primary" onClick={handle90DaysClick}>
                  90 dias
                </Button>
              </div>
            </Col>
          </Row>

          {/* Filtros principais */}
          <Row className="mt-2">
            <Col md="4">
              <Label for="dateRange">Período</Label>
              <div className="d-flex align-items-center">
                <Calendar size={15} className="me-2" />
                <Flatpickr
                  id="dateRange"
                  className="form-control border-0 shadow-none bg-transparent"
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
            <Col md="4">
              <Label for="search">Buscar por usuário</Label>
              <Input
                id="search"
                type="text"
                placeholder="Nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md="4">
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
        </CardBody>
      </Card>

      {/* Tabela de logs */}
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Logs de Auditoria ({totalItems})</h5>
          </div>

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
          />
        </CardBody>
      </Card>

      {/* Modal de detalhes */}
      <Modal
        isOpen={detailModal}
        toggle={() => setDetailModal(false)}
        size="lg"
      >
        <ModalHeader toggle={() => setDetailModal(false)}>
          Detalhes do Log
        </ModalHeader>
        <ModalBody>
          {selectedLog && (
            <div>
              <Row>
                <Col md="6">
                  <h6>Informações Básicas</h6>
                  <p>
                    <strong>ID:</strong> {selectedLog.id}
                  </p>
                  <p>
                    <strong>Data/Hora:</strong>{' '}
                    {formatDate(selectedLog.created_at)}
                  </p>
                  <p>
                    <strong>Evento:</strong> {selectedLog.event_label}
                  </p>
                </Col>
                <Col md="6">
                  <h6>Usuário Responsável</h6>
                  <p>
                    <strong>Nome:</strong> {selectedLog.user.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedLog.user.email}
                  </p>
                </Col>
              </Row>

              <hr />

              <h6>Parâmetros da Ação</h6>
              <pre className="bg-light p-3 rounded">
                {JSON.stringify(selectedLog.params, null, 2)}
              </pre>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDetailModal(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LogsTab;
