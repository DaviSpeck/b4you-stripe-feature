import { FC } from 'react';
import { Card, CardBody, Input, Label } from 'reactstrap';
import { CalendarFiltersProps } from './interfaces/calendar-filters';

const CalendarFilters: FC<CalendarFiltersProps> = ({
  isMaster,
  managers,
  selectedManager,
  onManagerChange,
  milestones,
  selectedMilestones,
  onToggleMilestone,
  birthdayRevenueFilters,
  selectedBirthdayRevenueFilters,
  onToggleBirthdayRevenueFilter,
}) => {
  const formatMilestoneLabel = (milestone: string): string => {
    return milestone
      .replace('R$ ', '')
      .replace('.000.000', ' mi')
      .replace('.000', ' mil');
  };

  const formatBirthdayRevenueLabel = (filter: string): string => {
    if (filter === 'BELOW_10K') return 'Abaixo de 10k';
    // Mapear os valores para o formato correto
    const map: Record<string, string> = {
      '10K': '10 mil',
      '50K': '50 mil',
      '500K': '500 mil',
      '1M': '1 mi',
      '5M': '5 mi',
      '10M': '10 mi',
    };
    return map[filter] || filter;
  };

  return (
    <Card className="mb-2">
      <CardBody>
        <div className="d-flex align-items-start gap-4 flex-wrap">
          {isMaster && (
            <div className="d-flex flex-column gap-2">
              <Label className="mb-0 text-muted">Gerente:</Label>
              <Input
                type="select"
                value={selectedManager}
                onChange={(e) => onManagerChange(e.target.value)}
                style={{ width: 200 }}
              >
                <option value="">Todos os gerentes</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.email}
                  </option>
                ))}
              </Input>
            </div>
          )}

          <div className="d-flex flex-column gap-2">
            <Label className="mb-0 text-muted">
              Filtrar por metas batidas:
            </Label>
            <div className="d-flex align-items-center gap-1 flex-wrap">
              {milestones.map((m) => {
                const isActive = selectedMilestones.includes(m);
                return (
                  <button
                    key={m}
                    className={`btn milestone-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onToggleMilestone(m)}
                  >
                    {formatMilestoneLabel(m)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            <Label className="mb-0 text-muted">
              Filtrar por faturamento aniversariantes:
            </Label>
            <div className="d-flex align-items-center gap-1 flex-wrap">
              {birthdayRevenueFilters?.map((f) => {
                const isActive = selectedBirthdayRevenueFilters.includes(f);
                return (
                  <button
                    key={f}
                    className={`btn milestone-btn ${isActive ? 'active' : ''}`}
                    onClick={() => onToggleBirthdayRevenueFilter(f)}
                  >
                    {formatBirthdayRevenueLabel(f)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CalendarFilters;
