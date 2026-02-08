import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../../utility/hooks/useSkin';
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Input,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  CardHeader,
} from 'reactstrap';
import '../../assets/scss/pages/producers.scss';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import memoizeOne from 'memoize-one';
import { api } from '@services/api';
import { formatDocument, maskPhone } from '@utils';
import ViewProducerSales from './ViewProducerSales';
import ViewProducerCoproduction from './ViewProducerCoproduction';
import ViewProducerAffiliates from './ViewProducerAffiliates';
import { useHistory, Link } from 'react-router-dom';
import { Settings, ArrowRightCircle } from 'react-feather';
import moment from 'moment';
import { Calendar } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import { toast } from 'react-toastify';
import { configNotify } from '../../configs/toastConfig';
import ReactTooltip from 'react-tooltip';
import LoadingSpinner from '../../components/LoadingSpinner';

const columns = memoizeOne(
  (
    toggleShowSalesDetails,
    toggleShowCoproduction,
    toggleShowAffiliates,
    history,
    generateAccess,
    requesting,
    setRequesting,
    skin,
  ) => [
      {
        name: 'Email',
        cell: (row) => row.email,
      },
      {
        name: 'Nome',
        cell: (row) => row.full_name,
      },
      {
        name: 'Documento',
        cell: (row) => formatDocument(row.document_number, 'CPF'),
      },
      {
        name: 'Telefone',
        cell: (row) => maskPhone(row.whatsapp),
      },
      {
        name: 'Criado Em',
        cell: (row) => moment(row.created_at).format('DD/MM/YYYY'),
      },
      {
        name: 'Status',
        cell: (row) => (
          <Badge color={row.status.color} className="view-details">
            {row.status.label}
          </Badge>
        ),
      },
      {
        name: 'Ações',
        cell: ({ uuid }) => {
          return (
            <>
              <Link to={`/producer/${uuid}`} className="mr-2">
                <Badge color="primary" className="view-details">
                  <Settings size={20} />
                </Badge>
              </Link>
              {!requesting && (
                <>
                  <Badge
                    color="warning"
                    className="view-details"
                    data-tip="Acessar Painel"
                    data-for={`tooltip-${uuid}`}
                    onClick={(e) => generateAccess(e, uuid, setRequesting)}
                  >
                    <ArrowRightCircle size={20} />
                  </Badge>
                  <ReactTooltip
                    id={`tooltip-${uuid}`}
                    place="top"
                    effect="solid"
                  />
                </>
              )}
              {requesting && <span>...</span>}
            </>
          );
        },
      },
    ],
);

