import { useState, useEffect } from 'react';
import { Dropdown, Modal, ListGroup, Spinner, Button } from 'react-bootstrap';
import { FiBell, FiImage, FiChevronDown, FiX } from 'react-icons/fi';
import {
  fetchNotifications,
  markIntegrationAsRead,
} from '../../services/oneSignalService';
import '../styles/notifications.scss';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export default function NotificationsBell() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingIntegrationId, setLoadingIntegrationId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 5;
  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;
  const unreadCount = 0;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchNotifications(page, pageSize)
      .then(
        ({ notifications: list, total, integrations: integrationsList }) => {
          setTotal(total);
          setNotifications((prev) => (page === 1 ? list : [...prev, ...list]));
          setIntegrations((prev) =>
            page === 1 ? integrationsList : [...prev, ...integrationsList]
          );
        }
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, page]);

  const NotificationsList = (
    <>
      {loading && page === 1 && (
        <div className='notifications-menu__loading'>
          <Spinner animation='border' size='sm' />
        </div>
      )}

      <ListGroup variant='flush'>
        {integrations.map((integration) => {
          const isLoading = loadingIntegrationId === integration.id;
          return (
            <ListGroup.Item
              key={`integration-${integration.id}`}
              action
              className='notifications-menu__item'
              onClick={async () => {
                if (integration.sale_item?.uuid && !isLoading) {
                  setLoadingIntegrationId(integration.id);
                  try {
                    await markIntegrationAsRead(integration.id);
                  } catch (error) {
                    console.error(
                      'Erro ao marcar notificação como lida:',
                      error
                    );
                  } finally {
                    window.location.href = `/vendas?uuid=${encodeURIComponent(
                      integration.sale_item.uuid
                    )}`;
                  }
                }
              }}
              style={{
                cursor:
                  integration.sale_item?.uuid && !isLoading
                    ? 'pointer'
                    : 'default',
                opacity: isLoading ? 0.6 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
              }}
            >
              <div className='notification-thumb'>
                {isLoading ? (
                  <Spinner animation='border' size='sm' />
                ) : (
                  <FiImage size={20} color='#888' />
                )}
              </div>
              <div className='notification-content'>
                <div className='notification-content__title'>
                  {isLoading ? 'Carregando...' : '💸'}{' '}
                  {integration.params?.message || 'Notificação de Integração'}
                </div>
                <div className='notification-content__text'>
                  {integration.sale && (
                    <>
                      <br />
                      <small>
                        <strong>Cliente:</strong> {integration.sale.full_name} (
                        {integration.sale.email})
                      </small>
                      {integration.sale.created_at && (
                        <>
                          <br />
                          <small>
                            <strong>Data da Compra:</strong>{' '}
                            {new Date(
                              integration.sale.created_at
                            ).toLocaleString('pt-BR')}
                          </small>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className='notification-content__date'>
                  {new Date(integration.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
        {notifications.map((n) => (
          <ListGroup.Item
            key={n.id}
            action
            onClick={() => n.url && window.open(n.url, '_blank')}
            className='notifications-menu__item'
          >
            <div className='notification-thumb'>
              {n.image_url ? (
                <img src={n.image_url} alt='' />
              ) : (
                <FiImage size={20} color='#888' />
              )}
            </div>
            <div className='notification-content'>
              <div className='notification-content__title'>{n.title}</div>
              <div className='notification-content__text'>{n.content}</div>
              <div className='notification-content__date'>
                {new Date(n.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {!loading && notifications.length === 0 && integrations.length === 0 && (
        <div className='notifications-menu__empty'>Sem notificações</div>
      )}

      {!loading && hasMore && (
        <div
          className='notifications-menu__load-more'
          onClick={(e) => {
            e.stopPropagation();
            setPage((p) => p + 1);
          }}
        >
          <FiChevronDown size={20} />
        </div>
      )}

      {loading && page > 1 && (
        <div className='notifications-menu__loading'>
          <Spinner animation='border' size='sm' />
        </div>
      )}
    </>
  );

  const BellButton = (
    <Button
      variant='link'
      className='notifications-toggle p-0'
      onClick={() => {
        setOpen(true);
        setPage(1);
        setNotifications([]);
        setIntegrations([]);
      }}
      title='Notificações'
    >
      <FiBell size={24} className='notifications-toggle__icon' />
      {unreadCount > 0 ? (
        <span className='notifications-toggle__badge'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : (
        <span className='notifications-toggle__badge notifications-toggle__badge--dot' />
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {BellButton}
        <Modal
          show={open}
          onHide={() => setOpen(false)}
          centered
          scrollable
          contentClassName='p-0'
          className='notifications-modal'
        >
          <Modal.Header>
            <Modal.Title>Notificações</Modal.Title>
            <Button
              variant='link'
              className='ms-auto p-0'
              onClick={() => setOpen(false)}
            >
              <FiX size={20} />
            </Button>
          </Modal.Header>
          <Modal.Body>{NotificationsList}</Modal.Body>
        </Modal>
      </>
    );
  }

  return (
    <Dropdown
      className='notifications-dropdown'
      show={open}
      onToggle={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          setPage(1);
          setNotifications([]);
          setIntegrations([]);
        }
      }}
      autoClose='outside'
    >
      <Dropdown.Toggle as='div'>{BellButton}</Dropdown.Toggle>
      <Dropdown.Menu renderOnMount className='notifications-menu'>
        <div className='notifications-menu__header'>Notificações</div>
        {NotificationsList}
      </Dropdown.Menu>
    </Dropdown>
  );
}
