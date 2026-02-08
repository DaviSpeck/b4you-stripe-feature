import { Button, Modal } from 'react-bootstrap';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import { currency, notify } from '../functions';
import memoizeOne from 'memoize-one';
import DataTable from 'react-data-table-component';
import Loader from '../../utils/loader';
import { useEffect, useState } from 'react';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import ModalSelect3Steps from '../products/offers/modal-3steps';
import api from '../../providers/api';

const columnsOffers = memoizeOne(
  (handleModal3Steps, handleShorten, isAffiliate) => [
    {
      name: <RenderNameDataTable name='Título' iconClassName='bx bx-outline' />,
      selector: (item) => <div className='d-flex flex-wrap'>{item.label}</div>,
      width: '30%',
      wrap: true,
    },
    {
      name: (
        <RenderNameDataTable name='Valor' iconClassName='bx bx-dollar-circle' />
      ),
      selector: (item) => <div>{currency(item.price)}</div>,
    },
    {
      name: <RenderNameDataTable name='Comissão' iconClassName='bx bx-dollar' />,
      selector: (item) => <div>{currency(item.commission_amount)}</div>,
    },
    {
      name: <RenderNameDataTable name='Link' iconClassName='bx bx-link' />,
      width: '40%',
      selector: (item) => {
        const hasShort = !!item.short_link;
        const link = hasShort ? item.short_link : item.url;

        return (
          <div className='d-flex align-items-center' style={{ width: '100%' }}>
            <textarea
              className='form-control pix-code'
              value={link}
              readOnly
              style={{
                width: '350px',
                height: '35px',
                borderRadius: '8px 0 0 8px',
                background: '#f1f3f5',
                border: '1px solid #ced4da',
                fontSize: 13,
                color: '#495057',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                cursor: 'default',
              }}
            />

            <Button
              variant='primary'
              onClick={(e) => {
                e.preventDefault();
                handleModal3Steps(item);
              }}
              className='d-flex align-items-center justify-content-center'
              style={{
                borderRadius: '0 8px 8px 0',
                height: '35px',
                width: '40px',
              }}
            >
              <i className='bx bx-copy-alt' style={{ fontSize: 20 }} />
            </Button>

            {isAffiliate && (
              <Button
                variant={hasShort ? 'secondary' : 'primary'}
                disabled={hasShort}
                onClick={(e) => {
                  e.preventDefault();
                  if (!hasShort) handleShorten(item);
                }}
                className='d-flex align-items-center justify-content-center ml-2'
                style={{
                  height: '35px',
                  minWidth: '105px',
                  borderRadius: '8px',
                  background: hasShort && '#adb5bd',
                  color: '#fff',
                  fontWeight: 600,
                  opacity: hasShort ? 0.9 : 1,
                  cursor: hasShort ? 'default' : 'pointer',
                }}
              >
                {hasShort ? 'Encurtado' : 'Encurtar'}
              </Button>
            )}
          </div>
        );
      },
    },
  ]
);

const ModalOffer = ({ show, setShow, size, offers, product }) => {
  const [urlCheckout, setUrlCheckout] = useState('');
  const [showSelect3Steps, setShowSelect3Steps] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [list, setList] = useState(offers);

  useEffect(() => {
    setList(offers || []);
  }, [offers]);

  const isProducer = product?.is_producer === true;
  const isCoproducer = product?.is_coproducer === true;
  const isAffiliate = !isProducer && !isCoproducer;

  const handleModal3Steps = (offer) => {
    const link = offer.short_link || offer.url;
    setUrlCheckout(link);
    setSelectedOffer(offer);
    setShowSelect3Steps(true);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    notify({ message: 'Link copiado!', type: 'success' });
  };

  const handleShorten = async (offer) => {
    try {
      const { data } = await api.post('/short_links', {
        type: 'OFFER',
        target_uuid: offer.uuid,
        owner_type: 'affiliate',
        owner_uuid: product?.affiliate?.uuid,
      });

      const updated = list.map((o) =>
        o.uuid === offer.uuid ? { ...o, short_link: data.short_link } : o
      );

      setList(updated);

      notify({ message: 'Link encurtado!', type: 'success' });
    } catch (err) {
      notify({ message: 'Erro ao encurtar link', type: 'danger' });
    }
  };

  return (
    <>
      <Modal
        show={show}
        className='modal-filter'
        size={size}
        onHide={() => setShow(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Ofertas</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <DataTable
            className='mt-3'
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página',
              rangeSeparatorText: 'de',
              selectAllRowsItem: true,
              selectAllRowsItemText: 'Todos',
            }}
            columns={columnsOffers(
              handleModal3Steps,
              handleShorten,
              isAffiliate
            )}
            data={list}
            striped
            highlightOnHover
            progressComponent={<Loader title='Carregando ofertas...' />}
            noDataComponent={
              <div className='no-data-component'>
                <div className='mr-3 not-found'>
                  <div className='text-center'>
                    <div className='strong'>Nenhuma oferta</div>
                    <span>para mostrar...</span>
                  </div>
                </div>
              </div>
            }
          />
        </Modal.Body>
      </Modal>

      <ModalGeneric
        title='Selecione o modelo de Checkout'
        centered
        show={showSelect3Steps}
        setShow={setShowSelect3Steps}
        size='md'
      >
        <ModalSelect3Steps
          urlCheckout={urlCheckout}
          handleCopyLink={handleCopyLink}
          product={product}
          offer={selectedOffer}
          forAffiliates
        />
      </ModalGeneric>
    </>
  );
};

export default ModalOffer;