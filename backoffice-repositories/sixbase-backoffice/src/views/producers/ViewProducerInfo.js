import { useAbility } from '@casl/react';
import { AbilityContext } from '@src/utility/context/Can';
import {
  FormatBRL,
  formatDocument,
  formatWhatsappPhone,
  getUserData,
} from '@utils';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import {
  buildDateRangePayload,
  calculateStage,
} from '../../components/client_wallet/tabs/monitoring/utils/monitoring.utils';
import { managerStatusContactTypes } from '../../views/client_wallet/tabs/monitoring/interfaces/monitoring.interface';
import { managerPhaseTypes } from '../../views/client_wallet/tabs/management/interfaces/management.interface';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import DataTable from 'react-data-table-component';
import {
  Check,
  Clock,
  DollarSign,
  Edit2,
  Gift,
  Info,
  Lock,
  Settings,
  TrendingUp,
  Unlock,
  UserCheck,
  X,
} from 'react-feather';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Alert,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  TabContent,
  Table,
  TabPane,
} from 'reactstrap';
import '../../assets/scss/pages/producer.scss';
import '../../assets/scss/pages/producers.scss';
import { configNotify } from '../../configs/toastConfig';
import { api } from '../../services/api';
import { useSkin } from '../../utility/hooks/useSkin';
import ConfirmAction from '../components/ConfirmAction';
import ChangeFee from './ChangeFee';
import BlockNotesModal from './components/BlockNotesModal';
import FilterSales from './FilterSales';
import ModalNotes from './ModalNotes';
import { OnboardingTable } from './onboarding-table';
import ViewPagarme from './Pagarme';

// Status de contato e fases de gerenciamento importados das interfaces
// managerStatusContactTypes - importado de monitoring.interface
// managerPhaseTypes - importado de management.interface

// Constantes para Stage
const STAGE_NORMALIZE = {
  SAUDAVEL: 'HEALTHY',
  ATENCAO: 'ATTENTION',
  QUEDA: 'DROP',
  CHURN: 'CHURN',
  SAUDÁVEL: 'HEALTHY', // caso venha acento em algum ambiente
  ATENÇÃO: 'ATTENTION', // idem
};

const STAGE_LABELS = {
  HEALTHY: 'Saudável',
  ATTENTION: 'Atenção',
  DROP: 'Queda',
  CHURN: 'Churn',
};

const STAGE_COLORS = {
  HEALTHY: 'success',
  ATTENTION: 'warning',
  DROP: 'danger',
  CHURN: 'dark',
};

const displayMetrics = (metrics) => {
  const { pending, paid, refunded, chargeback, denied } = metrics;
  pending.label = 'Pendentes';
  paid.label = 'Pagas';
  refunded.label = 'Reembolsadas';
  chargeback.label = 'Chargebacks';
  denied.label = 'Negadas';
  const arr = [pending, paid, refunded, chargeback, denied];
  return (
    <div
      className="d-flex justify-content-between mt-2"
      style={{ height: '200px' }}
    >
      {arr.map((metric, index) => {
        const safePercentage = metric?.percentage || 0;
        const safeTotal = metric?.total || 0;
        const safeAmount = metric?.amount || 0;

        return (
          <div style={{ maxWidth: '110px' }} key={index}>
            <div className="text-center">{metric?.label || 'N/A'}</div>
            <div className="text-center">{safeTotal}</div>
            <div className="text-center">{FormatBRL(safeAmount)}</div>
            <CircularProgressbar
              className="mt-1"
              value={safePercentage}
              text={`${safePercentage.toFixed(2)}%`}
            />
          </div>
        );
      })}
    </div>
  );
};

const displayAwardsProgress = (awardsData, totalRevenue) => {
  const milestones = ['10K', '50K', '500K', '1M', '5M', '10M'];
  const milestoneValues = {
    '10K': 10000,
    '50K': 50000,
    '500K': 500000,
    '1M': 1000000,
    '5M': 5000000,
    '10M': 10000000,
  };

  // Encontra o próximo marco a ser alcançado baseado na receita total
  const currentMilestoneIndex = milestones.findIndex(
    (milestone) => totalRevenue < milestoneValues[milestone],
  );
  const currentMilestone =
    currentMilestoneIndex === -1
      ? milestones[milestones.length - 1]
      : milestones[currentMilestoneIndex];

  const currentMilestoneValue = milestoneValues[currentMilestone];
  const previousMilestoneValue =
    currentMilestoneIndex === 0
      ? 0
      : milestoneValues[milestones[currentMilestoneIndex - 1]];

  const progress =
    currentMilestoneIndex === -1
      ? 100
      : Math.min(
        ((totalRevenue - previousMilestoneValue) /
          (currentMilestoneValue - previousMilestoneValue)) *
        100,
        100,
      );

  return (
    <div id="progress-bar" style={{ marginBottom: '20px' }}>
      <div
        className="list-progress"
        style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
      >
        {milestones.map((milestone) => {
          const milestoneValue = milestoneValues[milestone];
          const awardData = awardsData.find(
            (award) =>
              award.milestone && award.milestone.trim() === milestone.trim(),
          );

          // Determina o status, cor da barra e descrição
          let barColor = '#e9ecef'; // Branco por padrão
          let barValue = 0;
          let statusText = '';

          // Se já atingiu este milestone
          if (totalRevenue >= milestoneValue) {
            // Se tem registro na tabela de awards
            if (awardData) {
              if (
                awardData.status &&
                awardData.status.trim().toLowerCase() === 'sent'
              ) {
                barColor = '#28a745'; // Verde para enviado
                barValue = 100;
                statusText = 'Enviado';
              } else {
                barColor = '#ffc107'; // Amarelo para pendente
                barValue = 100;
                statusText = 'Pendente';
              }
            } else {
              // Atingiu mas não tem registro na tabela - considera conquistado
              barColor = '#17a2b8'; // Azul para conquistado
              barValue = 100;
              statusText = 'Conquistado';
            }
          } else {
            // Não atingiu ainda
            const milestoneIndex = milestones.indexOf(milestone);
            const currentIndex = milestones.indexOf(currentMilestone);

            // Se é o próximo milestone a ser conquistado
            if (milestoneIndex === currentIndex) {
              barColor = '#FFA500'; // Amarelo para em progresso
              barValue = progress;
              statusText = 'Em progresso';
            }
            // Caso contrário, mantém branco (já definido acima)
          }

          return (
            <div
              key={milestone}
              className="progrees-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '60px',
              }}
            >
              {/* Valor em cima */}
              <div
                className="label"
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  textAlign: 'center',
                }}
              >
                {milestone}
              </div>

              {/* Barra pequenininha */}
              <div style={{ position: 'relative', width: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: '#e9ecef',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '4px',
                      backgroundColor: barColor,
                      width: `${barValue}%`,
                      transition: 'width 0.3s ease',
                    }}
                  ></div>
                </div>
              </div>

              {/* Descrição embaixo - sempre presente para manter alinhamento */}
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '10px',
                  color: statusText ? barColor : 'transparent',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  minHeight: '14px',
                }}
              >
                {statusText || '\u00A0'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const columns = memoizeOne((userUuid) => [
  { name: 'ID', cell: (row) => row.uuid },
  { name: 'Nome', cell: (row) => row.name },
  { name: 'Tipo', cell: (row) => row.type },
  {
    name: 'Pagamento',
    cell: (row) => (
      <div>{row.payment_type === 'single' ? 'Único' : 'Assinatura'}</div>
    ),
  },
  {
    name: 'Garantia',
    cell: (row) => <div>{`${row.warranty_days || 0} dias`}</div>,
  },
  {
    name: 'Ativo',
    cell: (row) => (
      <div className="d-flex align-items-center">
        {row.deleted ? (
          <>
            <Check size={20} style={{ color: '#28c76f' }} />
            <div style={{ marginLeft: '8px', color: '#28c76f' }}>Ativo</div>
          </>
        ) : (
          <>
            <X size={20} style={{ color: '#ea5455' }} />
            <div style={{ marginLeft: '4px', color: '#ea5455' }}>Deletado</div>
          </>
        )}
      </div>
    ),
  },

  {
    name: 'Ações',
    cell: (row) => (
      <Link to={`/producer/${userUuid}/product/${row.uuid}`}>
        <Badge color="primary" className="view-details">
          <Settings size={20} />
        </Badge>
      </Link>
    ),
  },
]);

const columnsWithdraw = memoizeOne((openModal, fetchInfoDetails) => [
  {
    name: 'PSP ID',
    cell: (row) => {
      const pspId = row.psp_id || row.transaction?.psp_id;
      return pspId;
    },
  },
  {
    name: 'Tipo de Saque',
    cell: (row) => {
      const withdrawalType = row?.transaction.withdrawal_type?.name || '-';
      return withdrawalType;
    },
    center: true,
  },
  {
    name: 'Status',
    cell: (row) => (
      <Badge color={row.status?.color || row.transaction?.status?.color}>
        {row.status?.name || row.transaction?.status?.name}
      </Badge>
    ),
  },
  {
    name: 'Saque',
    cell: (row) =>
      FormatBRL(row.amount || row.transaction?.withdrawal_amount || 0),
  },
  {
    name: 'Saque c/ tarifa',
    cell: (row) =>
      FormatBRL(row.withdrawal_total || row.transaction?.withdrawal_total || 0),
  },
  {
    name: 'Tarifa',
    cell: (row) => FormatBRL(row.fee_total || row.transaction?.revenue || 0),
  },
  {
    name: 'Solicitado',
    cell: (row) =>
      row.created_at
        ? moment(row.created_at).format('DD/MM/YYYY HH:mm')
        : 'Data não disponível',
  },
  {
    name: 'Atualizado',
    cell: (row) =>
      row.updated_at
        ? moment(row.updated_at).format('DD/MM/YYYY HH:mm')
        : 'Data não disponível',
  },
  {
    name: 'Detalhes',
    cell: (row) => (
      <Badge
        color="primary"
        className="view-details"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          openModal(row.bank_data || row.bank_address);
          fetchInfoDetails(row.psp_id || row.transaction?.psp_id || row.id);
        }}
      >
        <Settings size={20} />
      </Badge>
    ),
  },
]);

const columnsKyc = memoizeOne((showDocuments) => [
  {
    name: 'Criado em',
    cell: (row) => moment(row.created_at).format('DD/MM/YYYY HH:mm'),
  },
  {
    name: 'Atualizado em',
    cell: (row) => moment(row.updated_at).format('DD/MM/YYYY HH:mm'),
  },
  {
    name: 'Status',
    cell: (row) => <Badge color={row.status?.color}>{row.status?.label}</Badge>,
  },
  {
    name: 'Arquivos',
    width: '200px',
    cell: (row) => {
      return (
        <Button size="sm" color="light" onClick={() => showDocuments(row)}>
          <Info color="#4DD0BB" size="14"></Info>
          Visualizar
        </Button>
      );
    },
  },
  {
    name: 'Detalhes',
    cell: (row) => row.details || 'Não informado',
  },
]);

const columnsSales = memoizeOne((salesDetailsProducer) => [
  {
    name: 'Data',
    cell: (row) => moment(row.created_at).format('DD/MM/YYYY HH:mm'),
  },
  { name: 'Produto', cell: (row) => row.product?.name || 'Não informado' },
  {
    name: 'Cliente',
    width: '250px',
    cell: (row) => (
      <div className="d-flex flex-column">
        <div className="fw-bolder">{row.student?.full_name}</div>
        <div className="fw-bold fst-italic mb-1">{row.student?.email}</div>
      </div>
    ),
  },
  { name: 'Tipo', cell: (row) => row.role },
  { name: 'Valor', cell: (row) => FormatBRL(row.amount) },
  {
    name: 'Pagamento',
    cell: (row) => <div>{row.payment_method}</div>,
  },
  {
    name: 'Status',
    cell: (row) => <Badge color={row.status?.color}>{row.status?.name}</Badge>,
    width: '175px',
  },
  {
    name: 'Detalhes',
    cell: (row) => (
      <Badge
        color="primary"
        style={{ cursor: 'pointer' }}
        onClick={() => salesDetailsProducer(row)}
      >
        <Settings size={21} />
      </Badge>
    ),
    center: true,
  },
]);

