import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
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
} from 'reactstrap';
import memoizeOne from 'memoize-one';
import { AlertTriangle } from 'react-feather';
import { api } from '@services/api';
import moment from 'moment';
import { useSkin } from '../../utility/hooks/useSkin';

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

const columns = memoizeOne((setActive) => [
  {
    name: 'ID',
    cell: (row) => row.id,
    width: '80px',
  },
  {
    name: 'Dado',
    cell: (row) => row.data,
  },
  {
    name: 'Tipo',
    cell: (row) => types.find((e) => e.id === row.id_type).label,
    width: '150px',
  },
  {
    name: 'Razão',
    cell: (row) => reasons.find((e) => e.id === row.id_reason).label,
    width: '150px',
  },
  {
    name: 'Data',
    cell: (row) => moment(row.created_at).format('DD/MM/YYYY HH:mm'),
    width: '150px',
  },
  {
    name: 'Ativo',
    cell: (row) => (
      <div onClick={() => setActive(row)} style={{ cursor: 'pointer' }}>
        <Badge color={row.active === true ? 'success' : 'danger'}>
          {row.active === true ? 'Sim' : 'Não'}
        </Badge>
      </div>
    ),
    width: '90px',
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
  const [data, setData] = useState([]);
  const [typeBlock, setTypeBlock] = useState(0);
  const [inputBlock, setInputBlock] = useState('');
  const [showModalInput, setShowModalInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputFilter, setInputFilter] = useState('');
  const { skin } = useSkin();

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalRecords: 0,
  });

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/blacklist?page=${pagination.page}&size=${pagination.size}&input=${inputFilter}`,
      );
      setData(response.data.rows);
      setPagination((prev) => ({ ...prev, totalRecords: response.data.count }));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const setBlacklistStatus = async (row) => {
    setLoading(true);
    try {
      await api.put(`/blacklist/active`, {
        active: !row.active,
        id: row.id,
      });
      await fetchBlacklist();
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlacklist();
  }, [pagination.page, pagination.size, inputFilter]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.put(`/blacklist/register`, {
        inputBlock,
        typeBlock,
      });
      await fetchBlacklist();
    } catch (error) {
      console.log(error);
    } finally {
      setShowModalInput(false);
      setLoading(false);
    }
  };

  return (
    <section id="sectionKYC">
      <h2 className="mb-2">Blacklist</h2>

      <Modal
        id="modalViewStudentSales"
        isOpen={showModalInput}
        toggle={() => setShowModalInput(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setShowModalInput(false)}>
          Incluir bloqueio
        </ModalHeader>

        <ModalBody className="text-center">
          <div className="d-flex justify-content-end gap-2">
            <Input
              placeholder="Digite o valor"
              onChange={({ target }) => {
                setTimeout(() => {
                  setInputBlock(target.value);
                }, 1000);
              }}
            />

            <Input
              type="select"
              onChange={({ target }) => setTypeBlock(target.value)}
            >
              <option value="">Selecione</option>
              <option value="email">E-mail</option>
              <option value="cpf">CPF</option>
              <option value="ip">IP</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="cep">CEP</option>
            </Input>
            <Button
              color="primary"
              disabled={!inputBlock || typeBlock === 0}
              onClick={() => handleRegister()}
            >
              Salvar
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Card>
        <CardBody className="filters">
          <FormGroup className="filters">
            <Label>BUSCAR POR: E-MAIL, CPF, IP, ENDEREÇO, WHATSAPP</Label>
            <div className="d-flex">
              <Input
                onChange={({ target }) => {
                  setTimeout(() => {
                    setInputFilter(target.value);
                  }, 1000);
                }}
              />

              <div className="flex justify-end ml-2">
                <Button color="primary" onClick={() => setShowModalInput(true)}>
                  Adicionar
                </Button>
              </div>
            </div>
          </FormGroup>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Bloqueios</CardTitle>
        </CardHeader>

        <CardBody>
          <DataTable
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página',
              rangeSeparatorText: 'de',
              selectAllRowsItem: false,
              selectAllRowsItemText: 'Todos',
            }}
            columns={columns(setBlacklistStatus)}
            data={data}
            noDataComponent={noDataComponent()}
            progressPending={loading}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            pagination
            paginationServer
            paginationPerPage={pagination.size}
            paginationRowsPerPageOptions={[100, 50, 25, 10]}
            onChangeRowsPerPage={(perPage) =>
              setPagination((prev) => ({ ...prev, size: perPage }))
            }
            onChangePage={(newPage) =>
              setPagination((prev) => ({ ...prev, page: newPage - 1 }))
            }
            paginationTotalRows={pagination.totalRecords}
          />
        </CardBody>
      </Card>
    </section>
  );
}
