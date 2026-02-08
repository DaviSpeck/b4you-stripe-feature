import { FC, memo } from 'react';
import { Button, Card, CardBody, CardTitle, Table } from 'reactstrap';

interface DomainItem {
  domain: string;
  sessions: number;
  successSessions: number;
  conversionRate: number;
}

interface JourneyDomainsTableProps {
  items: DomainItem[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const JourneyDomainsTable: FC<JourneyDomainsTableProps> = ({
  items,
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h4" className="mb-2">
          Jornada - Domínios
        </CardTitle>
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th>Domínio</th>
              <th className="text-end">Sessões</th>
              <th className="text-end">Compras concluídas</th>
              <th className="text-end">Taxa de checkout concluído</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.domain}-${index}`}>
                <td>{item.domain}</td>
                <td className="text-end">{item.sessions}</td>
                <td className="text-end">{item.successSessions}</td>
                <td className="text-end">{item.conversionRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-2">
            <Button
              size="sm"
              color="outline-secondary"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-muted small">
              Página {page} de {totalPages}
            </span>
            <Button
              size="sm"
              color="outline-secondary"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default memo(JourneyDomainsTable);