const columnsCoproductions = memoizeOne(() => [
  {
    name: 'Nome',
    cell: (row) => (
      <Link
        to={`/producer/${row.product?.producer?.uuid}/product/${row.product?.uuid}`}
      >
        {row.product?.name}
      </Link>
    ),
  },
  { name: 'Comissão', cell: (row) => row.commission_percentage + '%' },
  {
    name: 'Status',
    cell: (row) => <Badge color={row.status?.color}>{row.status?.name}</Badge>,
  },
  {
    name: 'Aceito em',
    cell: (row) => moment(row.accepted_at).format('DD/MM/YYYY HH:mm'),
  },
  {
    name: 'Expira em',
    cell: (row) =>
      row.expires_at
        ? moment(row.expires_at).format('DD/MM/YYYY HH:mm')
        : 'Vitalício',
  },
  {
    name: 'Cancelado em',
    cell: (row) =>
      row.canceled_at
        ? moment(row.canceled_at).format('DD/MM/YYYY HH:mm')
        : '-',
  },
]);
const columnsAffiliations = memoizeOne(() => [
  {
    name: 'Nome',
    cell: (row) => (
      <Link
        to={`/producer/${row.product?.producer?.uuid}/product/${row.product?.uuid}`}
      >
        {row.product?.name}
      </Link>
    ),
  },
  { name: 'Comissão', cell: (row) => row.commission + '%' },
  {
    name: 'Status',
    cell: (row) => <Badge color={row.status?.color}>{row.status?.name}</Badge>,
  },
  {
    name: 'Aceito em',
    cell: (row) => moment(row.updated_at).format('DD/MM/YYYY HH:mm'),
  },
]);

