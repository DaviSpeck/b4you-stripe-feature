import { Col, Row, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '../../../providers/api';
import { useEffect } from 'react';
import Loader from '../../../utils/loader';
import { Link } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { MultiSelect } from 'react-multi-select-component';
import { notify } from '../../functions';

const configSelect = {
  allItemsAreSelected: 'Todas as ofertas estão selecionadas',
  clearSearch: 'Limpar filtro',
  clearSelected: 'Limpar selecionado',
  noOptions: 'Sem produtos',
  search: 'Buscar',
  selectAll: 'Selecionar todas',
  selectAllFiltered: 'Selecionar todas (com filtros)',
  selectSomeItems: 'Selecione...',
  create: 'Cadastrar',
};

const ModalRule = ({ uuidIntegration, setShow }) => {
  const [requesting, setRequesting] = useState(false);
  const [products, setProducts] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [course, setCourse] = useState([]);

  const { register, handleSubmit, formState } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api
      .get(`/integrations/memberkit/info/${uuidIntegration}`)
      .then((response) => {
        setProducts(response.data.products);
        setCourse(
          response.data.data.map((item) => ({
            label: item.course_name + ' - ' + item.name,
            value: item.id,
          }))
        );
      })
      .catch(() => {})
      .finally();
  };

  const onSubmit = (data) => {
    setRequesting(true);

    if (selectedCourse.length > 0) {
      let fields = {
        ids_classroom: selectedCourse,
        uuid_product: data.product,
      };

      api
        .post(`/integrations/memberkit/${uuidIntegration}`, fields)
        .then(() => {
          setShow(false);
          notify({ message: 'Regra criada com sucesso', type: 'success' });
        })
        .catch(() => {
          notify({ message: 'Falha ao criar regra', type: 'error' });
        })
        .finally(() => setRequesting(false));
    } else {
      notify({ message: 'Selecione um curso e turma', type: 'error' });
      setRequesting(false);
    }
  };

  return (
    <>
      {products !== null && course !== null ? (
        <>
          <Row>
            <Col xs={12}>
              <div className='form-group'>
                <label htmlFor=''>Produto</label>
                <Form.Control
                  as='select'
                  name='product'
                  ref={register({ required: true })}
                  disabled={products.length === 0}
                >
                  {products.some((item) => item.payment_type === 'single') ? (
                    <optgroup label='Pagamento único'>
                      {products
                        .filter((p) => p.payment_type === 'single')
                        .map((item) => (
                          <option value={item.uuid} key={item.uuid}>
                            {item.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : (
                    <></>
                  )}
                  {products.some((p) => p.payment_type !== 'single') ? (
                    <optgroup label='Pagamento recorrente'>
                      {products
                        .filter((p) => p.payment_type !== 'single')
                        .map((item) => (
                          <option value={item.uuid} key={item.uuid}>
                            {item.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : (
                    <></>
                  )}
                </Form.Control>
                {products.length === 0 && (
                  <div
                    className='mt-2'
                    style={{ fontSize: 12, color: '#ff285c' }}
                  >
                    Você não possui nenhum produto cadastrado.{' '}
                    <Link to='/produtos/listar' style={{ color: '#4dd0bb' }}>
                      Cadastrar agora
                    </Link>
                  </div>
                )}
              </div>
            </Col>

            <Col xs={12}>
              <div className='form-group'>
                <label htmlFor=''>Curso - Turma</label>
                <MultiSelect
                  options={course}
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  overrideStrings={configSelect}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex justify-content-end'>
              <ButtonDS
                size={'sm'}
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid || requesting}
              >
                {!requesting ? 'Salvar' : 'salvando...'}
              </ButtonDS>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Loader
            title='carregando dados da
          Memberkit...'
          />
        </>
      )}
    </>
  );
};

export default ModalRule;
