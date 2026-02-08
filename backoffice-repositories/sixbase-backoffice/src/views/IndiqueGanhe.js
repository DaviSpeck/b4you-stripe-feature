import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../utility/hooks/useSkin';
import {
  Badge,
  Card,
  CardBody,
  FormGroup,
  Input,
  Label,
  Alert,
  Row,
  Col,
} from 'reactstrap';
import memoizeOne from 'memoize-one';
import { api } from '@services/api';
import { formatDocument, maskPhone } from '@utils';
import {
  Settings,
  User,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
} from 'react-feather';
import { Link } from 'react-router-dom';

const columns = memoizeOne(() => [
  {
    name: 'Nome',
    selector: (row) => row.full_name,
    sortable: true,
    minWidth: '250px',
    cell: (row) => (
      <div className="d-flex align-items-center">
        <User size={16} className="me-2" />
        {row.full_name}
      </div>
    ),
  },
  {
    name: 'Email',
    selector: (row) => row.email,
    sortable: true,
    minWidth: '250px',
    cell: (row) => (
      <div className="d-flex align-items-center">
        <Mail size={16} className="me-2" />
        {row.email}
      </div>
    ),
  },
  {
    name: 'Documento',
    selector: (row) => row.document_number,
    sortable: true,
    minWidth: '150px',
    cell: (row) => formatDocument(row.document_number, 'CPF'),
  },
  {
    name: 'Data de Cadastro',
    selector: (row) => row.created_at,
    sortable: true,
    minWidth: '150px',
    cell: (row) => (
      <div className="d-flex align-items-center">
        <Calendar size={16} className="me-2" />
        {new Date(row.created_at).toLocaleDateString('pt-BR')}
      </div>
    ),
  },
  {
    name: 'Status Produtos',
    sortable: true,
    center: true,
    minWidth: '120px',
    cell: (row) => {
      const statusColor = row.referral_disabled ? '#FF0000' : '#00FF00';

      return (
        <Badge
          color={statusColor}
          style={{
            backgroundColor: statusColor,
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
          }}
        >
          {row.referral_disabled ? 'Bloqueados' : 'Ativos'}
        </Badge>
      );
    },
  },
  {
    name: 'Status',
    selector: (row) => row.referral_program?.status?.label || row.status,
    sortable: true,
    center: true,
    minWidth: '120px',
    cell: (row) => {
      const status = row.referral_program?.status?.label;
      const statusColor = row.referral_program?.status?.color || '#6c757d';

      return (
        <Badge
          color={statusColor}
          style={{
            backgroundColor: statusColor,
            color: '#fff',
            border: 'none',
            fontWeight: 'bold',
          }}
        >
          {status || 'N/A'}
        </Badge>
      );
    },
  },
  {
    name: 'Saldo',
    selector: (row) => row.referral_balance || 0,
    sortable: true,
    center: true,
    minWidth: '150px',
    cell: (row) => (
      <div className="d-flex align-items-center justify-content-center">
        <DollarSign size={16} className="me-1" />
        <span className="fw-bold text-success">
          R$ {(row.referral_balance || 0).toFixed(2)}
        </span>
      </div>
    ),
  },
  {
    name: 'Pendentes',
    selector: (row) => row.pending_commissions || 0,
    sortable: true,
    center: true,
    minWidth: '150px',
    cell: (row) => (
      <div className="d-flex align-items-center justify-content-center">
        <Clock size={16} className="me-1" />
        <span className="fw-bold text-warning">
          R$ {(row.pending_commissions || 0).toFixed(2)}
        </span>
      </div>
    ),
  },
  {
    name: 'Total Ganho',
    selector: (row) => row.total_earned || 0,
    sortable: true,
    center: true,
    minWidth: '160px',
    cell: (row) => (
      <div className="d-flex align-items-center justify-content-center">
        <TrendingUp size={16} className="me-1" />
        <span className="fw-bold text-primary">
          R$ {(row.total_earned || 0).toFixed(2)}
        </span>
      </div>
    ),
  },

  {
    name: 'Ações',
    center: true,
    minWidth: '100px',
    cell: (row) => (
      <Link to={`/producer/${row.uuid}`}>
        <Badge color="primary" style={{ cursor: 'pointer' }}>
          <Settings size={16} />
        </Badge>
      </Link>
    ),
  },
]);

