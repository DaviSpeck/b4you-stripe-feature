import Loader from '../utils/loader';
import NoDataComponentContent from './NoDataComponentContent';
import {
  Card,
  Col,
  Form,
  ModalFooter,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from 'react-bootstrap';
import ModalGeneric from '../jsx/components/ModalGeneric';
import DataTable from 'react-data-table-component';
import RenderNameDataTable from '../jsx/components/RenderNameDataTable';
import memoizeOne from 'memoize-one';
import BadgeDS from '../jsx/components/design-system/BadgeDS';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../providers/api';
import ButtonDS from '../jsx/components/design-system/ButtonDS';
import _ from 'lodash';

const columnsAffiliates = memoizeOne(() => [
  {
    name: <RenderNameDataTable name='Afiliado' iconClassName='bx bx-user' />,
    cell: (item) => (
      <div>
        {item.full_name} {item.email}
      </div>
    ),
  },
  {
    name: <RenderNameDataTable name='Comissão' iconClassName='bx bx-dollar' />,
    cell: (item) => item.commission + `%`,
  },
  {
    name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
    cell: (item) => (
      <BadgeDS variant={item.status.color}>{item.status.label}</BadgeDS>
    ),
  },
  {
    name: <RenderNameDataTable name='Gerente' iconClassName='bx bx-user' />,
    cell: (item) =>
      item.manager ? (
        <div>
          {item.manager.full_name} {item.manager.email}
        </div>
      ) : (
        ' - '
      ),
  },
]);

export default function EditManager({ show, setShow, manager }) {
  const [selectedType, setSelectedType] = useState(manager.type);
  const [filterAffiliates, setFilterAffiliates] = useState('all');
  const [requesting, setRequesting] = useState(false);
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRows, setTotalRows] = useState(10);

  const selectedRows = useRef([]);
  const deletedRows = useRef([]);

  const debouncedSave = useCallback(
    _.debounce((emailValue) => {
      setEmail(emailValue);
    }, 300),
    []
  );

  useEffect(() => {
    if (email) {
      debouncedSave(email);
    }
  }, [email, debouncedSave]);

  useEffect(() => {
    findAffiliates();
  }, [email, filterAffiliates, currentPage, totalRows]);

  const manageManager = (e) => {
    e.preventDefault();
    setLoading(true);
    setRequesting(true);
    api
      .post('/managers/manage', {
        type: selectedType,
        affiliates: selectedRows.current.map((c) => c.id),
        manager_id: manager.id,
        del: deletedRows.current.map((d) => d.id),
      })
      .then(() => {
        findAffiliates();
        deletedRows.current = [];
        selectedRows.current = [];
      })
      // eslint-disable-next-line
      .catch((err) => console.log(err))
      .finally(() => {
        setLoading(false);
        setRequesting(false);
      });
  };

  const findAffiliates = () => {
    setRequesting(true);
    const urlParams = new URLSearchParams({
      email,
      filter: filterAffiliates,
      page: currentPage,
      size: totalRows,
    });
    api
      .get(
        `/managers/affiliates/${manager.product_uuid}/${
          manager.id
        }?${urlParams.toString()}`
      )
      .then((r) => {
        setRecords(r.data.rows);
        setCount(r.data.count);
      })
      // eslint-disable-next-line
      .catch((e) => console.log(e))
      .finally(() => setRequesting(false));
  };

  return (
    <ModalGeneric
      show={show}
      setShow={setShow}
      title={`Gerenciar Afiliados de ${manager.full_name}`}
      size={'lg'}
    >
      <Card>
        <Card.Body>
          <Row md='12'>
            <Col
              md='6'
              style={
                selectedType === 'all'
                  ? {
                      border: '2px solid #eaecf0',
                      borderRadius: 10,
                      height: 100,
                    }
                  : {}
              }
              className='d-flex align-items-center justify-content-between'
              onClick={() => setSelectedType('all')}
            >
              <Form.Check
                inline
                label='Atuais e futuros'
                name='type'
                type='radio'
                defaultChecked={selectedType === 'all'}
                checked={selectedType === 'all'}
                onChange={() => setSelectedType('all')}
              />
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-top-invisible-offer`}>
                    Caso habilite esta opção, todos os afiliados atuais desse
                    gerente e todos futuros afiliados do produto, exceto os que
                    vierem através do link exclusivo de outro gerente, serão
                    vinculados ao gerente atual. Você pode alterar essa
                    configuração a qualquer momento. Caso o gerente seja
                    removido, todos os afiliados vinculados a ele ficarão sem
                    gerentes. Caso você selecione afiliados específicos, os
                    afiliados que não forem selecionados por você, ficarão sem
                    vínculo com gerentes
                  </Tooltip>
                }
              >
                <i className='bx bx-info-circle ml-2'></i>
              </OverlayTrigger>
            </Col>
            <Col
              md='6'
              style={
                selectedType === 'not-all'
                  ? {
                      border: '2px solid #eaecf0',
                      borderRadius: 10,
                      height: 100,
                    }
                  : {}
              }
              className='d-flex align-items-center'
              onClick={() => setSelectedType('not-all')}
            >
              <Form.Check
                inline
                label='Específicos'
                name='type'
                type='radio'
                defaultChecked={selectedType === 'not-all'}
                checked={selectedType === 'not-all'}
                onChange={() => setSelectedType('not-all')}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card>
        <Card.Title className='ml-3 mt-3'>Filtros</Card.Title>
        <Card.Body>
          <Row md='12'>
            <label>E-mail</label>
            <input
              type='text'
              name='email'
              className='form-control'
              onChange={(e) => setEmail(e.target.value)}
            />
          </Row>
          <Row md='12' className='justify-content-between mt-3'>
            <Col md='3.5' onClick={() => setFilterAffiliates('all')}>
              <Form.Check
                inline
                label='Todos os afiliados'
                name='filter-affiliates'
                type='radio'
                defaultChecked={filterAffiliates === 'all'}
                checked={filterAffiliates === 'all'}
                onChange={() => setFilterAffiliates('all')}
              />
            </Col>
            <Col md='3.5' onClick={() => setFilterAffiliates('selected')}>
              <Form.Check
                inline
                label='Afiliados atribuídos'
                name='filter-affiliates'
                type='radio'
                defaultChecked={filterAffiliates === 'selected'}
                checked={filterAffiliates === 'selected'}
                onChange={() => setFilterAffiliates('selected')}
              />
            </Col>
            <Col md='3.5' onClick={() => setFilterAffiliates('not-selected')}>
              <Form.Check
                inline
                label='Afiliados não atribuídos'
                name='filter-affiliates'
                type='radio'
                defaultChecked={filterAffiliates === 'not-selected'}
                checked={filterAffiliates === 'not-selected'}
                onChange={() => setFilterAffiliates('not-selected')}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <div className='container-datatable card mt-3'>
        <DataTable
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página',
            rangeSeparatorText: 'de',
            selectAllRowsItem: false,
            selectAllRowsItemText: 'Todos',
          }}
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          columns={columnsAffiliates()}
          data={records}
          striped
          highlightOnHover
          progressPending={requesting}
          progressComponent={<Loader title='Carregando...' />}
          noDataComponent={<NoDataComponentContent />}
          responsive
          pagination
          paginationServer
          onChangePage={(page) => {
            setCurrentPage(page - 1);
          }}
          onChangeRowsPerPage={(rowsPerPage) => {
            setTotalRows(rowsPerPage);
          }}
          paginationTotalRows={count}
          selectableRows
          selectableRowSelected={(row) => row.id_manager === manager.id}
          onSelectedRowsChange={({ selectedRows: selected }) => {
            selectedRows.current = selected;
            const affiliatesManager = records.filter(
              (r) => r.id_manager === manager.id
            );
            const selectedAff = selected.filter(
              (s) => s.id_manager === manager.id
            );
            if (affiliatesManager.length > selectedAff.length) {
              const del = [];
              affiliatesManager.forEach((a) => {
                if (!selectedAff.find((s) => s.id === a.id)) {
                  del.push(a);
                }
              });
              deletedRows.current = del;
            }
          }}
        />
      </div>
      <ModalFooter style={{ padding: 0 }} className='justify-content-end'>
        <ButtonDS onClick={manageManager} variant='primary'>
          {loading ? (
            <Spinner variant='light' size='sm' animation='border' />
          ) : (
            'Salvar'
          )}
        </ButtonDS>
      </ModalFooter>
    </ModalGeneric>
  );
}
