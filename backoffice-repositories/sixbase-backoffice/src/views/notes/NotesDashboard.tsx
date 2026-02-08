import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Row,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Settings } from 'react-feather';
import { api } from 'services/api';
import { toast } from 'react-toastify';
import { configNotify } from 'configs/toastConfig';
import { useSkin } from 'utility/hooks/useSkin';
import DataTable from 'react-data-table-component';

type NoteType = 'commercial' | 'administrative';

interface NoteRow {
  id: number;
  type: NoteType;
  uuid?: string;
  version?: number;
  summary?: string | null;
  next_action?: string | null;
  followup_status?: string | null;
  pending_points?: string | null;
  additional_notes?: string | null;
  next_contact_at?: string | null;
  created_at?: string | null;
  producer?: { uuid: string; name: string | null };
  author?: { name: string | null };
  note?: string | null;
}

const statusLabels: Record<string, string> = {
  in_progress: 'Em andamento',
  done: 'Concluído',
  awaiting_producer: 'Aguardando produtor',
  awaiting_internal: 'Aguardando interno',
  resolved: 'Resolvido',
  left_platform: 'Saiu da plataforma'
};

const formatDateBr = (value?: string | null) => {
  if (!value) return '-';
  if (value.includes('/')) return value.split(' ')[0];
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
};

const renderMultiline = (value?: string | null) => {
  if (!value) return null;
  const normalized = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{normalized}</span>;
};
const hasHistory = (note?: NoteRow | null) => Number(note?.version || 0) > 1;

