import memoizeOne from 'memoize-one';
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Check, Settings, X, Edit2 } from 'react-feather';
import { Link, useParams } from 'react-router-dom';
import General from './reports/General';
import Select from 'react-select';
import jsPDF from 'jspdf';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Nav,
  NavLink,
  NavItem,
  TabContent,
  Table,
  TabPane,
  Spinner,
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Input,
} from 'reactstrap';
import { api } from '../../services/api';
import { FormatBRL } from '../../utility/Utils';
import ViewStudentSales from '../students/ViewStudentSales';
import '../../assets/scss/pages/producer.scss';
import { toast } from 'react-toastify';
import ModalNotes from './ModalNotes';
import { useSkin } from '../../utility/hooks/useSkin';

const generatePDF = async (filename) => {
  const element = document.getElementById('content-id');
  const pdf = new jsPDF({
    format: 'a4',
    unit: 'px',
  });
  pdf.html(element, {
    async callback(doc) {
      await doc.save(filename);
    },
  });
};

const column = memoizeOne((setShowSalesDetails, setActiveItem) => [
  {
    name: 'Produto',
    cell: (row) => (
      <Link to={`/producer/${row.producer?.uuid}/product/${row.product?.uuid}`}>
        {row.product?.name}
      </Link>
    ),
  },
  {
    name: 'Valor',
    cell: (row) => FormatBRL(row.price),
  },
  {
    name: 'Status',
    cell: (row) => <Badge color={row.status?.color}>{row.status?.name}</Badge>,
  },
  {
    name: 'Detalhes',
    cell: (row) => (
      <Badge
        color="primary"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setActiveItem(row);
          setShowSalesDetails(true);
        }}
      >
        <Settings size={21} />
      </Badge>
    ),
  },
]);

