import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../../utility/hooks/useSkin';
import { Badge, Card, CardBody, FormGroup, Input, Label } from 'reactstrap';
import memoizeOne from 'memoize-one';
import { api } from '@services/api';
import { formatDocument, maskPhone } from '@utils';
import { Settings } from 'react-feather';
import { Link } from 'react-router-dom';

const columns = memoizeOne(() => [
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
    name: 'WhatsApp',
    cell: (row) => maskPhone(row.whatsapp),
  },
  {
    name: 'Detalhes',
    center: true,
    cell: (row) => (
      <Link to={`/student/${row.uuid}`}>
        <Badge color="primary" style={{ cursor: 'pointer' }}>
          <Settings size={21} />
        </Badge>
      </Link>
    ),
  },
]);

export default function HomeStudents() {
  const { skin } = useSkin();
  const [records, setRecords] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [inputFilter, setInputFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (page, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();

      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPage);
      if (inputFilter) query.append('input', inputFilter);

      const response = await api.get(`/students?${query.toString()}`);
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
    await fetchStudents(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page) => {
    fetchStudents(page - 1);
  };

  useEffect(() => {
    fetchStudents(0);
  }, [inputFilter]);

  return (
    <section id="pageHomeStudents">
      <h2 className="mb-2">Clientes</h2>

      <Card>
        <CardBody>
          <FormGroup className="filters">
            <Label>Nome / E-mail ou CPF</Label>
            <Input
              onChange={({ target }) => {
                setTimeout(() => {
                  setInputFilter(target.value);
                }, 1000);
              }}
            />
          </FormGroup>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <DataTable
            columns={columns()}
            data={records}
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
