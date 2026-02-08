import { useEffect, useState } from 'react';
import { Col, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import BadgeDS from '../../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import formatDate from '../../../utils/formatters';
import { notify } from '../../functions';

const popoverRight = (item, handleCopyLink) => (
  <Popover
    id='popover-trigger-hover-focus'
    className='popoverReserve-offers popoverReserve-subscription'
    title='Detalhes'
  >
    <ul>
      {item.payment_method === 'pix' && (
        <li onClick={() => handleCopyLink(item.checkout_url)}>
          <i className='bx bx-copy-alt'></i>
          Copiar link do checkout
        </li>
      )}
      <li
        onClick={() =>
          handleCopyLink(
            item.payment_method === 'pix' ? item.pix_code : item.billet_url
          )
        }
      >
        <i className='bx bx-copy-alt'></i>
        {item.payment_method === 'pix' && 'Copiar código Pix'}
        {item.payment_method === 'billet' && 'Copiar link do Boleto'}
      </li>
    </ul>
  </Popover>
);

const ModalSubscription = ({
  setActiveSubscription,
  activeSubscription,
  onCancelSubscription,
  onSendCardUpdateLink,
  // TODO: Descomentar quando backend estiver pronto
  // setShow,
  // fetchData,
  // onReprocessCharge,
}) => {
  const [charges, setCharges] = useState([]);
  const [requesting, setRequesting] = useState(true);
  const [sendingCardLink, setSendingCardLink] = useState(false);
  // TODO: Descomentar quando backend estiver pronto
  // const [reprocessingCharge, setReprocessingCharge] = useState(false);

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    notify({ message: 'Link copiado!', type: 'success' });
  };

  const renderPrice = (amount) => {
    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  useEffect(() => {
    api
      .get(`/subscriptions/${activeSubscription.uuid}`)
      .then((response) => {
        setCharges(response.data);
        setRequesting(false);
      })
      .catch(() => {
        setRequesting(false);
      });

    return () => {
      setActiveSubscription(null);
    };
  }, []);

  const handleCancelSubscription = async () => {
    if (onCancelSubscription) {
      await onCancelSubscription(activeSubscription);
    }
  };

  const handleSendCardUpdateLink = async () => {
    if (onSendCardUpdateLink) {
      setSendingCardLink(true);
      try {
        await onSendCardUpdateLink(activeSubscription);
      } finally {
        setSendingCardLink(false);
      }
    }
  };

  /* TODO: Descomentar quando o backend estiver pronto */
  /*const handleReprocessCharge = async () => {
    if (onReprocessCharge) {
      setReprocessingCharge(true);
      try {
        await onReprocessCharge(activeSubscription);
        fetchData();
      } finally {
        setReprocessingCharge(false);
      }
    }
  };*/

  if (!activeSubscription) {
    return null;
  }

  const isActive = activeSubscription.status?.key === 'active';
  const isPending = activeSubscription.status?.key === 'pending';
  const isWarning = activeSubscription.status?.key === 'warning';

  const hasAtLeastOnePaidPayment =
    charges?.rows?.some(
      (charge) => charge.status?.key === 'paid' || charge.paid_at !== null
    ) || false;

  // TODO: Descomentar quando backend estiver pronto
  // const today = new Date().toISOString().split('T')[0];
  // const lastAttemptDate = localStorage.getItem(
  //   `reprocess_charge:${activeSubscription.uuid}`
  // );
  // const notAttemptedToday = lastAttemptDate !== today;

  // const nextChargeDate = activeSubscription.next_charge
  //   ? new Date(activeSubscription.next_charge).toISOString().split('T')[0]
  //   : null;
  // const isAfterDueDate = nextChargeDate ? today >= nextChargeDate : false;

  // const canReprocessByRules =
  //   activeSubscription.can_reprocess && isAfterDueDate && notAttemptedToday;

  const canShowCardUpdateButton =
    isActive || isWarning || (isPending && hasAtLeastOnePaidPayment);

  return (
    <>
      <h4 className='mb-4'>Detalhes</h4>

      <Row>
        <Col>
          <b className='d-block mb-1'>Produto</b>
          {activeSubscription.product.name}
        </Col>
        <Col>
          <b className='d-block mb-1'>Aluno</b>
          {activeSubscription.student.full_name}
        </Col>
        <Col>
          <b className='d-block mb-1'>Plano</b>
          {activeSubscription.plan.label}
        </Col>
      </Row>
      <Row className='mt-2'>
        <Col>
          <b className='d-block mb-1'>Preço</b>
          {renderPrice(activeSubscription.plan.price)}
        </Col>
        <Col>
          <b className='d-block mb-1'>Contratação</b>
          {formatDate(activeSubscription.created_at)}
        </Col>
        <Col>
          <b className={`d-block mb-1`}>Status</b>
          <BadgeDS variant={`${activeSubscription.status.color}`} disc>
            {activeSubscription.status.name}
          </BadgeDS>
        </Col>
      </Row>
      <hr />
      <h4>Cobranças</h4>
      {requesting ? (
        <div className='d-block text-align-center mt-4 mb-4'>
          <i className='bx bx-loader-alt bx-spin' style={{ fontSize: 24 }} />
        </div>
      ) : (
        <table className='table'>
          <thead>
            <tr>
              <th>Preço</th>
              <th>Criado em</th>
              <th>Pago em</th>
              <th>Status</th>
            </tr>
          </thead>
          {charges.rows.map((item) => {
            return (
              <tbody key={item.uuid}>
                <tr>
                  <td>{renderPrice(item.price)}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>{item.paid_at ? formatDate(item.paid_at) : '-'}</td>
                  <td>
                    <BadgeDS variant={`${item.status.color}`} disc>
                      {item.status.label}
                    </BadgeDS>
                  </td>
                  {item.status.key === 'pending' && (
                    <td>
                      <OverlayTrigger
                        container={this}
                        trigger={['click']}
                        rootClose={'mousedown'}
                        placement='right'
                        overlay={popoverRight(item, handleCopyLink)}
                      >
                        <ButtonDS
                          variant={`primary`}
                          size='icon'
                          title='detalhes'
                          outline
                        >
                          <i className='bx bx-cog' />
                        </ButtonDS>
                      </OverlayTrigger>
                    </td>
                  )}
                </tr>
              </tbody>
            );
          })}
        </table>
      )}
      <hr />
      <div
        className='d-flex justify-content-end flex-wrap'
        style={{ gap: '1rem' }}
      >
        {isActive && (
          <ButtonDS
            size='sm'
            variant='danger'
            onClick={handleCancelSubscription}
            className='d-flex align-items-center justify-content-center'
          >
            <i className='bx bx-x' style={{ marginRight: '0.5rem' }}></i>
            Cancelar Assinatura
          </ButtonDS>
        )}

        {canShowCardUpdateButton && (
          <ButtonDS
            size='sm'
            variant='warning'
            onClick={handleSendCardUpdateLink}
            disabled={sendingCardLink}
            className='d-flex align-items-center justify-content-center'
          >
            <i
              className='bx bx-credit-card'
              style={{ marginRight: '0.75rem' }}
            ></i>
            {sendingCardLink
              ? 'Enviando...'
              : 'Enviar Link de Atualização de Cartão'}
          </ButtonDS>
        )}

        {/* TODO: Descomentar quando o backend estiver pronto */}
        {/* {(isPending || isWarning) && canReprocessByRules && (
          <ButtonDS
            size='sm'
            variant='primary'
            onClick={handleReprocessCharge}
            disabled={reprocessingCharge}
            title='Reprocessar cobrança'
            className='d-flex align-items-center justify-content-center'
          >
            <i className='bx bx-refresh' style={{ marginRight: '0.5rem' }}></i>
            {reprocessingCharge ? 'Reprocessando...' : 'Reprocessar Cobrança'}
          </ButtonDS>
        )} */}
      </div>
    </>
  );
};

export default ModalSubscription;
