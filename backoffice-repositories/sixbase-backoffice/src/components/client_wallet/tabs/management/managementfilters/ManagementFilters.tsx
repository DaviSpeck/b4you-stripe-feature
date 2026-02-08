import { FC } from 'react';
import { Card, CardHeader, Input, Label } from 'reactstrap';
import { ManagementFiltersProps } from './interfaces/management-filters.interface';

const ManagementFilters: FC<ManagementFiltersProps> = ({
  managers,
  selectedManager,
  onManagerChange,
}) => {
  return (
    <Card>
      <CardHeader className="d-flex align-items-center justify-content-center">
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
      </CardHeader>
    </Card>
  );
};

export default ManagementFilters;

