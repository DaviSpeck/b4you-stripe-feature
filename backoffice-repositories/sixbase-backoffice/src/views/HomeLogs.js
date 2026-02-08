import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Card, CardBody, Input, Label, CardHeader } from 'reactstrap';
import { api } from '../services/api';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useSkin } from '../utility/hooks/useSkin';

const columns = memoizeOne(() => [
  {
    name: 'ID',
    cell: (row) => row.id,
    width: `70px`,
  },
  {
    name: 'Usuário',
    cell: (row) => row.full_name,
  },
  {
    name: 'Ação',
    cell: (row) => row.event,
  },
  {
    name: 'Produtor ou Cliente',
    cell: (row) => <Link to={`${row.link}`}>{row?.producer_name}</Link>,
  },

  {
    name: 'Criado',
    cell: (row) => moment(row?.created_at).format('DD/MM/YYYY HH:mm:ss'),
  },
  {
    name: 'IP',
    cell: (row) => row.ip_address,
  },
  {
    name: 'Info. Adicionais',
    style: { margin: '0px', padding: '0px' },
    cell: (row) => (
      <div
        dangerouslySetInnerHTML={{ __html: row.params }}
        style={{ margin: 0, padding: 0 }}
      />
    ),
  },
]);

const HomeLogs = () => {
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([{}]);
  const [activeType, setActiveType] = useState('all');
  const [users, setUsers] = useState([{}]);
  const [activeUser, setActiveUser] = useState('all');
  const [inputFilter, setInputFilter] = useState('');
  const { skin } = useSkin();

  const fetchData = async (page, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('event', activeType);
      query.append('id_user', activeUser);
      query.append('input', inputFilter);
      query.append('page', page);
      query.append('size', newPerPage ? newPerPage : recordsPerPage);
      const response = await api.get(`logs?${query.toString()}`);
      setCount(response.data.count);
      setRecords(response.data.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`logs/types`);
      setTypes(response.data.events);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`logs/users`);
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (newPerPage, page) => {
    await fetchData(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page) => {
    fetchData(page - 1);
  };

  const handleChangeStatus = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setActiveType(value);
  };
  const handleChangeUsers = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setActiveUser(value);
  };

  useEffect(() => {
    fetchData(0);
  }, [activeType, activeUser, inputFilter]);

  useEffect(() => {
    fetchTypes();
    fetchUsers();
  }, []);

  return (
    <section id="pageHomeLogs">
      <h2 className="mb-2">Logs</h2>

      <Card>
        <CardHeader className="flex-sm-row flex-column align-items-sm-center">
          <div>
            <Label>E-mail do produtor</Label>
            <Input
              onChange={({ target }) => {
                setTimeout(() => {
                  setInputFilter(target.value);
                }, 1000);
              }}
            />
          </div>
          <div>
            <select as="select" name="users" onChange={handleChangeUsers}>
              <option value={'all'}>Todos</option>
              {users.map((item) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.full_name}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <select as="select" name="status" onChange={handleChangeStatus}>
              <option value={'all'}>Todos</option>
              {types.map((item) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardBody>
          <DataTable
            columns={columns()}
            data={records}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={count}
            onChangeRowsPerPage={handleRecordsPerPageChange}
            onChangePage={handleRecordsPageChange}
            noDataComponent={'Não existem produtos para o nome pesquisado'}
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

export default HomeLogs;
