import { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import placeholderMarket from '../../images/placeholderMarket.png';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import { notify } from '../functions';
import './styles.scss';

const formatText = (type) => {
  if (type === 'physical') return 'Físico';
  if (type === 'video') return 'Vídeo';
  if (type === 'ebook') return 'E-book';
  return 'Pagamento';
};

const formatIcon = (type) => {
  if (type === 'physical') return <i class='bx bx-package'></i>;
  if (type === 'video') return <i class='bx bx-video'></i>;
  if (type === 'ebook') return <i class='bx bx-book-alt'></i>;
  return <i class='bx bx-credit-card-alt'></i>;
};

const formatScope = (scope) =>
  scope === 'international' ? 'Internacional' : 'Nacional';

const PageProductsList = () => {
  const [modalShow, setModalShow] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('ASC');

  const handleClose = () => {
    setModalShow(false);
  };

  const handleSort = () => {
    if (sort === 'ASC') {
      setSort('DESC');
    } else {
      setSort('ASC');
    }
  };

  useEffect(() => {
    if (modalShow === false) {
      setLoading(true);

      api
        .get(`/products?size=100&order=${sort}`)
        .then((response) => {
          const filtered = response.data.rows.filter((p) => !p.has_shop_integration);
          setProducts(filtered);
          setLoading(false);
        })
        .catch(() => {});
    }
  }, [modalShow, sort]);

  return (
    <>
      <PageTitle
        title='Meus Produtos'
        path={[
          { url: '/produtos', text: 'Produtos' },
          { url: null, text: 'Meus Produtos' },
        ]}
      />
      <ModalNewCourse
        modalShow={modalShow}
        setModalShow={setModalShow}
        handleClose={handleClose}
      />
      <section id='pageProductsList'>
        <Row>
          <Col className='d-flex flex-column flex-sm-row justify-content-between mb-4'>
            <ButtonDS
              onClick={() => setModalShow(true)}
              variant='primary'
              size='md'
            >
              Novo Produto
            </ButtonDS>

            <ButtonDS
              onClick={handleSort}
              variant='light'
              size='md'
              className='d-flex align-items-center mt-3 mt-sm-0'
            >
              {sort === 'ASC' ? (
                <>
                  <i class='bx bx-up-arrow-alt mr-2'></i> Ordenar (A-Z)
                </>
              ) : (
                <>
                  <i class='bx bx-down-arrow-alt mr-2'></i> Ordenar (Z-A)
                </>
              )}
            </ButtonDS>
          </Col>
        </Row>

        {loading ? (
          <Loader title='Carregando...' style={{ padding: '50px' }} />
        ) : (
          <Row>
            <Col lg={12}>
              <div className='list-products'>
                {products.length > 0 ? (
                  products.map((product) => {
                    return (
                      <Link
                        to={`/produtos/editar/${product.uuid}/geral`}
                        className='product'
                        key={product.uuid}
                      >
                        <div className='wrap-img'>
                          <img
                            src={
                              product.cover ? product.cover : placeholderMarket
                            }
                          />
                          <div className='floating-tag'>
                            <div className='box-icon'>
                              {formatIcon(product.type)}
                            </div>
                            <div className='tag'>
                              {formatText(product.type)}
                            </div>
                          </div>
                        </div>
                        <div class='content p-3'>
                          <div class='label mt-0'>{product.name}</div>
                          <div className='text mt-1 d-flex flex-wrap scope-tags'>
                            <span className='scope-pill mr-1'>
                              Operação: {formatScope(product.operation_scope)}
                            </span>
                            <span className='scope-pill mr-1'>
                              Moeda: {product.currency_code || 'BRL'}
                            </span>
                            <span className='scope-pill'>
                              Adquirente: {product.acquirer_key || 'pagarme'}
                            </span>
                          </div>
                          <div class='text d-flex justify-content-end'>
                            {product.payment_type === 'single'
                              ? 'Único'
                              : 'Assinatura'}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      Nenhum produto registrado.
                    </td>
                  </tr>
                )}
              </div>
            </Col>
          </Row>
        )}
      </section>
    </>
  );
};

export const ModalNewCourse = ({ modalShow, setModalShow, handleClose }) => {
  const [requesting, setRequesting] = useState(null);
  const [categories, setCategories] = useState([]);
  const [registerReturn, setRegisterReturn] = useState(null);

  useEffect(() => {
    setRegisterReturn(null);
  }, [modalShow]);
  useEffect(() => {
    api
      .get('/products/categories')
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => {
        // setCategories(null);
      });
  }, []);

  const { register, handleSubmit, errors, formState, watch } = useForm({
    mode: 'onChange',
    defaultValues: {
      type: 'video',
      operation_scope: 'national',
      currency_code: 'BRL',
      acquirer_key: 'pagarme',
    },
  });

  const { isValid } = formState;

  const onSubmit = (data) => {
    // data.price = parseFloat(data.price.replace(',', '.'));

    setRequesting(true);

    if (!data.payment_type) {
      data.payment_type = 'single';
    }

    if (!data.operation_scope) data.operation_scope = 'national';
    if (!data.currency_code) data.currency_code = 'BRL';
    if (!data.acquirer_key) data.acquirer_key = 'pagarme';

    api
      .post('/products', data)
      .then(() => {
        setModalShow(false);
        notify({ message: 'Produto criado com sucesso', type: 'success' });
      })
      .catch((err) => {
        if (err?.response?.status === 403 && data.operation_scope === 'international') {
          notify({
            message:
              'Seu produtor não está habilitado para criar produto internacional.',
            type: 'error',
          });
        } else {
          notify({ message: 'Falha ao criar o produto', type: 'error' });
        }
        if (err.response.data.body.errors) {
          err.response.data.body.errors.forEach((element) => {
            return setRegisterReturn(`${Object.values(element)[0]} `);
          });
        } else {
          setRegisterReturn(err.response.data.message);
        }
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <Modal centered show={modalShow} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Novo Produto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={12}>
            {registerReturn && (
              <div
                className='alert alert-danger alert-xs'
                style={{
                  padding: '.75rem 1.0em',
                  fontSize: 14,
                  border: '1px solid #f3d1d9',
                }}
              >
                {registerReturn}
              </div>
            )}
            <div className='form-group'>
              <label htmlFor='name'>Nome do Produto</label>
              <Form.Control
                name='name'
                id='name'
                className={errors.name ? 'is-invalid' : null}
                ref={register({ required: 'Digite um nome válido' })}
              />
              {errors?.name?.message && (
                <small className='form-error mt-1'>
                  {errors?.name?.message}
                </small>
              )}
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='type'>Tipo do Produto</label>
              <Form.Control
                as='select'
                name='type'
                id='type'
                className='form-control'
                ref={register}
              >
                <option value='video'>Curso em Vídeo</option>
                <option value='physical'>Produto físico</option>
                <option value='ebook'>E-book</option>
                <option value='payment_only'>Somente Pagamento</option>
              </Form.Control>
            </div>
          </Col>

          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='category'>Categoria</label>
              <Form.Control
                as='select'
                name='category'
                id='category'
                className='form-control'
                ref={register}
              >
                {categories.map((item, index) => {
                  return (
                    <option value={item.id} key={index}>
                      {item.label}
                    </option>
                  );
                })}
              </Form.Control>
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='operation_scope'>Operação</label>
              <small className='d-block text-muted mb-1'>
                Nacional (BRL / pagarme) ou Internacional (USD / stripe).
              </small>
              <Form.Control
                as='select'
                name='operation_scope'
                id='operation_scope'
                className='form-control'
                ref={register}
              >
                <option value='national'>Nacional</option>
                <option value='international'>Internacional</option>
              </Form.Control>
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='currency_code'>Moeda</label>
              <small className='d-block text-muted mb-1'>
                Defina a moeda de venda conforme a operação selecionada.
              </small>
              <Form.Control
                as='select'
                name='currency_code'
                id='currency_code'
                className='form-control'
                ref={register}
              >
                <option value='BRL'>BRL</option>
                <option value='USD'>USD</option>
              </Form.Control>
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='acquirer_key'>Adquirente</label>
              <small className='d-block text-muted mb-1'>
                Defina o adquirente de acordo com o escopo operacional.
              </small>
              <Form.Control
                as='select'
                name='acquirer_key'
                id='acquirer_key'
                className='form-control'
                ref={register}
              >
                <option value='pagarme'>pagarme</option>
                <option value='stripe'>stripe</option>
              </Form.Control>
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='payment_type'>Tipo de Pagamento</label>
              <Form.Control
                as='select'
                name='payment_type'
                id='payment_type'
                className='form-control'
                ref={register}
              >
                <option value='single'>Pagamento único</option>
                {(watch('type') === 'video' ||
                  watch('type') === 'payment_only' ||
                  watch('type') === 'physical') && (
                  <option value='subscription'>Pagamento recorrente</option>
                )}
              </Form.Control>
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='warranty'>Garantia</label>
              <Form.Control
                as='select'
                ref={register}
                name='warranty'
                id='warranty'
                defaultValue='7'
              >
                <option value='7'>7 dias</option>
                <option value='15'>15 dias</option>
                <option value='21'>21 dias</option>
                <option value='30'>30 dias</option>
              </Form.Control>
            </div>
          </Col>
          <Col md={12}>
            <div className='form-group'>
              <label htmlFor=''>Página de vendas</label>
              <Form.Control
                name='sales_page_url'
                type='url'
                placeholder='https://...'
                className={errors.sales_page_url ? 'is-invalid' : null}
                ref={register({
                  required: 'Digite uma URL válida',
                  minLength: {
                    value: 9,
                    message: 'Sua URL deve começar com "https://"',
                  },
                })}
                defaultValue='https://'
              />
              {errors?.sales_page_url?.message && (
                <small className='form-error mt-1'>
                  {errors?.sales_page_url?.message}
                </small>
              )}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <ButtonDS size={'sm'} variant='light' onClick={handleClose}>
          Fechar
        </ButtonDS>
        <ButtonDS
          size={'sm'}
          variant='primary'
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || requesting}
        >
          {!requesting ? 'Salvar' : 'salvando...'}
        </ButtonDS>
      </Modal.Footer>
    </Modal>
  );
};

export default PageProductsList;
