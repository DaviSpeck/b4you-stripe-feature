import { Button, Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import memoizeOne from 'memoize-one';
import Loader from '../../utils/loader';
import api from '../../providers/api';
import { notify } from '../functions';
import { useState, useEffect } from 'react';

const ModalPages = ({ pages, show, setShow, size, product }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(pages || []);
  }, [pages]);

  const isProducer = product?.is_producer === true;
  const isCoproducer = product?.is_coproducer === true;
  const isAffiliate = !isProducer && !isCoproducer;

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    notify({ message: 'Link copiado!', type: 'success' });
  };

  const createShortLink = async (page) => {
    try {
      const { data } = await api.post('/short_links', {
        type: 'PAGE',
        target_uuid: page.uuid,
        owner_type: 'affiliate',
        owner_uuid: product?.affiliate?.uuid,
      });

      setList((prev) =>
        prev.map((p) =>
          p.uuid === page.uuid ? { ...p, short_link: data.short_link } : p
        )
      );

      notify({ message: 'Link encurtado!', type: 'success' });
    } catch (err) {
      notify({ message: 'Erro ao encurtar link', type: 'danger' });
    }
  };

  const columnsPages = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Título' iconClassName='bx bx-outline' />,
      selector: (item) => <div className='d-flex flex-wrap'>{item.label}</div>,
      width: '30%',
      wrap: true,
    },
    {
      name: <RenderNameDataTable name='Tipo' iconClassName='bx bx-cube' />,
      selector: (item) => <div>{item.type}</div>,
      width: '15%',
    },
    {
      name: <RenderNameDataTable name='Link' iconClassName='bx bx-link' />,
      width: '55%',
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

            {/* copiar */}
            <Button
              variant='primary'
              onClick={(e) => {
                e.preventDefault();
                handleCopyLink(link);
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
                  if (!hasShort) createShortLink(item);
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
  ]);

  return (
    <Modal show={show} size={size} centered onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Páginas</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <DataTable
          columns={columnsPages()}
          data={list}
          striped
          highlightOnHover
          progressComponent={<Loader title='Carregando páginas...' />}
        />
      </Modal.Body>
    </Modal>
  );
};

export default ModalPages;