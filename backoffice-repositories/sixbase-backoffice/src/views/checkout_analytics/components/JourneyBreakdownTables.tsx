import { FC, memo } from 'react';
import { Info } from 'react-feather';
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Row,
  Table,
  UncontrolledTooltip,
} from 'reactstrap';
import '../styles/journey-breakdown.scss';

interface BreakdownItem {
  label: string;
  sessions: number;
  successSessions: number;
  successRate: number;
}

interface JourneyBreakdownTablesProps {
  byCheckoutType: BreakdownItem[];
  byCheckoutMode: BreakdownItem[];
  byPaymentMethod: BreakdownItem[];
  byProduct: BreakdownItem[];
  byProducer: BreakdownItem[];
  productPagination: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (pageSize: number) => void;
  };
  producerPagination: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (pageSize: number) => void;
  };
}

const CardHeader: FC<{
  title: string;
  tooltip?: string;
  tooltipId?: string;
}> = ({ title, tooltip, tooltipId }) => (
  <div className="d-flex justify-content-between align-items-center mb-2">
    <h5 className="mb-0 fw-semibold">{title}</h5>
    {tooltip && tooltipId && (
      <>
        <span id={tooltipId} className="text-muted cursor-pointer">
          <Info size={14} />
        </span>
        <UncontrolledTooltip target={tooltipId} placement="top">
          {tooltip}
        </UncontrolledTooltip>
      </>
    )}
  </div>
);

const BreakdownMiniSummary: FC<{ items: BreakdownItem[] }> = ({ items }) => {
  const totalSessions = items.reduce((acc, i) => acc + i.sessions, 0);
  const avgConversion =
    items.length > 0
      ? items.reduce((acc, i) => acc + i.successRate, 0) / items.length
      : 0;

  return (
    <div className="d-flex gap-4 mb-2">
      <div>
        <div className="fw-bold fs-5">{totalSessions}</div>
        <small className="text-muted">Sessões</small>
      </div>
      <div>
        <div className="fw-bold fs-5">{avgConversion.toFixed(1)}%</div>
        <small className="text-muted">
          Conversão média de checkout concluído
        </small>
      </div>
    </div>
  );
};

const renderTable = (items: BreakdownItem[]) => (
  <Table responsive borderless size="sm" className="mb-0 breakdown-table">
    <thead className="text-muted small">
      <tr>
        <th>Grupo</th>
        <th className="text-end">Sessões</th>
        <th className="text-end">Compras concluídas</th>
        <th className="text-end">Taxa de checkout concluído</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.label}>
          <td className="fw-medium">{item.label}</td>
          <td className="text-end">{item.sessions}</td>
          <td className="text-end">{item.successSessions}</td>
          <td className="text-end fw-semibold text-success">
            {item.successRate.toFixed(1)}%
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

const PaginationControls: FC<{
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  selectId: string;
}> = ({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  selectId,
}) => (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-2 gap-2">
      <div className="d-flex align-items-center gap-1">
        <Label className="mb-0 text-muted small" for={selectId}>
          Linhas por página
        </Label>
        <Input
          id={selectId}
          type="select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ width: 90 }}
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Input>
      </div>

      {totalPages > 1 && (
        <div className="d-flex align-items-center gap-2">
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
    </div>
  );

const JourneyBreakdownTables: FC<JourneyBreakdownTablesProps> = ({
  byCheckoutType,
  byCheckoutMode,
  byPaymentMethod,
  byProduct,
  byProducer,
  productPagination,
  producerPagination,
}) => {
  return (
    <Row className="mb-3">
      {/* KPIs */}
      <Col lg="4" className="mb-2">
        <Card>
          <CardBody>
            <CardHeader
              title="Tipo de checkout"
              tooltip="Sessões e checkouts concluídos por tipo de checkout."
              tooltipId="journey-checkout-type-tooltip"
            />
            <BreakdownMiniSummary items={byCheckoutType} />
            {renderTable(byCheckoutType)}
          </CardBody>
        </Card>
      </Col>

      <Col lg="4" className="mb-2">
        <Card>
          <CardBody>
            <CardHeader
              title="Modo"
              tooltip="Sessões e checkouts concluídos por modo de checkout."
              tooltipId="journey-checkout-mode-tooltip"
            />
            <BreakdownMiniSummary items={byCheckoutMode} />
            {renderTable(byCheckoutMode)}
          </CardBody>
        </Card>
      </Col>

      <Col lg="4" className="mb-2">
        <Card>
          <CardBody>
            <CardHeader
              title="Método de pagamento"
              tooltip="Sessões e checkouts concluídos por método de pagamento."
              tooltipId="journey-payment-method-tooltip"
            />
            <BreakdownMiniSummary items={byPaymentMethod} />
            {renderTable(byPaymentMethod)}
          </CardBody>
        </Card>
      </Col>

      <Col lg="12" className="mb-2">
        <Card>
          <CardBody>
            <CardHeader
              title="Produto"
              tooltip="Sessões e checkouts concluídos por produto no período filtrado."
              tooltipId="journey-product-tooltip"
            />
            <BreakdownMiniSummary items={byProduct} />
            {renderTable(byProduct)}
            <PaginationControls
              {...productPagination}
              selectId="journey-product-page-size"
            />
          </CardBody>
        </Card>
      </Col>

      <Col lg="12">
        <Card>
          <CardBody>
            <CardHeader
              title="Produtor"
              tooltip="Sessões e checkouts concluídos por produtor no período filtrado."
              tooltipId="journey-producer-tooltip"
            />
            <BreakdownMiniSummary items={byProducer} />
            {renderTable(byProducer)}
            <PaginationControls
              {...producerPagination}
              selectId="journey-producer-page-size"
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default memo(JourneyBreakdownTables);
