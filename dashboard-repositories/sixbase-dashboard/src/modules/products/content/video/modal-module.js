import { useEffect, useRef, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Switch from 'react-switch';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import RemoveUploadImage from '../../../../jsx/components/RemoveUploadImage';
import UploadImage from '../../../../jsx/components/UploadImage';
import ConfirmAction from '../../../../jsx/layouts/ConfirmAction';
import api from '../../../../providers/api';
import Loader from '../../../../utils/loader';
import { useProduct } from '../../../../providers/contextProduct';

const ModalModule = ({ show, setShow, uuidProduct, activeModule, notify }) => {
  const {
    register,
    setValue,
    handleSubmit,
    errors,
    formState,
    reset,
    getValues,
  } = useForm({ mode: 'onChange' });
  const { isValid } = formState;
  const { product } = useProduct();
  const [checkActive, setCheckActive] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [lessons, setLessons] = useState(0);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [checkCheckbox, setCheckCheckbox] = useState(true);
  const [activeClassroom, setActiveClassroom] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [pending, setPending] = useState(true);
  const [img_link, setImg_link] = useState(null);
  const [uploadFile, setUploadFile] = useState([]);
  const [objectUrl, setObjectUrl] = useState(null);

  const fileElement = useRef(null);

  // Get cover format from product
  const moduleCoverFormat = product?.module_cover_format || 'vertical';
  const coverDimensions = moduleCoverFormat === 'horizontal' 
    ? '300 x 225 px (formato paisagem)' 
    : '290 x 512 px (formato vertical)';

  useEffect(() => {
    if (activeModule) {
      setImg_link(activeModule.cover);
    }
  }, [activeModule]);

  useEffect(() => {
    setValue('active', checkActive);
  }, [checkActive]);

  useEffect(() => {
    api
      .get('/products/classrooms/' + uuidProduct + '/preview')
      .then((response) => {
        setClassrooms(response.data);
        setPending(false);
      })
      .catch(() => {});

    if (show) {
      if (activeModule) {
        setActiveClassroom(activeModule.classrooms);
        reset(activeModule);
        setValue(
          'classrooms_ids',
          activeModule.classrooms.map((item) => item.uuid)
        );
        setLessons(activeModule.lessons.length);
        setCheckActive(activeModule.active);
      } else {
        reset();
      }
    }
  }, [show]);

  useEffect(() => {
    if (activeModule) {
      if (activeClassroom.length !== classrooms.length) {
        return setCheckCheckbox(false);
      }
      return setCheckCheckbox(true);
    }
    return setCheckCheckbox(true);
  }, [activeClassroom, classrooms]);

  const handleCheckboxToggle = () => {
    let fieldsClassrooms = getValues().classrooms_ids;
    if (fieldsClassrooms === false) {
      fieldsClassrooms = [];
    }
    if (typeof fieldsClassrooms === 'string') {
      fieldsClassrooms = [fieldsClassrooms];
    }
    fieldsClassrooms.length === classrooms.length
      ? setCheckCheckbox(true)
      : setCheckCheckbox(false);
  };

  const changeAllCheckbox = () => {
    let fieldsClassrooms = getValues().classrooms_ids;
    if (fieldsClassrooms === false) {
      fieldsClassrooms = [];
    }
    if (typeof fieldsClassrooms === 'string') {
      fieldsClassrooms = [fieldsClassrooms];
    }
    if (checkCheckbox) {
      setValue('classrooms_ids', false);
      setCheckCheckbox(false);
    } else {
      setValue(
        'classrooms_ids',
        classrooms.map((item) => item.uuid)
      );
      setCheckCheckbox(true);
    }
  };

  const onSubmit = (data) => {
    if (Object.keys(data).length > 0) {
      if (typeof data.classrooms_ids === 'string') {
        data.classrooms_ids = [data.classrooms_ids];
      }
      if (activeModule) {
        setRequesting('put');

        api
          .put(
            '/products/modules/' + uuidProduct + '/' + activeModule.uuid,
            data
          )
          .then(() => {
            notify({ message: 'Salvo com sucesso', type: 'success' });
            closeModal();
          })
          .catch(() => {
            notify({ message: 'Erro ao salvar', type: 'error' });
          })
          .finally(() => {
            setRequesting(false);
          });
      } else {
        setRequesting('post');
        data.active = checkActive;
        const formData = new FormData();
        formData.append('cover', uploadFile);
        formData.append('data', JSON.stringify(data));
        api
          .post(`/products/modules/${uuidProduct}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(() => {
            notify({ message: 'Módulo criado com sucesso', type: 'success' });
            closeModal();
          })
          .catch(() => {
            notify({ message: 'Falha ao criar o modulo', type: 'error' });
          })
          .finally(() => {
            setRequesting(false);
          });
      }
    }
  };

  const handleDelete = () => {
    setRequesting('delete');
    api
      .delete('/products/modules/' + uuidProduct + '/' + activeModule.uuid)
      .then(() => {
        notify({ message: 'Módulo removido com sucesso', type: 'success' });

        closeModal();
      })
      .catch(() => {
        notify({ message: 'Falha ao remover o módulo', type: 'error' });
      });
  };

  const handleBrowse = (e) => {
    let selectedFile = e.target.files[0];
    setUploadFile(selectedFile);
    setObjectUrl(URL.createObjectURL(selectedFile));
  };

  const removeImage = () => {
    fileElement.current.value = null;
    setUploadFile([]);
    setObjectUrl(null);
  };

  const closeModal = () => {
    setShow(false);
    // setActiveModule(null);
  };

  return (
    <div>
      <Modal
        show={true}
        centered
        onHide={() => {
          setShow(false);
        }}
        id='create-module'
      >
        <Modal.Header closeButton>
          <Modal.Title>{activeModule ? 'Editar ' : 'Novo '} Módulo</Modal.Title>
        </Modal.Header>

        {pending ? (
          <Loader style={{ padding: '70px 0' }} />
        ) : (
          <div>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <div className='form-group'>
                    <label>Título</label>
                    <Form.Control
                      type='email'
                      className='form-control'
                      name='title'
                      isInvalid={errors.title}
                      ref={register({ required: true })}
                    />
                    <div className='form-error'>
                      {errors.title && <span>{errors.title.message}</span>}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <label htmlFor=''>Liberar</label>
                    <Form.Control
                      ref={register()}
                      name='release'
                      as='select'
                      className='select-input'
                    >
                      <option value='0'>Imediatamente</option>
                      {[
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                      ].map((item, index) => {
                        return (
                          <option value={item} key={index}>
                            Após {item} {item > 1 ? 'dias' : 'dia'} da compra
                          </option>
                        );
                      })}
                    </Form.Control>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <div className='d-flex align-items-center mb-4'>
                      <input type='hidden' name='active' ref={register()} />
                      <Switch
                        onChange={() => {
                          setCheckActive(!checkActive);
                        }}
                        checked={checkActive}
                        checkedIcon={false}
                        uncheckedIcon={false}
                        onColor='#0f1b35'
                        onHandleColor='#fff'
                        boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                        activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                        handleDiameter={24}
                        height={30}
                        width={56}
                        className='react-switch'
                      />
                      <span className='ml-2' style={{ fontSize: '18px' }}>
                        <small>
                          {checkActive ? (
                            <span>Alunos podem ver este módulo</span>
                          ) : (
                            <span className='text-danger'>
                              Alunos <b>NÃO</b> podem ver este módulo
                            </span>
                          )}
                        </small>
                      </span>
                    </div>
                  </Form.Group>
                </Col>
                <Col>
                  {checkActive && (
                    <div className='check-wrap'>
                      <div className='d-flex top'>
                        <label className='d-block bold'>
                          Turmas com acesso
                        </label>
                        <div
                          className='d-block'
                          onClick={changeAllCheckbox}
                          style={{
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          {checkCheckbox ? (
                            <div className='d-flex align-items-center'>
                              <i className='bx bxs-checkbox-checked'></i>

                              <span style={{ textDecoration: 'underline' }}>
                                Marcar todas
                              </span>
                            </div>
                          ) : (
                            <div className='d-flex align-items-center'>
                              <i className='bx bxs-checkbox'></i>
                              <span style={{ textDecoration: 'underline' }}>
                                Marcar todas
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='bottom'>
                        {classrooms.map((item, index) => (
                          <div className='item' key={index}>
                            <label className='pointer'>
                              <input
                                type='checkbox'
                                name={`classrooms_ids`}
                                value={item.uuid}
                                ref={register}
                                className='checkbox-input'
                                onChange={handleCheckboxToggle}
                                style={{
                                  marginRight: '20px',
                                  cursor: 'pointer',
                                }}
                                defaultChecked={
                                  activeModule
                                    ? activeClassroom.length
                                      ? activeClassroom.filter(
                                          (a) => a.uuid === item.uuid
                                        ).length > 0
                                      : false
                                    : true
                                }
                              />
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Col>
              </Row>

              {!activeModule ? (
                <Row className='mt-4'>
                  <Col md={6}>
                    <label>Imagem capa do módulo</label>
                    <input
                      type='file'
                      ref={fileElement}
                      multiple={false}
                      onChange={handleBrowse}
                      className='form-control'
                    />
                    <small className='d-block mt-2'>
                      Dimensões esperadas {coverDimensions}
                    </small>
                    {objectUrl && (
                      <div
                        className='form-group d-flex justify-content-start mt-2'
                        mt={3}
                        p={0}
                      >
                        <img
                          src={objectUrl}
                          className='img-fluid'
                          style={{ maxWidth: 200 }}
                        />
                      </div>
                    )}
                    {objectUrl && (
                      <ButtonDS
                        type='submit'
                        variant='danger'
                        onClick={removeImage}
                        size='icon'
                        outline
                      >
                        <i className='bx bx-x' style={{ fontSize: 20 }}></i>
                      </ButtonDS>
                    )}
                  </Col>
                </Row>
              ) : (
                <Row className='mt-4'>
                  <Col md={6}>
                    <UploadImage
                      route={`/products/modules/${uuidProduct}/${activeModule.uuid}/cover`}
                      multiple={false}
                      field={'cover'}
                      update={'cover'}
                      setImg_link={setImg_link}
                    />

                    <small className='d-block mt-2'>
                      Dimensões esperadas {coverDimensions}
                    </small>

                    <div
                      className='form-group d-flex justify-content-start mt-2'
                      mt={3}
                      p={0}
                    >
                      <img
                        src={img_link}
                        className='img-fluid'
                        style={{ maxWidth: 200 }}
                      />
                    </div>
                    {img_link && (
                      <RemoveUploadImage
                        route={`/products/modules/${uuidProduct}/${activeModule.uuid}/cover`}
                        field={'cover'}
                        setImg_link={setImg_link}
                        img_link={img_link}
                      />
                    )}
                  </Col>
                </Row>
              )}
            </Modal.Body>
            <Modal.Footer>
              {activeModule ? (
                <ButtonDS
                  size={'sm'}
                  onClick={() => {
                    setModalCancelShow(true);
                  }}
                  variant='danger'
                  disabled={requesting}
                >
                  {requesting === 'delete' ? 'excluindo...' : 'Excluir'}
                </ButtonDS>
              ) : (
                <div></div>
              )}
              <div className='d-flex'>
                <ButtonDS
                  size={'md'}
                  onClick={handleSubmit(onSubmit)}
                  disabled={
                    !isValid || requesting === 'put' || requesting === 'post'
                  }
                  iconRight={'bx-check-circle'}
                >
                  <span>
                    {requesting === 'put' || requesting === 'post'
                      ? 'salvando...'
                      : 'Salvar'}
                  </span>
                </ButtonDS>
              </div>
            </Modal.Footer>
          </div>
        )}
      </Modal>

      {modalCancelShow && (
        <ConfirmAction
          show={modalCancelShow}
          setShow={setModalCancelShow}
          handleAction={handleDelete}
          buttonText={'Excluir'}
          simpleConfirm={!lessons}
          title={'Excluir Módulo '}
          centered
        />
      )}
    </div>
  );
};

export default ModalModule;
