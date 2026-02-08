import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import Switch from 'react-switch';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';

const Crud = ({
  activeClassroom,
  setActiveClassroom,
  modules,
  uuidProduct,
  setShow,
  notify,
}) => {
  const [requesting, setRequesting] = useState(null);
  const [toggle, setToggle] = useState(activeClassroom?.is_default);
  const [countActiveCheckboxes, setCountActiveCheckboxes] = useState(1);
  const [showWarning, setShowWarning] = useState(false);

  const { register, handleSubmit, reset, getValues, formState } = useForm({
    mode: 'onChange',
  });

  const { isValid } = formState;

  useEffect(() => {
    if (activeClassroom) {
      let defaultModules = activeClassroom.modules.map((item) => {
        return item.uuid;
      });

      let resetValues = {
        is_default: activeClassroom.is_default,
        label: activeClassroom.label,
        modules_ids: defaultModules,
      };
      reset(resetValues, () => {
        handleCheckboxToggle();
      });
    }
  }, [activeClassroom]);

  const onSubmit = (data) => {
    if (typeof data.modules_ids === 'string') {
      data.modules_ids = [data.modules_ids];
    }
    setRequesting('put');
    setShowWarning(false);

    if (activeClassroom) {
      api
        .put(
          '/products/classrooms/' + uuidProduct + '/' + activeClassroom.uuid,
          data
        )
        .then(() => {
          notify({ message: 'Turma salva com sucesso', type: 'success' });
          closeModal();
        })
        .catch(() => {
          notify({ message: 'Sem sucesso ao salvar a turma', type: 'error' });
        });
    } else {
      api
        .post('/products/classrooms/' + uuidProduct, data)
        .then((response) => {
          notify({ message: 'Turma criada com sucesso', type: 'success' });
          setActiveClassroom(response.data);
          setRequesting(false);
        })
        .catch(() => {
          notify({ message: 'Sem sucesso ao salvar a turma', type: 'error' });
        });
    }
  };

  const handleDelete = () => {
    setRequesting('delete');
    setShowWarning(false);

    api
      .delete(
        '/products/classrooms/' + uuidProduct + '/' + activeClassroom.uuid
      )
      .then(() => {
        notify({ message: 'Turma removida com sucesso', type: 'success' });
        closeModal();
      })
      .catch(() => {
        notify({ message: 'Falha ao remover a turma', type: 'error' });
        setShowWarning(true);
        setRequesting(false);
      });
  };

  const handleToggle = () => {
    setToggle(!toggle);
  };

  const handleCheckboxToggle = () => {
    let fields = getValues();

    setCountActiveCheckboxes(fields.modules_ids.length);
  };

  const closeModal = () => {
    setShow(false);
    // setactiveLesson(null);
  };

  return (
    <>
      <Row>
        <Col xs={12}>
          <Form.Group as={Row} controlId='formPlaintextEmail'>
            <Form.Label column sm='2'>
              Nome
            </Form.Label>
            <Col sm='10'>
              <Form.Control ref={register({ required: true })} name='label' />
            </Col>
          </Form.Group>
        </Col>
      </Row>

      {activeClassroom && (
        <Row>
          <Col className='mb-4'>
            <div className='d-flex align-items-center'>
              <Switch
                onChange={handleToggle}
                checked={toggle}
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
              <input
                type='hidden'
                ref={register}
                name='is_default'
                value={toggle}
              />
              <span className='ml-4'>Definir como Turma Padrão</span>
            </div>
          </Col>
          <Col xs={12}>
            <div className='form-group mb-5'>
              <label className='d-block bold'>Módulos Disponíveis</label>
              {modules.map((item, index) => {
                return (
                  <div
                    key={index}
                    className='d-flex justify-content-between align-items-center'
                  >
                    <label className='pointer'>
                      <input
                        type='checkbox'
                        name={`modules_ids`}
                        value={item.uuid}
                        ref={register}
                        className='mr-3'
                        onChange={handleCheckboxToggle}
                      />
                      {item.title}
                    </label>
                    {/* <small>({item.lessons_quantity} aulas)</small> */}
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      )}
      {showWarning && (
        <Row>
          <Col>
            <small className='bold text-danger mb-2 d-block'>
              Para excluir uma turma, primeiro transfira os alunos para outra.
            </small>
          </Col>
        </Row>
      )}
      <Row>
        <Col md={12} className='d-flex justify-content-between'>
          {activeClassroom ? (
            <ButtonDS
              size={'sm'}
              onClick={handleDelete}
              variant='danger'
              disabled={requesting}
            >
              {requesting === 'delete' ? 'excluindo...' : 'Excluir'}
            </ButtonDS>
          ) : (
            <div></div>
          )}
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            variant='primary'
            disabled={
              !isValid ||
              requesting === 'put' ||
              countActiveCheckboxes === 0 ||
              countActiveCheckboxes === undefined
            }
          >
            {requesting === 'put' ? 'salvando...' : 'Salvar'}
          </ButtonDS>
        </Col>
      </Row>
    </>
  );
};

export default Crud;
