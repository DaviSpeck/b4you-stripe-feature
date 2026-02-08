import React, { useEffect, useState, FC } from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../../utility/hooks/useSkin';
import {
  Badge,
  Card,
  CardBody,
  FormGroup,
  Input,
  Label,
  Row,
  Col,
  CardHeader,
} from 'reactstrap';
import memoizeOne from 'memoize-one';
import { api } from '../../services/api';
import { formatDocument } from '../../utility/Utils';
import { Settings } from 'react-feather';
import { Link } from 'react-router-dom';
import {
  Column,
  PagarmeRecord,
  PagarmeData,
  ApiResponse,
} from '../../interfaces/pagarme.interface';

const columns = memoizeOne((): Column[] => [
  {
    name: 'Email',
    cell: (row: PagarmeRecord) => row.email,
  },
  {
    name: 'Nome',
    cell: (row: PagarmeRecord) => row.full_name,
  },
  {
    name: 'Documento',
    cell: (row: PagarmeRecord) =>
      formatDocument(row.document, row.is_company ? 'CNPJ' : 'CPF'),
  },
  {
    name: 'Tipo da Conta',
    cell: (row: PagarmeRecord) => (row.is_company ? 'JURÍDICA' : 'FÍSICA'),
  },
  {
    name: 'Pagarme ID',
    cell: (row: PagarmeRecord) => row.pagarme_id,
  },
  {
    name: 'Status',
    cell: (row: PagarmeRecord) => (
      <Badge color={row?.status?.color}>{row.status.label}</Badge>
    ),
  },
  {
    name: 'Detalhes',
    center: true,
    cell: (row: PagarmeRecord) => (
      <Link to={`/producer/${row.uuid}`}>
        <Badge color="primary" style={{ cursor: 'pointer' }}>
          <Settings size={21} />
        </Badge>
      </Link>
    ),
  },
]);

const HomePagarme: FC = () => {
  const { skin } = useSkin();
  const [records, setRecords] = useState<PagarmeRecord[]>([]);
  const [recordsCount, setRecordsCount] = useState<number>(0);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [inputFilter, setInputFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [handleType, setHandleTypes] = useState<string>('cpf');
  const [handelStatus, setHandleStatus] = useState<string>('all');
  const [pagarmeData, setPagarmeData] = useState<PagarmeData>({
    filteredCompany: [],
    filteredIndividual: [],
  });

  const handleChangeType = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const value = e.target.value;
    setHandleTypes(value);
  };

  const handleChangeStatus = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const value = e.target.value;
    setHandleStatus(value);
  };

  const fetchProducers = async (
    page: number,
    newPerPage: number | null = null,
  ): Promise<void> => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('page', page.toString());
      query.append(
        'size',
        (newPerPage ? newPerPage : recordsPerPage).toString(),
      );
      query.append('status', handelStatus);
      query.append('type', handleType);

      if (inputFilter) query.append('input', inputFilter);

      const response = await api.get<ApiResponse>(
        `/users/pagarme/report/data/filters?${query.toString()}`,
      );
      const { data } = response;
      setRecordsCount(data.count);
      setRecords(data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchPagarme = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<PagarmeData>(
        `/users/pagarme/report/count`,
      );
      const { data } = response;
      setPagarmeData(data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (
    newPerPage: number,
    page: number,
  ): Promise<void> => {
    await fetchProducers(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page: number): void => {
    fetchProducers(page - 1);
  };

  useEffect(() => {
    fetchProducers(0);
  }, [inputFilter, handleType, handelStatus]);

  useEffect(() => {
    fetchPagarme();
  }, []);

  return (
    <section id="pageHomeStudents">
      <h2 className="mb-2">Pagarme - Produtores</h2>

      {pagarmeData &&
        pagarmeData.filteredCompany.length > 0 &&
        pagarmeData.filteredIndividual.length > 0 && (
          <Card
            className="p-0"
            style={{
              border: '2px solid #3a3f51',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <CardHeader className="d-flex flex-row">
              <div className="col-6">
                <h4 className="text-primary" style={{ marginBottom: '1px' }}>
                  CADASTRADOS PAGARME CNPJ:
                </h4>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {pagarmeData.filteredCompany.map((item) => (
                    <li key={item.status.id} style={{ fontWeight: 'normal' }}>
                      {item.status.label}: {item.count}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-6">
                <h4 className="text-primary" style={{ marginBottom: '1px' }}>
                  CADASTRADOS PAGARME CPF:
                </h4>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {pagarmeData.filteredIndividual.map((item) => (
                    <li key={item.status.id} style={{ fontWeight: 'normal' }}>
                      {item.status.label}: {item.count}
                    </li>
                  ))}
                </ul>
              </div>
            </CardHeader>
          </Card>
        )}

      <Card>
        <CardBody>
          <FormGroup className="filters">
            <Row form>
              <Col md={4}>
                <Label>Nome / E-mail ou CPF</Label>
                <Input
                  onChange={({
                    target,
                  }: React.ChangeEvent<HTMLInputElement>) => {
                    setTimeout(() => {
                      setInputFilter(target.value);
                    }, 1000);
                  }}
                />
              </Col>
              <Col md={4}>
                <Label>Tipo</Label>
                <Input type="select" name="type" onChange={handleChangeType}>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </Input>
              </Col>
              <Col md={4}>
                <Label>Status</Label>
                <Input
                  type="select"
                  name="status"
                  onChange={handleChangeStatus}
                >
                  <option value={'all'}>Todos</option>
                  <option value="0">Não cadastrado/Iniciado</option>
                  <option value="3">Aprovado</option>
                  <option value="4">Negado</option>
                </Input>
              </Col>
            </Row>
          </FormGroup>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <DataTable
            columns={columns()}
            data={records}
            pagination
            progressPending={loading}
            progressComponent={<span>Carregando</span>}
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
};

export default HomePagarme;