const NotesDashboard: React.FC = () => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [managerId, setManagerId] = useState<string | null>(null);
  const [type, setType] = useState<NoteType | ''>('');
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [managers, setManagers] = useState<{ id: number; full_name: string }[]>([]);

  const totalPages = useMemo(() => Math.ceil(total / size), [total, size]);
  const [selectedNote, setSelectedNote] = useState<NoteRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyNotes, setHistoryNotes] = useState<NoteRow[]>([]);
  const [historyNote, setHistoryNote] = useState<NoteRow | null>(null);
  const openModal = (note: NoteRow) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNote(null);
  };

  const openHistory = async (note: NoteRow) => {
    if (!note?.uuid) return;
    setHistoryNote(note);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryNotes([]);
    try {
      const { data } = await api.get(`/notes/${note.uuid}/history`);
      setHistoryNotes(data.rows || []);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar histórico', configNotify);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setHistoryNote(null);
    setHistoryNotes([]);
    setHistoryLoading(false);
  };

  const columns = useMemo(
    () => [
      {
        name: 'Produtor',
        cell: (row: NoteRow) =>
          row.producer?.uuid ? (
            <Link to={`/producer/${row.producer.uuid}`}>
              {row.producer?.name || row.producer?.uuid}
            </Link>
          ) : (
            '-'
          )
      },
      {
        name: 'Autor',
        selector: (row: NoteRow) => row.author?.name || '-',
        wrap: true
      },
      {
        name: 'Data',
        selector: (row: NoteRow) => row.created_at || '-',
        wrap: true
      },
      {
        name: 'Status',
        cell: (row: NoteRow) =>
          row.followup_status ? (
            <Badge color="info">
              {statusLabels[row.followup_status] || row.followup_status}
            </Badge>
          ) : (
            '-'
          ),
        wrap: true
      },
      {
        name: 'Resumo',
        selector: (row: NoteRow) => row.summary || '-',
        wrap: true
      },
      {
        name: 'Proxima acao',
        selector: (row: NoteRow) => row.next_action || '-',
        wrap: true
      },
      {
        name: 'Tipo',
        cell: (row: NoteRow) => (
          <Badge color={row.type === 'commercial' ? 'primary' : 'warning'}>
            {row.type === 'commercial' ? 'Comercial' : 'Administrativa'}
          </Badge>
        )
      },
      {
        name: 'Acoes',
        width: '110px',
        center: true,
        cell: (row: NoteRow) => (
          <Badge
            color="primary"
            className="view-details"
            style={{ cursor: 'pointer' }}
            onClick={() => openModal(row)}
            aria-label="Ver detalhes"
          >
            <Settings size={16} color="#fff" />
          </Badge>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true
      }
    ],
    [openModal]
  );

  const fetchManagers = async () => {
    try {
      const { data } = await api.get('/client-wallet/managers');
      setManagers(data?.managers || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotes = async (nextPage = page) => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page: nextPage, size };
      if (managerId) params.manager_id = managerId;
      if (type) params.type = type.toLowerCase();
      if (status) params.followup_status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const { data } = await api.get('/notes', { params });
      setNotes(data.rows || []);
      setTotal(data.total || 0);
      setPage(data.page || 0);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar notas', configNotify);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    fetchNotes(0);
  }, [managerId, type, status, startDate, endDate, size]);

  const handlePageChange = (nextPage: number) => {
    const zeroBased = nextPage - 1;
    if (zeroBased < 0 || zeroBased >= totalPages) return;
    fetchNotes(zeroBased);
  };

  const handleRowsPerPageChange = (newSize: number, newPage: number) => {
    const zeroBased = newPage - 1;
    setSize(newSize);
    setPage(zeroBased);
    fetchNotes(zeroBased);
  };

  return (
    <div className="notes-dashboard container-xxl">
      <Row className="mb-2">
        <Col>
          <h2 className={isDark ? 'text-white' : 'text-dark'}>Notas</h2>
        </Col>
      </Row>
      <Card>
        <CardBody>
          <Row className="gy-2 gx-2 mb-2">
            <Col xs="12" md="3" lg="2">
              <Label className="form-label">Tipo</Label>
              <Input
                type="select"
                value={type}
                onChange={(e) => setType(e.target.value as NoteType | '')}
              >
                <option value="">Todos</option>
                <option value="commercial">Comercial</option>
                <option value="administrative">Administrativa</option>
              </Input>
            </Col>
            <Col xs="12" md="3" lg="2">
              <Label className="form-label">Status follow-up</Label>
              <Input
                type="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Todos</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Input>
            </Col>
            <Col xs="12" md="6" lg="3">
              <Label className="form-label">Gerente</Label>
              <Input
                type="select"
                value={managerId || ''}
                onChange={(e) => setManagerId(e.target.value || null)}
              >
                <option value="">Todos</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </Input>
            </Col>
            <Col xs="12" md="4" lg="2">
              <Label className="form-label">Data inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col xs="12" md="4" lg="2">
              <Label className="form-label">Data final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Col>
            <Col
              xs="12"
              md="4"
              lg="3"
              className="d-flex align-items-end gap-1 flex-wrap"
            >
              <Button color="primary" onClick={() => fetchNotes(0)} disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Filtrar'}
              </Button>
              <Button
                color="secondary"
                outline
                onClick={() => {
                  setType('');
                  setStatus('');
                  setManagerId(null);
                  setStartDate('');
                  setEndDate('');
                }}
                disabled={loading}
              >
                Limpar
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <DataTable
            columns={columns}
            data={notes}
            progressPending={loading}
            progressComponent={<Spinner />}
            noDataComponent="Nenhuma nota encontrada"
            pagination
            paginationServer
            paginationTotalRows={total}
            paginationDefaultPage={page + 1}
            paginationRowsPerPageOptions={[5, 10, 20, 50]}
            paginationPerPage={size}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
            highlightOnHover
            className="react-dataTable"
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: false
            }}
          />
        </CardBody>
      </Card>

      <Modal isOpen={modalOpen} toggle={closeModal} size="lg" centered>
        <ModalHeader toggle={closeModal}>Detalhes da nota</ModalHeader>
        <ModalBody>
          {selectedNote && (
            <div className="d-grid gap-2">
              <div className="d-flex align-items-center gap-1">
                <Badge color={selectedNote.type === 'commercial' ? 'primary' : 'warning'}>
                  {selectedNote.type === 'commercial' ? 'Comercial' : 'Administrativa'}
                </Badge>
                <span className="text-muted">
                  {selectedNote.created_at || '-'} {selectedNote.author?.name ? `• ${selectedNote.author?.name}` : ''}
                </span>
              </div>

              {selectedNote.producer?.uuid && (
                <div>
                  <strong>Produtor:</strong>{' '}
                  <Link to={`/producer/${selectedNote.producer.uuid}`}>
                    {selectedNote.producer.name || selectedNote.producer.uuid}
                  </Link>
                </div>
              )}

              {selectedNote.summary && (
                <div>
                  <strong>Resumo do contato:</strong> {renderMultiline(selectedNote.summary)}
                </div>
              )}
              {selectedNote.next_action && (
                <div>
                  <strong>Próxima ação:</strong> {renderMultiline(selectedNote.next_action)}
                </div>
              )}
              {selectedNote.followup_status && (
                <div>
                  <strong>Status:</strong> {statusLabels[selectedNote.followup_status] || selectedNote.followup_status}
                </div>
              )}
              {selectedNote.next_contact_at && (
                <div>
                  <strong>Próximo contato:</strong> {selectedNote.next_contact_at}
                </div>
              )}
              {selectedNote.pending_points && (
                <div>
                  <strong>Pontos pendentes:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 0 }}>
                    {renderMultiline(selectedNote.pending_points)}
                  </p>
                </div>
              )}
              {selectedNote.additional_notes && (
                <div>
                  <strong>Observações adicionais:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 0 }}>
                    {renderMultiline(selectedNote.additional_notes)}
                  </p>
                </div>
              )}
              {selectedNote.note && (
                <div>
                  <strong>Observação livre:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 0 }}>
                    {renderMultiline(selectedNote.note)}
                  </p>
                </div>
              )}
              {hasHistory(selectedNote) && (
                <div className="mt-1">
                  <span className="text-muted">
                    Esta nota possui histórico de versões. Clique em &quot;Ver histórico&quot; para visualizar.
                  </span>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {hasHistory(selectedNote) && (
            <Button
              color="primary"
              outline
              onClick={() => selectedNote && openHistory(selectedNote)}
              disabled={!selectedNote?.uuid || historyLoading}
            >
              Ver histórico
            </Button>
          )}
          <Button color="secondary" outline onClick={closeModal}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={historyOpen} toggle={closeHistory} size="lg" centered>
        <ModalHeader toggle={closeHistory}>Histórico da nota</ModalHeader>
        <ModalBody>
          {historyLoading && (
            <div className="d-flex justify-content-center py-2">
              <Spinner />
            </div>
          )}
          {!historyLoading && historyNotes.length === 0 && hasHistory(historyNote) && (
            <p className="text-muted mb-0">Nenhuma versão encontrada.</p>
          )}
          {!historyLoading &&
            historyNotes.map((note) => (
              <Card key={`${note.uuid}-${note.version}`} className="mb-1">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center gap-1">
                      <Badge color="dark">v{note.version}</Badge>
                      {note.type && (
                        <Badge color={note.type === 'commercial' ? 'primary' : 'warning'}>
                          {note.type === 'commercial' ? 'Comercial' : 'Administrativa'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted small">{formatDateBr(note.created_at || '')}</span>
                  </div>
                  {note.summary && (
                    <div className="mb-1">
                      <strong>Resumo:</strong> {renderMultiline(note.summary)}
                    </div>
                  )}
                  {note.next_action && (
                    <div className="mb-1">
                      <strong>Próxima ação:</strong> {renderMultiline(note.next_action)}
                    </div>
                  )}
                  {note.followup_status && (
                    <div className="mb-1">
                      <strong>Status:</strong> {statusLabels[note.followup_status] || note.followup_status}
                    </div>
                  )}
                  {note.next_contact_at && (
                    <div className="mb-1">
                      <strong>Próximo contato:</strong> {formatDateBr(note.next_contact_at)}
                    </div>
                  )}
                  {note.pending_points && (
                    <div className="mb-1">
                      <strong>Pontos pendentes:</strong> {renderMultiline(note.pending_points)}
                    </div>
                  )}
                  {note.additional_notes && (
                    <div className="mb-1">
                      <strong>Observações adicionais:</strong> {renderMultiline(note.additional_notes)}
                    </div>
                  )}
                  {note.note && (
                    <div className="mb-0">
                      <strong>Observação livre:</strong> {renderMultiline(note.note)}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={closeHistory}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default NotesDashboard;
