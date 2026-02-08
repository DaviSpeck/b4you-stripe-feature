import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import PaymentMethod from '../components/PaymentMethod';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  FormGroup,
  Spinner,
} from 'reactstrap';
import memoizeOne from 'memoize-one';
import { AlertTriangle, ThumbsUp, Info } from 'react-feather';
import { Link } from 'react-router-dom';
import { api } from '@services/api';
import moment from 'moment';
import { FormatBRL, formatDocument, capitalizeName } from '@utils';
import TooltipItem from '../reports/components/ToolTipItem';
import { useSkin } from '../../utility/hooks/useSkin';
const TRUST = 3;

const types = [
  {
    id: 1,
    label: 'IP',
  },
  {
    id: 2,
    label: 'CPF',
  },
  {
    id: 3,
    label: 'WHATSAPP',
  },
  {
    id: 4,
    label: 'EMAIL',
  },
  {
    id: 5,
    label: 'ENDERECO',
  },
  {
    id: 6,
    label: 'CEP',
  },
  {
    id: 7,
    label: 'Automático',
  },
];

const reasons = [
  {
    id: 1,
    label: 'Chargeback',
  },
  {
    id: 2,
    label: 'Incluido pelo suporte',
  },
  {
    id: 3,
    label: 'Venda noturna',
  },
  {
    id: 4,
    label: 'Compra acima do limite',
  },
  {
    id: 5,
    label: 'Attracione',
  },
  {
    id: 6,
    label: 'Notavel',
  },
  {
    id: 7,
    label: 'Produto Digital',
  },
  {
    id: 8,
    label: 'Bandeira Elo',
  },
];

const productTypes = [
  { id: 1, label: 'Video' },
  { id: 2, label: 'Ebook' },
  { id: 3, label: 'Somente Pagamento' },
  { id: 4, label: 'Fisico' },
  { id: 5, label: 'ECOMMERCE' },
];

const columnsCNPJ = memoizeOne((toggleAction) => [
  {
    name: 'ID',
    cell: (row) => row.id,
    width: '80px',
  },
  {
    name: 'Tipo da regra',
    width: '135px',
    cell: (row) => {
      const type = types.find((e) => e.id === row.blacklist.id_type);
      const reason = reasons.find((e) => e.id === row.blacklist.id_reason);
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{reason?.label}</span>
          <span style={{ fontSize: '12px' }}>{type?.label}</span>
        </div>
      );
    },
  },
  {
    name: 'Cliente',
    cell: (row) => {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link to={`/student/${row?.sale?.products[0].student?.uuid}`}>
            {capitalizeName(row?.sale?.products[0].student?.full_name)}
          </Link>
          <span>{row.sale.email}</span>
          <span>{`CPF: ${formatDocument(
            row.sale.document_number,
            'CPF',
          )}`}</span>
        </div>
      );
    },
    minWidth: '220px',
  },
  {
    name: 'Valor',
    width: '100px',
    cell: (row) =>
      FormatBRL(
        row.sale.products.reduce((acc, obj) => {
          return acc + obj.price;
        }, 0),
      ),
  },
  {
    name: 'Produto',
    cell: (row) => row.sale.products[0].product.name,
  },
  {
    name: 'Pago em',
    width: '110px',
    cell: (row) =>
      moment(row.sale.products[0].paid_at).format('DD/MM/YYYY HH:mm:ss'),
  },
  {
    name: (
      <div className="d-flex align-items-center gap-1">
        Score
        <TooltipItem
          item={{
            placement: 'right',
            text: '🟦Muito baixo: 0-19<br/>🟩Baixo: 20-39<br/>🟨Médio: 40-59<br/>🟧Alto: 60-79<br/>🟥Muito Alto: 80-100',
          }}
          id={1}
        >
          <div className="d-flex justify-content-center">
            <Info size={14} />
          </div>
        </TooltipItem>
      </div>
    ),
    width: '110px',
    cell: (row) => {
      const value = row.antifraud_response?.value;
      if (typeof value === 'number') {
        return <div>{value.toFixed(2)}</div>;
      } else if (value) {
        const parsed = parseFloat(value);
        return <div>{!isNaN(parsed) ? parsed.toFixed(2) : value}</div>;
      } else {
        return <div>Pendente</div>;
      }
    },
  },
  {
    name: (
      <div className="d-flex align-items-center gap-1">
        Score Konduto
        <TooltipItem
          item={{
            placement: 'right',
            text: '🟩Aprovar: 0.0-0.6<br/>🟨Análise: 0.6-0.8<br/>🟥Fraude: 0.8 ou superior',
          }}
          id={2}
        >
          <div className="d-flex justify-content-center">
            <Info size={14} />
          </div>
        </TooltipItem>
      </div>
    ),
    width: '115px',
    cell: (row) => {
      const value = row.sale?.score_konduto;
      if (typeof value === 'number') {
        return <div>{value.toFixed(2)}</div>;
      } else if (value) {
        const parsed = parseFloat(value);
        return <div>{!isNaN(parsed) ? parsed.toFixed(2) : value}</div>;
      } else {
        return <div>Pendente</div>;
      }
    },
  },
  // {
  //   name: 'Método',
  //   width: '80px',
  //   cell: (row) =>
  //     row.sale.products[0].payment_method === 'card'
  //       ? 'Cartão'
  //       : row.sale.products[0].payment_method === 'pix'
  //       ? 'Pix'
  //       : 'Boleto',
  // },
  {
    name: 'Ações',
    center: true,
    cell: (row) => {
      return (
        <div className="d-flex justify-content-around">
          {!row.antifraud_response && (
            <div
              onClick={() => toggleAction('score', row)}
              style={{ cursor: 'pointer', marginRight: '2px' }}
            >
              <Badge color="warning">Score</Badge>
            </div>
          )}

          <div
            onClick={() => toggleAction('info', row)}
            style={{ cursor: 'pointer', marginRight: '2px' }}
          >
            <Badge>Info</Badge>
          </div>
          <div
            onClick={() => toggleAction('approve', row)}
            style={{ cursor: 'pointer', marginRight: '2px' }}
          >
            <Badge color="danger">Reembolsar</Badge>
          </div>

          <div
            onClick={() => toggleAction('reprove', row)}
            style={{ cursor: 'pointer' }}
          >
            <Badge color="success">Confiar</Badge>
          </div>
        </div>
      );
    },
  },
]);

