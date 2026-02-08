import { FormatBRL } from '@utils';
import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { ThumbsDown, ThumbsUp } from 'react-feather';
import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  CardBody,
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
  TabContent,
  TabPane,
} from 'reactstrap';
import { api } from '../services/api';
import { useSkin } from '../utility/hooks/useSkin';

const columns = memoizeOne((toggleAction, openModalAndSelectedRowId) => [
  {
    name: 'ID',
    cell: (row) => row.id,
    width: `100px`,
  },
  {
    name: 'Usuário',
    width: '300px',
    cell: (row) => (
      <div>
        <div>{row.full_name}</div>
        <div>{row.producer_uuid ? (<Link to={`/producer/${row.producer_uuid}`} style={{ textDecoration: "underline" }}>{row.email}</Link>) : row.email}</div>
        <div>{row.bank_account.document}</div>
      </div>
    ),
  },
  {
    name: 'Valor',
    cell: (row) => FormatBRL(row.amount),
  },
  {
    name: 'Banco',
    cell: (row) => row.bank_account.code,
  },
  {
    name: 'Agencia',
    cell: (row) => row.bank_account.agency,
  },
  {
    name: 'Conta',
    cell: (row) => row.bank_account.number,
  },
  {
    name: 'Solicitado em',
    cell: (row) => row.created_at,
  },
  {
    name: 'Ações',
    center: true,
    cell: (row) => {
      return (
        <div className="w-100 d-flex justify-content-around">
          <Button
            size="sm"
            color="light"
            onClick={() => openModalAndSelectedRowId(row.id)}
          >
            <ThumbsUp color="green" size="14"></ThumbsUp>
          </Button>
          <Button
            size="sm"
            color="light"
            onClick={() => toggleAction(row.id, 0)}
          >
            <ThumbsDown color="red" size="14"></ThumbsDown>
          </Button>
        </div>
      );
    },
  },
]);

const columnsPaidAndDenied = memoizeOne(() => [
  {
    name: 'ID',
    cell: (row) => row.id,
    width: `100px`,
  },
  {
    name: 'Usuário',
    width: '300px',
    cell: (row) => (
      <div>
        <div>{row.full_name}</div>
        <div>{row.producer_uuid ? (<Link to={`/producer/${row.producer_uuid}`} style={{ textDecoration: "underline" }}>{row.email}</Link>) : row.email}</div>
        <div>{row.bank_account.document}</div>
      </div>
    ),
  },
  {
    name: 'Valor',
    cell: (row) => FormatBRL(row.amount),
  },
  {
    name: 'Banco',
    cell: (row) => row.bank_account.code,
  },

  {
    name: 'Agencia',
    cell: (row) => row.bank_account.agency,
  },
  {
    name: 'Conta',
    cell: (row) => row.bank_account.number,
  },
  {
    name: 'Solicitado em',
    cell: (row) => row.created_at,
  },
  {
    name: 'Atualizado em',
    cell: (row) => row.updated_at,
  },
]);

