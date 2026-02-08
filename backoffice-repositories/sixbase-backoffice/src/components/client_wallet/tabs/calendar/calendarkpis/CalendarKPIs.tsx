import { FC } from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { CalendarKPIsProps } from './interfaces/calendar-kpis';

const CalendarKPIs: FC<CalendarKPIsProps> = ({
  monthlyBirthdayCount,
  monthlyGoalsAchievedCount,
}) => {
  return (
    <Row>
      <Col md="6" sm="12">
        <Card className="mb-2 kpi-card">
          <CardBody>
            <h6 className="text-muted mb-1">Aniversariantes</h6>
            <h3 className="text-info mb-0">{monthlyBirthdayCount}</h3>
            <small className="text-muted mt-1 d-block">
              Produtores com aniversário no período
            </small>
          </CardBody>
        </Card>
      </Col>

      <Col md="6" sm="12">
        <Card className="mb-2 kpi-card">
          <CardBody>
            <h6 className="text-muted mb-1">Metas batidas</h6>
            <h3 className="text-success mb-0">{monthlyGoalsAchievedCount}</h3>
            <small className="text-muted mt-1 d-block">
              Produtores que bateram meta no período
            </small>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default CalendarKPIs;
