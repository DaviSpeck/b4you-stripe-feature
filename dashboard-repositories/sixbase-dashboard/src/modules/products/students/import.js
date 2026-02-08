import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../../providers/api';
import regexEmail from '../../../utils/regex-email';
import { notify } from '../../functions';
import { useProduct } from '../../../providers/contextProduct';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const Import = ({ setShow, classrooms, uuidProduct, onSuccess }) => {
  const [nav, setNav] = useState('input');
  const [requesting, setRequesting] = useState(null);
  const [listValid, setListValid] = useState([]);
  const [listInvalid, setListInvalid] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const { register, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;
  const { product } = useProduct();

  const onSubmit = (data) => {
    let explode = data.importStudents.split(';');
    let removeLineBreaks = [];
    explode.map((x) => {
      return removeLineBreaks.push(x.replace(/(\r\n|\n|\r)/gm, ''));
    });

    let uniques = [...new Set(removeLineBreaks)];
    let valids = [];
    let invalids = [];

    uniques.map((item) => {
      if (item) {
        let email = item.trim();
        // let name = student[1]?.trim();

        if (regexEmail(email)) {
          return valids.push(email);
        } else {
          return invalids.push(email);
        }
      }
      return true;
    });

    setListValid(valids);
    setListInvalid(invalids);

    setClassroom(getValues('destination'));
    setNav('review');

    return false;
  };

  const handleImport = () => {
    setRequesting('post');

    setNav('success');

    let activeClassroom = getValues('classroom');

    let fields = { data: listValid };
    if (activeClassroom) {
      fields.classroom_id = classroom;
    }

    api
      .post(`/products/students/${uuidProduct}/import/`, fields)
      .then(() => {
        notify({ message: 'Alunos importados com sucesso', type: 'success' });

        if (onSuccess) onSuccess();
        setShow(false);
        setRequesting(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao importar alunos', type: 'error' });
      });
  };

  return (
    <div>
      {nav === 'input' && (
        <Row>
          <Col md={12} className='mb-4'>
            <div>
              <b>Instruções:</b> separe os alunos por ponto e vírgula (;)
            </div>
            <div className='d-block mt-2'>
              <b>Exemplo:</b> fernando@gmail.com; vinicius@gmail.com
            </div>
          </Col>
          {product.type === 'video' && (
            <Col md={12} className='form-group'>
              <label htmlFor='classroom'>Turma</label>
              <Form.Control
                as='select'
                id='classroom'
                ref={register({ required: true })}
                name='destination'
              >
                {classrooms.map((item, index) => {
                  return (
                    <option value={item.uuid} key={index}>
                      {item.label}
                    </option>
                  );
                })}
              </Form.Control>
            </Col>
          )}
          <Col md={12} className='form-group'>
            <label htmlFor='name'>Importação em massa</label>
            <Form.Control
              as='textarea'
              id='name'
              ref={register({ required: true })}
              name='importStudents'
              placeholder='Insira os e-mails separados por ;'
              rows={6}
            />
          </Col>
        </Row>
      )}
      {nav === 'review' && (
        <Row>
          <Col md={12}>
            <b>{listValid.length} novos alunos</b> serão importados com sucesso.
          </Col>
          {listInvalid.length > 0 && (
            <>
              <Col md={12} className='text-danger bold'>
                porém {listInvalid.length} e-mails não são válidos e não serão
                importados.
              </Col>
              <Col md={12} className='mb-4'>
                <table className='table table-sm'>
                  <thead>
                    <tr>
                      <th>E-mail inválidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listInvalid.map((item, index) => {
                      return (
                        <tr key={index}>
                          {/* <td>{item.name}</td> */}
                          <td className='text-danger bold'>{item}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Col>
            </>
          )}
        </Row>
      )}
      {nav === 'success' && (
        <div>
          <div className='text-center mb-2'>
            <h5 className='bg-success d-inline-block p-2'>
              {listValid.length} alunos importados.
            </h5>
          </div>
          <p>
            Enviamos um e-mail para cada um de seus alunos com o acesso ao seu
            curso.
          </p>
          <p>
            Por favor, peça que verifiquem a caixa de spam ou lixo eletrônico
            das suas caixas de entrada.
          </p>
          <p>
            Lembre-se que alunos importados não tem histórico de compra na
            B4you.
          </p>
        </div>
      )}
      {nav !== 'success' && (
        <Row>
          <Col className='d-flex justify-content-between mt-4'>
            {nav === 'review' ? (
              <Button
                size={'sm'}
                variant='light'
                onClick={() => {
                  setNav('input');
                }}
              >
                Voltar
              </Button>
            ) : (
              <div></div>
            )}
            {nav === 'input' ? (
              <ButtonDS
                size={'sm'}
                variant='primary'
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid}
              >
                Revisar
              </ButtonDS>
            ) : (
              <ButtonDS
                size={'sm'}
                variant='primary'
                onClick={handleImport}
                disabled={listValid.length === 0 || requesting === 'post'}
              >
                {requesting !== 'post'
                  ? 'Confirmar Importação'
                  : 'importando...'}
              </ButtonDS>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Import;