const ViewProducerInfo = () => {
  const { skin } = useSkin();
  const ability = useAbility(AbilityContext);
  const [show, setShow] = useState(false);
  const [showFutureReleases, setShowFutureReleases] = useState(false);
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [showWithdrawalBlocked, setShowWithdrawalBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockNotes, setShowBlockNotes] = useState(false);
  const [blockNotes, setBlockNotes] = useState([]);

  const [open, setOpen] = useState(0);

  const toggleAccord = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const [salesDetails, setSalesDetails] = useState(false);

  const salesDetailsProducer = (item) => {
    api
      .get(`users/transactions/${item.uuid}`)
      .then((r) => {
        setOpen(0);
        setSalesDetails(r.data);
      })
      .catch((error) => console.log(error));
    setShowSalesDetails(true);
  };

  let { userUuid } = useParams();
  const [active, setActive] = useState('1');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [recordsProduct, setRecordsProduct] = useState([]);
  const [recordsCountProduct, setRecordsCountProduct] = useState(0);
  const [recordsPerPageProduct, setRecordsPerPageProduct] = useState(10);

  const [recordsWithdraw, setRecordsWithdraw] = useState([]);
  const [recordsCountWithdraw, setRecordsCountWithdraw] = useState(0);
  const [recordsPerPageWithdraw, setRecordsPerPageWithdraw] = useState(10);

  const [recordsKyc, setRecordsKyc] = useState([]);
  const [recordsCountKyc, setRecordsCountKyc] = useState(0);
  const [recordsPerPageKyc, setRecordsPerPageKyc] = useState(10);

  const [recordsCnpj, setRecordsCnpj] = useState([]);

  const [recordsSales, setRecordsSales] = useState([]);
  const [recordsCountSales, setRecordsCountSales] = useState(0);
  const [recordsPerPageSales, setRecordsPerPageSales] = useState(10);

  const [balance, setBalance] = useState(null);
  const [balanceMetrics, setBalanceMetrics] = useState(null);

  const [inputFilter, setInputFilter] = useState('');

  const [activeItem, setActiveItem] = useState(null);

  const [recordsCoproductions, setRecordsCoproductions] = useState([]);
  const [recordsCountCoproductions, setRecordsCountCoproductions] = useState(0);
  const [recordsPerPageCoproductions, setRecordsPerPageCoproductions] =
    useState(10);

  const [withdrawalInfo, setWithdrawalInfo] = useState(null);

  const [recordsAffiliations, setRecordsAffiliations] = useState([]);
  const [recordsCountAffiliations, setRecordsCountAffiliations] = useState(0);
  const [recordsPerPageAffiliations, setRecordsPerPageAffiliations] =
    useState(10);

  // Referral program state
  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [salesMetrics, setSalesMetrics] = useState(null);
  const [salesChartsMetrics, setSalesChartsMetrics] = useState(null);

  const [showIpLogsModal, setShowIpLogsModal] = useState(false);
  const [ipLogs, setIpLogs] = useState([]);
  const [ipLogsLoading, setIpLogsLoading] = useState(false);

  const [managers, setManagers] = useState([]);

  const [awardsData, setAwardsData] = useState([]);
  const [awardsLoading, setAwardsLoading] = useState(false);
  const [awardBlocking, setAwardBlocking] = useState(false);
  const [upsellLoading, setUpsellLoading] = useState(false)

  const showDocuments = async ({
    doc_front_key,
    doc_back_key,
    address_key,
    selfie_key,
  }) => {
    const docs = [doc_back_key, doc_front_key, address_key, selfie_key];
    const promises = [];
    for (const doc of docs) {
      promises.push(api.get(`/kyc/file/${doc}`));
    }
    const responses = await Promise.all(promises);
    const links = [];
    for (const response of responses) {
      links.push(response.data.url);
    }
    setImages(links);
    setShowModal(true);
  };

  const downloadToExcel = async (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    query.append('size', recordsCountWithdraw);
    api
      .get(`/users/${userUuid}/withdrawals/export?${query.toString()}`, {
        responseType: 'blob',
      })
      .then((blob) => {
        const fileURL = window.URL.createObjectURL(blob.data);
        window.open(fileURL);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const openModal = (item) => {
    setActiveItem(item);
    setShow(true);
  };

  const toggle = (tab) => {
    if (active !== tab) {
      setActive(tab);
    }
  };

  const fetchSalesMetrics = () => {
    api
      .get(
        `/users/${userUuid}/transactions/metrics?start_date=2022-01-01&end_date=${moment().format(
          'YYYY-MM-DD',
        )}`,
      )
      .then((r) => {
        setSalesMetrics(r.data);
      })
      .catch((error) => {
        console.error('Error fetching sales metrics:', error);
        setSalesMetrics(null);
      });
  };

  const fetchSalesChartsMetrics = () => {
    api
      .get(
        `/users/${userUuid}/metrics?start_date=2022-01-01&end_date=${moment().format(
          'YYYY-MM-DD',
        )}`,
      )
      .then((r) => {
        setSalesChartsMetrics(r.data);
      })
      .catch((error) => {
        console.error('Error fetching sales charts metrics:', error);
        setSalesChartsMetrics(null);
      });
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setLoading(true);
      api
        .get(`/users/${userUuid}`)
        .then((r) => {
          if (isMounted) {
            setUser(r.data);
            setEmail(r.data.email);
            setDocument(r.data.document_number);
            // Se temos um gerente, buscar os dados usando o UUID (que sempre temos)
            if (r.data.id_manager && userUuid) {
              // Chamar após um pequeno delay para garantir que a função está definida
              setTimeout(() => {
                if (typeof fetchProducerDetails === 'function') {
                  // Passar primeiro o ID se existir, senão passar o UUID
                  fetchProducerDetails(r.data.id || userUuid);
                } else {
                  console.error(
                    '[useEffect user] fetchProducerDetails não é uma função!',
                  );
                }
              }, 100);
            } else {
              setContactStatus(null);
              setStage(null);
              setManagerPhase(null);
              setIsLoadingStage(false);
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          if (isMounted) {
            setUser(null);
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [userUuid]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/client-wallet/managers', {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });
        const managersData = response.data?.managers || [];
        setManagers(Array.isArray(managersData) ? managersData : []);
      } catch (error) {
        console.error('Error fetching managers:', error);
        setManagers([]);
      }
    };
    fetchManagers();
  }, []);

  // Atualizar dados quando o gerente mudar
  useEffect(() => {
    if (user?.id_manager && user.id) {
      // Chamar após um pequeno delay para garantir que a função está definida
      setTimeout(() => {
        if (typeof fetchProducerDetails === 'function') {
          fetchProducerDetails(user.id);
        } else {
          console.error(
            '[useEffect manager] fetchProducerDetails não é uma função!',
          );
        }
      }, 100);
    } else {
      setContactStatus(null);
      setStage(null);
      setManagerPhase(null);
      setIsLoadingStage(false);
    }
  }, [user?.id_manager, user?.id, userUuid]);

  useEffect(() => {
    const abortController = new AbortController();

    setUser(null);
    setBalance(null);
    setBalanceMetrics(null);
    setSalesMetrics(null);
    setSalesChartsMetrics(null);
    setRecordsProduct([]);
    setRecordsWithdraw([]);
    setRecordsKyc([]);
    setRecordsSales([]);
    setRecordsCoproductions([]);
    setRecordsAffiliations([]);
    setReferralData(null);

    fetchData();
    fetchSalesMetrics();
    fetchSalesChartsMetrics();
    fetchProducts();
    fetchBalance(abortController.signal);
    fetchWithdraw();
    fetchKyc();
    fetchSales();
    fetchCoproductions();
    fetchAffiliations();
    fetchReferralData();
    fetchAwardsData();
    return () => {
      abortController.abort();
    };
  }, [userUuid]);

  const fetchData = async () => {
    try {
      const response = await api.get(`users/${userUuid}/transactions/metrics`);
      setBalanceMetrics(response.data);
    } catch (error) {
      console.error('Error fetching balance metrics:', error);
      setBalanceMetrics(null);
    }
  };

  const fetchProducts = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('userUuid', userUuid);
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPageProduct);
      const trimmedInput = inputFilter.trim();
      if (trimmedInput) query.append('input', trimmedInput);

      const response = await api.get(`/products?${query.toString()}`);
      setRecordsCountProduct(response.data.count);
      setRecordsProduct(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChangeProduct = async (newPerPage, page) => {
    await fetchProducts(page - 1, newPerPage);
    setRecordsPerPageProduct(newPerPage);
  };

  const handleRecordsPageChangeProduct = (page) => {
    fetchProducts(page - 1);
  };

  useEffect(() => {
    if (inputFilter.length === 0 || inputFilter.trim().length > 0) {
      fetchProducts(0);
    }
  }, [inputFilter]);

  const fetchBalance = async (signal) => {
    setLoading(true);
    try {
      const response = await api.get(`users/${userUuid}/balances`, { signal });
      if (!signal?.aborted) {
        setBalance(response.data.data);
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchWithdraw = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPageWithdraw);

      const response = await api.get(
        `/users/${userUuid}/withdrawals?${query.toString()}`,
      );
      setRecordsCountWithdraw(response.data.info?.count || 0);
      setRecordsWithdraw(response.data.info?.rows || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setRecordsCountWithdraw(0);
      setRecordsWithdraw([]);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChangeWithdraw = async (newPerPage, page) => {
    await fetchWithdraw(page - 1, newPerPage);
    setRecordsPerPageWithdraw(newPerPage);
  };

  const handleRecordsPageChangeWithDraw = (page) => {
    fetchWithdraw(page - 1);
  };

  const fetchKyc = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPageKyc);

      const response = await api.get(
        `users/${userUuid}/kyc?${query.toString()}`,
      );
      setRecordsCountKyc(response.data.info.count);
      setRecordsKyc(response.data.info.rows);
      setRecordsCnpj(response.data.cnpj);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchSales = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPageSales);
      const response = await api.get(
        `users/${userUuid}/transactions?${query.toString()}`,
        {
          params: filterParams,
        },
      );
      setRecordsCountSales(response.data.count);
      setRecordsSales(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChangeSales = async (newPerPage, page) => {
    await fetchSales(page - 1, newPerPage);
    setRecordsPerPageSales(newPerPage);
  };

  const handleRecordsPageChangeSales = (page) => {
    fetchSales(page - 1);
  };

  const fetchBlockedWithdrawal = async () => {
    setLoading(true);
    try {
      const newBlockedStatus = !balance.withdrawal_blocked;
      await api.put(`users/${userUuid}/withdrawal`, {
        blocked: newBlockedStatus,
        reason: blockReason || null,
      });

      // Atualizar o estado local imediatamente para o botão aparecer/desaparecer
      setBalance((prevBalance) => ({
        ...prevBalance,
        withdrawal_blocked: newBlockedStatus,
      }));

      // Atualizar o status do usuário baseado no bloqueio do saque
      setUser((prevUser) => ({
        ...prevUser,
        status: {
          ...prevUser.status,
          color: newBlockedStatus ? 'danger' : 'success',
          label: newBlockedStatus ? 'Saldo Bloqueado' : 'Seguro',
        },
      }));

      setShowWithdrawalBlocked(false);
      setBlockReason('');
      fetchBalance();
      toast.success(
        newBlockedStatus
          ? 'Saque bloqueado com sucesso'
          : 'Saque desbloqueado com sucesso',
        configNotify,
      );
    } catch (error) {
      console.log(error);
      toast.error('Erro ao bloquear/desbloquear saque', configNotify);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${userUuid}/block-notes`);
      const notes = response.data?.blockNotes || response.data || [];
      setBlockNotes(notes);
    } catch (error) {
      console.error('Error fetching block notes:', error);
      setBlockNotes([]);
      toast.error('Erro ao carregar notas de bloqueio', configNotify);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoproductions = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPageSales);

      const response = await api.get(
        `users/${userUuid}/coproductions?${query.toString()}`,
      );
      setRecordsCountCoproductions(response.data.count);
      setRecordsCoproductions(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChangeCoproductions = async (newPerPage, page) => {
    await fetchCoproductions(page - 1, newPerPage);
    setRecordsPerPageCoproductions(newPerPage);
  };

  const handleRecordsPageChangeCoproductions = (page) => {
    fetchCoproductions(page - 1);
  };

  const fetchInfoDetails = async (psp_id) => {
    setLoading(true);
    setWithdrawalInfo(null);
    api
      .get(`users/${userUuid}/withdrawals/info?psp_id=${psp_id}`)
      .then((r) => {
        setWithdrawalInfo(r.data.info);
      })
      .catch((error) => console.log(error));
    setLoading(false);
  };

  const fetchAffiliations = async (page = 0, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPageSales);

      const response = await api.get(
        `users/${userUuid}/affiliates?${query.toString()}`,
      );
      setRecordsCountAffiliations(response.data.count);
      setRecordsAffiliations(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChangeAffiliations = async (newPerPage, page) => {
    await fetchAffiliations(page - 1, newPerPage);
    setRecordsPerPageAffiliations(newPerPage);
  };

  const handleRecordsPageChangeAffiliations = (page) => {
    fetchAffiliations(page - 1);
  };

  const fetchReferralData = async () => {
    setReferralLoading(true);
    try {
      const response = await api.get(`/users/referral/${userUuid}`);
      setReferralData(response.data);
    } catch (error) {
      console.log('Error fetching referral data:', error);
      setReferralData({
        has_referral_program: false,
        referral_disabled: false,
      });
    }
    setReferralLoading(false);
  };

  const fetchAwardsData = async () => {
    setAwardsLoading(true);
    try {
      const response = await api.get(
        `/award-shipments?producer_uuid=${userUuid}`,
      );
      setAwardsData(response.data.rows || []);
    } catch (error) {
      console.log('Error fetching awards data:', error);
      setAwardsData([]);
    }
    setAwardsLoading(false);
  };

  const handleReferralStatusChange = async (newStatus) => {
    try {
      const statusValue = newStatus === '1' ? 'active' : 'blocked';
      const statusId = newStatus === '1' ? 1 : 2;

      // Update local state immediately for better UX
      setReferralData((prev) => ({
        ...prev,
        referral_program: {
          ...prev.referral_program,
          status: {
            key: statusValue,
            id: statusId,
          },
        },
      }));

      // Make API call to update status
      await api.put(`/users/referral/${userUuid}/status`, {
        status: statusId,
      });

      toast.success(
        'Status do programa de indicação atualizado com sucesso',
        configNotify,
      );
    } catch (error) {
      console.log('Error updating referral status:', error);
      toast.error(
        'Erro ao atualizar status do programa de indicação',
        configNotify,
      );

      // Revert to original state on error
      fetchReferralData();
    }
  };

  const handleReferralDisabledChange = async (disabled) => {
    try {
      // Update local state immediately for better UX
      setReferralData((prev) => ({
        ...prev,
        referral_disabled: disabled,
      }));

      // Make API call to update referral_disabled
      await api.put(`/users/referral/${userUuid}/disabled`, {
        referral_disabled: disabled,
      });

      toast.success(
        'Configuração de geração de comissões atualizada com sucesso',
        configNotify,
      );
    } catch (error) {
      console.log('Error updating referral disabled:', error);
      toast.error(
        'Erro ao atualizar configuração de geração de comissões',
        configNotify,
      );

      // Revert to original state on error
      fetchReferralData();
    }
  };

  const [isUpdatingManager, setIsUpdatingManager] = useState(false);

  const HandleChangeManager = async (e) => {
    // Só chama preventDefault se o evento tiver esse método (chamadas naturais do onChange)
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (isUpdatingManager) return; // Previne chamadas simultâneas

    const value = e.target.value;

    // Permite enviar string vazia quando "Selecione um gerente" for selecionado
    if (value === user?.id_manager) return;

    setIsUpdatingManager(true);

    try {
      await api.put(`/users/${user.uuid}/manager`, {
        manager_id: value || null,
      });

      setUser((prev) => ({
        ...prev,
        id_manager: value || '',
      }));

      // Se um gerente foi atribuído, buscar os dados dos 3 campos
      if (value && user.id) {
        fetchProducerDetails(user.id);
      } else {
        // Se o gerente foi removido, limpar os dados
        setContactStatus(null);
        setStage(null);
        setManagerPhase(null);
        setIsLoadingStage(false);
      }
    } catch (error) {
      console.log('Error updating manager:', error);
      toast.error('Erro ao atualizar gerente', configNotify);
    } finally {
      toast.success('Gerente atualizado com sucesso', configNotify);
      setIsUpdatingManager(false);
    }
  };

  const { register, reset, getValues, setValue, handleSubmit } = useForm({
    mode: 'onChange',
  });
  const inputRef = useRef(null);
  const userIdRef = useRef(null); // Ref para armazenar o user.id de forma mais confiável

  const [modalFilterShow, setModalFilterShow] = useState(false);
  const [filterParams, setFilterParams] = useState(null);
  const [filters, setFilters] = useState({});
  const [delayDebounce, setDelayDebounce] = useState(null);
  const [searchTerm, setSearchTerm] = useState(null);
  const [editingEmail, setEditingEmail] = useState(false);

  const [editingDocument, setEditingDocument] = useState(false);
  const [document_number, setDocument] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [confirmCNPJ, setConfirmCNPJ] = useState(false);

  const removeFilters = () => {
    reset({ role: 'all' });
    setFilters({});
    setFilterParams({});
    inputRef.current.value = '';
    setModalFilterShow(false);
  };

  const onSubmit = () => {
    prepareFilterParams();
  };

  const prepareFilterParams = () => {
    var params = new URLSearchParams();
    const data = { ...getValues() };
    for (const [key, value] of Object.entries(data)) {
      if (value && value !== 'false') {
        params.append(key, value);
      }
    }
    if (searchTerm) {
      params.append('input', searchTerm);
    }
    setFilterParams(params);
    setModalFilterShow(false);
  };

  useEffect(() => {
    if (searchTerm !== null) {
      prepareFilterParams();
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchSales();
  }, [filterParams]);

  const fields = user?.sale_settings || {};

  const [nameField, setNameField] = useState(null);
  const [showChangeFee, setShowChangeFee] = useState(false);

  const [showModalNotes, setShowModalNotes] = useState(false);
  const [email, setEmail] = useState('');

  // Estados para Status de Contato, Etapa e Gerenciamento
  const [contactStatus, setContactStatus] = useState(null);
  const [stage, setStage] = useState(null);
  const [managerPhase, setManagerPhase] = useState(null);
  const [isUpdatingContactStatus, setIsUpdatingContactStatus] = useState(false);
  const [isUpdatingManagerPhase, setIsUpdatingManagerPhase] = useState(false);
  const [isLoadingStage, setIsLoadingStage] = useState(false);

  // Verificar permissões do usuário logado
  const currentUserData = getUserData();
  const isCommercial = currentUserData?.role?.toUpperCase() === 'COMERCIAL';
  const isMaster = currentUserData?.role?.toUpperCase() === 'MASTER';
  const isAdm = currentUserData?.role?.toUpperCase() === 'ADM';
  const canEdit =
    user?.id_manager &&
    (isMaster || (isCommercial && user.id_manager === currentUserData?.id));

  const fetchProducerDetails = async (userIdOrUuid) => {
    const searchIdentifier = userIdOrUuid || userUuid;
    if (!searchIdentifier) {
      return;
    }

    try {
      setIsLoadingStage(true);

      // Buscar tanto o stage quanto os dados de management do usuário
      const [userResponse, stageResponse, managementResponse] =
        await Promise.all([
          api.get(`/users/${userUuid}`).catch((err) => {
            console.error('[fetchProducerDetails] Erro ao buscar /users:', err);
            return { data: null };
          }),
          api
            .get(`/client-wallet/producer/stage/${searchIdentifier}`, {
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Expires: '0',
              },
            })
            .catch((err) => {
              console.error(
                '[fetchProducerDetails] Erro ao buscar /client-wallet/producer/stage:',
                err,
              );
              return { data: null };
            }),
          api
            .get(`/client-wallet/management/user/${searchIdentifier}`, {
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Expires: '0',
              },
            })
            .catch((err) => {
              console.error(
                '[fetchProducerDetails] Erro ao buscar /client-wallet/management/user:',
                err,
              );
              return { data: null };
            }),
        ]);

      // Usar PREFERENCIALMENTE os dados do managementResponse (específico para management data)
      // Fallback: stageResponse -> userResponse
      const managementData = managementResponse?.data || {};
      const stageData = stageResponse?.data || {};

      let finalContactStatus = 'NAO_CONTATADO';
      let contactStatusSource = 'DEFAULT';

      if (managementData?.contact_status) {
        finalContactStatus = managementData.contact_status;
        contactStatusSource = 'managementData';
      } else if (stageData?.contact_status) {
        finalContactStatus = stageData.contact_status;
        contactStatusSource = 'stageData';
      } else if (userResponse?.data?.contact_status) {
        finalContactStatus = userResponse.data.contact_status;
        contactStatusSource = 'userResponse.contact_status';
      } else if (userResponse?.data?.id_manager_status_contact != null) {
        const statusMap = {
          1: 'NAO_CONTATADO',
          2: 'EM_CONTATO',
          3: 'EM_ACOMPANHAMENTO',
          4: 'SEM_RETORNO',
          5: 'CONCLUIDO',
          6: 'CONCLUIDO_REMOVIDO',
        };
        finalContactStatus =
          statusMap[userResponse.data.id_manager_status_contact] ??
          'NAO_CONTATADO';
        contactStatusSource = 'userResponse.id_manager_status_contact';
      }
      setContactStatus(finalContactStatus);

      // Manager phase - prioridade: managementData > stageData > userResponse
      const phase =
        managementData.manager_phase ??
        stageData.manager_phase ??
        userResponse?.data?.manager_phase ??
        null;
      setManagerPhase(phase);

      // Atualizar o user com o id numérico - prioridade: managementData > stageData
      // IMPORTANTE: Sempre atualizar o user.id se vier das respostas, independente de já existir
      const userId =
        managementData.id || stageData.id || userResponse?.data?.id;
      if (userId) {
        // Atualizar tanto o estado quanto o ref para garantir disponibilidade imediata
        userIdRef.current = userId;
        setUser((prev) => ({ ...prev, id: userId }));
      } else {
        console.warn(
          '[fetchProducerDetails] user.id não encontrado em nenhuma resposta!',
          {
            managementData,
            stageData,
            userResponse_data: userResponse?.data,
          },
        );
      }

      // Stage
      if (stageData.stage) {
        const normalizedStage =
          STAGE_NORMALIZE[String(stageData.stage).toUpperCase()] || null;
        setStage(normalizedStage);
      } else {
        setStage(null);
      }
    } catch (error) {
      console.error(
        '[fetchProducerDetails] Error fetching producer details:',
        error,
      );
      setContactStatus('NAO_CONTATADO');
      setStage(null);
      setManagerPhase(null);
    } finally {
      setIsLoadingStage(false);
    }
  };

  // Handler para atualizar status de contato
  const handleUpdateContactStatus = async (newStatus) => {
    if (isUpdatingContactStatus) {
      return;
    }

    // Usar o userIdRef.current como fallback se user.id não estiver disponível ainda
    const userId = user?.id || userIdRef.current;

    if (!userId) {
      console.error('[handleUpdateContactStatus] user.id não encontrado:', {
        user,
        userIdRef: userIdRef.current,
      });
      toast.error('Erro: ID do usuário não encontrado', configNotify);
      return;
    }

    setIsUpdatingContactStatus(true);
    try {
      const response = await api.post(
        '/client-wallet/producers/contact-status',
        {
          user_id: userId,
          contact_status: newStatus,
        },
      );

      setContactStatus(newStatus);
      toast.success('Status de contato atualizado com sucesso', configNotify);
    } catch (error) {
      console.error('[handleUpdateContactStatus] Erro completo:', error);
      console.error(
        '[handleUpdateContactStatus] Resposta de erro:',
        error.response?.data,
      );
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar status de contato',
        configNotify,
      );
    } finally {
      setIsUpdatingContactStatus(false);
    }
  };

  // Handler para atualizar fase de gerenciamento
  const handleUpdateManagerPhase = async (newPhase) => {
    if (isUpdatingManagerPhase) {
      return;
    }

    // Usar o userIdRef.current como fallback se user.id não estiver disponível ainda
    const userId = user?.id || userIdRef.current;

    if (!userId) {
      console.error('[handleUpdateManagerPhase] user.id não encontrado:', {
        user,
        userIdRef: userIdRef.current,
      });
      toast.error('Erro: ID do usuário não encontrado', configNotify);
      return;
    }

    setIsUpdatingManagerPhase(true);
    try {
      const response = await api.post('/client-wallet/management/phase', {
        user_id: userId,
        phase: newPhase || null,
      });

      setManagerPhase(newPhase);
      setUser((prev) => ({ ...prev, manager_phase: newPhase }));
      toast.success(
        'Fase de gerenciamento atualizada com sucesso',
        configNotify,
      );
    } catch (error) {
      console.error('[handleUpdateManagerPhase] Erro completo:', error);
      console.error(
        '[handleUpdateManagerPhase] Resposta de erro:',
        error.response?.data,
      );
      toast.error(
        error.response?.data?.message ||
        'Erro ao atualizar fase de gerenciamento',
        configNotify,
      );
    } finally {
      setIsUpdatingManagerPhase(false);
    }
  };

  const fetchFollowUp = async () => {
    setLoading(true);
    setShow(false);
    try {
      await api.put(`users/${userUuid}`, {
        follow_up: !user.follow_up,
      });
      toast.success(
        `Usuário ${user?.follow_up ? 'desmarcado' : 'marcado'} com sucesso`,
        configNotify,
      );
      setUser((prev) => ({
        ...prev,
        follow_up: !user.follow_up,
      }));
    } catch (error) {
      toast.error('Falha ao marcar usuário', configNotify);
      console.log(error);
    }
    setLoading(false);
  };

  const toggleActive = async (e) => {
    e.preventDefault();
    api
      .put(`users/${user.uuid}/toggle-active`, { active: !user.active })
      .then(() => {
        setUser((prev) => ({
          ...prev,
          active: !user.active,
        }));
        toast.success(`Atualizacao concluida com sucesso`, configNotify);
      })
      .catch(() => toast.error('Falha ao alterar', configNotify))
      .finally(() => {
        setConfirm(false);
      });
  };

  const removeCNPJ = async (e) => {
    e.preventDefault();
    api
      .put(`users/${user.uuid}/remove-cnpj`)
      .then(() => {
        setUser((prev) => ({
          ...prev,
          cnpj: null,
          is_company: false,
          verified_company: false,
          status_cnpj: {
            color: 'warning',
            label: 'Aguardando Envio',
          },
        }));
        toast.success(`Atualizacao concluida com sucesso`, configNotify);
      })
      .catch(() => toast.error('Falha ao alterar', configNotify))
      .finally(() => {
        setConfirmCNPJ(false);
      });
  };

  const onSubmitSwitch = () => {
    const data = {
      ...user.sale_settings,
      use_highest_sale: !fields.use_highest_sale,
    };

    api
      .put(`users/${user.uuid}/fees`, data)
      .then(() => {
        setUser((prev) => ({
          ...prev,
          sale_settings: {
            ...prev.sale_settings,
            use_highest_sale: !fields.use_highest_sale,
          },
        }));
        toast.success(
          `Usar apenas porcentagem alterado com sucesso`,
          configNotify,
        );
        setShow(false);
      })
      .catch(() => toast.error('Falha ao alterar', configNotify));
  };

  const changeEmail = (e) => {
    e.preventDefault();
    api
      .put(`/users/${user.uuid}/change-email`, {
        email,
      })
      .then(() => {
        setUser((prev) => ({
          ...prev,
          email,
        }));
        setEditingEmail(false);
        toast.success('E-mail alterado com sucesso', configNotify);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || 'Falha ao alterar o email',
          configNotify,
        );
      });
  };

  const changeDocument = (e) => {
    e.preventDefault();
    api
      .put(`/users/${user.uuid}/change-document`, {
        document_number,
      })
      .then(() => {
        setUser((prev) => ({
          ...prev,
          document_number,
        }));
        setEditingDocument(false);
        toast.success('Documento alterado com sucesso', configNotify);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || 'Falha ao alterar o documento',
          configNotify,
        );
      });
  };

  const generateAccess = (e) => {
    e.preventDefault();
    api
      .get(`/users/${user.uuid}/generate-access`)
      .then((r) => {
        const { token } = r.data;
        window.open(
          `https://dash.b4you.com.br/acessar?backoffice=${token}`,
          '_blank',
        );
      })
      .catch(() => {
        toast.error(
          'Falha ao gerar acesso, por favor, tente novamente mais tarde',
          configNotify,
        );
      });
  };

  const [activeItemCard, setActiveItemCard] = useState(null);
  const [activeItemMethod, setActiveItemMethod] = useState(null);

  const [showModalCard, setShowModalCard] = useState(false);
  const [showModalPixBillet, setShowModalPixBillet] = useState(false);
  const [confirmAllTariffs, setConfirmAllTariffs] = useState(false);

  const toggleModalCard = () => setShowModalCard(!showModalCard);

  const toggleModal = () => setShowModalPixBillet(!showModalPixBillet);

  const handleChangeCard = (item, value, index, type) => {
    toggleModalCard();
    setActiveItemCard({
      item: item,
      value: value,
      index: index + 1,
      type: type,
      defaultValue: value,
    });
  };

  const handleChange = (value, type, method) => {
    toggleModal();
    setActiveItemMethod({
      value: value,
      defaultValue: value,
      type: type,
      method: method,
    });
  };

  const changeTariff = () => {
    let data = {};
    if (activeItemCard) {
      data = {
        ...fields,
        [`fee_${activeItemCard.type}_card_service`]: {
          ...(fields[`fee_${activeItemCard.type}_card_service`] || {}),
          [activeItemCard.item]: +activeItemCard.value,
        },
      };
    } else {
      data = {
        ...fields,
        [`fee_${activeItemMethod.type}_${activeItemMethod.method}_service`]:
          +activeItemMethod.value,
      };
    }

    api
      .put(`users/${user.uuid}/fees`, data)
      .then(() => {
        setUser((prev) => ({
          ...prev,
          sale_settings: {
            ...prev.sale_settings,
            ...data,
          },
        }));
        toast.success(`Tarifas alterado com sucesso`, configNotify);
        setActiveItemCard(null);
        setActiveItemMethod(null);
        setShowModalCard(false);
        setShowModalPixBillet(false);
      })
      .catch(() => toast.error('Falha ao alterar', configNotify));
  };

  const changeAllTariffs = () => {
    let data = {};
    if (activeItemCard) {
      data = {
        ...fields,
        [`fee_${activeItemCard.type}_card_service`]: Object.keys(
          fields[`fee_${activeItemCard.type}_card_service`] || {},
        ).reduce((acc, key) => {
          acc[key] = +activeItemCard.value;
          return acc;
        }, {}),
      };
    }
    api
      .put(`users/${user.uuid}/fees`, data)
      .then(() => {
        setUser((prev) => ({
          ...prev,
          sale_settings: {
            ...prev.sale_settings,
            ...data,
          },
        }));
        toast.success(`Tarifas alterado com sucesso`, configNotify);
        setActiveItemCard(null);
        setActiveItemMethod(null);
        setShowModalCard(false);
        setShowModalPixBillet(false);
      })
      .catch(() => toast.error('Falha ao alterar', configNotify));
  };

  const fetchIpLogs = async () => {
    setIpLogsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('user_uuid', userUuid);
      query.append('event', 'all');
      query.append('page', 0);
      query.append('size', 20);

      const response = await api.get(`/logs/ips?${query.toString()}`);
      setIpLogs(response.data.rows);
    } catch (error) {
      toast.error('Erro ao buscar logs de IP', configNotify);
    }
    setIpLogsLoading(false);
  };

  useEffect(() => {
    if (showIpLogsModal) {
      fetchIpLogs();
    }
    // eslint-disable-next-line
  }, [showIpLogsModal]);

  // Show loading state while user data is being fetched
  if (loading && !user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '50vh' }}
      >
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <>
      <Modal
        isOpen={showModalPixBillet}
        toggle={toggleModal}
        centered
        size={'sm'}
      >
        <ModalHeader toggle={toggleModal}>Editar tarifa</ModalHeader>
        <ModalBody>
          <Label>Valor antigo</Label>
          {activeItemMethod?.type === 'variable' ? (
            <Input
              type="text"
              disabled
              value={`${activeItemMethod?.defaultValue}%`}
            />
          ) : (
            <Input
              type="text"
              disabled
              value={`${FormatBRL(activeItemMethod?.defaultValue)}`}
            />
          )}
          <Label className="mt-1">Novo valor</Label>
          <Input
            type="text"
            defaultValue={`${+activeItemMethod?.value}`}
            onChange={(e) =>
              setActiveItemMethod((prev) => ({
                ...prev,
                value: e.target.value,
              }))
            }
          />

          <Row className="mt-2 mb-2">
            <Col className="d-flex justify-content-end">
              <Button color="primary" onClick={changeTariff}>
                Salvar
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={showModalCard}
        toggle={toggleModalCard}
        centered
        size={'md'}
        id={`changeTariff`}
      >
        <ModalHeader toggle={toggleModal}>Editar tarifa</ModalHeader>
        <ModalBody>
          <Label>Parcela atual</Label>
          <Input
            type="text"
            disabled
            value={`${activeItemCard?.index} ${activeItemCard?.index === 1 ? 'vez' : 'vezes'
              }`}
          />
          <Label className="mt-1">Tarifa atual</Label>
          {activeItemCard?.type === 'variable' ? (
            <>
              <Input
                type="text"
                disabled
                value={`${+activeItemCard?.defaultValue}%`}
              />
              <Label className="mt-1">Alterar tarifa</Label>
              <Input
                type="number"
                defaultValue={activeItemCard?.value}
                placeholder={activeItemCard?.value}
                onChange={(e) =>
                  setActiveItemCard((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
              />
            </>
          ) : (
            <>
              <Input
                type="text"
                disabled
                value={`${FormatBRL(+activeItemCard?.defaultValue)}`}
              />
              <Label className="mt-1">Alterar tarifa</Label>
              <div className="d-flex align-items-center">
                <div
                  className="form-control disabled"
                  style={{
                    width: 50,
                    borderColor: '#404656',
                    borderRadius: '5px 0px 0px 5px',
                  }}
                >
                  R$
                </div>
                <Input
                  type="text"
                  defaultValue={activeItemCard?.value}
                  placeholder={activeItemCard?.value}
                  onChange={(e) =>
                    setActiveItemCard((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))
                  }
                  style={{ borderRadius: `0px 5px 5px 0px` }}
                />
              </div>
            </>
          )}

          <Row className="mt-2 mb-2">
            <Col className="d-flex justify-content-between">
              {!confirmAllTariffs && (
                <Button
                  color="primary"
                  onClick={() => {
                    setConfirmAllTariffs(true);
                  }}
                  outline
                >
                  Aplicar para todas as parcelas
                </Button>
              )}
              {confirmAllTariffs && (
                <Button
                  color="danger"
                  onClick={() => {
                    setConfirmAllTariffs(false);
                    changeAllTariffs();
                  }}
                  outline
                >
                  Confirmar alterar todas as parcelas
                </Button>
              )}
              <Button color="primary" onClick={changeTariff}>
                Salvar
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>

      {confirm && (
        <ConfirmAction
          title="Confirmacao"
          show={confirm}
          setShow={setConfirm}
          textAlert={
            user?.active ? 'Deseja deletar a conta?' : 'Deseja ativar a conta?'
          }
          simpleConfirm
          centered
          buttonText={user?.active ? 'Deletar' : 'Ativar'}
          handleAction={toggleActive}
        />
      )}

      {confirmCNPJ && (
        <ConfirmAction
          title="Confirmacao"
          show={confirmCNPJ}
          setShow={setConfirmCNPJ}
          textAlert="Deseja remover a conta CNPJ?"
          simpleConfirm
          centered
          buttonText="Remover"
          handleAction={removeCNPJ}
        />
      )}

      <Modal
        id="modalViewDocuments"
        isOpen={showModal}
        toggle={() => setShowModal(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setShowModal(false)}>
          Documentos de {user && user.full_name}
        </ModalHeader>
        <ModalBody>
          <div className="d-grid gap-3">
            {images.map((image) => (
              <Row>
                <img src={image} alt="Documento" width={200} />
              </Row>
            ))}
          </div>
        </ModalBody>
      </Modal>
      {user && (
        <>
          <section id="pageProducerInfo">
            <h2>{user.full_name}</h2>
            <Breadcrumb className="mb-1">
              <BreadcrumbItem>
                <Link to="/producers">Produtores</Link>
              </BreadcrumbItem>
              <BreadcrumbItem active>
                <span>Produtor</span>
              </BreadcrumbItem>
            </Breadcrumb>

            <ModalNotes
              show={showModalNotes}
              setShow={setShowModalNotes}
              user={user}
            />

            <Card>
              <CardBody>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '1'}
                      onClick={() => {
                        toggle('1');
                      }}
                    >
                      Cadastro
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '2'}
                      onClick={() => {
                        toggle('2');
                      }}
                    >
                      Produtos
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '6'}
                      onClick={() => {
                        toggle('6');
                      }}
                    >
                      Coproduções
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '7'}
                      onClick={() => {
                        toggle('7');
                      }}
                    >
                      Afiliações
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '3'}
                      onClick={() => {
                        toggle('3');
                      }}
                    >
                      Saques
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '5'}
                      onClick={() => {
                        toggle('5');
                      }}
                    >
                      Vendas
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '4'}
                      onClick={() => {
                        toggle('4');
                      }}
                    >
                      KYC
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '8'}
                      onClick={() => {
                        toggle('8');
                      }}
                    >
                      Configurações
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '9'}
                      onClick={() => {
                        toggle('9');
                      }}
                    >
                      Pagarme
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      href="#"
                      active={active === '10'}
                      onClick={() => {
                        toggle('10');
                      }}
                    >
                      Indique e Ganhe
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={active}>
                  <TabPane tabId="1">
                    <Row>
                      <Col xs="12" md="8">
                        <div>
                          <h4 style={{ color: '#349888', marginBottom: '15px' }}>
                            <i
                              className="bx bx-trophy"
                              style={{ marginRight: '8px' }}
                            ></i>
                            Premiações
                            {user && (
                              <Button
                                color={user.award_eligible ? 'danger' : 'success'}
                                size="sm"
                                className="ms-2 d-inline-flex align-items-center"
                                onClick={async () => {
                                  try {
                                    setAwardBlocking(true);
                                    const path = user.award_eligible
                                      ? `/users/${user.uuid}/awards/block`
                                      : `/users/${user.uuid}/awards/unblock`;
                                    await api.patch(path);
                                    setUser((prev) => ({
                                      ...prev,
                                      award_eligible: !prev.award_eligible,
                                    }));
                                    fetchAwardsData();
                                  } catch (err) {
                                    console.error(
                                      'Erro ao alterar elegibilidade de premiação',
                                      err,
                                    );
                                  } finally {
                                    setAwardBlocking(false);
                                  }
                                }}
                                disabled={awardBlocking}
                                outline
                                style={{ marginLeft: 10 }}
                              >
                                {awardBlocking ? (
                                  <Spinner size="sm" className="me-1" />
                                ) : user.award_eligible ? (
                                  <Lock size={16} className="me-1" />
                                ) : (
                                  <Unlock size={16} className="me-1" />
                                )}
                                {user.award_eligible
                                  ? 'Bloquear premiação'
                                  : 'Desbloquear premiação'}
                              </Button>
                            )}
                          </h4>

                          {awardsLoading ? (
                            <div
                              className="d-flex justify-content-center align-items-center"
                              style={{ height: '200px' }}
                            >
                              <Spinner color="primary" />
                            </div>
                          ) : (
                            displayAwardsProgress(
                              awardsData,
                              balanceMetrics?.paid || 0,
                            )
                          )}
                        </div>
                      </Col>
                      {ability.can(
                        'manage',
                        'Producers.manage-dashboard-functionalities',
                      ) && (
                          <Col xs="12" md="4" className="mt-3 mt-md-0">
                            <Card style={{ height: '100%' }}>
                              <CardBody>
                                <h6 className="mb-1">Funcionalidades</h6>

                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>Upsell Nativo</strong>
                                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                                      Habilita configuração de Upsell Nativo na Dashboard.
                                    </div>
                                  </div>

                                  <FormGroup switch className="mb-0 ml-2">
                                    <Input
                                      type="switch"
                                      checked={!!user?.upsell_native_enabled}
                                      disabled={upsellLoading}
                                      onChange={async () => {
                                        try {
                                          setUpsellLoading(true)

                                          const path = user.upsell_native_enabled
                                            ? `/users/${user.uuid}/upsell-native/disable`
                                            : `/users/${user.uuid}/upsell-native/enable`

                                          await api.patch(path)

                                          setUser((prev) => ({
                                            ...prev,
                                            upsell_native_enabled: !prev.upsell_native_enabled,
                                          }))
                                        } catch (err) {
                                          console.error('Erro ao alterar Upsell Nativo', err)
                                        } finally {
                                          setUpsellLoading(false)
                                        }
                                      }}
                                    />
                                    <Label check />
                                  </FormGroup>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        )}
                    </Row>
                    <Table hover>
                      <tbody>
                        <tr>
                          <th>Acompanhamento</th>
                          {ability.can('manage', 'Producers.access-panel') && (
                            <button
                              className="btn btn-primary"
                              onClick={generateAccess}
                            >
                              Acessar painel
                            </button>
                          )}
                          {ability.can('manage', 'Producers.view-ip-logs') && (
                            <button
                              className="btn btn-secondary ml-2"
                              onClick={() => setShowIpLogsModal(true)}
                            >
                              Logs de IP
                            </button>
                          )}
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>
                            <div className="d-flex align-items-center">
                              <Badge
                                color={user?.status?.color || 'secondary'}
                                className="view-details"
                              >
                                {user?.status?.label || 'N/A'}
                              </Badge>
                              <Badge
                                color="primary"
                                className="view-details ml-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  fetchBlockNotes();
                                  setShowBlockNotes(true);
                                }}
                              >
                                <Settings size={20} />
                              </Badge>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th>Tag</th>
                          <td>
                            <Button
                              color="warning"
                              size="sm"
                              onClick={() => fetchFollowUp()}
                              outline
                              disabled={
                                user?.follow_up
                                  ? !ability.can(
                                    'manage',
                                    'Producers.unmark-follow-up',
                                  )
                                  : !ability.can(
                                    'manage',
                                    'Producers.mark-follow-up',
                                  )
                              }
                            >
                              {user?.follow_up
                                ? 'Desmarcar alerta'
                                : 'Marcar alerta'}
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Notas</th>
                          <td>
                            <Badge
                              color="primary"
                              className="view-details"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setShowModalNotes(true)}
                            >
                              <Settings size={20} />
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Gerente</th>
                          <td>
                            {isMaster || isCommercial || isAdm ? (
                              <div className="d-flex align-items-center">
                                <Input
                                  type="select"
                                  name="manager"
                                  value={user?.id_manager || ''}
                                  onChange={HandleChangeManager}
                                  style={{ marginRight: '10px', flex: 1 }}
                                >
                                  <option value="">Selecione um gerente</option>
                                  {managers.map((manager) => (
                                    <option key={manager.id} value={manager.id}>
                                      {manager.email}
                                    </option>
                                  ))}
                                </Input>

                                {(isMaster ||
                                  isAdm ||
                                  (isCommercial &&
                                    user?.id_manager ===
                                    currentUserData?.id)) &&
                                  user?.id_manager && (
                                    <Button
                                      color="danger"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        HandleChangeManager({
                                          target: { value: '' },
                                        });
                                      }}
                                      outline
                                    >
                                      Remover gerente
                                    </Button>
                                  )}
                              </div>
                            ) : (
                              <span>
                                {managers.find((m) => m.id === user?.id_manager)
                                  ?.email || 'Sem gerente'}
                              </span>
                            )}
                          </td>
                        </tr>
                        {user?.id_manager && (
                          <>
                            <tr>
                              <th scope="row">Status de Contato</th>
                              <td>
                                {canEdit ? (
                                  <Input
                                    type="select"
                                    value={contactStatus || 'NAO_CONTATADO'}
                                    onChange={(e) =>
                                      handleUpdateContactStatus(e.target.value)
                                    }
                                    disabled={isUpdatingContactStatus}
                                    style={{ maxWidth: '250px' }}
                                  >
                                    {managerStatusContactTypes.map((status) => (
                                      <option
                                        key={status.id}
                                        value={status.key}
                                      >
                                        {status.label}
                                      </option>
                                    ))}
                                  </Input>
                                ) : (
                                  <span>
                                    {managerStatusContactTypes.find(
                                      (s) =>
                                        s.key ===
                                        (contactStatus || 'NAO_CONTATADO'),
                                    )?.label ||
                                      contactStatus ||
                                      'Não contatado'}
                                  </span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">Etapa em Acompanhamento</th>
                              <td>
                                {isLoadingStage ? (
                                  <Spinner size="sm" color="primary" />
                                ) : stage ? (
                                  <Badge
                                    color={STAGE_COLORS[stage] || 'secondary'}
                                  >
                                    {STAGE_LABELS[stage] ?? 'Sem etapa'}
                                  </Badge>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <th scope="row">Etapa em Gerenciamento</th>
                              <td>
                                {canEdit ? (
                                  <Input
                                    type="select"
                                    value={managerPhase || ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      handleUpdateManagerPhase(
                                        value ? Number(value) : null,
                                      );
                                    }}
                                    disabled={isUpdatingManagerPhase}
                                    style={{ maxWidth: '250px' }}
                                  >
                                    <option value="">Sem etapa</option>
                                    {managerPhaseTypes.map((phase) => (
                                      <option key={phase.id} value={phase.id}>
                                        {phase.label}
                                      </option>
                                    ))}
                                  </Input>
                                ) : (
                                  <span>
                                    {managerPhase
                                      ? managerPhaseTypes.find(
                                        (p) => p.id === managerPhase,
                                      )?.label || 'Sem etapa'
                                      : 'Sem etapa'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <th scope="row">Conta Ativa</th>
                          <td>
                            {user.active ? (
                              <Check
                                size={20}
                                style={{
                                  color: '#28c76f',
                                  marginRight: '10px',
                                }}
                              />
                            ) : (
                              <X
                                size={20}
                                style={{
                                  color: '#ea5455',
                                  marginRight: '10px',
                                }}
                              />
                            )}
                            <Button
                              color="danger"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                setConfirm(true);
                              }}
                              outline
                            >
                              {user?.active ? 'Deletar conta' : 'Ativar conta'}
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <Table hover>
                      <thead>
                        <tr>
                          <th colSpan="2" className="title-table">
                            Geral
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">ID</th>
                          <td>{user.uuid}</td>
                        </tr>
                        <tr>
                          <th scope="row">Nome</th>
                          <td className="text-capitalize">{user.full_name}</td>
                        </tr>
                        <tr>
                          <th scope="row">E-mail</th>
                          <td>
                            {editingEmail ? (
                              <div className="d-flex justify-content-start align-items-center">
                                <Input
                                  style={{ width: '300px' }}
                                  type="email"
                                  value={email}
                                  onChange={(e) => {
                                    e.preventDefault();
                                    setEmail(e.target.value);
                                  }}
                                />
                                <div className="d-flex ml-3 align-items-center">
                                  <Badge
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                    color="primary"
                                    onClick={changeEmail}
                                  >
                                    <Check size={30} />
                                  </Badge>
                                  <Badge
                                    className="ml-2"
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                    color="danger"
                                    onClick={() => setEditingEmail(false)}
                                  >
                                    <X size={30} />
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <>
                                <a href={`mailto:${user.email}`}>
                                  {user.email}
                                </a>
                                <Badge
                                  className="ml-3"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setEditingEmail(true)}
                                >
                                  <Edit2 size={20} />
                                </Badge>
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">WhatsApp</th>
                          <td>
                            {(
                              <a
                                href={`https://wa.me/${formatWhatsappPhone(
                                  user.whatsapp,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {formatWhatsappPhone(user.whatsapp)}
                              </a>
                            ) || 'Não informado'}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">CPF</th>
                          <td>
                            {editingDocument ? (
                              <div className="d-flex justify-content-start align-items-center">
                                <Input
                                  style={{ width: '300px' }}
                                  type="email"
                                  value={document_number}
                                  onChange={(e) => {
                                    e.preventDefault();
                                    setDocument(e.target.value);
                                  }}
                                />
                                <div className="d-flex ml-3 align-items-center">
                                  <Badge
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                    color="primary"
                                    onClick={changeDocument}
                                  >
                                    <Check size={30} />
                                  </Badge>
                                  <Badge
                                    className="ml-2"
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                    color="danger"
                                    onClick={() => setEditingDocument(false)}
                                  >
                                    <X size={30} />
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center">
                                <div>{user.document_number}</div>
                                <Badge
                                  className="ml-3"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setEditingDocument(true)}
                                >
                                  <Edit2 size={20} />
                                </Badge>
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">CNPJ</th>
                          <td>{user.cnpj || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Data de nascimento</th>
                          <td>
                            {user.birth_date
                              ? moment(user.birth_date).format('DD/MM/YYYY')
                              : 'Não informado'}
                          </td>
                        </tr>

                        <tr>
                          <th scope="row">KYC Verificado</th>
                          <td>
                            {user.verified_id ? (
                              <Check size={20} style={{ color: '#28c76f' }} />
                            ) : (
                              <X size={20} style={{ color: '#ea5455' }} />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">CNPJ Status</th>
                          <td>
                            <div className="d-flex justify-content-start align-items-center">
                              <Badge
                                color={user?.status_cnpj?.color || 'secondary'}
                              >
                                {user?.status_cnpj?.label || 'N/A'}
                              </Badge>
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <th scope="row">Conta criada em</th>
                          <td>
                            {moment(user.created_at).format(
                              'DD/MM/YYYY HH:mm',
                            ) || 'Não informado'}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <Table hover>
                      <thead>
                        <tr>
                          <th colSpan="2" className="title-table">
                            Conta báncaria
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Número</th>
                          <td>
                            {user.bank_account.account_number ||
                              'Não informado'}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Banco</th>
                          <td>
                            {user.bank_account.bank?.label || 'Não informado'}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Código</th>
                          <td>
                            {user.bank_account.bank_code || 'Não informado'}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Agência</th>
                          <td>{user.bank_account.agency || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Tipo</th>
                          <td>
                            {user.bank_account.account_type || 'Não informado'}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <Table hover className="mt-3">
                      <thead>
                        <tr>
                          <th colSpan="2" className="title-table">
                            Endereço
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Cidade</th>
                          <td>{user.address.city || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Estado</th>
                          <td>{user.address.state || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Bairro</th>
                          <td>
                            {user.address.neighborhood || 'Não informado'}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Rua</th>
                          <td>{user.address.street || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Número</th>
                          <td>{user.address.number || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Complemento</th>
                          <td>{user.address.complement || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">CEP</th>
                          <td>{user.address.zipcode || 'Não informado'}</td>
                        </tr>
                      </tbody>
                    </Table>

                    {user && user.onboarding && (
                      <OnboardingTable
                        onboarding={user.onboarding}
                        user={user}
                      />
                    )}
                  </TabPane>
                  <TabPane tabId="2">
                    <FormGroup className="filters">
                      <Label>ID ou Nome</Label>
                      <Input
                        onChange={({ target }) => {
                          setTimeout(() => {
                            setInputFilter(target.value);
                          }, 1000);
                        }}
                      />
                    </FormGroup>
                    <DataTable
                      columns={columns(userUuid)}
                      data={recordsProduct}
                      progressPending={loading}
                      pagination
                      paginationServer
                      paginationTotalRows={recordsCountProduct}
                      onChangeRowsPerPage={handleRecordsPerPageChangeProduct}
                      onChangePage={handleRecordsPageChangeProduct}
                      paginationComponentOptions={{
                        rowsPerPageText: 'Linhas por página:',
                        rangeSeparatorText: 'de',
                        noRowsPerPage: false,
                      }}
                      progressComponent={<Spinner />}
                      noDataComponent={<>Sem conteúdo</>}
                      theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                    />
                  </TabPane>
                  <TabPane tabId="3">
                    {activeItem && (
                      <Modal
                        isOpen={show}
                        toggle={() => {
                          setShow(false);
                        }}
                        centered
                      >
                        <ModalHeader toggle={() => setShow(!show)}>
                          Detalhes
                        </ModalHeader>
                        <ModalBody>
                          <Table hover>
                            <tbody>
                              <tr>
                                <th scope="row">Agência</th>
                                <td>
                                  {activeItem?.agency ||
                                    activeItem?.account_agency ||
                                    'Não informado'}
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Número da conta</th>
                                <td>
                                  {activeItem?.account_number ||
                                    'Não informado'}
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Banco</th>
                                <td>
                                  {activeItem?.bank_code ||
                                    activeItem?.bank_name ||
                                    'Não informado'}
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Tipo</th>
                                <td>
                                  {activeItem?.account_type ||
                                    activeItem?.type ||
                                    'Não informado'}
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Operação</th>
                                <td>
                                  {activeItem?.operation || 'Não informado'}
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Nome do Beneficiário</th>
                                <td>
                                  {activeItem?.recipient_name ||
                                    'Não informado'}
                                </td>
                              </tr>
                              <tr>
                                <th scope="row">Documento</th>
                                <td>
                                  {activeItem?.document_number ||
                                    'Não informado'}
                                </td>
                              </tr>
                              <h4 className="mt-2 mb-2">Histórico</h4>

                              {loading ? (
                                <Spinner color="white" />
                              ) : (
                                withdrawalInfo && (
                                  <>
                                    {withdrawalInfo.map((item) => (
                                      <>
                                        {item.created_at && (
                                          <>
                                            <tr>
                                              <th scope="row">Data</th>
                                              <td>{item.created_at}</td>
                                            </tr>
                                            <tr>
                                              <th scope="row">Status</th>
                                              <td>{item.type}</td>
                                            </tr>
                                          </>
                                        )}
                                        {item?.errors && (
                                          <tr>
                                            <th scope="row">Erros</th>

                                            <td>{item.errors}</td>
                                          </tr>
                                        )}
                                        {item?.message ===
                                          'Transaction is in manual approval' && (
                                            <tr>
                                              <th scope="row">Erros</th>
                                              <td>Saque em aprovação manual.</td>
                                              <td>{item.message}</td>
                                            </tr>
                                          )}
                                        <hr />
                                      </>
                                    ))}
                                  </>
                                )
                              )}
                            </tbody>
                          </Table>
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            color="primary"
                            onClick={() => {
                              setShow(false);
                            }}
                          >
                            Fechar
                          </Button>
                        </ModalFooter>
                      </Modal>
                    )}

                    {balance && (
                      <>
                        <Modal
                          isOpen={showFutureReleases}
                          toggle={() => setShowFutureReleases(false)}
                          centered
                        >
                          <ModalHeader
                            toggle={() =>
                              setShowFutureReleases(!showFutureReleases)
                            }
                          >
                            Lançamentos futuros
                          </ModalHeader>
                          <ModalBody>
                            <Table hover>
                              <tbody>
                                {balance.future_releases.length === 0 ? (
                                  'Não há registros'
                                ) : (
                                  <>
                                    {balance.future_releases.map((item) => (
                                      <>
                                        <tr>
                                          <th scope="row">Data</th>
                                          <td>
                                            {moment(item.release_date).format(
                                              'DD/MM/YYYY',
                                            )}
                                          </td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Valor</th>
                                          <td>{FormatBRL(item.amount)}</td>
                                        </tr>
                                      </>
                                    ))}
                                  </>
                                )}
                              </tbody>
                            </Table>
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              color="primary"
                              onClick={() => setShowFutureReleases(false)}
                            >
                              Fechar
                            </Button>
                          </ModalFooter>
                        </Modal>
                      </>
                    )}
                    {balance && (
                      <>
                        <Modal
                          isOpen={showWithdrawalBlocked}
                          toggle={() => {
                            setShowWithdrawalBlocked(false);
                            setBlockReason('');
                          }}
                          centered
                        >
                          <ModalHeader
                            toggle={() => {
                              setShowWithdrawalBlocked(false);
                              setBlockReason('');
                            }}
                          >
                            {balance?.withdrawal_blocked
                              ? 'Desbloquear saque'
                              : 'Bloquear saque'}
                          </ModalHeader>
                          <ModalBody>
                            <Alert color="danger" className="p-1">
                              <b>Atenção</b>: Você deseja{' '}
                              <b>
                                {balance?.withdrawal_blocked
                                  ? 'desbloquear'
                                  : 'bloquear'}
                              </b>{' '}
                              o saque do produtor?
                            </Alert>

                            <div className="mt-3">
                              <Label for="blockReason">
                                {balance?.withdrawal_blocked
                                  ? 'Motivo do desbloqueio'
                                  : 'Motivo do bloqueio'}{' '}
                                <span className="text-danger">*</span>
                              </Label>
                              <Input
                                type="textarea"
                                id="blockReason"
                                name="blockReason"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder={
                                  balance?.withdrawal_blocked
                                    ? 'Digite o motivo do desbloqueio do saque...'
                                    : 'Digite o motivo do bloqueio do saque...'
                                }
                                maxLength={500}
                                rows={4}
                                className="mt-1"
                              />
                              <small className="text-muted">
                                {blockReason.length}/500 caracteres
                              </small>
                            </div>

                            <p className="mt-3">
                              Ao apertar o botão abaixo o saque do produtor será{' '}
                              <b>
                                {balance?.withdrawal_blocked
                                  ? 'desbloqueado'
                                  : 'bloqueado'}
                              </b>
                              . Você tem certeza que quer tomar esta ação?
                            </p>
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              color="secondary"
                              onClick={() => {
                                setShowWithdrawalBlocked(false);
                                setBlockReason('');
                              }}
                              className="me-2"
                            >
                              Cancelar
                            </Button>
                            <Button
                              color="danger"
                              onClick={() => fetchBlockedWithdrawal()}
                              disabled={!blockReason.trim()}
                            >
                              {loading ? (
                                <Spinner size="sm" />
                              ) : balance?.withdrawal_blocked ? (
                                'Confirmar desbloqueio'
                              ) : (
                                'Confirmar bloqueio'
                              )}
                            </Button>
                          </ModalFooter>
                        </Modal>
                      </>
                    )}

                    <BlockNotesModal
                      show={showBlockNotes}
                      loading={loading}
                      notes={blockNotes}
                      userUuid={userUuid}
                      onClose={() => setShowBlockNotes(false)}
                    />

                    <div className="row-balance">
                      <div className="balance-avaliable">
                        <div className="icon">
                          <DollarSign />
                        </div>
                        <div className="item-content">
                          <div>Saldo liberado</div>
                          <div className="value">
                            {FormatBRL(balance?.available_balance)}
                          </div>
                        </div>
                      </div>
                      <div className="balance-pending">
                        <div className="item-content">
                          <div className="label">Saldo indicação</div>
                          <div className="value">
                            {FormatBRL(balance?.referral_balance)}
                          </div>
                        </div>
                      </div>
                      <div className="balance-pending">
                        <div className="item-content">
                          <div className="label">
                            Saldo pendente{' '}
                            <span
                              className="icon"
                              onClick={() => setShowFutureReleases(true)}
                            >
                              <Info />
                            </span>
                          </div>
                          <div className="value">
                            {FormatBRL(balance?.pending_balance)}
                          </div>
                        </div>
                      </div>
                      <div className="balance-pending">
                        <div className="item-content">
                          <div className="label">Reserva de segurança</div>
                          <div className="value">
                            {FormatBRL(balance?.withheld_balance)}
                          </div>
                        </div>
                      </div>
                      <div className="balance-pending">
                        <div className="item-content">
                          <div className="label">Disponivel para saque</div>
                          <div className="value">
                            {FormatBRL(balance?.max_withdrawal_amount)}
                          </div>
                        </div>
                      </div>
                      <div className="balance-pending">
                        <div className="item-content">
                          <div className="label">Total em saque</div>
                          <div className="value">
                            {FormatBRL(balance?.total_withdrawal)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => setShowWithdrawalBlocked(true)}
                        className="mt-2"
                        outline
                        disabled={
                          balance?.withdrawal_blocked
                            ? !ability.can(
                              'manage',
                              'Producers.unblock-withdraw',
                            )
                            : !ability.can('manage', 'Producers.block-withdraw')
                        }
                      >
                        {loading ? (
                          <Spinner />
                        ) : balance?.withdrawal_blocked ? (
                          'Desbloquear saque'
                        ) : (
                          'Bloquear saque'
                        )}
                      </Button>
                    }

                    <Button
                      color="success"
                      size="sm"
                      onClick={(e) => downloadToExcel(e)}
                      className="mt-2"
                      outline
                      style={{ marginLeft: '20px' }}
                    >
                      EXPORTAR PARA EXCEL
                    </Button>

                    <DataTable
                      className="mt-2"
                      columns={columnsWithdraw(openModal, fetchInfoDetails)}
                      data={recordsWithdraw}
                      progressPending={loading}
                      pagination
                      paginationServer
                      paginationTotalRows={recordsCountWithdraw}
                      onChangeRowsPerPage={handleRecordsPerPageChangeWithdraw}
                      onChangePage={handleRecordsPageChangeWithDraw}
                      paginationComponentOptions={{
                        rowsPerPageText: 'Linhas por página:',
                        rangeSeparatorText: 'de',
                        noRowsPerPage: false,
                      }}
                      progressComponent={<Spinner />}
                      noDataComponent={<>Sem saques solicitados</>}
                      theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                    />
                  </TabPane>
                  <TabPane tabId="4">
                    <Table hover>
                      <thead>
                        <tr>
                          <th colSpan="2" className="title-table">
                            Informações de CNPJ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">CNPJ</th>
                          <td>{recordsCnpj.cnpj || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <th scope="row">Status</th>
                          <td>
                            <Badge color={recordsCnpj.status?.color}>
                              {recordsCnpj.status?.label}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>

                    <h2 className="p-2 pb-0" style={{ color: '#349888' }}>
                      KYC
                    </h2>
                    <DataTable
                      columns={columnsKyc(showDocuments)}
                      data={recordsKyc}
                      progressPending={loading}
                      pagination
                      paginationServer
                      paginationTotalRows={recordsCountKyc}
                      paginationComponentOptions={{
                        rowsPerPageText: 'Linhas por página:',
                        rangeSeparatorText: 'de',
                        noRowsPerPage: false,
                      }}
                      progressComponent={<Spinner />}
                      noDataComponent={<>Sem conteúdo</>}
                      theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                    />
                  </TabPane>
                  <TabPane tabId="5">
                    {balanceMetrics && (
                      <div className="row-balance">
                        <div className="balance-avaliable">
                          <div className="icon">
                            <DollarSign />
                          </div>
                          <div className="item-content">
                            <div>Vendas confirmadas</div>
                            <div className="value">
                              {FormatBRL(balanceMetrics?.paid)}
                            </div>
                          </div>
                        </div>
                        <div className="balance-pending">
                          <div className="item-content">
                            <div className="label">Reembolsos solicitados</div>
                            <div className="value">
                              {FormatBRL(balanceMetrics?.pending_refund)}
                            </div>
                          </div>
                        </div>
                        <div className="balance-pending">
                          <div className="item-content">
                            <div className="label">Reembolsos</div>
                            <div className="value">
                              {FormatBRL(balanceMetrics?.refunded)}
                            </div>
                          </div>
                        </div>
                        <div className="balance-pending">
                          <div className="item-content">
                            <div className="label">Últimos 30 dias</div>
                            <div className="value">
                              {FormatBRL(balanceMetrics?.last_third_days)}
                            </div>
                          </div>
                        </div>

                        <Modal
                          isOpen={modalFilterShow}
                          toggle={() => setModalFilterShow(false)}
                          centered
                        >
                          <ModalHeader toggle={() => setModalFilterShow(false)}>
                            <div>Filtrar</div>
                          </ModalHeader>
                          <ModalBody>
                            <FilterSales
                              register={register}
                              getValues={getValues}
                              setValue={setValue}
                              userUuid={userUuid}
                            />
                          </ModalBody>
                          <ModalFooter>
                            <Button
                              size={'sm'}
                              color="light"
                              onClick={() => removeFilters()}
                            >
                              Remover Filtros
                            </Button>
                            <Button
                              size={'sm'}
                              color="primary"
                              onClick={handleSubmit(onSubmit)}
                            >
                              Aplicar Filtros
                            </Button>
                          </ModalFooter>
                        </Modal>
                      </div>
                    )}
                    {salesChartsMetrics && displayMetrics(salesChartsMetrics)}
                    {salesDetails && (
                      <Modal
                        isOpen={showSalesDetails}
                        toggle={() => setShowSalesDetails(false)}
                        centered
                        size="lg"
                      >
                        <ModalHeader
                          toggle={() => setShowSalesDetails(!showSalesDetails)}
                        >
                          Detalhes da Venda
                        </ModalHeader>
                        <ModalBody>
                          <Table hover>
                            <thead>
                              <tr>
                                <div
                                  className="title-table"
                                  style={{
                                    fontWeight: 500,
                                    color: '#349888',
                                  }}
                                >
                                  Geral
                                </div>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th scope="row">ID</th>
                                <td>{salesDetails.uuid}</td>
                              </tr>
                              <tr>
                                <th scope="row">Preço</th>
                                <td>{FormatBRL(salesDetails.price)}</td>
                              </tr>
                              <tr>
                                <th scope="row">Método de pagamento</th>
                                <td>{salesDetails.payment_method?.label}</td>
                              </tr>
                              {salesDetails.payment_method.key === 'card' && (
                                <tr>
                                  <th scope="row">Parcelas</th>
                                  <td>{salesDetails.installments}</td>
                                </tr>
                              )}
                              {salesDetails.payment_method.key === 'billet' && (
                                <tr>
                                  <th scope="row">URL Boleto</th>
                                  <td>
                                    <a
                                      href={salesDetails?.charge?.billet_url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      Link
                                    </a>
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <th scope="row">Prazo máximo de reembolso</th>
                                <td>
                                  {moment(
                                    salesDetails.valid_refund_until,
                                  ).format('DD/MM/YYYY HH:mm')}
                                </td>
                              </tr>
                              {salesDetails.coupon && (
                                <tr>
                                  <th scope="row">Cupom</th>
                                  <td>
                                    {salesDetails.coupon.label} -{' '}
                                    {salesDetails.coupon.percentage}%
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                          <Table hover>
                            <thead>
                              <tr>
                                <div
                                  className="title-table"
                                  style={{
                                    fontWeight: 500,
                                    color: '#349888',
                                  }}
                                >
                                  Cliente
                                </div>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th scope="row">ID</th>
                                <td>{salesDetails.student?.uuid}</td>
                              </tr>
                              <tr>
                                <th scope="row">Nome</th>
                                <td>{salesDetails.student?.full_name}</td>
                              </tr>
                              <tr>
                                <th scope="row">E-mail</th>
                                <td>{salesDetails.student?.email}</td>
                              </tr>
                              <tr>
                                <th scope="row">CPF</th>
                                <td>
                                  {salesDetails.student?.document_number
                                    ? formatDocument(
                                      salesDetails.student?.document_number,
                                      'CPF',
                                    )
                                    : '-'}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                          <Table>
                            <Accordion open={open} toggle={toggleAccord}>
                              {salesDetails.transactions.map((item, index) => (
                                <AccordionItem>
                                  <AccordionHeader
                                    targetId={index + 1}
                                    className="p-0"
                                  >
                                    <div
                                      style={{
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#349888',
                                        marginLeft: '12px',
                                      }}
                                    >
                                      Comissão {index + 1}
                                    </div>
                                  </AccordionHeader>
                                  <AccordionBody
                                    accordionId={index + 1}
                                    className="p-0"
                                  >
                                    <Table>
                                      <tbody>
                                        <tr>
                                          <th scope="row">ID</th>
                                          <td>{item.user?.uuid}</td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Tipo</th>
                                          <td>{item.role}</td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Nome</th>
                                          <td>{item.user?.full_name}</td>
                                        </tr>
                                        <tr>
                                          <th scope="row">E-mail</th>
                                          <td>{item.user?.email}</td>
                                        </tr>

                                        <tr>
                                          <th scope="row">Valor da comissão</th>
                                          <td>
                                            {FormatBRL(item.user_net_amount)}
                                          </td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Status</th>
                                          <td>
                                            <Badge color={item.status?.color}>
                                              {item.status?.label}
                                            </Badge>
                                          </td>
                                        </tr>
                                        <tr>
                                          <th scope="row">Data de pagamento</th>
                                          <td>
                                            {item.release_date
                                              ? moment(
                                                item.release_date,
                                              ).format('DD/MM/YYYY')
                                              : 'Não informado'}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </Table>
                                  </AccordionBody>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </Table>
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            color="primary"
                            onClick={() => setShowSalesDetails(false)}
                          >
                            Fechar
                          </Button>
                        </ModalFooter>
                      </Modal>
                    )}
                    <div className="mt-3 mb-2">
                      <Col className="search-group">
                        <div className="form-group ">
                          <i className="bx bx-search" />
                          <input
                            className="form-control"
                            placeholder="Buscar..."
                            type="text"
                            ref={inputRef}
                            onChange={(e) => {
                              clearTimeout(delayDebounce);
                              setDelayDebounce(
                                setTimeout(() => {
                                  setSearchTerm(e.target.value);
                                }, 1000),
                              );
                            }}
                          />
                        </div>
                        <Button
                          style={{ height: '100%' }}
                          onClick={() => setModalFilterShow(true)}
                          color="primary"
                        >
                          Filtrar
                        </Button>
                      </Col>

                      <DataTable
                        columns={columnsSales(salesDetailsProducer)}
                        data={recordsSales}
                        progressPending={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={recordsCountSales}
                        onChangeRowsPerPage={handleRecordsPerPageChangeSales}
                        onChangePage={handleRecordsPageChangeSales}
                        paginationComponentOptions={{
                          rowsPerPageText: 'Linhas por página:',
                          rangeSeparatorText: 'de',
                          noRowsPerPage: false,
                        }}
                        progressComponent={<Spinner />}
                        noDataComponent={<>Sem vendas</>}
                        theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                      />
                    </div>
                  </TabPane>
                  <TabPane tabId="6">
                    <DataTable
                      columns={columnsCoproductions()}
                      data={recordsCoproductions}
                      progressPending={loading}
                      pagination
                      paginationServer
                      paginationTotalRows={recordsCountCoproductions}
                      onChangeRowsPerPage={
                        handleRecordsPerPageChangeCoproductions
                      }
                      onChangePage={handleRecordsPageChangeCoproductions}
                      paginationComponentOptions={{
                        rowsPerPageText: 'Linhas por página:',
                        rangeSeparatorText: 'de',
                        noRowsPerPage: false,
                      }}
                      progressComponent={<Spinner />}
                      noDataComponent={<>Sem coproduções</>}
                      theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                    />
                  </TabPane>
                  <TabPane tabId="7">
                    <DataTable
                      columns={columnsAffiliations()}
                      data={recordsAffiliations}
                      progressPending={loading}
                      pagination
                      paginationServer
                      paginationTotalRows={recordsCountAffiliations}
                      onChangeRowsPerPage={
                        handleRecordsPerPageChangeAffiliations
                      }
                      onChangePage={handleRecordsPageChangeAffiliations}
                      paginationComponentOptions={{
                        rowsPerPageText: 'Linhas por página:',
                        rangeSeparatorText: 'de',
                        noRowsPerPage: false,
                      }}
                      progressComponent={<Spinner />}
                      noDataComponent={<>Sem afiliações</>}
                      theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                    />
                  </TabPane>
                  <TabPane tabId="8">
                    <Table hover>
                      <thead>
                        <tr>
                          <th colSpan="2" className="title-table">
                            Tarifa Pix
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Variavel</th>
                          <td>{fields.fee_variable_pix_service || 0}%</td>
                          {ability.can(
                            'manage',
                            'Financeiro.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    handleChange(
                                      fields.fee_variable_pix_service || 0,
                                      'variable',
                                      'pix',
                                    );
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                        <tr>
                          <th scope="row">Fixa</th>
                          <td>
                            {FormatBRL(fields.fee_fixed_pix_service || 0)}
                          </td>
                          {ability.can(
                            'manage',
                            'Producers.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    handleChange(
                                      fields.fee_fixed_pix_service || 0,
                                      'fixed',
                                      'pix',
                                    );
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                      </tbody>
                    </Table>
                    <Table hover>
                      <thead>
                        <tr>
                          <th colSpan="2" className="title-table">
                            Tarifa Boleto
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Variavel</th>
                          <td>{fields.fee_variable_billet_service}%</td>
                          {ability.can(
                            'manage',
                            'Producers.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    handleChange(
                                      fields.fee_variable_pix_service,
                                      'variable',
                                      'billet',
                                    );
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                        <tr>
                          <th scope="row">Fixa</th>
                          <td>{FormatBRL(fields.fee_fixed_billet_service)}</td>
                          {ability.can(
                            'manage',
                            'Producers.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    handleChange(
                                      fields.fee_fixed_pix_service,
                                      'fixed',
                                      'billet',
                                    );
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                      </tbody>
                    </Table>
                    <div className="table-card d-flex gap-0 pl-4 mt-3">
                      <div>
                        <div className="title-table mb-2">
                          Tarifa Cartão Variavel
                        </div>
                        <Table className={'w-25'}>
                          <thead>
                            <tr>
                              <th>Parcela</th>
                              <th>Tarifa</th>
                            </tr>
                          </thead>

                          <tbody>
                            {Object.keys(
                              fields.fee_variable_card_service || {},
                            ).map((item, index) => {
                              return (
                                <tr>
                                  <th>{index + 1}</th>
                                  <th>
                                    {((fields.fee_variable_card_service || {})[
                                      index + 1
                                    ] || 0) + '%'}
                                  </th>
                                  <div
                                    className="icon"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                      handleChangeCard(
                                        item,
                                        (fields.fee_variable_card_service ||
                                          {})[index + 1] || 0,
                                        index,
                                        'variable',
                                      )
                                    }
                                  >
                                    <i className="bx bxs-pencil"></i>
                                  </div>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <div>
                        <div className="title-table mb-2">
                          Tarifa Cartão Fixo
                        </div>
                        <Table className={'w-25'}>
                          <thead>
                            <tr>
                              <th>Parcela</th>
                              <th>Tarifa</th>
                            </tr>
                          </thead>

                          <tbody>
                            {Object.keys(
                              fields.fee_fixed_card_service || {},
                            ).map((item, index) => {
                              return (
                                <tr>
                                  <th>{index + 1}</th>
                                  <th>
                                    {FormatBRL(
                                      (fields.fee_fixed_card_service || {})[
                                      index + 1
                                      ] || 0,
                                    )}
                                  </th>
                                  <div
                                    className="icon"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                      handleChangeCard(
                                        item,
                                        (fields.fee_fixed_card_service || {})[
                                        index + 1
                                        ] || 0,
                                        index,
                                        'fixed',
                                      )
                                    }
                                  >
                                    <i className="bx bxs-pencil"></i>
                                  </div>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                    <Table hover className="mt-2">
                      <thead>
                        <tr>
                          <th colSpan="2" className="title-table">
                            Prazo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Boleto</th>
                          <td>
                            <div>
                              {fields.release_billet}{' '}
                              {fields.release_billet > 1 ? 'dias' : 'dia'}
                            </div>
                          </td>
                          {ability.can(
                            'manage',
                            'Producers.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setNameField('release_billet');
                                    setShowChangeFee(true);
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                        <tr>
                          <th scope="row">Cartão</th>
                          <td>
                            {fields.release_credit_card}{' '}
                            {fields.release_credit_card > 1 ? 'dias' : 'dia'}
                          </td>
                          {ability.can(
                            'manage',
                            'Producers.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setNameField('release_credit_card');
                                    setShowChangeFee(true);
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                        <tr>
                          <th scope="row">Pix</th>
                          <td>
                            {fields.release_pix}{' '}
                            {fields.release_pix > 1 ? 'dias' : 'dia'}
                          </td>
                          {ability.can(
                            'manage',
                            'Producers.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setNameField('release_pix');
                                    setShowChangeFee(true);
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                      </tbody>
                    </Table>
                    <Table hover className="mt-2">
                      <thead>
                        <tr>
                          <div className="title-table">
                            Reserva de segurança
                          </div>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Porcentagem</th>
                          <td>{fields?.withheld_balance_percentage}%</td>
                          {ability.can(
                            'manage',
                            'Producers.edit-service-fees',
                          ) && (
                              <td>
                                <Badge
                                  color="primary"
                                  className="view-details"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setNameField('withheld_balance_percentage');
                                    setShowChangeFee(true);
                                  }}
                                >
                                  <Settings />
                                </Badge>
                              </td>
                            )}
                        </tr>
                        <tr>
                          <th>Usar apenas porcentagem</th>
                          <td>{!fields?.use_highest_sale ? 'Sim' : 'Não'}</td>
                          {ability.can(
                            'manage',
                            'Producers.toggle-highest-sale',
                          ) && (
                              <td>
                                <FormGroup>
                                  <Input
                                    type="switch"
                                    checked={!fields?.use_highest_sale}
                                    onClick={() => {
                                      onSubmitSwitch();
                                    }}
                                  />
                                </FormGroup>
                              </td>
                            )}
                        </tr>
                      </tbody>
                    </Table>
                  </TabPane>
                  <TabPane tabId="9">
                    <ViewPagarme user={user} />
                  </TabPane>
                  <TabPane tabId="10">
                    {referralLoading ? (
                      <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ height: '200px' }}
                      >
                        <Spinner color="primary" />
                      </div>
                    ) : (
                      <div>
                        <Row className="mb-0">
                          {referralData &&
                            referralData.has_referral_program && (
                              <Col md={3}>
                                <Card className="text-center">
                                  <CardBody>
                                    <div className="d-flex align-items-center justify-content-center mb-2">
                                      <Gift
                                        size={24}
                                        className="text-success me-2"
                                      />
                                      <h6 className="mb-0">
                                        Status do Programa
                                      </h6>
                                    </div>
                                    <FormGroup>
                                      <Input
                                        type="select"
                                        value={
                                          referralData.referral_program?.status
                                            ?.key === 'active'
                                            ? '1'
                                            : '2'
                                        }
                                        onChange={(e) =>
                                          handleReferralStatusChange(
                                            e.target.value,
                                          )
                                        }
                                        style={{ textAlign: 'center' }}
                                      >
                                        <option value="1">Ativo</option>
                                        <option value="2">Bloqueado</option>
                                      </Input>
                                    </FormGroup>
                                  </CardBody>
                                </Card>
                              </Col>
                            )}

                          <Col md={3}>
                            <Card className="text-center">
                              <CardBody>
                                <div className="d-flex align-items-center justify-content-center mb-2">
                                  <X size={24} className="text-danger me-2" />
                                  <h6 className="mb-0">Produtos bloqueados</h6>
                                </div>
                                <FormGroup>
                                  <Input
                                    type="select"
                                    value={
                                      referralData?.referral_disabled
                                        ? 'true'
                                        : 'false'
                                    }
                                    onChange={(e) =>
                                      handleReferralDisabledChange(
                                        e.target.value === 'true',
                                      )
                                    }
                                    style={{ textAlign: 'center' }}
                                  >
                                    <option value="false">Não</option>
                                    <option value="true">Sim</option>
                                  </Input>
                                </FormGroup>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>

                        <Row className="mb-4">
                          {referralData &&
                            referralData.has_referral_program && (
                              <>
                                <Col md={3}>
                                  <Card className="text-center">
                                    <CardBody>
                                      <div className="d-flex align-items-center justify-content-center mb-2">
                                        <UserCheck
                                          size={24}
                                          className="text-secondary me-2"
                                        />
                                        <h6 className="mb-0">
                                          Pessoas Indicadas
                                        </h6>
                                      </div>
                                      <h4 className="text-secondary">
                                        {referralData.total_people_referred}
                                      </h4>
                                    </CardBody>
                                  </Card>
                                </Col>
                                <Col md={3}>
                                  <Card className="text-center">
                                    <CardBody>
                                      <div className="d-flex align-items-center justify-content-center mb-2">
                                        <DollarSign
                                          size={24}
                                          className="text-success me-2"
                                        />
                                        <h6 className="mb-0">Saldo Total</h6>
                                      </div>
                                      <h4 className="text-success">
                                        R${' '}
                                        {(
                                          referralData.referral_balance || 0
                                        ).toFixed(2)}
                                      </h4>
                                    </CardBody>
                                  </Card>
                                </Col>
                                <Col md={3}>
                                  <Card className="text-center">
                                    <CardBody>
                                      <div className="d-flex align-items-center justify-content-center mb-2">
                                        <Clock
                                          size={24}
                                          className="text-warning me-2"
                                        />
                                        <h6 className="mb-0">Pendentes</h6>
                                      </div>
                                      <h4 className="text-warning">
                                        R${' '}
                                        {(
                                          referralData.pending_commissions || 0
                                        ).toFixed(2)}
                                      </h4>
                                    </CardBody>
                                  </Card>
                                </Col>
                                <Col md={3}>
                                  <Card className="text-center">
                                    <CardBody>
                                      <div className="d-flex align-items-center justify-content-center mb-2">
                                        <TrendingUp
                                          size={24}
                                          className="text-primary me-2"
                                        />
                                        <h6 className="mb-0">Total Ganho</h6>
                                      </div>
                                      <h4 className="text-primary">
                                        R${' '}
                                        {(
                                          referralData.total_earned || 0
                                        ).toFixed(2)}
                                      </h4>
                                    </CardBody>
                                  </Card>
                                </Col>
                              </>
                            )}
                        </Row>
                        {!referralData?.has_referral_program && (
                          <Alert color="info">
                            <h5>Programa de Indicação</h5>
                            <p className="mb-0">
                              Este usuário não participa do programa de
                              indicação.
                            </p>
                          </Alert>
                        )}
                      </div>
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </section>
          <ChangeFee
            name={nameField}
            user={user}
            setUser={setUser}
            show={showChangeFee}
            setShow={setShowChangeFee}
          />
        </>
      )}
      <Modal
        isOpen={showIpLogsModal}
        toggle={() => setShowIpLogsModal(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setShowIpLogsModal(false)}>
          Logs de IP do usuário
        </ModalHeader>
        <ModalBody>
          {ipLogsLoading ? (
            <Spinner />
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>IP</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {ipLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4">Nenhum log encontrado</td>
                  </tr>
                ) : (
                  ipLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.ip}</td>
                      <td>
                        {moment(log.created_at).format('DD/MM/YYYY HH:mm:ss')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setShowIpLogsModal(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ViewProducerInfo;
