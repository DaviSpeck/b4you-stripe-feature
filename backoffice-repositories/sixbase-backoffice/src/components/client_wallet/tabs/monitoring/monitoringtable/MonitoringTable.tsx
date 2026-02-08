import { FC } from 'react';
import { Card, CardHeader, CardBody, Input, Label } from 'reactstrap';
import { Search, TrendingDown, TrendingUp } from 'react-feather';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import {
  ProducerPerformanceItem,
  ContactStatusKey,
  managerStatusContactTypes,
  Stage,
} from '../../../../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';
import { stageBadge } from '../utils/stage.utils';
import { FormatBRL } from '../../../../../utility/Utils';
import { MonitoringTableProps } from './interfaces/monitoring-table.interface';
import '../monitoring.scss';

const MonitoringTable: FC<MonitoringTableProps> = ({
  items,
  loading,
  totalRows,
  page,
  perPage,
  searchText,
  onSearchChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  onPageChange,
  onPerPageChange,
  contactStatusChanges,
  onContactStatusChange,
  selectedStage,
  onStageChange,
  canEditContactStatus,
}) => {
  const { skin } = useSkin();

  const columns = memoizeOne(() => [
    {
      name: 'Nome',
      selector: (row: ProducerPerformanceItem) => row.name,
      sortable: true,
      cell: (row: ProducerPerformanceItem) => (
        <div>
          <div
            className="font-weight-bold d-flex align-items-center"
            style={{ gap: 6 }}
          >
            <Link
              to={`/producer/${row.user_uuid || row.id}`}
              style={{ textDecoration: 'none' }}
            >
              {row.name}
            </Link>
            {row.stage && stageBadge(row.stage)}
          </div>
          <small className="text-muted">{row.email}</small>
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Faturamento Atual',
      selector: (row: ProducerPerformanceItem) => row.current_revenue,
      sortable: true,
      right: true,
      cell: (row: ProducerPerformanceItem) => (
        <span>{FormatBRL(row.current_revenue)}</span>
      ),
    },
    {
      name: 'Faturamento Mês Anterior',
      selector: (row: ProducerPerformanceItem) => row.prev_revenue,
      sortable: true,
      right: true,
      cell: (row: ProducerPerformanceItem) => (
        <span>{FormatBRL(row.prev_revenue)}</span>
      ),
    },
    {
      name: 'Variação %',
      selector: (row: ProducerPerformanceItem) => row.variation_percentage,
      sortable: true,
      right: true,
      cell: (row: ProducerPerformanceItem) => {
        const isPositive = row.variation_percentage >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const color = isPositive ? 'success' : 'danger';
        return (
          <div
            className={`text-${color} d-flex align-items-center`}
            style={{ gap: 6 }}
          >
            <Icon size={16} />
            {row.variation_percentage.toFixed(2)}%
          </div>
        );
      },
    },
    {
      name: 'Status de contato',
      selector: (row: ProducerPerformanceItem) => row.contact_status,
      sortable: false,
      cell: (row: ProducerPerformanceItem) => {
        const currentStatus =
          contactStatusChanges[row.id] || row.contact_status || 'NAO_CONTATADO';

        if (!canEditContactStatus) {
          const label =
            managerStatusContactTypes.find((s) => s.key === currentStatus)
              ?.label || 'Não contatado';

          return <span className="text-muted">{label}</span>;
        }

        return (
          <Input
            type="select"
            value={currentStatus}
            onChange={(e) => {
              const newStatus = e.target.value as ContactStatusKey;
              if (newStatus && newStatus !== currentStatus) {
                onContactStatusChange(row.id, newStatus);
              }
            }}
            style={{ minWidth: 150 }}
          >
            {managerStatusContactTypes.map((s) => (
              <option key={s.id} value={s.key}>
                {s.label}
              </option>
            ))}
          </Input>
        );
      },
      grow: 1.2,
    },
  ]);

  return (
    <Card className="mt-1">
      <CardHeader className="d-flex align-items-start justify-content-between flex-wrap">
        <div>
          <h4 className="mb-0">Lista por Etapa</h4>
          <small className="text-muted">
            Nome, e-mail, faturamentos e status de contato
          </small>
        </div>
        <div
          className="d-flex align-items-start flex-wrap gap-4"
          style={{ width: '100%', marginTop: 16 }}
        >
          <div
            className="d-flex flex-column"
            style={{ minWidth: 220, flex: '1 1 280px' }}
          >
            <Label className="mb-1" style={{ whiteSpace: 'nowrap' }}>
              Buscar:
            </Label>
            <div className="d-flex align-items-center">
              <Search size={15} className="mr-1" />
              <Input
                type="text"
                placeholder="Buscar por nome ou e-mail"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="d-flex flex-column" style={{ minWidth: 180 }}>
            <Label className="mb-1" style={{ whiteSpace: 'nowrap' }}>
              Filtro por etapa:
            </Label>
            <Input
              type="select"
              value={selectedStage}
              onChange={(e) => onStageChange(e.target.value as Stage | '')}
              style={{ width: '100%' }}
            >
              <option value="">Todas as etapas</option>
              <option value="HEALTHY">Saudável</option>
              <option value="ATTENTION">Atenção</option>
              <option value="DROP">Queda</option>
              <option value="CHURN">Churn</option>
            </Input>
          </div>
          <div className="d-flex flex-column" style={{ minWidth: 180 }}>
            <Label className="mb-1" style={{ whiteSpace: 'nowrap' }}>
              Ordenar por:
            </Label>
            <Input
              type="select"
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="variation_percentage">Variação %</option>
              <option value="current_revenue">Faturamento Atual</option>
            </Input>
          </div>
          <div className="d-flex flex-column" style={{ minWidth: 120 }}>
            <Label className="mb-1" style={{ whiteSpace: 'nowrap' }}>
              Direção:
            </Label>
            <Input
              type="select"
              value={sortDirection}
              onChange={(e) => onSortDirectionChange(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </Input>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <DataTable
          columns={columns()}
          data={items}
          progressPending={loading}
          progressComponent={
            <LoadingSpinner
              size={24}
              text="Carregando dados..."
              showText={true}
            />
          }
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationDefaultPage={page}
          paginationPerPage={perPage}
          onChangeRowsPerPage={(newPerPage, pageIdx) => {
            onPerPageChange(newPerPage, pageIdx);
          }}
          onChangePage={(pageIdx) => {
            onPageChange(pageIdx);
          }}
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página:',
            rangeSeparatorText: 'de',
            noRowsPerPage: false,
          }}
          noDataComponent="Nenhum produtor encontrado"
        />
      </CardBody>
    </Card>
  );
};

export default MonitoringTable;
