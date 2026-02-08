import { FC } from 'react';
import { Calendar } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import { Card, CardHeader, Input, Label } from 'reactstrap';
import { DashboardFiltersProps } from './interfaces/dashboard-filters.interface';

const DashboardFilters: FC<DashboardFiltersProps> = ({
  isMaster,
  managers,
  selectedManager,
  onManagerChange,
  dateRange,
  onDateChange,
}) => {
  return (
    <Card>
      <CardHeader className="d-flex align-items-center justify-content-between flex-wrap">
        <h4 className="mb-0">Dashboard da Carteira</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {isMaster && (
            <div className="d-flex align-items-center mr-2">
              <Label className="mb-0 mr-1">Gerente:</Label>
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
          <div className="d-flex align-items-center">
            <Calendar size={15} className="mr-1" />
            <Flatpickr
              className="form-control"
              style={{ width: 250 }}
              value={dateRange}
              onChange={(dates) => onDateChange(dates)}
              options={{
                mode: 'range',
                dateFormat: 'd/m/Y',
                defaultDate: [new Date(Date.now() - 30 * 86400000), new Date()],
              }}
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default DashboardFilters;
