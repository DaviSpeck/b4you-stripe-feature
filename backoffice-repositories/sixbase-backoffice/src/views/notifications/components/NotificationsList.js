import { useEffect, useState, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Trash2, Inbox } from 'react-feather';

import {
  fetchNotifications,
  deleteNotification,
} from '../../../services/notificationService';
import { NotificationDetailOffcanvas } from './NotificationDetailOffcanvas';
import { useSkin } from '../../../utility/hooks/useSkin';

const paginationPT = {
  rowsPerPageText: 'Linhas por página',
  rangeSeparatorText: 'de',
  selectAllRowsItem: false,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const formatDate = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

const channelIcon = (channel) => {
  switch (channel) {
    case 'push':
      return 'Push';
    case 'email':
      return 'Email';
    case 'sms':
      return 'SMS';
    default:
      return '—';
  }
};

const formatTag = (channel) => {
  switch (channel) {
    case 'user_status':
      return 'Inativo';
    case 'affiliate_status':
      return 'Creator/Afiliado';
    case 'producer_status':
      return 'Produtor';
    default:
      return '—';
  }
};

const getSchedule = (row) => row.schedules?.[0] ?? {};
// const lastHistory = row => {
//     const hist = getSchedule(row).history ?? []
//     return hist[hist.length - 1] ?? {}
// }

export default function NotificationsList({ filterText, onDelete }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const { skin } = useSkin();

  // const pollRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications } = await fetchNotifications();
      setList(Array.isArray(notifications) ? notifications : []);
    } catch (err) {
      console.error('Erro ao carregar notificações', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // pollRef.current = setInterval(load, 30_000)
    // return () => clearInterval(pollRef.current)
  }, [load]);

  const openConfirm = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setDeletingId(null);
    setConfirmOpen(false);
  };
  const handleDelete = async () => {
    try {
      await deleteNotification(deletingId);
      closeConfirm();
      await sleep(350);
      load();
      onDelete?.();
    } catch (err) {
      console.error('Erro ao apagar notificação', err);
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: (r) => r.id,
      sortable: true,
      minWidth: '70px',
      grow: 0,
    },
    {
      name: 'Canal',
      cell: (row) => channelIcon(row.channel),
      minWidth: '70px',
      grow: 0,
    },
    {
      name: 'Título',
      selector: (r) => r.title,
      sortable: true,
      minWidth: '140px',
      grow: 2,
    },
    {
      name: 'Conteúdo',
      selector: (r) => r.content,
      wrap: true,
      minWidth: '200px',
      grow: 3,
    },
    {
      name: 'Tags',
      selector: (row) => row.audience?.tags?.map(formatTag).join(', '),
      wrap: true,
      minWidth: '180px',
      grow: 2,
    },
    {
      name: 'Tipo',
      cell: (row) => {
        const scType = getSchedule(row).schedule_type;
        const label = scType === 'immediate' ? 'Agora' : 'Agendado';
        const color = scType === 'immediate' ? 'info' : 'warning';
        return (
          <span className={`badge rounded-pill bg-${color}`}>{label}</span>
        );
      },
      minWidth: '100px',
      grow: 0,
    },
    {
      name: 'Envio',
      selector: (r) => formatDate(getSchedule(r).send_at),
      sortable: true,
      minWidth: '160px',
      grow: 0,
    },
    // {
    //     name: 'Status',
    //     cell: row => {
    //         const st = lastHistory(row).status ? 'Enviado' : 'Pendente'
    //         const color = { Pendente: 'secondary', Enviado: 'success' }[st] || 'light'
    //         return <span className={`badge bg-${color}`}>{st}</span>
    //     },
    //     minWidth: '100px',
    //     grow: 0
    // },
    // {
    //     name: 'Sucesso/Falha',
    //     cell: row => {
    //         const hist = lastHistory(row)
    //         return hist.successful !== undefined ? `${hist.successful}/${hist.failed}` : '—'
    //     },
    //     minWidth: '130px',
    //     grow: 0
    // },
    {
      name: 'Imagem',
      cell: (row) =>
        row.image_url ? (
          <img
            src={row.image_url}
            alt="thumb"
            style={{
              height: 40,
              width: 40,
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
        ) : (
          '—'
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      minWidth: '80px',
      grow: 0,
    },
    {
      name: 'Link',
      cell: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ whiteSpace: 'nowrap' }}
          >
            Abrir
          </a>
        ) : (
          '—'
        ),
      minWidth: '60px',
      grow: 1,
    },
    {
      name: 'Criada em',
      selector: (r) => formatDate(r.created_at),
      sortable: true,
      minWidth: '150px',
      grow: 0,
    },
    {
      name: 'Ações',
      right: true,
      cell: (row) => (
        <Button
          color="flat-secondary"
          title="Apagar"
          onClick={(e) => {
            e.stopPropagation();
            openConfirm(row.id);
          }}
          style={{ padding: '0.25rem' }}
        >
          <Trash2 size={16} />
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '80px',
      grow: 0,
    },
  ];

  const filteredData = filterText
    ? list.filter(
        (n) =>
          n.title.toLowerCase().includes(filterText.toLowerCase()) ||
          n.content.toLowerCase().includes(filterText.toLowerCase()),
      )
    : list;

  return (
    <>
      <DataTable
        noHeader
        columns={columns}
        data={filteredData}
        keyField="id"
        fixedHeader
        fixedHeaderScrollHeight="60vh"
        progressPending={loading}
        pagination
        paginationComponentOptions={paginationPT}
        highlightOnHover
        pointerOnHover
        dense
        theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
        noDataComponent={
          <div
            className="d-flex flex-column align-items-center justify-content-center w-100 py-5"
            style={{ minHeight: '200px' }}
          >
            <Inbox size={48} />
            <p className="mt-1">Nenhum registro para exibir</p>
          </div>
        }
        onRowClicked={(row) => setViewItem(row)}
      />

      <NotificationDetailOffcanvas
        viewItem={viewItem}
        toggleDetail={() => setViewItem(null)}
      />

      <Modal isOpen={confirmOpen} toggle={closeConfirm} centered>
        <ModalHeader toggle={closeConfirm}>Confirmar exclusão</ModalHeader>
        <ModalBody>
          Tem certeza que deseja excluir a notificação{' '}
          <strong>{deletingId}</strong>?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeConfirm}>
            Cancelar
          </Button>
          <Button color="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
