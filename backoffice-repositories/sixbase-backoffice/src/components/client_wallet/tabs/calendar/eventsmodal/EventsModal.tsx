import { FC } from 'react';
import moment from 'moment';
import { Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import { FormatBRL } from '../../../../../utility/Utils';
import { EventsModalProps } from './interfaces/events-modal';

const EventsModal: FC<EventsModalProps> = ({
  isOpen,
  onToggle,
  selectedEvents,
  selectedEventType,
  selectedDate,
}) => {
  const title =
    selectedEventType === 'birthday'
      ? 'Aniversariantes do dia'
      : 'Metas batidas no dia';

  return (
    <Modal isOpen={isOpen} toggle={onToggle} centered size="lg">
      <ModalHeader toggle={onToggle} className="border-0 pb-0">
        <div>
          <h5 className="mb-0 fw-semibold">{title}</h5>
          <small className="text-muted">
            {moment(selectedDate).format('D [de] MMMM [de] YYYY')}
          </small>
        </div>
      </ModalHeader>
      <ModalBody
        style={{ maxHeight: '65vh', overflowY: 'auto', paddingTop: '0.75rem' }}
      >
        {selectedEvents.length > 0 ? (
          selectedEvents.map((ev, idx) => (
            <div key={idx} className="p-3 mb-3 rounded border border-dark">
              <h6 className="mb-1">{ev.name}</h6>
              {ev.milestone_achieved && (
                <small className="text-success">
                  Meta atingida: {ev.milestone_achieved}
                </small>
              )}
              <Row className="mt-1">
                <Col sm="6">
                  <small className="text-muted d-block">Email</small>
                  {ev.email}
                </Col>
                <Col sm="6">
                  <small className="text-muted d-block">Gerente</small>
                  {ev.manager_email}
                </Col>
                <Col sm="6">
                  <small className="text-muted d-block">
                    Faturamento no Período
                  </small>
                  <span>{FormatBRL(ev.revenue)}</span>
                  <small
                    className="text-muted d-block mt-1"
                    style={{ fontSize: '10px' }}
                  >
                    Período selecionado (
                    {moment(selectedDate).format('MM/YYYY')})
                  </small>
                </Col>
                <Col sm="6">
                  <small className="text-muted d-block">
                    Faturamento Total
                  </small>
                  <span>{FormatBRL(ev.revenue_total)}</span>
                  <small
                    className="text-muted d-block mt-1"
                    style={{ fontSize: '10px' }}
                  >
                    Acumulado (todos os tempos)
                  </small>
                </Col>
              </Row>
            </div>
          ))
        ) : (
          <div className="text-center text-muted py-3">
            Nenhum evento encontrado.
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default EventsModal;