const columnsOldSales = memoizeOne((toggleAction) => [
  {
    name: 'ID',
    cell: (row) => row.id,
    width: '80px',
  },
  {
    name: 'Tipo da regra',
    width: '135px',
    cell: (row) => {
      const type = types.find((e) => e.id === row.blacklist.id_type);
      const reason = reasons.find((e) => e.id === row.blacklist.id_reason);
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{reason?.label}</span>
          <span style={{ fontSize: '12px' }}>{type?.label}</span>
        </div>
      );
    },
  },
  {
    name: 'Cliente',
    cell: (row) => {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link to={`/student/${row?.sale?.products[0].student?.uuid}`}>
            {capitalizeName(row?.sale?.products[0].student?.full_name)}
          </Link>
          <span>{row.sale.email}</span>
          <span>{`CPF: ${formatDocument(
            row.sale.document_number,
            'CPF',
          )}`}</span>
        </div>
      );
    },
    minWidth: '220px',
  },
  {
    name: 'Valor',
    width: '100px',
    cell: (row) =>
      FormatBRL(
        row.sale.products.reduce((acc, obj) => {
          return acc + obj.price;
        }, 0),
      ),
  },
  {
    name: 'Produto',
    cell: (row) => row.sale.products[0].product.name,
  },
  {
    name: 'Pago em',
    width: '110px',
    cell: (row) =>
      moment(row.sale.products[0].paid_at).format('DD/MM/YYYY HH:mm:ss'),
  },
  // {
  //   name: 'Método',
  //   width: '110px',
  //   cell: (row) =>
  //     row.sale.products[0].payment_method === 'card'
  //       ? 'Cartão'
  //       : row.sale.products[0].payment_method === 'pix'
  //       ? 'Pix'
  //       : 'Boleto',
  // },
  {
    name: (
      <div className="d-flex align-items-center gap-1">
        Score
        <TooltipItem
          item={{
            placement: 'right',
            text: '🟦Muito baixo: 0-19<br/>🟩Baixo: 20-39<br/>🟨Médio: 40-59<br/>🟧Alto: 60-79<br/>🟥Muito Alto: 80-100',
          }}
          id={1}
        >
          <div className="d-flex justify-content-center">
            <Info size={14} />
          </div>
        </TooltipItem>
      </div>
    ),
    width: '110px',
    cell: (row) => {
      const value = row.antifraud_response?.value;
      if (typeof value === 'number') {
        return <div>{value.toFixed(2)}</div>;
      } else if (value) {
        const parsed = parseFloat(value);
        return <div>{!isNaN(parsed) ? parsed.toFixed(2) : value}</div>;
      } else {
        return <div>Sem consulta</div>;
      }
    },
  },
  {
    name: (
      <div className="d-flex align-items-center gap-1">
        Score Konduto
        <TooltipItem
          item={{
            placement: 'right',
            text: '🟩Aprovar: 0.0-0.6<br/>🟨Análise: 0.6-0.8<br/>🟥Fraude: 0.8 ou superior',
          }}
          id={2}
        >
          <div className="d-flex justify-content-center">
            <Info size={14} />
          </div>
        </TooltipItem>
      </div>
    ),
    width: '115px',
    cell: (row) => {
      const value = row.sale?.score_konduto;
      if (typeof value === 'number') {
        return <div>{value.toFixed(2)}</div>;
      } else if (value) {
        const parsed = parseFloat(value);
        return <div>{!isNaN(parsed) ? parsed.toFixed(2) : value}</div>;
      } else {
        return <div>Pendente</div>;
      }
    },
  },
  {
    name: 'Status',
    cell: (row) => (
      <div>
        <Badge color={row.id_status === TRUST ? 'success' : 'danger'}>
          {row.id_status === TRUST ? 'Confiável' : 'Reembolsada'}
        </Badge>
      </div>
    ),
    width: '100px',
  },
  {
    name: 'Ações',
    center: true,
    width: '200px',
    cell: (row) => {
      return (
        <div className="w-100 d-flex justify-content-start gap-1">
          <Button
            size="sm"
            color="light"
            onClick={() => toggleAction('info', row)}
          >
            <Info size="14"></Info>
          </Button>
          {row.id_status === TRUST && (
            <Button
              size="sm"
              color="light"
              onClick={() => toggleAction('approve', row)}
            >
              <ThumbsUp color="green" size="14"></ThumbsUp>
            </Button>
          )}
        </div>
      );
    },
  },
]);