const Withdrawals = () => {
  const { skin } = useSkin();
  const [records, setRecords] = useState([]);
  const [recordsApproved, setRecordsApproved] = useState([]);
  const [recordsDenied, setRecordsDenied] = useState([]);
  const [count, setCount] = useState(0);
  const [countApproved, setCountApproved] = useState(0);
  const [countDenied, setCountDenied] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [pageDenied, setPageDenied] = useState(0);
  const [pageApproved, setPageApproved] = useState(0);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState('1');
  const [showModal, setShowModal] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const { control, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      withdrawals: 'manual',
    },
  });

  const selectedWithdrawal = watch('withdrawals');

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page);
      query.append('size', recordsPerPage);
      const response = await api.get(`/withdrawals?${query.toString()}`);
      setCount(response.data.count);
      setRecords(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchDataApproved = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', pageApproved);
      query.append('size', recordsPerPage);
      const response = await api.get(
        `/withdrawals/approved?${query.toString()}`,
      );
      setCountApproved(response.data.count);
      setRecordsApproved(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const submitExport = () => {
    const filename =
      active === '1'
        ? 'pendente.xlsx'
        : active === '2'
        ? 'aprovados.xlsx'
        : 'negados.xlsx';
    toast.success('Exportando... Essa operação pode demorar', configNotify);
    api
      .get(`/withdrawals/export?active=${active}`, {
        responseType: 'blob',
      })
      .then((r) => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        toast.success('Exportado com sucesso', configNotify);
      })
      .catch((e) => console.error(e));
  };

  const fetchDataDenied = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', pageDenied);
      query.append('size', recordsPerPage);
      const response = await api.get(`/withdrawals/denied?${query.toString()}`);
      setCountDenied(response.data.count);
      setRecordsDenied(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (newPerPage) => {
    setRecordsPerPage(newPerPage);
  };

  const handlePageChange = (page) => {
    setPage(page - 1);
  };

  const handlePageChangeApproved = (page) => {
    setPageApproved(page - 1);
  };

  const handlePageChangeDenied = (page) => {
    setPageDenied(page - 1);
  };

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

  const openModalAndSelectedRowId = (id) => {
    setSelectedRowId(id);
    handleShowModal();
  };

  const configNotify = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  const handleChangeStatus = async (id, status, type = null) => {
    try {
      await api.post(`/withdrawals/${id}`, { status, type });
      await fetchData();
      await fetchDataApproved();
      await fetchDataDenied();
      toast.success('Salvo com sucesso', configNotify);
    } catch (error) {
      console.log(error);
      toast.error('Erro ao atualizar...', configNotify);
    }
  };

  useEffect(() => {
    fetchData();
  }, [recordsPerPage, page]);

  useEffect(() => {
    fetchDataApproved();
  }, [recordsPerPage, pageApproved]);

  useEffect(() => {
    fetchDataDenied();
  }, [recordsPerPage, pageDenied]);

  return (
    <section id="Withdrawals">
      <h2 className="mb-2">Saques</h2>
      <div className="d-flex justify-content-end mb-2 mt-2">
        <Button color="primary" onClick={submitExport}>
          Exportar{' '}
          {active === '1'
            ? '(PENDENTES)'
            : active === '2'
            ? '(APROVADOS)'
            : '(NEGADOS)'}
        </Button>
      </div>
      <Nav tabs>
        <NavItem>
          <NavLink
            href="#"
            active={active === '1'}
            onClick={() => {
              setActive('1');
            }}
          >
            Pendentes
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            active={active === '2'}
            onClick={() => {
              setActive('2');
            }}
          >
            Aprovados
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            href="#"
            active={active === '3'}
            onClick={() => {
              setActive('3');
            }}
          >
            Negados
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={active}>
        <TabPane tabId="1">
          <Card>
            <CardBody>
              <DataTable
                columns={columns(handleChangeStatus, openModalAndSelectedRowId)}
                data={records}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={count}
                onChangeRowsPerPage={handleRecordsPerPageChange}
                onChangePage={handlePageChange}
                noDataComponent={'Não existem saques pendentes'}
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página:',
                  rangeSeparatorText: 'de',
                  noRowsPerPage: false,
                }}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              />
            </CardBody>
          </Card>
        </TabPane>
        <TabPane tabId="2">
          <Card>
            <CardBody>
              <DataTable
                columns={columnsPaidAndDenied()}
                data={recordsApproved}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={countApproved}
                onChangeRowsPerPage={handleRecordsPerPageChange}
                onChangePage={handlePageChangeApproved}
                noDataComponent={'Não existem saques aprovados'}
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página:',
                  rangeSeparatorText: 'de',
                  noRowsPerPage: false,
                }}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              />
            </CardBody>
          </Card>
        </TabPane>
        <TabPane tabId="3">
          <Card>
            <CardBody>
              <DataTable
                columns={columnsPaidAndDenied()}
                data={recordsDenied}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={countDenied}
                onChangeRowsPerPage={handleRecordsPerPageChange}
                onChangePage={handlePageChangeDenied}
                noDataComponent={'Não existem saques negados'}
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página:',
                  rangeSeparatorText: 'de',
                  noRowsPerPage: false,
                }}
                theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
              />
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>

      {showModal && (
        <Modal isOpen={showModal} toggle={handleShowModal} centered size="lg">
          <ModalHeader toggle={handleShowModal}>
            Esse saque será feito manualmente ou via Pagar.me?
          </ModalHeader>
          <ModalBody>
            <div className="mb-1">
              <Label>Selecione:</Label>
              <Controller
                name="withdrawals"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-column">
                    <FormGroup check inline className="mt-1 mb-1">
                      <Input
                        {...field}
                        type="radio"
                        id="manual"
                        value="manual"
                        checked={field.value === 'manual'}
                      />
                      <Label check for="manual">
                        Manualmente
                      </Label>
                    </FormGroup>
                    <FormGroup check inline>
                      <Input
                        {...field}
                        type="radio"
                        id="pagarme"
                        value="pagarme"
                        checked={field.value === 'pagarme'}
                      />
                      <Label check for="pagarme">
                        Via Pagar.me
                      </Label>
                    </FormGroup>
                  </div>
                )}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="d-flex justify-content-between w-100">
              <div className="d-flex gap-2">
                <Button color="secondary" onClick={handleShowModal}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onClick={() => {
                    handleChangeStatus(selectedRowId, 1, selectedWithdrawal);
                    handleShowModal();
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </section>
  );
};

export default Withdrawals;
