import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  Col,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormFeedback,
  Spinner
} from 'reactstrap';
import { api } from '../../services/api';
import { configNotify } from '../../configs/toastConfig';
import { toast } from 'react-toastify';
import { Trash } from 'react-feather';
import { useSkin } from '../../utility/hooks/useSkin';

const statusLabels = {
  in_progress: 'Em andamento',
  done: 'Concluído',
  awaiting_producer: 'Aguardando produtor',
  awaiting_internal: 'Aguardando interno',
  resolved: 'Resolvido',
  left_platform: 'Saiu da plataforma'
};

const SHORT_TEXT_LIMIT = 200;
const LONG_TEXT_LIMIT = 800;
const SHORT_DISPLAY_LIMIT = 200;
const LONG_DISPLAY_LIMIT = 300;

const truncateText = (value, limit) => {
  if (!value) return '';
  const text = String(value);
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
};

const formatDateBr = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('/')) {
    return value.split(' ')[0];
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
};

const formatDateInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('/')) {
    const [day, month, year] = value.split(' ')[0].split('/');
    if (day && month && year) return `${year}-${month}-${day}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const iso = d.toISOString();
  return iso.substring(0, 10);
};

const renderMultiline = (value) => {
  if (!value) return null;
  const normalized = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{normalized}</div>;
};

const ModalNotes = ({ show, setShow, user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { skin } = useSkin();

  const [activeTab, setActiveTab] = useState('commercial');
  const [noteType, setNoteType] = useState('');
  const [summary, setSummary] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [pendingPoints, setPendingPoints] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [followupStatus, setFollowupStatus] = useState('');
  const [nextContactAt, setNextContactAt] = useState('');
  const [noteText, setNoteText] = useState('');
  const [editingUuid, setEditingUuid] = useState(null);
  const [page, setPage] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyNotes, setHistoryNotes] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [touchedSummary, setTouchedSummary] = useState(false);
  const [touchedNextAction, setTouchedNextAction] = useState(false);
  const [touchedNextContact, setTouchedNextContact] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const pageSize = 5;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextContactDate = nextContactAt ? new Date(nextContactAt) : null;
  const nextContactInvalid = !!(nextContactDate && nextContactDate < today);
  const nextContactRequired = ['in_progress', 'awaiting_producer', 'awaiting_internal'].includes(followupStatus);
  const nextContactMissing = nextContactRequired && !nextContactAt;

  const summaryRemaining = Math.max(0, LONG_TEXT_LIMIT - summary.length);
  const nextActionRemaining = Math.max(0, SHORT_TEXT_LIMIT - nextAction.length);
  const pendingRemaining = Math.max(0, LONG_TEXT_LIMIT - pendingPoints.length);
  const additionalRemaining = Math.max(0, LONG_TEXT_LIMIT - additionalNotes.length);
  const noteRemaining = Math.max(0, LONG_TEXT_LIMIT - noteText.length);

  const summaryInvalid = noteType === 'commercial' && !summary.trim();
  const nextActionInvalid = noteType === 'commercial' && !nextAction.trim();
  const summaryError =
    summaryInvalid && (submitAttempted || touchedSummary) ? 'Preenchimento obrigatório' : '';
  const nextActionError =
    nextActionInvalid && (submitAttempted || touchedNextAction) ? 'Preenchimento obrigatório' : '';
  const nextContactError =
    (submitAttempted || touchedNextContact)
      ? nextContactInvalid
        ? 'Data do próximo contato não pode ser no passado.'
        : nextContactMissing
        ? 'Preenchimento obrigatório'
        : ''
      : '';

  const isCreateDisabled =
    !noteType ||
    (noteType === 'commercial' && (!summary.trim() || !nextAction.trim())) ||
    nextContactInvalid || nextContactMissing;

  const fetchDataNotes = (nextPage = page) => {
    setLoading(true);
    api
      .get(`users/${user.uuid}/notes`, {
        params: { type: activeTab, page: nextPage, size: pageSize }
      })
      .then((r) => {
        setNotes(r.data?.rows || []);
        setTotal(r.data?.total || 0);
        setPage(r.data?.page || 0);
      })
      .catch(() => toast.error('Erro ao carregar notas', configNotify))
      .finally(() => {
        setLoading(false);
      });
  };

  const openHistory = (note) => {
    if (!note?.uuid) return;
    setSelectedHistory(note);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryNotes([]);
    api
      .get(`users/${user.uuid}/notes/${note.uuid}/history`)
      .then((r) => {
        setHistoryNotes(r.data?.rows || []);
      })
      .catch(() => toast.error('Erro ao carregar histórico', configNotify))
      .finally(() => setHistoryLoading(false));
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedHistory(null);
    setHistoryNotes([]);
    setHistoryLoading(false);
  };

  const startEdit = (note) => {
    setActiveTab(note.type === 'administrative' ? 'administrative' : 'commercial');
    setNoteType(note.type);
    setEditingUuid(note.uuid || null);
    setSummary(note.summary || '');
    setNextAction(note.next_action || '');
    setPendingPoints(note.pending_points || '');
    setAdditionalNotes(note.additional_notes || '');
    setFollowupStatus(note.followup_status || '');
    setNextContactAt(formatDateInput(note.next_contact_at));
    setNoteText(note.note || '');
    setTouchedSummary(false);
    setTouchedNextAction(false);
    setTouchedNextContact(false);
    setSubmitAttempted(false);
  };

  const resetForm = () => {
    setNoteType('');
    setSummary('');
    setNextAction('');
    setPendingPoints('');
    setAdditionalNotes('');
    setFollowupStatus('');
    setNextContactAt('');
    setNoteText('');
    setEditingUuid(null);
    setTouchedSummary(false);
    setTouchedNextAction(false);
    setTouchedNextContact(false);
    setSubmitAttempted(false);
  };

  useEffect(() => {
    setTouchedSummary(false);
    setTouchedNextAction(false);
    setTouchedNextContact(false);
    setSubmitAttempted(false);
  }, [noteType]);

  useEffect(() => {
    if (nextContactRequired && !nextContactAt) {
      setTouchedNextContact(true);
    }
  }, [nextContactRequired, nextContactAt]);

  const newNote = () => {
    setSubmitAttempted(true);
    if (!noteType) {
      toast.warn('Selecione o tipo da nota antes de salvar.', configNotify);
      return;
    }
    if (summary.length > SHORT_TEXT_LIMIT) {
      toast.warn(`Resumo do contato deve ter no máximo ${SHORT_TEXT_LIMIT} caracteres.`, configNotify);
      return;
    }

    if (nextAction.length > SHORT_TEXT_LIMIT) {
      toast.warn(`Próxima ao (follow-up) deve ter no máximo ${SHORT_TEXT_LIMIT} caracteres.`, configNotify);
      return;
    }
    if (pendingPoints.length > LONG_TEXT_LIMIT) {
      toast.warn(`Pontos pendentes deve ter no máximo ${LONG_TEXT_LIMIT} caracteres.`, configNotify);
      return;
    }
    if (additionalNotes.length > LONG_TEXT_LIMIT) {
      toast.warn(`Observações adicionais deve ter no máximo ${LONG_TEXT_LIMIT} caracteres.`, configNotify);
      return;
    }
    if (noteText.length > LONG_TEXT_LIMIT) {
      toast.warn(`Observação livre deve ter no máximo ${LONG_TEXT_LIMIT} caracteres.`, configNotify);
      return;
    }
    if (nextContactMissing) {
      toast.warn('Data do próximo contato e obrigatória para este status.', configNotify);
      return;
    }
    if (nextContactInvalid) {
      toast.warn('Data do próximo contato não pode ser no passado.', configNotify);
      return;
    }
    const payload = {
      note: noteText,
      note_uuid: editingUuid,
      type: noteType,
      summary,
      next_action: nextAction,
      pending_points: pendingPoints,
      additional_notes: additionalNotes,
      followup_status: followupStatus,
      next_contact_at: nextContactAt || null
    };

    if (noteType === 'commercial') {
      if (!summary.trim() || !nextAction.trim()) {
        toast.warn('Preenchimento obrigatório.', configNotify);
        return;
      }
    }

    api
      .post(`users/${user.uuid}/notes`, payload)
      .then(() => {
        fetchDataNotes();
        toast.success(`Nota criada com sucesso`, configNotify);
        resetForm();
      })
      .catch((e) => {
        const msg = e?.response?.data?.message || 'Falha ao criar nota';
        toast.error(msg, configNotify);
      });
  };

  const deleteNote = () => {
    if (!noteToDelete) return;
    setDeleting(true);
    api
      .delete(`users/${user.uuid}/notes/${noteToDelete.id}`)
      .then(() => {
        toast.success('Nota removida com sucesso', configNotify);
        fetchDataNotes();
        setNoteToDelete(null);
      })
      .catch(() => {
        toast.error('Falha ao remover nota', configNotify);
      })
      .finally(() => setDeleting(false));
  };

  useEffect(() => {
    if (show) {
      fetchDataNotes(0);
    }
  }, [show, activeTab]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
        <Modal
          isOpen={show}
          toggle={() => {
            setShow(false);
          }}
          centered
          size="lg"
        >
          <ModalHeader toggle={() => setShow(!show)}>Notas</ModalHeader>
          <ModalBody>
          <Nav tabs className="mb-2">
            <NavItem>
              <NavLink
                href="#"
                active={activeTab === 'commercial'}
                onClick={() => setActiveTab('commercial')}
              >
                Notas Comerciais
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                active={activeTab === 'administrative'}
                onClick={() => setActiveTab('administrative')}
              >
                Notas Administrativas
              </NavLink>
            </NavItem>
          </Nav>

          <div className="mb-2">
            <Label className="form-label">Tipo da nota*</Label>
            <Input
              type="select"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="commercial">Comercial</option>
              <option value="administrative">Administrativa</option>
            </Input>
            {editingUuid && <small className="text-muted d-block mt-1">Editando nota existente (será criada nova versão).</small>}
          </div>

          {noteType === 'commercial' && (
            <>
              <Row className="mt-1">
                <Col md="6">
                  <Label className="form-label">Status do follow-up</Label>
                  <Input
                    type="select"
                    value={followupStatus}
                    onChange={(e) => setFollowupStatus(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md="6">
                  <Label className="form-label">Data do próximo contato</Label>
                  <Input
                    type="date"
                    value={nextContactAt}
                    onChange={(e) => {
                      setTouchedNextContact(true);
                      setNextContactAt(e.target.value);
                    }}
                    onBlur={() => setTouchedNextContact(true)}
                    invalid={!!nextContactError}
                  />
                  {nextContactError && <FormFeedback>{nextContactError}</FormFeedback>}
                </Col>
              </Row>
              <div className="mt-1">                
                  <Label className="form-label">Próxima ação (follow-up)</Label>
                  <Input
                    value={nextAction}
                    onChange={(e) => {
                      setTouchedNextAction(true);
                      setNextAction(e.target.value);
                    }}
                    onBlur={() => setTouchedNextAction(true)}
                    placeholder='Descreva qual será o próximo passo, definido na conversa com o produtor.'
                    maxLength={SHORT_TEXT_LIMIT}
                    invalid={!!nextActionError}
                  />
                  {nextActionError && <FormFeedback>{nextActionError}</FormFeedback>}
                  <div className="text-end text-muted small">
                    {nextActionRemaining} caracteres restantes
                  </div>             
              </div>
              <div className="mt-1">
                <Label className="form-label">Resumo do contato*</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={summary}
                  onChange={(e) => {
                      setTouchedSummary(true);
                      setSummary(e.target.value);
                  }}
                  maxLength={LONG_TEXT_LIMIT}
                  invalid={!!summaryError}
                  onBlur={() => setTouchedSummary(true)}
                  placeholder="Explique o contexto geral do atendimento (situação atual do produtor)."
                />
                  {summaryError && <FormFeedback>{summaryError}</FormFeedback>}
                  <div className="text-end text-muted small">
                    {summaryRemaining} caracteres restantes
                  </div>
              </div>
              <div className="mt-1">
                <Label className="form-label">Pontos pendentes</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={pendingPoints}
                  onChange={(e) => setPendingPoints(e.target.value)}
                  placeholder='Itens que precisam de resolução ou acompanhamento.'
                  maxLength={LONG_TEXT_LIMIT}
                />
                <div className="text-end text-muted small">
                  {pendingRemaining} caracteres restantes
                </div>
              </div>
              <div className="mt-1">
                <Label className="form-label">Observações adicionais</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder='Informações complementares relevantes sobre este atendimento.'
                  maxLength={LONG_TEXT_LIMIT}
                />
                <div className="text-end text-muted small">
                  {additionalRemaining} caracteres restantes
                </div>
              </div>
            </>
          )}

          {noteType && (
            <>
              {noteType === 'administrative' ? (
                <div className="mt-2">
                  <Label className="form-label">Nota administrativa</Label>
                  <Input
                    type="textarea"
                    rows="4"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    maxLength={LONG_TEXT_LIMIT}
                  />
                  <div className="text-end text-muted small">
                    {noteRemaining} caracteres restantes
                  </div>
                  <div className="d-flex w-100 justify-content-end">
                    <Button color="primary" className="mt-2" onClick={newNote} disabled={isCreateDisabled}>
                      {editingUuid ? 'Salvar edição' : 'Criar nota'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="d-flex w-100 justify-content-end mt-2">
                  <Button color="primary" onClick={newNote} disabled={isCreateDisabled}>
                    {editingUuid ? 'Salvar edição' : 'Criar nota'}
                  </Button>
                </div>
              )}
            </>
          )}
          <div className="mt-3">
            {loading && <p>Carregando notas...</p>}
            {!loading && notes.length === 0 && (
              <p className="text-muted">Nenhuma nota encontrada</p>
            )}
            {notes.map((item) => (
                <Card
                  key={item.id}
                  className="p-2"
                  style={{ 
                    background: skin === 'dark' ? `#171c28` : `#f8f9fa`, 
                    color: skin === 'dark' ? `#eee` : `#212529`,
                    border: skin === 'dark' ? 'none' : '1px solid #dee2e6'
                  }}
                >
                  <CardBody>
                    <CardTitle>Nota</CardTitle>
                    <CardSubtitle>
                      {item.user_backoffice.full_name} - {formatDateBr(item.created_at)}
                    </CardSubtitle>
                  {item.type && (
                    <Badge color={item.type === 'commercial' ? 'primary' : 'warning'}>
                      {item.type === 'commercial' ? 'Comercial' : 'Administrativa'}
                    </Badge>
                  )}
                  {item.summary && (
                    <p className="mt-1 mb-0">
                      <strong>Resumo:</strong> {truncateText(item.summary, SHORT_DISPLAY_LIMIT)}
                    </p>
                  )}
                  {item.next_action && (
                    <p className="mb-0">
                      <strong>Próxima ação:</strong> {truncateText(item.next_action, SHORT_DISPLAY_LIMIT)}
                    </p>
                  )}
                  {item.followup_status && (
                    <p className="mb-0">
                      <strong>Status:</strong> {statusLabels[item.followup_status] || item.followup_status}
                    </p>
                  )}
                  {item.next_contact_at && (
                    <p className="mb-0">
                      <strong>Próximo contato:</strong> {formatDateBr(item.next_contact_at)}
                    </p>
                  )}
                  {item.pending_points && (
                    <div className="mb-0">
                      <strong>Pontos pendentes:</strong> {renderMultiline(item.pending_points)}
                    </div>
                  )}
                  {item.additional_notes && (
                    <div className="mb-0">
                      <strong>Observações adicionais:</strong> {renderMultiline(item.additional_notes)}
                    </div>
                  )}
                    <div className="mt-2" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                        {renderMultiline(item.note)}
                    </div>
                    <div className="d-flex w-100 justify-content-end gap-1">
                      <Button
                        color="primary"
                        size="sm"
                        outline
                        onClick={() => startEdit(item)}
                        disabled={!item.uuid}
                      >
                        Editar
                      </Button>
                      {item.version > 1 && (
                        <Button
                          color="secondary"
                          size="sm"
                          outline
                          onClick={() => openHistory(item)}
                          disabled={!item.uuid}
                        >
                          Ver histórico
                        </Button>
                      )}
                      <Badge
                        color="danger"
                        className="view-details"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setNoteToDelete(item)}
                      >
                        <Trash size={26} />
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              ))}
            {!loading && notes.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div>
                  Página {page + 1} de {totalPages} (total {total})
                </div>
                <div>
                  <Button
                    color="secondary"
                    size="sm"
                    className="me-1"
                    disabled={page === 0}
                    onClick={() => {
                    const prev = Math.max(0, page - 1);
                    setPage(prev);
                    fetchDataNotes(prev);
                  }}
                  >
                    Anterior
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => {
                    const next = Math.min(totalPages - 1, page + 1);
                    setPage(next);
                    fetchDataNotes(next);
                  }}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              outline
              onClick={() => {
                setShow(false);
              }}
            >
              Fechar
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={!!noteToDelete} toggle={() => setNoteToDelete(null)} centered>
          <ModalHeader toggle={() => setNoteToDelete(null)}>Confirmar exclusão</ModalHeader>
          <ModalBody>Tem certeza que deseja apagar esta nota?</ModalBody>
          <ModalFooter>
            <Button color="secondary" outline onClick={() => setNoteToDelete(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button color="danger" onClick={deleteNote} disabled={deleting}>
              {deleting ? <Spinner size="sm" /> : "Apagar"}
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
            {!historyLoading && historyNotes.length === 0 && (
              <p className="text-muted mb-0">Nenhuma versão encontrada.</p>
            )}
            {!historyLoading &&
              historyNotes.map((h) => (
                <Card key={`${h.uuid}-${h.version}`} className="mb-1">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-1">
                        <Badge color="dark">v{h.version}</Badge>
                        {h.type && (
                          <Badge color={h.type === 'commercial' ? 'primary' : 'warning'}>
                            {h.type === 'commercial' ? 'Comercial' : 'Administrativa'}
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted small">{formatDateBr(h.created_at)}</span>
                    </div>

                    {h.summary && (
                      <div className="mb-1">
                        <strong>Resumo:</strong> {renderMultiline(h.summary)}
                      </div>
                    )}
                    {h.next_action && (
                      <div className="mb-1">
                        <strong>Próxima ação:</strong> {renderMultiline(h.next_action)}
                      </div>
                    )}
                    {h.followup_status && (
                      <div className="mb-1">
                        <strong>Status:</strong> {statusLabels[h.followup_status] || h.followup_status}
                      </div>
                    )}
                    {h.next_contact_at && (
                      <div className="mb-1">
                        <strong>Próximo contato:</strong> {formatDateBr(h.next_contact_at)}
                      </div>
                    )}
                    {h.pending_points && (
                      <div className="mb-1">
                        <strong>Pontos pendentes:</strong> {renderMultiline(h.pending_points)}
                      </div>
                    )}
                    {h.additional_notes && (
                      <div className="mb-1">
                        <strong>Observações adicionais:</strong> {renderMultiline(h.additional_notes)}
                      </div>
                    )}
                    {h.note && (
                      <div className="mb-0">
                        <strong>Observação livre:</strong> {renderMultiline(h.note)}
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
    </>
  );
};

export default ModalNotes;