export default function IndiqueGanhe() {
  const { skin } = useSkin();
  const [records, setRecords] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [inputFilter, setInputFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusFilterProducts, setStatusFilterProducts] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (page, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPage);
      if (inputFilter) query.append('search', inputFilter);
      if (statusFilter !== 'all') query.append('status', statusFilter);
      if (statusFilterProducts !== 'all')
        query.append('statusProducts', statusFilterProducts);

      const response = await api.get(`/users/referral?${query.toString()}`);

      // Handle different possible response formats
      let users = [];
      let totalCount = 0;

      if (response.data && response.data.info) {
        // Format: { data: { info: { count, rows } } }
        users = response.data.info.rows || [];
        totalCount = response.data.info.count || 0;
      } else if (response.data && Array.isArray(response.data)) {
        // Format: { data: [...] }
        users = response.data;
        totalCount = response.data.length;
      } else if (response.data && response.data.rows) {
        // Format: { data: { rows, count } }
        users = response.data.rows || [];
        totalCount = response.data.count || 0;
      } else if (response.data && response.data.data) {
        // Format: { data: { data: [...] } }
        users = response.data.data || [];
        totalCount = response.data.total || response.data.count || users.length;
      } else {
        // Fallback: assume response.data is the array
        users = response.data || [];
        totalCount = users.length;
      }

      setRecords(users);
      setRecordsCount(totalCount);
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || 'Erro desconhecido',
      );

      // Fallback data for demonstration
      setRecords([
        {
          uuid: '1',
          full_name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '11999887766',
          document_number: '12345678901',
          created_at: '2024-01-15T10:30:00Z',
          status: 'active',
          referral_program: {
            status: {
              label: 'Ativo',
              value: 'active',
              color: '#28a745',
            },
          },
          referral_balance: {
            total: 1500.0,
          },
          pending_commissions: 250.0,
          total_earned: 1750.0,
          total_paid: 1500.0,
        },
        {
          uuid: '2',
          full_name: 'Maria Santos',
          email: 'maria.santos@email.com',
          phone: '11988776655',
          document_number: '98765432100',
          created_at: '2024-01-20T14:45:00Z',
          status: 'pending',
          referral_program: {
            status: {
              label: 'Pendente',
              value: 'pending',
              color: '#ffc107',
            },
          },
          referral_balance: {
            total: 750.0,
          },
          pending_commissions: 500.0,
          total_earned: 1250.0,
          total_paid: 750.0,
        },
        {
          uuid: '3',
          full_name: 'Pedro Oliveira',
          email: 'pedro.oliveira@email.com',
          phone: '11977665544',
          document_number: '45678912300',
          created_at: '2024-01-25T09:15:00Z',
          status: 'active',
          referral_program: {
            status: {
              label: 'Ativo',
              value: 'active',
              color: '#28a745',
            },
          },
          referral_balance: {
            total: 2200.0,
          },
          pending_commissions: 300.0,
          total_earned: 2500.0,
          total_paid: 2200.0,
        },
      ]);
      setRecordsCount(3);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (newPerPage, page) => {
    await fetchUsers(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page) => {
    fetchUsers(page - 1);
  };

  useEffect(() => {
    fetchUsers(0);
  }, [inputFilter, statusFilter, statusFilterProducts]);

  return (
    <section id="pageIndiqueGanhe">
      <h2 className="mb-2">Indique e Ganhe</h2>
      <p className="text-muted mb-4">
        Gerencie os usuários do programa de indicação e ganhe recompensas.
      </p>

      {error && (
        <Alert color="danger" className="mb-3">
          <strong>Erro:</strong> {error}
        </Alert>
      )}

      <Card>
        <CardBody>
          <Row>
            <Col md={4}>
              <FormGroup className="filters">
                <Label>Buscar por nome, email ou CPF</Label>
                <Input
                  placeholder="Digite para buscar..."
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
                <Label>Filtrar por Status</Label>
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={({ target }) => setStatusFilter(target.value)}
                >
                  <option value="all">Todos os Status</option>
                  <option value="1">Usuários Ativos</option>
                  <option value="2">Usuários Bloqueados</option>
                  <option value="3">Usuários Cancelados</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup className="filters">
                <Label>Filtrar por Status Produtos</Label>
                <Input
                  type="select"
                  value={statusFilterProducts}
                  onChange={({ target }) =>
                    setStatusFilterProducts(target.value)
                  }
                >
                  <option value="all">Todos os Status</option>
                  <option value="false">Ativos</option>
                  <option value="true">Bloqueados</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="horizontal-scroll-table">
            <DataTable
              columns={columns()}
              data={records}
              pagination
              paginationServer
              paginationTotalRows={recordsCount}
              onChangeRowsPerPage={handleRecordsPerPageChange}
              onChangePage={handleRecordsPageChange}
              progressPending={loading}
              progressComponent={<div>Carregando...</div>}
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página:',
                rangeSeparatorText: 'de',
                noRowsPerPage: false,
              }}
              theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              highlightOnHover
              pointerOnHover
              persistTableHead
              noTableHead={false}
              subHeaderWrap
              dense
              customStyles={{
                table: {
                  style: {
                    minWidth: '1200px',
                    width: '100%',
                  },
                },
              }}
            />
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
