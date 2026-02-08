/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { Controller, useForm } from 'react-hook-form';
import api from '../../../providers/api';
import { notify } from '../../../modules/functions';
import { useParams } from 'react-router-dom';

const PageLinks = ({ product }) => {
  const { register, handleSubmit, errors, setValue, control } = useForm({
    mode: 'onChange',
  });
  const { uuidProduct } = useParams();

  const [modalShow, setModalShow] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [, setLoading] = useState(true);

  const [records, setRecords] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api
      .get(`products/pages/${uuidProduct}`)
      .then((r) => setRecords(r.data))
      .catch((err) => {
        // eslint-disable-next-line
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = (data) => {
    setRequesting(true);

    if (activeItem) {
      api
        .put(`products/pages/${uuidProduct}/${activeItem.uuid}`, data)
        .then((r) => {
          setRecords((prev) => {
            const index = prev.findIndex((p) => p.uuid === activeItem.uuid);
            prev[index] = r.data;
            return prev;
          });
          notify({ message: 'Página editada com sucesso', type: 'success' });
          setModalShow(false);
        })
        .catch(() => {
          notify({ message: 'Falha ao editar página', type: 'error' });
        })
        .finally(() => {
          setRequesting(false);
        });
    } else {
      api
        .post(`products/pages/${uuidProduct}`, data)
        .then(({ data }) => {
          setRecords((prev) => [...prev, data]);
          setModalShow(false);
          notify({ message: 'Página criada com sucesso', type: 'success' });
        })
        .catch(() => {
          notify({ message: 'Falha ao criar página', type: 'error' });
        })
        .finally(() => {
          setRequesting(false);
        });
    }
  };
  const deletePage = (item) => {
    setRequesting(true);
    api
      .delete(`products/pages/${uuidProduct}/${item.uuid}`)
      .then(() => {
        setRecords((prev) => prev.filter((p) => p.uuid !== item.uuid));
        notify({ message: 'Página removida com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Falha ao remover página', type: 'error' });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  useEffect(() => {
    if (activeItem) {
      setValue('label', activeItem.label);
      setValue('url', activeItem.url);
      setValue('type', activeItem.type.key);
    }
  }, [activeItem]);

  const copyToClipboard = (element, param, text = 'Copiado com sucesso') => {
    element.select();
    navigator.clipboard.writeText(param);
    notify({
      message: text,
      type: 'success',
    });
    setTimeout(() => {}, 3000);
  };

  return (
    <>
      <h3 className='mb-2'>Páginas</h3>
      <small>
        As páginas serão visualizadas por todos os afiliados na página do
        produto na vitrine. Além das páginas adicionadas abaixo, também existem
        páginas de checkout que são criadas automaticamente quando a oferta ter
        a opção 'podem vender' ativa.
        <ButtonDS variant='link' className='ml-1 d-inline-block'>
          <a
            href={`${window.location.origin}/vitrine/produto/${product.slug}/${uuidProduct}?activeTab=links`}
            target='_blank'
            rel='noreferrer'
            style={{ fontSize: 12 }}
          >
            Visualizar páginas
          </a>
        </ButtonDS>
      </small>
      <Card className='mt-2'>
        <Card.Body>
          <Row>
            <Col>
              {records.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th>URL</th>
                      <th className='text-center' width='100'>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((item) => (
                      <tr key={item.uuid} className='small mb-2' rel='inactive'>
                        <td>{item.label}</td>
                        <td>{item.type?.label}</td>
                        <td className='d-flex'>
                          <textarea
                            id='pix-code'
                            className='form-control pix-code'
                            value={item.url}
                            onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(
                                e.currentTarget,
                                item.url,
                                'Copiado com sucesso'
                              );
                            }}
                            readOnly
                            style={{
                              height: '35px',
                              borderRadius: '8px 0px 0px 8px',
                            }}
                          />
                          <Button
                            variant={'primary'}
                            onClick={(e) => {
                              e.preventDefault();
                              const textarea =
                                e.currentTarget.parentElement.firstChild;
                              copyToClipboard(
                                textarea,
                                item.url,
                                'Copiado com sucesso'
                              );
                            }}
                            className='d-flex align-items-center'
                            style={{
                              borderRadius: '0px 8px 8px 0px',
                              height: '35px',
                            }}
                          >
                            <i
                              className='bx bx-copy-alt'
                              style={{ fontSize: 21 }}
                            ></i>
                          </Button>
                        </td>
                        <td>
                          <div className='d-flex'>
                            <ButtonDS
                              size='icon'
                              onClick={() => {
                                setModalShow(true);
                                setActiveItem(item);
                              }}
                              className='btn btn-primary shadow btn-xs sharp mr-1'
                            >
                              <i className='bx bxs-pencil'></i>
                            </ButtonDS>
                            <ButtonDS
                              size='icon'
                              variant='danger'
                              onClick={() => {
                                deletePage(item);
                              }}
                              className='btn btn-primary shadow btn-xs sharp mr-1'
                            >
                              {!requesting ? (
                                <i className='bx bx-trash-alt'></i>
                              ) : (
                                <Spinner />
                              )}
                            </ButtonDS>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className='text-center'>Sem registro de páginas</div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Modal
        show={modalShow}
        className='modal-filter'
        onHide={() => setModalShow(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{activeItem ? 'Editar' : 'Nova'} Página</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='form-group'>
            <label htmlFor=''>Título</label>
            <Form.Control
              type='text'
              className='form-control'
              name='label'
              isInvalid={errors.label}
              ref={register({ required: 'Campo obrigatório.' })}
            />
            <div className='form-error'>
              <span>{errors?.label?.message}</span>
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor=''>URL</label>
            <Form.Control
              type='text'
              className='form-control'
              name='url'
              isInvalid={errors.url}
              defaultValue={'https://'}
              ref={register({ required: 'Campo obrigatório.' })}
            />
            <div className='form-error'>
              <span>{errors?.url?.message}</span>
            </div>
          </div>
          <div className='form-group'>
            <label htmlFor=''>Tipo</label>
            <Controller
              render={(field) => (
                <Form.Control as='select' {...field}>
                  <option defaultValue value={'content'}>
                    Conteúdo
                  </option>
                  <option value={'sale'}>Venda</option>
                  <option value={'lead'}>Captura</option>
                  <option value={'other'}>Outro</option>
                </Form.Control>
              )}
              control={control}
              name='type'
            />
            <div className='form-error'>
              <span>{errors?.type?.message}</span>
            </div>
          </div>
          <Row className='d-flex justify-content-end mt-2'>
            <ButtonDS size='sm' onClick={handleSubmit(onSubmit)}>
              {activeItem ? 'Editar' : 'Nova'} página
            </ButtonDS>
          </Row>
        </Modal.Body>
      </Modal>
      <ButtonDS
        size='sm'
        onClick={() => {
          setActiveItem(null);
          setModalShow(true);
        }}
      >
        Nova página
      </ButtonDS>
    </>
  );
};

export default PageLinks;
