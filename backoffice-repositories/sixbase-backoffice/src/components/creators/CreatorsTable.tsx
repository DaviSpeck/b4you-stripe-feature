import { FC, useCallback, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { Download, MessageCircle, Search, User } from 'react-feather';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import { Creator, CreatorFilters } from '../../interfaces/creators.interface';
import { FormatBRL } from '../../utility/Utils';
import { useSkin } from '../../utility/hooks/useSkin';
import InfoTooltip from '../common/InfoTooltip';

interface CreatorsTableProps {
  creators: Creator[];
  fetchCreators: (showLoading?: any, page?: any, size?: any) => Promise<void>;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  filters: CreatorFilters;
  onFiltersChange: (filters: Partial<CreatorFilters>) => void;
  onSearchChange: (searchTerm: string) => void;
  onSortChange: (
    sortBy: CreatorFilters['sortBy'],
    sortOrder: CreatorFilters['sortOrder'],
  ) => void;
  onOriginChange: (origin: string) => void;
  onVerifiedChange: (verifiedStatus: string) => void;
  onRetry: () => void;
  onExportCSV: () => void;
  creatorsScope: 'all' | 'new';
  onCreatorsScopeChange: (scope: 'all' | 'new') => void;
}

const CreatorsTable: FC<CreatorsTableProps> = ({
  creators,
  fetchCreators,
  pagination,
  loading,
  error,
  filters,
  onSearchChange,
  onSortChange,
  onOriginChange,
  onVerifiedChange,
  onRetry,
  onExportCSV,
  creatorsScope,
  onCreatorsScopeChange,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';

  const columns = useMemo(
    () => [
      {
        name: 'Ranking',
        selector: (row: Creator) => row.ranking,
        width: '100px',
        center: true,
        cell: (row: Creator) => {
          const getRankingStyle = () => {
            if (row.ranking === 1) {
              return {
                color: '#FFD700',
              };
            } else if (row.ranking === 2) {
              return {
                color: '#C0C0C0',
              };
            } else if (row.ranking === 3) {
              return {
                color: '#CD7F32',
              };
            }
            return {};
          };

          return (
            <span
              style={{
                color:
                  row.ranking <= 3
                    ? getRankingStyle().color
                    : isDark
                      ? '#ffffff'
                      : '#1e293b',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              #{row.ranking}
            </span>
          );
        },
      },
      {
        name: 'Imagem',
        selector: (row: Creator) => row.name,
        width: '100px',
        center: true,
        cell: (row: Creator) => (
          <div className="d-flex justify-content-center">
            {row.avatar ? (
              <img
                src={row.avatar}
                alt={row.name}
                className="rounded-circle"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#E0E0E0',
                  color: '#808080',
                }}
              >
                <User size={16} />
              </div>
            )}
          </div>
        ),
      },
      {
        name: 'Nome',
        selector: (row: Creator) => row.name,
        cell: (row: Creator) => (
          <div className="text-capitalize">
            {row.uuid ? (
              <Link
                to={`/producer/${row.uuid}`}
                className="text-primary text-decoration-none"
                style={{ cursor: 'pointer' }}
              >
                <strong>{row.name}</strong>
              </Link>
            ) : (
              <strong>{row.name}</strong>
            )}
          </div>
        ),
      },
      {
        name: (
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <span>Renda Gerada</span>
            <InfoTooltip content="Cálculo baseado na soma do valor total das vendas pagas realizadas pelo creator como afiliado no período selecionado." />
          </div>
        ),
        selector: (row: Creator) => row.totalSalesValue,
        cell: (row: Creator) => (
          <span className="fw-bold text-success">
            {FormatBRL(row.totalSalesValue)}
          </span>
        ),
      },
      {
        name: (
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <span>Ticket Médio</span>
            <InfoTooltip content="Cálculo: Renda Gerada ÷ Número de Vendas. Representa o valor médio por venda realizada pelo creator como afiliado no período selecionado." />
          </div>
        ),
        selector: (row: Creator) => row.averageTicket,
        cell: (row: Creator) => (
          <span className="fw-bold" style={{ color: '#ffc107' }}>
            {FormatBRL(row.averageTicket)}
          </span>
        ),
      },
      {
        name: (
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <span>Comissão</span>
            <InfoTooltip content="Cálculo baseado na comissão total recebida pelo creator sobre suas vendas pagas no período selecionado." />
          </div>
        ),
        selector: (row: Creator) => row.totalCommission,
        cell: (row: Creator) => (
          <span className="fw-bold">{FormatBRL(row.totalCommission)}</span>
        ),
      },
      {
        name: (
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <span>B4You Recebeu</span>
            <InfoTooltip content="Cálculo baseado na comissão da B4You sobre as vendas pagas do creator no período selecionado." />
          </div>
        ),
        selector: (row: Creator) => row.b4youFee,
        cell: (row: Creator) => (
          <span className="fw-bold text-primary">
            {FormatBRL(row.b4youFee)}
          </span>
        ),
      },
      {
        name: (
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <span>Conversão (%)</span>
            <InfoTooltip content="Cálculo: (Número de Vendas ÷ Total de Cliques) × 100. Observação: nem todos os cliques são capturados, os dados podem estar parcialmente inconsistentes." />
          </div>
        ),
        selector: (row: Creator) => row.conversionRate,
        center: true,
        minWidth: '150px',
        cell: (row: Creator) => {
          const getConversionColor = (rate: number) => {
            if (rate >= 3) return 'text-success';
            if (rate >= 1) return 'text-warning';
            return 'text-danger';
          };

          return (
            <span
              className={`fw-bold ${getConversionColor(row.conversionRate)}`}
              title="Observação: nem todos os cliques são capturados. Os dados podem estar parcialmente inconsistentes."
            >
              {row.conversionRate}%
            </span>
          );
        },
      },
      {
        name: (
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <span>Vendas</span>
            <InfoTooltip content="Cálculo baseado no total de vendas pagas realizadas pelo creator como afiliado no período selecionado." />
          </div>
        ),
        selector: (row: Creator) => row.numberOfSales,
        center: true,
        cell: (row: Creator) => (
          <span className="fw-bold">{row.numberOfSales}</span>
        ),
      },
      {
        name: (
          <div className="d-flex align-items-center" style={{ gap: 6 }}>
            <span>Cliques</span>
            <InfoTooltip content="Cálculo baseado no total de cliques registrados nos links afiliados dos produtos do creator. Observação: nem todos os cliques são capturados, os dados podem estar parcialmente inconsistentes." />
          </div>
        ),
        selector: (row: Creator) => row.totalClicks,
        center: true,
        cell: (row: Creator) => (
          <span
            className="fw-bold"
            title="Observação: nem todos os cliques são capturados. Os dados podem estar parcialmente inconsistentes."
          >
            {row.totalClicks || 0}
          </span>
        ),
      },
      {
        name: 'Ações',
        cell: (row: Creator) => (
          <div className="d-flex gap-1">
            {row.whatsapp && (
              <a
                href={`https://wa.me/55${row.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-success text-decoration-none"
                style={{ cursor: 'pointer' }}
                title="Contatar via WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            )}
          </div>
        ),
        width: '100px',
        center: true,
      },
    ],
    [],
  );

  const processedCreatorsData = useMemo(() => {
    return creators.map((creator) => ({
      ...creator,
      totalSalesValue: Number(creator.totalSalesValue || 0),
      averageTicket: Number(creator.averageTicket || 0),
      totalCommission: Number(creator.totalCommission || 0),
      b4youFee: Number(creator.b4youFee || 0),
      totalClicks: Number(creator.totalClicks || 0),
      conversionRate: Number(creator.conversionRate || 0),
    }));
  }, [creators]);

  const sortOptions = [
    { value: 'totalSalesValue', label: 'Ranking (Renda Gerada)' },
    { value: 'numberOfSales', label: 'Número de Vendas' },
    { value: 'totalCommission', label: 'Comissão Total' },
    { value: 'conversionRate', label: 'Taxa de Conversão' },
    { value: 'averageTicket', label: 'Ticket Médio' },
  ];

  const orderOptions = [
    { value: 'asc', label: 'Crescente' },
    { value: 'desc', label: 'Decrescente' },
  ];

  const scopeOptions = [
    { value: 'all', label: 'Todos os Creators (Afiliados)' },
    { value: 'new', label: 'Creators Novos (Primeira Venda)' },
  ];

  const originOptions = [
    { value: 'all', label: 'Todos' },
    { value: '0', label: 'Não informado' },
    { value: '1', label: 'Por indicação' },
    { value: '2', label: 'Pelo Matheus Mota' },
    { value: '3', label: 'Perfil de alguém nas redes sociais' },
    { value: '4', label: 'Anúncios' },
    { value: '5', label: 'TikTok' },
    { value: '6', label: 'Instagram' },
    { value: '7', label: 'Busca no Google' },
    { value: '8', label: 'Escola Creator' },
  ];

  const verifiedOptions = [
    { value: 'all', label: 'Todos' },
    { value: '0', label: 'Não cadastrado/Iniciado' },
    { value: '3', label: 'Verificados' },
    { value: '4', label: 'Não verificados' },
  ];

  const handleSortByChange = useCallback(
    (option: any) => {
      onSortChange(option.value, filters.sortOrder);
    },
    [filters.sortOrder, onSortChange],
  );

  const handleSortOrderChange = useCallback(
    (option: any) => {
      onSortChange(filters.sortBy, option.value);
    },
    [filters.sortBy, onSortChange],
  );

  const handleScopeChange = useCallback(
    (option: any) => {
      onCreatorsScopeChange(option.value);
    },
    [onCreatorsScopeChange],
  );

  const handleFilterOrigin = useCallback(
    (option: any) => {
      onOriginChange(option.value);
    },
    [onOriginChange],
  );

  const handleFilterVerified = useCallback(
    (option: any) => {
      onVerifiedChange(option.value);
    },
    [onVerifiedChange],
  );

  return (
    <Card>
      <CardHeader>
        <Row className="align-items-end w-100 d-flex flex-column flex-lg-row">
          <Col xs={12} lg={3} className="mb-2">
            <div>
              <Label className="mb-1 small">Buscar Creator:</Label>
              <div className="position-relative">
                <Search
                  size={15}
                  className="position-absolute top-50 start-0 translate-middle-y ms-2"
                  style={{ zIndex: 10 }}
                />
                <Input
                  type="text"
                  placeholder="Digite o nome..."
                  value={filters.searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="ps-5"
                />
              </div>
            </div>
          </Col>
          <Col xs={12} lg={3} className="mb-2">
            <div>
              <Label className="mb-1 small d-flex align-items-center" style={{ gap: 6 }}>
                Mostrar:
                <InfoTooltip
                  size={12}
                  content={`"Creators" considera apenas usuários que já realizaram ao menos uma venda como afiliado.
"Creators Novos" são aqueles cuja primeira venda como afiliado ocorreu dentro do período selecionado.`}
                />
              </Label>
              <Select
                classNamePrefix="select"
                className="react-select"
                placeholder="Selecione..."
                options={scopeOptions}
                value={scopeOptions.find(
                  (option) => option.value === creatorsScope,
                )}
                onChange={handleScopeChange}
                isClearable={false}
              />
            </div>
          </Col>
          <Col xs={12} lg={3} className="mb-2">
            <div>
              <Label className="mb-1 small">Origem:</Label>
              <Select
                classNamePrefix="select"
                className="react-select"
                placeholder="Selecione..."
                options={originOptions}
                value={originOptions.find(
                  (option) => option.value === filters.origin,
                )}
                onChange={handleFilterOrigin}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
          </Col>
          <Col xs={12} lg={3} className="mb-2">
            <div>
              <Label className="mb-1 small">Verificados:</Label>
              <Select
                classNamePrefix="select"
                className="react-select"
                placeholder="Selecione..."
                options={verifiedOptions}
                value={verifiedOptions.find(
                  (option) => option.value === filters.verified,
                )}
                onChange={handleFilterVerified}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
          </Col>
          <Col xs={12} lg={3} className="mb-2">
            <div>
              <Label className="mb-1 small">Ordenar por:</Label>
              <Select
                classNamePrefix="select"
                className="react-select"
                placeholder="Selecione..."
                options={sortOptions}
                value={sortOptions.find(
                  (option) => option.value === filters.sortBy,
                )}
                onChange={handleSortByChange}
                isClearable={false}
              />
            </div>
          </Col>
          <Col xs={12} lg={3} className="mb-2">
            <div>
              <Label className="mb-1 small">Ordem:</Label>
              <Select
                classNamePrefix="select"
                className="react-select"
                placeholder="Selecione..."
                options={orderOptions}
                value={orderOptions.find(
                  (option) => option.value === filters.sortOrder,
                )}
                onChange={handleSortOrderChange}
                isClearable={false}
              />
            </div>
          </Col>
          <Col xs={12} lg={3} className="mb-2">
            <div>
              <Label className="small">&nbsp;</Label>
              <Button color="primary" onClick={onExportCSV} className="w-100">
                <div className="d-flex justify-content-center align-items-center gap-1">
                  <Download size={15} />
                  <span>Exportar CSV</span>
                </div>
              </Button>
            </div>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div className="alert alert-danger">
              <h5>Erro ao carregar dados</h5>
              <p className="mb-0">{error}</p>
              <Button
                color="primary"
                size="sm"
                className="mt-3"
                onClick={onRetry}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={processedCreatorsData}
            pagination
            paginationServer
            paginationPerPage={pagination.size}
            paginationTotalRows={pagination.total}
            paginationDefaultPage={pagination.page}
            onChangePage={(page) =>
              fetchCreators(true, page - 1, pagination.size)
            }
            onChangeRowsPerPage={(newSize, page) =>
              fetchCreators(true, page - 1, newSize)
            }
            paginationRowsPerPageOptions={[10, 20, 50]}
            sortServer
            progressPending={loading}
            progressComponent={
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="text-muted mt-2">Carregando creators...</p>
              </div>
            }
            onSort={(column, sortDirection) => {
              const columnName = String(column.name).toLowerCase();
              let sortBy: CreatorFilters['sortBy'] = 'totalSalesValue';

              if (columnName.includes('venda')) sortBy = 'numberOfSales';
              else if (columnName.includes('ticket')) sortBy = 'averageTicket';
              else if (columnName.includes('comiss'))
                sortBy = 'totalCommission';
              else if (columnName.includes('convers'))
                sortBy = 'conversionRate';
              else sortBy = 'totalSalesValue';

              const sortOrder: CreatorFilters['sortOrder'] =
                sortDirection === 'asc' ? 'asc' : 'desc';

              onSortChange(sortBy, sortOrder);
            }}
            noDataComponent={
              <div className="text-center py-5">
                <p className="text-muted">Nenhum creator encontrado</p>
              </div>
            }
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default CreatorsTable;
