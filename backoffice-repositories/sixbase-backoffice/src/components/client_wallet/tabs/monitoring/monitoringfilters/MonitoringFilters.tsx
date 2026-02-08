import { FC } from 'react';
import { Calendar, Info } from 'react-feather';
import {
  Card,
  CardHeader,
  Input,
  Label,
  Badge,
  UncontrolledTooltip,
} from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import { MonitoringFiltersProps } from './interfaces/monitoring-filters.interface';

const MonitoringFilters: FC<MonitoringFiltersProps> = ({
  isMaster,
  dateRange,
  onRangeChange,
  onQuickRange,
  selectedRangeLabel,
  rangePayload,
  managers,
  selectedManager,
  onManagerChange,
}) => {
  return (
    <Card>
      <CardHeader className="d-flex align-items-center justify-content-center flex-wrap">
        <div
          className="d-flex align-items-center justify-content-center flex-wrap"
          style={{ gap: 16 }}
        >
          <div className="d-flex align-items-center">
            <Calendar size={15} className="mr-1" />
            <Flatpickr
              className="form-control flat-picker bg-transparent border-0 shadow-none"
              value={dateRange}
              onChange={onRangeChange}
              style={{ width: '210px' }}
              options={{
                mode: 'range',
                dateFormat: 'd/m/Y',
                maxDate: new Date(),
              }}
              placeholder="Selecione o período de análise"
            />
          </div>
          <div
            className="d-flex align-items-center flex-wrap"
            style={{ gap: 8 }}
          >
            {[7, 15, 30, 60, 90].map((days) => (
              <button
                key={days}
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => onQuickRange(days)}
              >
                {`${days} dias`}
              </button>
            ))}
          </div>
          <div
            className="d-flex align-items-center flex-wrap"
            style={{ gap: 8 }}
          >
            <span className="text-muted" style={{ fontSize: 12 }}>
              Janela atual:
            </span>
            <Badge color="light-primary" pill>
              {selectedRangeLabel}
            </Badge>
            <span className="text-muted ml-1" style={{ fontSize: 12 }}>
              Comparada com:
            </span>
            <Badge color="light-secondary" pill>
              {rangePayload
                ? `${rangePayload.prevStart.format(
                    'DD/MM',
                  )} — ${rangePayload.prevEnd.format('DD/MM')}`
                : '--'}
            </Badge>
            <span
              id="n1-hint"
              className="d-inline-flex align-items-center ml-50"
              style={{ cursor: 'pointer' }}
            >
              <Info size={14} className="text-muted" />
            </span>
            <UncontrolledTooltip placement="top" target="n1-hint">
              Selecionando um período, comparamos o mesmo número de dias
              imediatamente anterior. Caso o intervalo inclua o dia atual,
              usamos até ontem (regra N-1).
            </UncontrolledTooltip>
          </div>
          {isMaster && (
            <div className="d-flex align-items-center">
              <Label className="mb-0 mr-1" style={{ whiteSpace: 'nowrap' }}>
                Gerente:
              </Label>
              <Input
                type="select"
                value={selectedManager}
                onChange={(e) => onManagerChange(e.target.value)}
                style={{ width: '220px' }}
              >
                <option value="">Todos os gerentes</option>
                {Array.isArray(managers) &&
                  managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.email}
                    </option>
                  ))}
              </Input>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};

export default MonitoringFilters;
