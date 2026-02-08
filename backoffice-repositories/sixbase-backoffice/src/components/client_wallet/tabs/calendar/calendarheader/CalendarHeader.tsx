import { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Button, Row, Col } from 'reactstrap';
import { CalendarHeaderProps } from './interfaces/calendar-header';

export const MONTH_NAMES_PT_BR = [
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
];

export const WEEK_DAYS_SHORT = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
];

const CalendarHeader: FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onTogglePicker,
}) => {
  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Button color="link" className="p-0" onClick={onPrevMonth}>
          <ChevronLeft size={18} />
        </Button>
        <Button color="link" className="p-0 text-body" onClick={onTogglePicker}>
          <h4 className="mb-0">
            {MONTH_NAMES_PT_BR[currentDate.month()]} {currentDate.year()}
          </h4>
        </Button>
        <Button color="link" className="p-0" onClick={onNextMonth}>
          <ChevronRight size={18} />
        </Button>
      </div>

      <Row className="no-gutters mb-1">
        {WEEK_DAYS_SHORT.map((wd) => (
          <Col key={wd} className="text-center">
            <small className="text-muted">{wd}</small>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default CalendarHeader;