const configNotify = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const ViewStudentInfo = () => {
  const { studentUuid } = useParams();
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState([]);
  const [active, setActive] = useState('1');
  const [showSalesDetails, setShowSalesDetails] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [showSendEmailConfirm, setShowSendEmailConfirm] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [showChargeback, setShowChargeback] = useState(false);
  const [filename, setFilename] = useState('');
  const [showModalNotes, setShowModalNotes] = useState(false);
  const { skin } = useSkin();

  const toggle = (tab) => {
    if (active !== tab) {
      setActive(tab);
    }
  };

  const getStudentData = () => {
    setLoading(true);
    api
      .get(`/students/${studentUuid}`)
      .then((r) => {
        setStudent(r.data.student);
        setRecords(r.data.sales);
        setFilename(r.data.sales[0].provider);
      })
      .catch((e) => console.log(e));
    setLoading(false);
  };

  useEffect(() => {
    getStudentData();
  }, []);

  const sendEmail = () => {
    setLoading(true);
    api
      .post(`/students/${studentUuid}/email`)
      .then((r) => {
        toast.success('E-mail enviado com sucesso', configNotify);
        setShowSendEmailConfirm(false);
      })
      .catch((error) => {
        console.log(error);
        toast.error('Falha ao enviar e-mail', configNotify);
      });
    setLoading(false);
  };

  const changeEmail = (e) => {
    e.preventDefault();
    api
      .put(`/students/${studentUuid}/change-email/support`, {
        email,
      })
      .then(() => {
        setStudent((prev) => ({
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

  return (
    <>
      {student && (
        <section id="pageStudentInfo">
          <h2>{student.full_name}</h2>

          <ViewStudentSales
            student={student}
            show={showSalesDetails}
            toggle={() => setShowSalesDetails(!showSalesDetails)}
            data={activeItem}
            getStudentData={getStudentData}
          />

          <Breadcrumb className="mb-1">
            <BreadcrumbItem>
              <Link to="/students">Clientes</Link>
            </BreadcrumbItem>
            <BreadcrumbItem active>
              <span>Cliente</span>
            </BreadcrumbItem>
          </Breadcrumb>

          {records.length > 0 && (
            <Modal
              isOpen={showChargeback}
              toggle={() => setShowChargeback(false)}
              centered
            >
              <ModalHeader toggle={() => setShowChargeback(false)}>
                Selecione a cobrança
              </ModalHeader>
              <ModalBody className="d-block align-items-center justify-content-center">
                <Select
                  onChange={({ value }) => {
                    setFilename(value);
                  }}
                  defaultValue={
                    records
                      .filter((r) => r.provider)
                      .map((r) => ({ value: r.provider, label: r.provider }))[0]
                  }
                  options={records
                    .filter((r) => r.provider)
                    .map((r) => ({
                      value: r.provider,
                      label: r.provider,
                    }))}
                />
                {student && records.length > 0 && (
                  <div className="d-flex justify-content-center mt-2">
                    <Button
                      className="btn btn-secondary"
                      onClick={() => generatePDF(filename)}
                    >
                      Gerar PDF
                    </Button>
                  </div>
                )}

                <div
                  style={{
                    position: 'fixed',
                    left: '-1000rem',
                  }}
                >
                  <General student={student} sales={records} />
                </div>
              </ModalBody>
            </Modal>
          )}

          <ModalNotes
            show={showModalNotes}
            setShow={setShowModalNotes}
            studentUuid={studentUuid}
          />

          <Modal
            isOpen={showSendEmailConfirm}
            toggle={() => setShowSendEmailConfirm(false)}
            centered
          >
            <ModalHeader toggle={() => setShowSendEmailConfirm(false)}>
              Enviar e-mail de primeiro acesso
            </ModalHeader>
            <ModalBody>
              <Alert color="primary" className="p-1">
                <b>Atenção</b>: Você deseja enviar o e-mail de primeiro acesso?
              </Alert>
              <p>
                Ao apertar o botão abaixo o e-mail de primeiro acesso será
                enviado ao cliente. Você tem certeza que quer tomar esta ação?
                Aperte o botão abaixo para confirmar.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="light"
                onClick={() => {
                  setShowSendEmailConfirm(false);
                }}
              >
                Fechar
              </Button>
              <Button color="primary" onClick={() => sendEmail()}>
                Enviar e-mail
              </Button>
            </ModalFooter>
          </Modal>

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
                {/*        <NavItem>
                  <NavLink
                    href="#"
                    active={active === '2'}
                    onClick={() => {
                      toggle('2');
                    }}
                  >
                    Eventos
                  </NavLink>
                </NavItem> */}
              </Nav>

              <TabContent className="py-50" activeTab={active}>
                <TabPane tabId="1">
                  <Table hover>
                    <thead>
                      <tr>
                        <div className="title-table">Geral</div>
                      </tr>
                    </thead>
                    <tbody>
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
                        <th scope="row">Nome</th>
                        <td>{student.full_name || 'Não informado'}</td>
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
                              <a href={`mailto:${student.email}`}>
                                {student.email}
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
                        <th scope="row">CPF</th>
                        <td>{student.document_number || 'Não informado'}</td>
                      </tr>
                      <tr>
                        <th scope="row">Telefone</th>
                        <td>{student.whatsapp || 'Não informado'}</td>
                      </tr>
                      {student?.address && (
                        <>
                          <tr>
                            <th scope="row">Endereço</th>
                            <td>
                              {`${student.address.street}, ${
                                student.address.number
                              }${
                                student.address.complement
                                  ? ' - ' + student.address.complement
                                  : ''
                              }, ${student.address.neighborhood}, ${
                                student.address.city
                              } - ${student.address.state}, CEP ${
                                student.address.zipcode
                              }`}
                            </td>
                          </tr>
                        </>
                      )}
                      <tr>
                        <th scope="row">Status</th>
                        <td>
                          {student.status === 'Ativo' ? (
                            <span style={{ color: '#28c76f' }}>
                              <Check size={20} /> Ativo
                            </span>
                          ) : (
                            <span style={{ color: '#ea5455' }}>
                              <X size={20} /> Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <Table hover>
                    <thead>
                      <tr>
                        <div className="title-table">Conta báncaria</div>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">Agência</th>
                        <td>{student.account_agency || 'Não informado'}</td>
                      </tr>
                      <tr>
                        <th scope="row">Número</th>
                        <td>{student.account_number || 'Não informado'}</td>
                      </tr>
                      <tr>
                        <th scope="row">Código</th>
                        <td>{student.bank_code || 'Não informado'}</td>
                      </tr>
                    </tbody>
                  </Table>
                  <h2 className="p-2 pb-0" style={{ color: '#349888' }}>
                    Compras
                  </h2>
                  <DataTable
                    columns={column(setShowSalesDetails, setActiveItem)}
                    data={records}
                    progressPending={loading}
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página:',
                      rangeSeparatorText: 'de',
                      noRowsPerPage: false,
                    }}
                    progressComponent={<Spinner />}
                    noDataComponent={<>Sem informações do cliente</>}
                    theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                  />
                </TabPane>
                <TabPane tabId="2">aba 2</TabPane>
              </TabContent>

              <div className="d-flex justify-content-between">
                <Button
                  color="primary"
                  className="mt-3"
                  onClick={() => setShowSendEmailConfirm(true)}
                  outline
                >
                  {loading
                    ? 'Carregando...'
                    : 'Enviar e-mail de primeiro acesso'}
                </Button>
                {records.length > 0 &&
                  records.filter((r) => r.provider).length > 0 && (
                    <Button
                      color="warning"
                      className="mt-3"
                      onClick={() => setShowChargeback(true)}
                    >
                      Relatório Chargeback
                    </Button>
                  )}
              </div>
            </CardBody>
          </Card>
        </section>
      )}
    </>
  );
};

export default ViewStudentInfo;
