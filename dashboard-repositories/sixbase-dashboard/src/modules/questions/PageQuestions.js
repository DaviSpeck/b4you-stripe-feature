import moment from 'moment';
import 'moment/locale/pt-br';
import { Fragment, useEffect, useState } from 'react';
import { Badge, Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import DataTable from '../../jsx/components/DataTable';
import ModalFilter from '../../jsx/components/ModalFilter';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import Answer from './answer';

moment.locale('pt-br');

const PageQuestions = () => {
  const [modalFilterShow, setModalFilterShow] = useState(false);
  const [modalQuestionShow, setModalQuestionShow] = useState(false);
  const [objectData, setObjectData] = useState({ data: [], columns: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [delayDebounce, setDelayDebounce] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);

  const { register, reset, getValues } = useForm({
    mode: 'onChange',
  });

  const showFilterModal = () => {
    setModalFilterShow(true);
  };

  const removeFilters = () => {
    reset();
    setFilters({});
  };

  const handleFilterChange = () => {
    setFilters(getValues());
  };

  useEffect(() => {
    if (modalQuestionShow === false) {
      fetchData();
    }
  }, [searchTerm, filters, modalQuestionShow]);

  useEffect(() => {
    if (modalFilterShow === true) {
      reset(filters);
    }
  }, [modalFilterShow]);

  const fetchData = () => {
    let fields = filters;

    if (searchTerm.length > 0) {
      fields.search = searchTerm;
    } else {
      delete fields['search'];
    }

    api
      .get('/questions')
      .then((response) => {
        setDataTable(response.data.rows);
      })
      .catch(() => {
        // console.error(err.response.data);
      });

    // api
    //   .get('/students', fields)
    //   .then((response) => {
    //
    //     setDataTable(response.data.rows);
    //   })
    //   .catch((err) => {
    //
    //   });
  };

  const setDataTable = (rows) => {
    let preparedData = [];
    rows.forEach((item) => {
      let newRow = [
        item.product.name,
        item.student.full_name,
        item.title,
        renderTime(item.created_at),
        renderStatus(item.status.id),
        renderActions(item),
      ];
      preparedData.push(newRow);
    });

    const object = {
      data: preparedData,
      columns: ['Produto', 'Aluno', 'Pergunta', 'Enviado', 'Status', 'Ações'],
    };

    setObjectData(object);
  };

  const renderTime = (value) => {
    return (
      <>
        <small>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).fromNow()}</div>
        </small>
      </>
    );
  };

  const renderStatus = (value) => {
    if (value === 2) {
      return <Badge variant='warning light'>Respondido</Badge>;
    }
    if (value === 1) {
      return <Badge variant=''>Aguardando</Badge>;
    }
  };

  const renderActions = (item) => {
    return (
      <>
        <Button
          onClick={() => {
            handleEdit(item);
          }}
          variant='danger'
          className='shadow btn-xs sharp mr-1'
        >
          <i className='fa fa-pencil' />
        </Button>
      </>
    );
  };

  const handleEdit = (item) => {
    setModalQuestionShow(true);
    setActiveQuestion(item);
  };

  return (
    <Fragment>
      <ModalFilter
        show={modalFilterShow}
        setShow={setModalFilterShow}
        removeFilters={removeFilters}
      >
        <div className='form-group'>
          <label htmlFor=''>Turma</label>
          <select
            className='form-control'
            as='select'
            name='turmas'
            ref={register()}
            onChange={handleFilterChange}
          >
            <option value='todas'>Todas</option>
            <option value='turmaA'>Turma A</option>
            <option value='turbaB'>Turma B</option>
          </select>
        </div>
      </ModalFilter>
      <ModalGeneric
        show={modalQuestionShow}
        setShow={setModalQuestionShow}
        size='lg'
        title='Responder Pergunta'
      >
        <Answer
          activeQuestion={activeQuestion}
          setActiveQuestion={setActiveQuestion}
          setShow={setModalQuestionShow}
        />
      </ModalGeneric>
      <section id='pageStudents'>
        <PageTitle title='Perguntas' />
        <Row>
          <Col>
            <DataTable
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página',
                rangeSeparatorText: 'de',
                selectAllRowsItem: true,
                selectAllRowsItemText: 'Todos',
              }}
              title='Perguntas'
              object={objectData}
              perPage={10}
              unit={'perguntas'}
              skeleton={false}
            >
              <div className='data-filter'>
                <div className='scroll' style={{ width: '100%' }}>
                  <Form.Control
                    placeholder='Buscar...'
                    onChange={(e) => {
                      clearTimeout(delayDebounce);
                      setDelayDebounce(
                        setTimeout(() => {
                          setSearchTerm(e.target.value);
                        }, 1000)
                      );
                    }}
                  />
                  <Button size={'sm'} onClick={showFilterModal}>
                    <i className='las la-search' /> Filtrar
                  </Button>
                </div>
              </div>
            </DataTable>
          </Col>
        </Row>
      </section>
    </Fragment>
  );
};

export default PageQuestions;
