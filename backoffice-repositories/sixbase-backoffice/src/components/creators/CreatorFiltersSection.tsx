import { FC, useCallback } from 'react';
import { Card, CardBody, Row, Col, Button, Label, Spinner } from 'reactstrap';
import { Calendar } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import {
  CreatorFilters,
  CreatorSummary,
} from '../../interfaces/creators.interface';
import { useSkin } from '../../utility/hooks/useSkin';
import InfoTooltip from 'components/common/InfoTooltip';

interface CreatorFiltersSectionProps {
  filters: CreatorFilters;
  onFiltersChange: (filters: Partial<CreatorFilters>) => void;
  onDateChange: (dates: Date[]) => void;
  producers: Array<{ value: string; label: string }>;
  products: Array<{ value: string; label: string }>;
  summary: CreatorSummary;
  isInitialLoad?: boolean;
  basicStatsLoading?: boolean;
}

/* ────────────────────────────────────────────── */
/* Componentização mínima (sem mudar visual) */
/* ────────────────────────────────────────────── */
interface StatInlineProps {
  label: string;
  tooltip: string;
  value: React.ReactNode;
  isLoading: boolean;
  isDark: boolean;
}

const StatInline: FC<StatInlineProps> = ({
  label,
  tooltip,
  value,
  isLoading,
  isDark,
}) => (
  <div className="d-flex align-items-baseline" style={{ gap: 8 }}>
    <span
      className="small d-flex align-items-center"
      style={{
        whiteSpace: 'nowrap',
        color: isDark ? '#cbd5e1' : '#64748b',
        gap: 6,
      }}
    >
      {label}
      <InfoTooltip content={tooltip} size={12} />
    </span>

    <span
      className="fw-bold"
      style={{
        color: isDark ? '#ffffff' : '#1e293b',
        fontSize: 15,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {isLoading ? (
        <Spinner size="sm" color={isDark ? 'light' : 'primary'} />
      ) : (
        value
      )}
    </span>
  </div>
);

const Divider = () => (
  <div
    className="d-none d-md-block"
    style={{
      width: 1,
      height: 20,
      background: 'rgba(255,255,255,0.15)',
    }}
  />
);

/* ────────────────────────────────────────────── */

const CreatorFiltersSection: FC<CreatorFiltersSectionProps> = ({
  filters,
  onFiltersChange,
  onDateChange,
  producers,
  products,
  summary,
  isInitialLoad = false,
  basicStatsLoading = false,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';
  const isLoadingStats = isInitialLoad || basicStatsLoading;

  const handleRange = useCallback(
    (days: number) => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - (days - 1));
      onDateChange([start, end]);
    },
    [onDateChange],
  );

  return (
    <Card className="mb-3">
      <CardBody>
        <Row className="g-2">
          <Col xs={12} className="mb-2">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              {/* Calendar */}
              <div className="d-flex align-items-center flex-shrink-0">
                <Calendar size={15} className="me-2" />
                <Flatpickr
                  className="form-control flat-picker bg-transparent border-0 shadow-none"
                  value={filters.calendar}
                  onChange={onDateChange}
                  options={{
                    mode: 'range',
                    dateFormat: 'd/m/Y',
                  }}
                />
              </div>

              {/* Selects */}
              <div
                className="d-flex gap-2 align-items-center flex-wrap"
                style={{ flex: '1 1 auto', minWidth: '300px' }}
              >
                <div
                  className="d-flex align-items-center gap-2 flex-grow-1"
                  style={{ minWidth: '200px' }}
                >
                  <Label className="mb-0 small text-white">Produtor:</Label>
                  <Select
                    classNamePrefix="select"
                    className="react-select"
                    styles={{
                      container: (base) => ({ ...base, width: '100%' }),
                      control: (base) => ({
                        ...base,
                        width: '100%',
                        minHeight: 38, // 🔹 pequeno ajuste
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        paddingTop: 4,
                        paddingBottom: 4,
                      }),
                    }}
                    options={producers}
                    value={producers.find(
                      (o) => o.value === filters.producerId,
                    )}
                    onChange={(option) =>
                      onFiltersChange({ producerId: option?.value || '' })
                    }
                    isClearable
                  />
                </div>

                <div
                  className="d-flex align-items-center gap-2 flex-grow-1"
                  style={{ minWidth: '200px' }}
                >
                  <Label className="mb-0 small text-white">Produto:</Label>
                  <Select
                    classNamePrefix="select"
                    className="react-select"
                    styles={{
                      container: (base) => ({ ...base, width: '100%' }),
                      control: (base) => ({
                        ...base,
                        width: '100%',
                        minHeight: 38, // 🔹 mesmo ajuste
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        paddingTop: 4,
                        paddingBottom: 4,
                      }),
                    }}
                    options={products}
                    value={products.find(
                      (o) => o.value === filters.productId,
                    )}
                    onChange={(option) =>
                      onFiltersChange({ productId: option?.value || '' })
                    }
                    isClearable
                  />
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              {/* Quick ranges */}
              <div className="d-flex gap-1 flex-wrap">
                <Button size="sm" color="primary" onClick={() => handleRange(1)}>
                  Hoje
                </Button>
                <Button size="sm" color="primary" onClick={() => handleRange(7)}>
                  7 dias
                </Button>
                <Button size="sm" color="primary" onClick={() => handleRange(30)}>
                  30 dias
                </Button>
                <Button size="sm" color="primary" onClick={() => handleRange(60)}>
                  60 dias
                </Button>
                <Button size="sm" color="primary" onClick={() => handleRange(90)}>
                  90 dias
                </Button>
              </div>

              {/* Stats */}
              <div className="d-flex align-items-center flex-wrap" style={{ gap: 16 }}>
                <StatInline
                  label="Creators All Time:"
                  tooltip="Total de usuários que já realizaram ao menos uma venda como afiliado, considerando todo o histórico.
Não inclui usuários que apenas se cadastraram como creator, mas nunca venderam."
                  value={(summary.totalCreatorsRegisteredAllTime || 0).toLocaleString()}
                  isLoading={isLoadingStats}
                  isDark={isDark}
                />

                <Divider />

                <StatInline
                  label="Creators ativos (últimos 30 dias):"
                  tooltip="Creators que realizaram ao menos uma venda como afiliado nos últimos 30 dias."
                  value={(summary.totalCreatorsActiveAllTime || 0).toLocaleString()}
                  isLoading={isLoadingStats}
                  isDark={isDark}
                />

                <Divider />

                <StatInline
                  label="Percentual de creators ativos All Time:"
                  tooltip="Percentual de creators ativos nos últimos 30 dias em relação ao total de creators que já realizaram ao menos uma venda como afiliado."
                  value={new Intl.NumberFormat('pt-BR', {
                    style: 'percent',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format((summary.percentageActiveCreatorsAllTime || 0) / 100)}
                  isLoading={isLoadingStats}
                  isDark={isDark}
                />
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CreatorFiltersSection;