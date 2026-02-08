import { Row, Col, Card, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const SubscriptionFilters = ({
  filterProperties,
  loadingFilters,
  selectedProduct,
  selectedPlan,
  selectedStatus,
  selectedRenewing,
  selectedCanceled,
  selectedPaymentMethod,
  searchInput,
  activePlans,
  loadingExport,
  onProductChange,
  onPlanChange,
  onStatusChange,
  onRenewingChange,
  onCanceledChange,
  onPaymentMethodChange,
  onSearchChange,
  onExport,
  children,
}) => {
  return (
    <Card>
      <Card.Body>
        {/* Filtros - Primeira Linha: Produto, Plano, Status, Método */}
        <Row className='align-items-end mb-3'>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Produto</Form.Label>
              <Form.Control
                as='select'
                value={selectedProduct}
                onChange={onProductChange}
                disabled={loadingFilters}
              >
                <option value='all'>Todos os produtos</option>
                {filterProperties?.products?.map((item) => (
                  <option value={item.uuid} key={item.uuid}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Plano</Form.Label>
              <Form.Control
                as='select'
                value={selectedPlan}
                onChange={onPlanChange}
                disabled={
                  loadingFilters ||
                  !selectedProduct ||
                  selectedProduct === 'all'
                }
              >
                <option value='all'>Todos os planos</option>
                {activePlans.map((item) => (
                  <option value={item.uuid} key={item.uuid}>
                    {item.label}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Control
                as='select'
                value={selectedStatus}
                onChange={onStatusChange}
                disabled={loadingFilters}
              >
                <option value='all'>Todos os status</option>
                {filterProperties?.subscriptionStatus?.map((item) => (
                  <option value={item.key} key={item.key}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Método de Pagamento</Form.Label>
              <Form.Control
                as='select'
                value={selectedPaymentMethod}
                onChange={onPaymentMethodChange}
                disabled={loadingFilters}
              >
                <option value='all'>Todos os métodos</option>
                {filterProperties?.paymentMethods?.map((item) => (
                  <option value={item.key} key={item.key}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Filtros - Segunda Linha: A Renovar, Canceladas */}
        <Row className='align-items-end mb-3'>
          <Col md={4}>
            <Form.Group className='mb-0'>
              <Form.Label className='d-flex align-items-center gap-2'>
                A Renovar
                {selectedStatus &&
                  selectedStatus !== 'all' &&
                  selectedStatus !== 'active' && (
                    <OverlayTrigger
                      placement='top'
                      overlay={
                        <Tooltip id='tooltip-renewing'>
                          Disponível apenas para status Ativo
                        </Tooltip>
                      }
                    >
                      <i
                        className='bx bx-info-circle text-muted'
                        style={{ cursor: 'help' }}
                      />
                    </OverlayTrigger>
                  )}
              </Form.Label>
              <Form.Control
                as='select'
                value={selectedRenewing}
                onChange={onRenewingChange}
                disabled={
                  loadingFilters ||
                  (selectedStatus &&
                    selectedStatus !== 'all' &&
                    selectedStatus !== 'active')
                }
              >
                <option value='all'>Todas</option>
                <option value='7d'>Próximos 7 dias</option>
                <option value='15d'>Próximos 15 dias</option>
                <option value='30d'>Próximos 30 dias</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className='mb-0'>
              <Form.Label className='d-flex align-items-center gap-2'>
                Canceladas
                {selectedStatus &&
                  selectedStatus !== 'all' &&
                  selectedStatus !== 'canceled' && (
                    <OverlayTrigger
                      placement='top'
                      overlay={
                        <Tooltip id='tooltip-canceled'>
                          Disponível apenas para status Cancelado
                        </Tooltip>
                      }
                    >
                      <i
                        className='bx bx-info-circle text-muted'
                        style={{ cursor: 'help' }}
                      />
                    </OverlayTrigger>
                  )}
              </Form.Label>
              <Form.Control
                as='select'
                value={selectedCanceled}
                onChange={onCanceledChange}
                disabled={
                  loadingFilters ||
                  (selectedStatus &&
                    selectedStatus !== 'all' &&
                    selectedStatus !== 'canceled')
                }
              >
                <option value='all'>Todas</option>
                <option value='voluntary'>Voluntário</option>
                <option value='involuntary'>Involuntário</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row className='align-items-end mb-3'>
          <Col md={9}>
            <Form.Group className='mb-0'>
              <Form.Label>Nome ou e-mail</Form.Label>
              <Form.Control
                type='text'
                placeholder='Buscar por nome ou e-mail'
                value={searchInput}
                onChange={onSearchChange}
                disabled={loadingFilters}
              />
            </Form.Group>
          </Col>
          <Col
            md={3}
            className='d-flex align-items-end mt-3 mt-md-0 mb-3 mb-md-0'
          >
            <ButtonDS
              iconRight='bx-export'
              onClick={onExport}
              outline
              disabled={loadingExport}
              className='w-100 w-md-auto'
            >
              {loadingExport ? 'Aguarde...' : 'Exportar xlsx'}
            </ButtonDS>
          </Col>
        </Row>

        {children}
      </Card.Body>
    </Card>
  );
};

export default SubscriptionFilters;