const noDataComponent = () => (
  <div className="d-flex align-items-end">
    <div className="me-1">
      <AlertTriangle size={24} />
    </div>
    <div>Nenhum registro na lista de bloqueio!</div>
  </div>
);

export default function Home() {
  const [accountNumber, setAccountNumber] = useState('');
  const [agency, setAgency] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [showModalBank, setShowModalBank] = useState(false);
  const [dataSales, setDataSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [isRefund, setIsRefund] = useState(null);
  const [infoSale, setInfoSale] = useState(null);
  const [dataOldSales, setDataOldSales] = useState([]);
  const [input, setInput] = useState('');
  const [showModalScore, setShowModalScore] = useState(false);
  const { skin } = useSkin();

  const [paginationSales, setPaginationSales] = useState({
    page: 0,
    size: 10,
    totalRecords: 0,
  });

  const [paginationOld, setPaginationOld] = useState({
    page: 0,
    size: 10,
    totalRecords: 0,
  });

  const fetchBlacklistSales = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/blacklist/sales?page=${paginationSales.page}&size=${paginationSales.size}`,
      );
      setDataSales(response.data.rows);
      setPaginationSales((prev) => ({
        ...prev,
        totalRecords: response.data.count,
      }));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const toggleAction = (action = '', row) => {
    setInfoSale(row);
    if (action === 'info') {
      setShowModal(true);
    }

    if (action === 'approve') {
      setIsRefund(true);
      setShowModalConfirm(true);
    }
    if (action === 'reprove') {
      setIsRefund(false);
      setShowModalConfirm(true);
    }
    if (action === 'score') {
      setShowModalScore(true);
    }
  };

  const fetchBlacklistOldSales = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/blacklist/old/sales?page=${paginationOld.page}&size=${paginationOld.size}`,
      );
      setDataOldSales(response.data.rows);
      setPaginationOld((prev) => ({
        ...prev,
        totalRecords: response.data.count,
      }));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchBlacklistSales();
  }, [paginationSales.page, paginationSales.size]);

  useEffect(() => {
    fetchBlacklistOldSales();
  }, [paginationOld.page, paginationOld.size]);

  const handleConfirmation = async () => {
    setLoading(true);
    try {
      if (!isRefund) {
        await api.put(`/blacklist/action`, {
          refund: isRefund,
          id: infoSale.id,
          id_sale: infoSale.id_sale,
          id_user_sale: infoSale.sale.id_user,
        });
      } else if (
        infoSale.sale.products[0].payment_method === 'card' ||
        infoSale.sale.products[0].payment_method === 'pix'
      ) {
        await api.put(`/blacklist/action`, {
          refund: isRefund,
          id: infoSale.id,
          sale_items_uuids: infoSale.sale.products.map((e) => e.uuid),
          id_sale: infoSale.id_sale,
          id_user_sale: infoSale.sale.id_user,
        });
      } else {
        setShowModalBank(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowModalConfirm(false);
      await fetchBlacklistSales();
      await fetchBlacklistOldSales();
      setLoading(false);
    }
  };

  const handleScore = async () => {
    setLoading(true);
    try {
      await api.post(`/blacklist/score`, { id: infoSale.id });
    } catch (error) {
      console.log(error);
    } finally {
      setShowModalScore(false);
      await fetchBlacklistSales();
      setLoading(false);
    }
  };

  const refundSale = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/blacklist/action`, {
        refund: isRefund,
        id: infoSale.id,
        sale_items_uuids: infoSale.sale.products.map((e) => e.uuid),
        bank_code: bankCode,
        agency,
        account_number: accountNumber,
        account_type: accountType,
      });
      await fetchBlacklistSales();
      setShowModalConfirm(false);
      setShowModalBank(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/blacklist/old/sales?page=${paginationOld.page}&size=${paginationOld.size}&input=${input}`,
      );
      setDataOldSales(response.data.rows);
      setPaginationOld((prev) => ({
        ...prev,
        totalRecords: response.data.count,
      }));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="sectionKYC">
      <h2 className="mb-2">Análise de Pedidos</h2>
      <Modal
        id="modalViewStudentSales"
        isOpen={showModal}
        toggle={() => setShowModal(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setShowModal(false)}>
          Dados da Venda
        </ModalHeader>
        <ModalBody>
          {infoSale && (
            <Card key={infoSale.id}>
              <CardBody>
                <div className="view-ss-container">
                  <div className="view-ss-item">
                    <span>ID</span>
                    <span>{infoSale.sale.products[0].uuid}</span>
                  </div>
                  <hr />

                  <div className="view-ss-item">
                    <span>Data</span>
                    <span>
                      {moment(infoSale.sale.created_at).format(
                        'DD/MM/YYYY HH:mm',
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Produto</span>
                    <span>
                      <Link
                        to={`/producer/${infoSale.sale.products[0].product.producer.uuid}/product/${infoSale.sale.products[0].product.uuid}`}
                      >
                        {infoSale.sale.products[0].product.name}
                      </Link>
                    </span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Produtor</span>
                    <span>
                      <Link
                        to={`/producer/${infoSale.sale.products[0].product.producer.uuid}`}
                      >
                        {infoSale.sale.products[0].product.producer.full_name}
                      </Link>
                    </span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>E-mail de suporte</span>
                    <span>
                      {infoSale.sale.products[0].product?.support_email ? (
                        <a
                          href={`mailto:${infoSale.sale.products[0].product?.support_email}`}
                        >
                          {infoSale.sale.products[0].product?.support_email}
                        </a>
                      ) : (
                        'Não informado'
                      )}
                    </span>
                  </div>

                  <hr />
                  <div className="view-ss-item">
                    <span>Preço</span>
                    <span>{FormatBRL(infoSale.sale.products[0].price)}</span>
                  </div>

                  <hr />
                  <div className="view-ss-item">
                    <span>Tipo</span>
                    <span>
                      {
                        productTypes.find(
                          (e) =>
                            e.id === infoSale.sale.products[0].product.id_type,
                        ).label
                      }
                    </span>
                  </div>

                  <hr />
                  <div className="view-ss-item">
                    <span>Método de Pagamento</span>
                    <span>
                      <PaymentMethod
                        type={infoSale.sale.products[0].payment_method}
                      />
                    </span>
                  </div>

                  <hr />

                  <div className="view-ss-item">
                    <span>Pago em</span>
                    <span>
                      {infoSale.sale.products[0].paid_at
                        ? moment(infoSale.sale.products[0].paid_at).format(
                            'DD/MM/YYYY HH:mm',
                          )
                        : '-'}
                    </span>
                  </div>
                  <hr />
                  {infoSale.sale.products[0].credit_card && (
                    <>
                      <div className="view-ss-item">
                        <span>Últimos quatro dígitos</span>
                        <span>
                          {infoSale.sale.products[0].credit_card.last_four}
                        </span>
                      </div>
                      <hr />
                    </>
                  )}
                  <div className="view-ss-item">
                    <span>Prazo máximo de reembolso</span>
                    <span>
                      {moment(
                        infoSale.sale.products[0].valid_refund_until,
                      ).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  <hr />
                </div>
              </CardBody>
            </Card>
          )}
        </ModalBody>
      </Modal>
      <Modal
        isOpen={showModalConfirm}
        toggle={() => setShowModalConfirm(false)}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setShowModalConfirm(false)}>
          Confirmação
        </ModalHeader>
        <ModalBody className="text-center">
          <p>
            Deseja realmente{' '}
            {isRefund
              ? 'Reembolsar esta venda'
              : 'marcar como confiável esta venda'}{' '}
            ?
          </p>

          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button
              disabled={loading}
              color="success"
              onClick={() => handleConfirmation()}
            >
              {loading ? <Spinner size="sm" /> : 'Sim'}
            </Button>
            <Button
              color="danger"
              disabled={loading}
              onClick={() => setShowModalConfirm(false)}
            >
              {loading ? <Spinner size="sm" /> : 'Não'}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        isOpen={showModalScore}
        toggle={() => setShowModalScore(false)}
        size="md"
        centered
      >
        <ModalHeader toggle={() => setShowModalScore(false)}>
          Confirmação
        </ModalHeader>
        <ModalBody className="text-center">
          <p>Deseja realmente atualizar score?</p>

          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button
              disabled={loading}
              color="success"
              onClick={() => handleScore()}
            >
              {loading ? <Spinner size="sm" /> : 'Sim'}
            </Button>
            <Button
              color="danger"
              disabled={loading}
              onClick={() => setShowModalScore(false)}
            >
              {loading ? <Spinner size="sm" /> : 'Não'}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        id="modalBankAccount"
        isOpen={showModalBank}
        toggle={() => setShowModalBank(false)}
        centered
        size="lg"
      >
        <ModalHeader toggle={() => setShowModalBank(false)}>
          Conta bancária para reembolso
        </ModalHeader>
        <ModalBody>
          <FormGroup className="form-bank-account">
            <Label>Número da conta com dígito</Label>
            <Input
              onChange={({ target }) => {
                setAccountNumber(target.value);
              }}
            />
            <Label>Agência</Label>
            <Input
              onChange={({ target }) => {
                setAgency(target.value);
              }}
            />
            <Label>Código do banco</Label>
            <Input
              onChange={({ target }) => {
                setBankCode(target.value);
              }}
            />
            <Label>Tipo de conta</Label>
            <Input
              type="select"
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="savings">Poupança</option>
              <option value="checking">Corrente</option>
            </Input>
          </FormGroup>
          <div className="d-flex justify-content-end">
            <Button color="danger" onClick={(e) => refundSale(e)} outline>
              {loading ? 'Carregando...' : 'Reembolsar Venda'}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos com suspeita de Fraude</CardTitle>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={columnsCNPJ(toggleAction)}
            data={dataSales}
            noDataComponent={noDataComponent()}
            progressPending={loading}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página',
              rangeSeparatorText: 'de',
              selectAllRowsItem: false,
              selectAllRowsItemText: 'Todos',
            }}
            pagination
            paginationServer
            paginationPerPage={paginationSales.size}
            paginationRowsPerPageOptions={[100, 50, 25, 10]}
            onChangeRowsPerPage={(perPage) =>
              setPaginationSales((prev) => ({ ...prev, size: perPage }))
            }
            onChangePage={(newPage) =>
              setPaginationSales((prev) => ({ ...prev, page: newPage - 1 }))
            }
            paginationTotalRows={paginationSales.totalRecords}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <FormGroup className="filters">
            <Label>BUSCAR POR: NOME, E-MAIL OU CPF DA COMPRA</Label>
            <div className="d-flex">
              <Input
                onChange={({ target }) => setInput(target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                value={input}
              />
              <div className="flex justify-end ml-2">
                <Button
                  color="primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Buscar'}
                </Button>
              </div>
            </div>
          </FormGroup>
          <DataTable
            columns={columnsOldSales(toggleAction)}
            data={dataOldSales}
            noDataComponent={noDataComponent()}
            progressPending={loading}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página',
              rangeSeparatorText: 'de',
              selectAllRowsItem: false,
              selectAllRowsItemText: 'Todos',
            }}
            pagination
            paginationServer
            paginationPerPage={paginationOld.size}
            paginationRowsPerPageOptions={[100, 50, 25, 10]}
            onChangeRowsPerPage={(perPage) =>
              setPaginationOld((prev) => ({ ...prev, size: perPage }))
            }
            onChangePage={(newPage) =>
              setPaginationOld((prev) => ({ ...prev, page: newPage - 1 }))
            }
            paginationTotalRows={paginationOld.totalRecords}
          />
        </CardBody>
      </Card>
    </section>
  );
}
