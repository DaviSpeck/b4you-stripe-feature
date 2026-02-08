import { useState } from 'react';
import { Col, Form, FormControl, Row } from 'react-bootstrap';
import Switch from 'react-switch';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const Actions = ({
  activeStudent,
  classrooms,
  uuidProduct,
  productType,
  defaultEction = '',
  setShow,
  onSuccess,
}) => {
  const [activeAction, setActiveAction] = useState(defaultEction);
  const [studentAccess, setStudentAccess] = useState(activeStudent.has_access);
  const [newClassroom, setNewClassroom] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const availableClassrooms = classrooms.filter(
    (item) => item.uuid !== activeStudent.classroom.uuid
  );

  const handleChangeClassroom = () => {
    setRequesting('put');

    let fields = {
      student_id: activeStudent.uuid,
    };

    api
      .put(
        '/products/students/' + uuidProduct + '/migrate/' + newClassroom,
        fields
      )
      .then(() => {
        notify({
          message: 'Aluno mudou de turma com sucesso',
          type: 'success',
        });

        setRequesting(null);
        if (onSuccess) onSuccess();
      })
      .catch(() => {
        notify({ message: 'Falha ao mudar de turma', type: 'error' });
      });
  };

  const handleManageAccess = () => {
    let newValue = !studentAccess;
    setStudentAccess(newValue);

    let fields = {
      student_id: activeStudent.uuid,
      has_access: newValue,
    };

    api
      .put('/products/students/' + uuidProduct + '/permission', fields)
      .then(() => {
        if (onSuccess) onSuccess();
      })
      .catch(() => {});
  };

  const valid = () => {
    if (newClassroom === '0') {
      return false;
    }
    if (newClassroom === null) {
      return false;
    }

    if (availableClassrooms.length === 0) {
      return false;
    }

    return true;
  };

  return (
    <div>
      {activeAction === null && (
        <>
          <div className='d-flex justify-content-center mb-4'>
            <h4 className='mb-4'>{activeStudent.full_name}</h4>
          </div>
          <div className='d-flex justify-content-center'>
            {productType === 'video' && (
              <ButtonDS
                onClick={() => {
                  setActiveAction('change-classroom');
                }}
              >
                Mudar de Turma
              </ButtonDS>
            )}
          </div>
        </>
      )}
      {activeAction === 'change-classroom' && (
        <>
          <Row className='mt-2'>
            <Col>
              <div className='mb-2'>Turma Atual:</div>
              <Form.Control disabled value={activeStudent.classroom.label} />
            </Col>
            <Col>
              <div className='mb-2'>Nova Turma:</div>
              <div>
                <FormControl
                  as='select'
                  disabled={availableClassrooms.length === 0}
                  onChange={(e) => {
                    setNewClassroom(e.target.value);
                  }}
                >
                  <option value='0'>escolha..</option>
                  {availableClassrooms.map((item, index) => {
                    return (
                      <option value={item.uuid} key={index}>
                        {item.label}
                      </option>
                    );
                  })}
                </FormControl>
              </div>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex justify-content-between mt-5'>
              <ButtonDS
                size={'sm'}
                variant='light'
                onClick={() => {
                  setShow(false);
                }}
              >
                Voltar
              </ButtonDS>
              <ButtonDS
                size={'sm'}
                variant='primary'
                onClick={handleChangeClassroom}
                disabled={!valid() || requesting === 'put'}
              >
                {requesting !== 'put' ? 'Confirmar Alteração' : 'Alterando...'}
              </ButtonDS>
            </Col>
          </Row>
        </>
      )}
      {activeAction === 'revoke-access' && (
        <>
          <h4 className='mb-4'>Gerenciar Acesso</h4>

          <Row>
            <Col>
              <div className='d-flex align-items-center'>
                <Switch
                  onChange={handleManageAccess}
                  checked={studentAccess}
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
                <span className='ml-4'>Aluno Pode Acessar o Curso</span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <small className='mt-4 d-block'>
                Ao bloquear o acesso de um aluno, ele ainda poderá acessar à
                área de membros, porém não poderá mais ver o conteúdo e a
                comunidade de seu curso.
              </small>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex justify-content-between mt-4'>
              <ButtonDS
                size={'sm'}
                variant='light'
                onClick={() => {
                  setActiveAction(null);
                }}
              >
                Voltar
              </ButtonDS>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Actions;