export default function HomeProducers() {
  const { skin } = useSkin();
  const [records, setRecords] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [inputFilter, setInputFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [showCoproduction, setShowCoproduction] = useState(false);
  const [showAffiliates, setShowAffiliates] = useState(false);
  const history = useHistory();

  const [modalFilter, setModalFilter] = useState(false);

  const [details, setDetails] = useState(null);

  const [fields, setFields] = useState({
    follow_up: '',
    blocked_withdrawal: '',
    negative_balance: '',
  });

  const [filter, setFilter] = useState({
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });

  const [requesting, setRequesting] = useState(false);

  const generateAccess = async (e, uuid, setRequesting) => {
    e.preventDefault();

    setRequesting(true);

    try {
      const response = await api.get(`/users/${uuid}/generate-access`);
      const { token } = response.data;
      window.open(
        `https://dash.b4you.com.br/acessar?backoffice=${token}`,
        '_blank',
      );
    } catch (error) {
      toast.error(
        'Falha ao gerar acesso, por favor, tente novamente mais tarde',
        configNotify,
      );
    } finally {
      setRequesting(false);
    }
  };
  const fetchProducers = async (page, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPage);
      const trimmedInput = inputFilter.trim();
      if (trimmedInput) query.append('input', trimmedInput);
      Object.keys(fields).forEach((element) => {
        query.append(element, fields[element]);
      });

      const response = await api.get(`/users?${query.toString()}`);
      const {
        data: { info },
      } = response;
      setRecordsCount(info.count);
      setRecords(info.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (newPerPage, page) => {
    await fetchProducers(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page) => {
    fetchProducers(page - 1);
  };

  const toggleShowSalesDetails = (_, data = null) => {
    if (data) setDetails(data);
    setShowSalesDetails(!showSalesDetails);
  };

  const toggleShowCoproduction = (_, data = null) => {
    if (data) setDetails(data);
    setShowCoproduction(!showCoproduction);
  };

  const toggleShowAffiliates = (_, data = null) => {
    if (data) setDetails(data);
    setShowAffiliates(!showAffiliates);
  };

  useEffect(() => {
    if (inputFilter.length === 0 || inputFilter.trim().length > 0)
      fetchProducers(0);
  }, [inputFilter]);

  const changeFilter = (e) => {
    setFields((prev) => ({
      ...prev,
      [e.currentTarget.name]: e.currentTarget.value,
    }));
  };

  const submitExport = async () => {
    if (moment(filter.calendar[1]).diff(moment(filter.calendar[0]), 'd') > 31) {
      toast.error(
        'Selecione o máximo de 31 dias para exportar os produtores',
        configNotify,
      );
      return;
    }
    toast.success('Exportando... Essa operação pode demorar', configNotify);
    setRequesting(true);

    try {
      await api
        .get(
          `users/export?start_date=${moment(filter.calendar[0]).format(
            'YYYY-MM-DD',
          )}&end_date=${moment(filter.calendar[1]).format('YYYY-MM-DD')}`,
          {
            responseType: 'blob',
          },
        )
        .then((r) => {
          const url = window.URL.createObjectURL(new Blob([r.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `${moment(filter.calendar[0]).format('YYYY-MM-DD')}_${moment(
              filter.calendar[1],
            ).format('YYYY-MM-DD')}.xlsx`,
          );
          document.body.appendChild(link);
          link.click();
        })
        .catch((err) => toast.error('Erro ao baixar arquivo', configNotify))
        .finally(() => setRequesting(false));
    } catch (error) {
      toast.error('Erro ao baixar arquivo', configNotify);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <section id="pageHomeProducers">
      <h2 className="mb-2">Produtores</h2>
      <ViewProducerSales
        show={showSalesDetails}
        toggle={toggleShowSalesDetails}
        data={details}
      />
      <ViewProducerCoproduction
        show={showCoproduction}
        toggle={toggleShowCoproduction}
        data={details}
      />
      <ViewProducerAffiliates
        show={showAffiliates}
        toggle={toggleShowAffiliates}
        data={details}
      />
      <Modal
        isOpen={modalFilter}
        toggle={() => {
          setModalFilter(false);
        }}
        centered
      >
        <ModalHeader toggle={() => setModalFilter(!modalFilter)}>
          Filtrar
        </ModalHeader>
        <ModalBody>
          <div className="mb-1">
            <Label className="mb-1">Alerta</Label>
            <Input
              type="select"
              name="follow_up"
              onChange={changeFilter}
              defaultValue={fields.follow_up}
            >
              <option value="">Não</option>
              <option value="1">Sim</option>
            </Input>
          </div>
          <div className="mb-1">
            <Label className="mb-1">Saque bloqueado</Label>
            <Input
              type="select"
              name="blocked_withdrawal"
              onChange={changeFilter}
              defaultValue={fields.blocked_withdrawal}
            >
              <option value="">Não</option>
              <option value="1">Sim</option>
            </Input>
          </div>
          <div className="mb-1">
            <Label className="mb-1">Saldo negativo</Label>
            <Input
              type="select"
              name="negative_balance"
              onChange={changeFilter}
              defaultValue={fields.negative_balance}
            >
              <option value="">Não</option>
              <option value="1">Sim</option>
            </Input>
          </div>

          <div className="d-flex justify-content-end">
            <Button
              color="primary"
              className="mt-1 mb-1"
              onClick={() => {
                fetchProducers(0);
                setModalFilter(false);
              }}
            >
              Filtrar
            </Button>
          </div>
        </ModalBody>
      </Modal>
      <Card>
        <CardBody>
          <FormGroup className="filters">
            <Label>Nome / E-mail / CPF / CNPJ</Label>
            <div className="d-flex">
              <Input
                onChange={({ target }) => {
                  setTimeout(() => {
                    setInputFilter(target.value);
                  }, 1000);
                }}
              />
              <Button
                color="primary"
                style={{ borderRadius: '0px 8px 8px 0px' }}
                onClick={() => setModalFilter(true)}
              >
                Filtrar
              </Button>
            </div>
          </FormGroup>
        </CardBody>
      </Card>
      <Card>
        <CardHeader className="flex-sm-row flex-column justify-content-sm-between justify-content-center align-items-sm-center align-items-start">
          <div className="d-flex flex-row justify-content-between w-100">
            <div className="d-flex align-items-center ml-2">
              <Calendar size={15} className="ml-2" />
              <Flatpickr
                className="form-control flat-picker bg-transparent border-0 shadow-none"
                value={filter.calendar}
                style={{ width: '205px' }}
                onChange={(date) =>
                  setFilter((prev) => ({ ...prev, calendar: date }))
                }
                options={{
                  mode: 'range',
                  // eslint-disable-next-line no-mixed-operators
                  dateFormat: 'd/m/Y',
                }}
              />
            </div>
            <div>
              <Button color="primary" onClick={submitExport}>
                {requesting ? 'Baixando...' : 'Exportar'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardBody>
          <DataTable
            columns={columns(
              toggleShowSalesDetails,
              toggleShowCoproduction,
              toggleShowAffiliates,
              history,
              generateAccess,
              requesting,
              setRequesting,
              skin,
            )}
            data={records}
            progressPending={loading}
            progressComponent={<LoadingSpinner text="Carregando..." showText />}
            pagination
            paginationServer
            paginationTotalRows={recordsCount}
            onChangeRowsPerPage={handleRecordsPerPageChange}
            onChangePage={handleRecordsPageChange}
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: false,
            }}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        </CardBody>
      </Card>
    </section>
  );
}
