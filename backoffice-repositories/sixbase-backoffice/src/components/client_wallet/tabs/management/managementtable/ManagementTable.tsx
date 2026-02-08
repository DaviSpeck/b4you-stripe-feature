import { FC } from 'react';
import { Card, CardHeader, CardBody, Input, Label, Button } from 'reactstrap';
import { Search, Plus } from 'react-feather';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import { useSkin } from '../../../../../utility/hooks/useSkin';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import {
  ManagementItem,
  ManagerPhase,
  managerPhaseTypes,
} from '../../../../../views/client_wallet/tabs/management/interfaces/management.interface';
import { FormatBRL } from '../../../../../utility/Utils';
import { ManagementTableProps } from './interfaces/management-table.interface';

const ManagementTable: FC<ManagementTableProps> = ({
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
  phaseChanges,
  onPhaseChange,
  canEdit,
  canAddClient,
  selectedPhase,
  onPhaseChangeFilter,
  onAddClientClick,
}) => {
  const { skin } = useSkin();

  const columns = memoizeOne(() => [
    {
      name: 'Nome',
      selector: (row: ManagementItem) => row.name,
      sortable: true,
      cell: (row: ManagementItem) => (
        <div>
          <div className="font-weight-bold">
            <Link
              to={`/producer/${row.user_uuid || row.id}`}
              style={{ textDecoration: 'none' }}
            >
              {row.name}
            </Link>
          </div>
          <small className="text-muted">{row.email}</small>
        </div>
      ),
      grow: 2,
    },
    {
      name: 'Faturamento',
      selector: (row: ManagementItem) => row.current_revenue,
      sortable: true,
      right: true,
      cell: (row: ManagementItem) => (
        <span>{FormatBRL(row.current_revenue)}</span>
      ),
    },
    {
      name: 'Etapa',
      selector: (row: ManagementItem) => row.manager_phase,
      sortable: false,
      cell: (row: ManagementItem) => {
        const currentPhase =
          phaseChanges[row.id] !== undefined
            ? phaseChanges[row.id]
            : row.manager_phase;

        if (!canEdit) {
          const label =
            currentPhase === null
              ? 'Sem etapa'
              : managerPhaseTypes.find((p) => p.id === currentPhase)?.label ||
                'Sem etapa';

          return (
            <span
              className="badge badge-light-secondary"
              style={{ marginLeft: 16, padding: '6px 8px' }}
            >
              {label}
            </span>
          );
        }

        return (
          <Input
            type="select"
            value={currentPhase ?? ''}
            onChange={(e) => {
              const newPhase = e.target.value
                ? (Number(e.target.value) as ManagerPhase)
                : null;
              if (newPhase !== currentPhase) {
                onPhaseChange(row.id, newPhase);
              }
            }}
            style={{ minWidth: 180, marginLeft: 16 }}
          >
            <option value="">Sem etapa</option>
            {managerPhaseTypes.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.label}
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
        <div className="d-flex align-items-center justify-content-between w-100 mb-2">
          <div>
            <h4 className="mb-0">Lista de Clientes</h4>
            <small className="text-muted">
              Nome, e-mail, faturamento e etapa
            </small>
          </div>

          {canAddClient && (
            <Button
              color="primary"
              onClick={onAddClientClick}
              className="d-flex align-items-center ml-2"
            >
              <Plus size={16} className="mr-1" />
              Adicionar Cliente
            </Button>
          )}
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
          <div className="d-flex flex-column" style={{ minWidth: 200 }}>
            <Label className="mb-1" style={{ whiteSpace: 'nowrap' }}>
              Filtro por etapa:
            </Label>
            <Input
              type="select"
              value={selectedPhase === 'null' ? 'null' : selectedPhase || ''}
              onChange={(e) => {
                if (e.target.value === 'null') {
                  onPhaseChangeFilter('null' as any);
                } else if (e.target.value === '') {
                  onPhaseChangeFilter(null);
                } else {
                  onPhaseChangeFilter(Number(e.target.value) as ManagerPhase);
                }
              }}
              style={{ width: '100%' }}
            >
              <option value="">Todas as etapas</option>
              <option value="null">Sem etapa</option>
              {managerPhaseTypes.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.label}
                </option>
              ))}
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
              <option value="name">Nome</option>
              <option value="current_revenue">Faturamento</option>
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
          paginationDefaultPage={page + 1}
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
          noDataComponent="Nenhum cliente encontrado"
        />
      </CardBody>
    </Card>
  );
};

export default ManagementTable;
