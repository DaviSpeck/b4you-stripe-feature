import { FC, useState, useEffect } from 'react';
import { Card, CardBody, Button, Badge, Spinner, Alert } from 'reactstrap';
import { AlertCircle, Settings } from 'react-feather';
import moment from 'moment';
import { api } from '../../services/api';
import ConfirmAction from '../components/ConfirmAction.jsx';
import * as XLSX from 'xlsx';
import { useSkin } from '../../utility/hooks/useSkin';
import memoizeOne from 'memoize-one';
import {
  Column,
  FilterState,
  Producer,
} from '../../interfaces/awards.interface';
import { FormatBRL } from '../../utility/Utils';
import {
  AwardsHeader,
  MilestoneNavigation,
  AwardsFilters,
  AwardsTabs,
  CreateAwardModal,
  EditAwardModal,
  UploadAwardModal,
} from '../../components/awards';
import { Link } from 'react-router-dom';

const getProducerData = (producer: Producer) => {
  if (producer.producer) {
    return {
      id: producer.producer.id,
      uuid: producer.producer.uuid,
      full_name: producer.producer.full_name,
      email: producer.producer.email,
      phone: producer.producer.phone,
    };
  }
  return {
    id: producer.id,
    uuid: producer.uuid || '',
    full_name: producer.full_name,
    email: producer.email,
    phone: producer.phone,
  };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const createColumns = (
  handleEditProducer: (producer: Producer) => void,
): Column[] => [
  {
    name: 'Produtor',
    cell: (row: Producer) => {
      const producerData = getProducerData(row);
      return (
        <div className="text-capitalize">
          {producerData.uuid ? (
            <Link
              to={`/producer/${producerData.uuid}`}
              className="text-primary text-decoration-none"
              style={{ cursor: 'pointer' }}
            >
              <strong>{producerData.full_name}</strong>
            </Link>
          ) : (
            <strong>{producerData.full_name}</strong>
          )}
        </div>
      );
    },
  },
  {
    name: 'Email',
    cell: (row: Producer) => {
      const producerData = getProducerData(row);
      return (
        <a
          href={`mailto:${producerData.email}`}
          className="text-info text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          <small>{producerData.email}</small>
        </a>
      );
    },
  },
  {
    name: 'Telefone',
    cell: (row: Producer) => {
      const producerData = getProducerData(row);
      return (
        <a
          href={`https://wa.me/55${producerData.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-success text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          <small>{producerData.phone}</small>
        </a>
      );
    },
  },
  {
    name: 'Faturamento',
    cell: (row: Producer) => (
      <span className="fw-bold">
        {FormatBRL((row as any).user_total_comission || 0)}
      </span>
    ),
  },
  {
    name: 'Data Alcançada',
    cell: (row: Producer) => <small>{formatDate(row.achieved_date)}</small>,
  },
  {
    name: 'Status',
    cell: (row: Producer) => (
      <Badge color="warning" pill>
        Pendente
      </Badge>
    ),
  },
  {
    name: 'Ações',
    center: true,
    cell: (row: Producer) => (
      <Badge
        color="primary"
        size="sm"
        onClick={() => handleEditProducer(row)}
        style={{ cursor: 'pointer' }}
        className="d-flex align-items-center"
      >
        <Settings size={20} />
      </Badge>
    ),
  },
];

const createSentColumns = (
  handleEditProducer: (producer: Producer) => void,
): Column[] => [
  {
    name: 'Produtor',
    cell: (row: Producer) => {
      const producerData = getProducerData(row);
      return (
        <div className="text-capitalize">
          {producerData.uuid ? (
            <Link
              to={`/producer/${producerData.uuid}`}
              className="text-primary text-decoration-none"
              style={{ cursor: 'pointer' }}
            >
              <strong>{producerData.full_name}</strong>
            </Link>
          ) : (
            <strong>{producerData.full_name}</strong>
          )}
        </div>
      );
    },
    width: '15%',
  },
  {
    name: 'Email',
    cell: (row: Producer) => {
      const producerData = getProducerData(row);
      return (
        <a
          href={`mailto:${producerData.email}`}
          className="text-info text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          <small>{producerData.email}</small>
        </a>
      );
    },
    width: '15%',
  },
  {
    name: 'Telefone',
    cell: (row: Producer) => {
      const producerData = getProducerData(row);
      return (
        <a
          href={`https://wa.me/55${producerData.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-success text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          <small>{producerData.phone}</small>
        </a>
      );
    },
    width: '15%',
  },
  {
    name: 'Data Alcançada',
    cell: (row: Producer) => <small>{formatDate(row.achieved_date)}</small>,
    width: '10%',
  },
  {
    name: 'Data Enviado',
    cell: (row: Producer) => (
      <small>{row.sent_date && formatDate(row.sent_date)}</small>
    ),
    width: '10%',
  },
  {
    name: 'Rastreamento',
    cell: (row: Producer) => (
      <div className="d-flex flex-column">
        <small className="mb-1">
          {row.tracking_code?.trim() ? (
            <a
              href={row.tracking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              <small className="text-primary">{row.tracking_code}</small>
            </a>
          ) : (
            <small>-</small>
          )}
        </small>
      </div>
    ),
    width: '15%',
  },
  {
    name: 'Status',
    cell: (row: Producer) => (
      <Badge color="success" pill>
        Enviado
      </Badge>
    ),
    width: '10%',
  },
  {
    name: 'Ações',
    center: true,
    cell: (row: Producer) => (
      <Badge
        color="primary"
        size="sm"
        onClick={() => handleEditProducer(row)}
        style={{ cursor: 'pointer' }}
        className="d-flex align-items-center"
      >
        <Settings size={20} />
      </Badge>
    ),
    width: '5%',
  },
];

const Awards: FC = () => {
  const { skin } = useSkin();
  const [filter, setFilter] = useState<FilterState>({
    calendar: [],
  });
  const [debouncedDateFilter, setDebouncedDateFilter] = useState<Date[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('10K');
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [awardsData, setAwardsData] = useState<
    Record<
      string,
      {
        pending: Producer[];
        sent: Producer[];
        pendingCount: number;
        sentCount: number;
      }
    >
  >({});
  const [pageSize, setPageSize] = useState<number>(10);
  const [pendingPage, setPendingPage] = useState<number>(0);
  const [sentPage, setSentPage] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    producer_uuid: '',
    producer_email: '',
    tracking_code: '',
    tracking_link: '',
    status: 'pending' as 'pending' | 'sent',
  });
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [blocking, setBlocking] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    milestone: '',
    achieved_date: '',
    tracking_code: '',
    tracking_link: '',
    status: 'pending' as 'pending' | 'sent',
    sent_date: '',
  });
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadEmails, setUploadEmails] = useState<string[]>([]);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [pendingDelete, setPendingDelete] = useState<Producer | null>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState<boolean>(false);

  const milestones = ['10K', '50K', '500K', '1M', '5M', '10M'];

  const sanitizeTracking = (v?: string) => {
    const s = (v || '').trim();
    return s === '' ? null : s;
  };

  const loadAwardsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const milestone = selectedMilestone;
      const paramsPending: any = {
        milestone,
        status: 'pending',
        page: pendingPage,
        size: pageSize,
      };
      const paramsSent: any = {
        milestone,
        status: 'sent',
        page: sentPage,
        size: pageSize,
      };
      if (debouncedSearchText?.trim()) {
        paramsPending.input = debouncedSearchText.trim();
        paramsSent.input = debouncedSearchText.trim();
      }
      if (
        debouncedDateFilter &&
        debouncedDateFilter.length === 2 &&
        debouncedDateFilter[0] &&
        debouncedDateFilter[1] &&
        moment(debouncedDateFilter[0]).isValid() &&
        moment(debouncedDateFilter[1]).isValid()
      ) {
        const startDate = moment(debouncedDateFilter[0]).format('YYYY-MM-DD');
        const endDate = moment(debouncedDateFilter[1]).format('YYYY-MM-DD');
        paramsPending.start_date = startDate;
        paramsPending.end_date = endDate;
        paramsSent.start_date = startDate;
        paramsSent.end_date = endDate;
      }

      const [pendingResponse, sentResponse] = await Promise.all([
        api.get(`/award-shipments`, { params: paramsPending }),
        api.get(`/award-shipments`, { params: paramsSent }),
      ]);

      setAwardsData((prev) => ({
        ...prev,
        [milestone]: {
          pending: pendingResponse.data.rows || [],
          sent: sentResponse.data.rows || [],
          pendingCount: pendingResponse.data.count || 0,
          sentCount: sentResponse.data.count || 0,
        },
      }));
    } catch (err) {
      setError('Erro ao carregar dados das premiações. Tente novamente.');
      console.error('Erro ao carregar premiações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        filter.calendar &&
        filter.calendar.length === 2 &&
        filter.calendar[0] &&
        filter.calendar[1] &&
        moment(filter.calendar[0]).isValid() &&
        moment(filter.calendar[1]).isValid()
      ) {
        setDebouncedDateFilter(filter.calendar);
      } else {
        setDebouncedDateFilter([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filter.calendar]);

  useEffect(() => {
    loadAwardsData();
  }, [
    selectedMilestone,
    pendingPage,
    sentPage,
    debouncedSearchText,
    debouncedDateFilter,
  ]);

  const currentMilestoneData = awardsData[selectedMilestone] || {
    pending: [],
    sent: [],
    pendingCount: 0,
    sentCount: 0,
  };
  const pendingProducers = currentMilestoneData.pending;
  const sentProducers = currentMilestoneData.sent;
  const pendingTotal = currentMilestoneData.pendingCount || 0;
  const sentTotal = currentMilestoneData.sentCount || 0;

  const createAward = async () => {
    if (!createForm.producer_uuid.trim() && !createForm.producer_email.trim()) {
      setError('UUID ou email do produtor é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const trackingCodeSan = sanitizeTracking(createForm.tracking_code);
      const trackingLinkSan = sanitizeTracking(createForm.tracking_link);
      const autoStatus: 'pending' | 'sent' =
        trackingCodeSan && trackingLinkSan ? 'sent' : 'pending';
      const computedSentDate = autoStatus === 'sent' ? now : undefined;
      const awardData: any = {
        ...(createForm.producer_uuid.trim() && {
          producer_uuid: createForm.producer_uuid.trim(),
        }),
        ...(createForm.producer_email.trim() && {
          producer_email: createForm.producer_email.trim(),
        }),
        milestone: selectedMilestone,
        achieved_date: now,
        status: autoStatus,
        sent_date: computedSentDate,
      };

      if (trackingCodeSan !== null) awardData.tracking_code = trackingCodeSan;
      if (trackingLinkSan !== null) awardData.tracking_link = trackingLinkSan;

      await api.post('/award-shipments', awardData);

      await loadAwardsData();

      setShowCreateModal(false);
      setCreateForm({
        producer_uuid: '',
        producer_email: '',
        tracking_code: '',
        tracking_link: '',
        status: 'pending',
      });

      setError(null);
    } catch (err) {
      console.error('Erro completo:', err.response?.data || err.message);
      setError(
        `Erro ao criar premiação: ${
          err.response?.data?.message || err.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const clearCreateModal = () => {
    setCreateForm({
      producer_uuid: '',
      producer_email: '',
      tracking_code: '',
      tracking_link: '',
      status: 'pending',
    });
    setError(null);
  };

  const handleEditProducer = (producer: Producer) => {
    setEditingProducer(producer);
    setEditForm({
      milestone: producer.milestone,
      achieved_date: producer.achieved_date.split('T')[0],
      tracking_code: producer.tracking_code || '',
      tracking_link: producer.tracking_link || '',
      status: producer.status,
      sent_date: producer.sent_date ? producer.sent_date.split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const updateAward = async () => {
    if (!editingProducer) return;

    setLoading(true);
    setError(null);
    try {
      const trackingCodeSan = sanitizeTracking(editForm.tracking_code);
      const trackingLinkSan = sanitizeTracking(editForm.tracking_link);
      if (editingProducer.status === 'pending') {
        const confirmData: any = {};
        if (trackingCodeSan !== null)
          confirmData.tracking_code = trackingCodeSan;
        if (trackingLinkSan !== null)
          confirmData.tracking_link = trackingLinkSan;
        await api.patch(
          `/award-shipments/${editingProducer.id}/confirm`,
          confirmData,
        );
      } else {
        const updateData: any = {};
        if (trackingCodeSan !== null)
          updateData.tracking_code = trackingCodeSan;
        if (trackingLinkSan !== null)
          updateData.tracking_link = trackingLinkSan;
        await api.patch(`/award-shipments/${editingProducer.id}`, updateData);
      }

      await loadAwardsData();

      setShowEditModal(false);
      setEditingProducer(null);
      setError(null);
    } catch (err) {
      console.error(
        'Erro ao processar premiação:',
        err.response?.data || err.message,
      );
      setError(
        `Erro ao processar premiação: ${
          err.response?.data?.message || err.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const blockProducer = async () => {
    if (!editingProducer) return;
    const producerData = getProducerData(editingProducer);
    setBlocking(true);
    setError(null);
    try {
      if (!producerData.uuid) {
        throw new Error('UUID do produtor não encontrado para bloqueio.');
      }
      await api.patch(`/users/${producerData.uuid}/awards/block`);
      await loadAwardsData();
      setShowEditModal(false);
      setEditingProducer(null);
    } catch (err: any) {
      console.error(
        'Erro ao bloquear produtor:',
        err.response?.data || err.message,
      );
      setError(
        `Erro ao bloquear produtor: ${
          err.response?.data?.message || err.message
        }`,
      );
    } finally {
      setBlocking(false);
    }
  };

  const deleteAward = async (producer: Producer) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/award-shipments/${producer.id}`);

      await loadAwardsData();

      if (showEditModal) {
        setShowEditModal(false);
        clearEditModal();
      }

      setError(null);
    } catch (err) {
      console.error(
        'Erro ao excluir premiação:',
        err.response?.data || err.message,
      );
      setError(
        `Erro ao excluir premiação: ${
          err.response?.data?.message || err.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (producer: Producer) => {
    setPendingDelete(producer);
    setShowDeleteConfirm(true);
  };

  const clearEditModal = () => {
    setEditForm({
      milestone: '',
      achieved_date: '',
      tracking_code: '',
      tracking_link: '',
      status: 'pending',
      sent_date: '',
    });
    setEditingProducer(null);
    setError(null);
  };

  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const emails: string[] = [];
        jsonData.forEach((row: any[]) => {
          if (row[0] && typeof row[0] === 'string' && row[0].includes('@')) {
            emails.push(row[0].trim());
          }
        });

        setUploadEmails(emails);
        setError(null);
      } catch (err) {
        setError('Erro ao processar arquivo Excel. Verifique o formato.');
        console.error('Erro ao processar Excel:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (uploadEmails.length === 0) {
      setError('Nenhum email válido encontrado no arquivo.');
      return;
    }

    setUploadLoading(true);
    setError(null);
    setUploadResults(null);

    try {
      const results = {
        success: 0,
        errors: [] as string[],
      };

      for (const email of uploadEmails) {
        try {
          const now = new Date();
          const awardData = {
            producer_email: email,
            milestone: selectedMilestone,
            achieved_date: now,
            status: 'pending',
          };

          await api.post('/award-shipments', awardData);
          results.success++;
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message || err.message || 'Erro desconhecido';
          results.errors.push(`${email}: ${errorMessage}`);
        }
      }

      setUploadResults(results);

      if (results.success > 0) {
        await loadAwardsData();
      }

      if (results.errors.length === 0) {
        setTimeout(() => {
          setShowUploadModal(false);
          clearUploadModal();
        }, 2000);
      }
    } catch (err) {
      setError('Erro ao processar upload em lote. Tente novamente.');
      console.error('Erro no upload em lote:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const clearUploadModal = () => {
    setUploadEmails([]);
    setUploadResults(null);
    setError(null);
  };

  const handlePendingPageChange = (page: number) => {
    setPendingPage(page - 1);
  };

  const handlePendingRowsPerPageChange = (newPerPage: number, page: number) => {
    setPageSize(newPerPage);
    setPendingPage(page - 1);
  };

  const handleSentPageChange = (page: number) => {
    setSentPage(page - 1);
  };

  const handleSentRowsPerPageChange = (newPerPage: number, page: number) => {
    setPageSize(newPerPage);
    setSentPage(page - 1);
  };

  const handleDateChange = (dates: Date[]) => {
    setFilter((prev) => ({ ...prev, calendar: dates }));
    if (
      dates &&
      dates.length === 2 &&
      dates[0] &&
      dates[1] &&
      moment(dates[0]).isValid() &&
      moment(dates[1]).isValid()
    ) {
      setPendingPage(0);
      setSentPage(0);
    }
  };

  const setQuickRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    setFilter((prev) => ({ ...prev, calendar: [startDate, endDate] }));
    setPendingPage(0);
    setSentPage(0);
  };

  return (
    <div>
      {/* Header */}
      <AwardsHeader
        onUploadClick={() => setShowUploadModal(true)}
        onCreateClick={() => setShowCreateModal(true)}
      />

      {/* Error Alert */}
      {error && (
        <Alert color="danger" className="mb-4">
          <AlertCircle size={16} className="me-2" />
          {error}
        </Alert>
      )}

      {/* Milestone Navigation */}
      <MilestoneNavigation
        milestones={milestones}
        selectedMilestone={selectedMilestone}
        onMilestoneChange={(milestone) => {
          setSelectedMilestone(milestone);
          setPendingPage(0);
          setSentPage(0);
        }}
      />

      {/* Main Content - Tabela com Tabs */}
      <Card>
        <CardBody>
          <AwardsFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingTotal={pendingTotal}
            sentTotal={sentTotal}
            filter={filter}
            onDateChange={handleDateChange}
            onQuickRange={setQuickRange}
            onClearFilter={() =>
              setFilter((prev) => ({ ...prev, calendar: [] }))
            }
            searchText={searchText}
            onSearchChange={(text) => {
              setSearchText(text);
              setPendingPage(0);
              setSentPage(0);
            }}
          />

          <AwardsTabs
            activeTab={activeTab}
            pendingProducers={pendingProducers}
            sentProducers={sentProducers}
            pendingTotal={pendingTotal}
            sentTotal={sentTotal}
            loading={loading}
            skin={skin}
            pendingColumns={memoizeOne(() =>
              createColumns(handleEditProducer),
            )()}
            sentColumns={memoizeOne(() =>
              createSentColumns(handleEditProducer),
            )()}
            onPendingPageChange={handlePendingPageChange}
            onPendingRowsPerPageChange={handlePendingRowsPerPageChange}
            onSentPageChange={handleSentPageChange}
            onSentRowsPerPageChange={handleSentRowsPerPageChange}
          />
        </CardBody>
      </Card>

      {/* Create Award Modal */}
      <CreateAwardModal
        isOpen={showCreateModal}
        onToggle={() => {
          setShowCreateModal(false);
          clearCreateModal();
        }}
        selectedMilestone={selectedMilestone}
        createForm={createForm}
        onFormChange={(field, value) =>
          setCreateForm({ ...createForm, [field]: value })
        }
        onCreateAward={createAward}
        loading={loading}
      />

      {/* Edit Award Modal */}
      <EditAwardModal
        isOpen={showEditModal}
        onToggle={() => {
          setShowEditModal(false);
          clearEditModal();
        }}
        editingProducer={editingProducer}
        editForm={editForm}
        onFormChange={(field, value) =>
          setEditForm({ ...editForm, [field]: value })
        }
        onUpdateAward={updateAward}
        onDeleteAward={() =>
          editingProducer && openDeleteConfirm(editingProducer)
        }
        onBlockAward={() => setShowBlockConfirm(true)}
        blocking={blocking}
        loading={loading}
        getProducerData={getProducerData}
      />

      {/* Confirm Delete Modal */}
      {pendingDelete && (
        <ConfirmAction
          show={showDeleteConfirm}
          setShow={setShowDeleteConfirm}
          footer={false}
          centered
          simpleConfirm
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir a premiação de ${
            getProducerData(pendingDelete).full_name
          }?`}
          textAlert="Essa operação não poderá ser desfeita."
          buttonText="Excluir"
          handleAction={async () => {
            if (!pendingDelete) return;
            await deleteAward(pendingDelete);
            setShowDeleteConfirm(false);
            setPendingDelete(null);
          }}
        />
      )}

      {/* Confirm Block Modal */}
      {editingProducer && (
        <ConfirmAction
          show={showBlockConfirm}
          setShow={setShowBlockConfirm}
          footer={false}
          centered
          simpleConfirm
          title="Confirmar bloqueio"
          description={`Tem certeza que deseja bloquear ${
            getProducerData(editingProducer).full_name
          } para premiações? Ele não poderá mais receber novas premiações. Para desbloquear, acesse a aba do produtor.`}
          buttonText="Bloquear"
          handleAction={async () => {
            await blockProducer();
            setShowBlockConfirm(false);
          }}
        />
      )}

      {/* Upload Modal */}
      <UploadAwardModal
        isOpen={showUploadModal}
        onToggle={() => {
          setShowUploadModal(false);
          clearUploadModal();
        }}
        selectedMilestone={selectedMilestone}
        uploadEmails={uploadEmails}
        uploadResults={uploadResults}
        uploadLoading={uploadLoading}
        onFileChange={(file) => {
          processExcelFile(file);
        }}
        onBulkUpload={handleBulkUpload}
      />
    </div>
  );
};

export default Awards;
