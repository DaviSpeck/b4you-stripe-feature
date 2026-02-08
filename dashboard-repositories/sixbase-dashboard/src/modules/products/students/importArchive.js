import { useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { useForm } from 'react-hook-form';
import { useProduct } from '../../../providers/contextProduct';
import regexEmail from '../../../utils/regex-email';
import { cpf } from 'cpf-cnpj-validator';
import * as xlsx from 'xlsx';
import api from '../../../providers/api';
import { notify } from '../../functions';

const ImportArchive = ({ show, setShow, classrooms, getStudents }) => {
  const [nav, setNav] = useState('input');
  const [requesting, setRequesting] = useState(null);
  const [listValid, setListValid] = useState([]);
  const [listInvalid, setListInvalid] = useState([]);
  const [classroom, setClassroom] = useState('');
  const { register, handleSubmit, formState, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      classroom: classrooms[0]?.uuid || null,
    },
  });
  const { isValid } = formState;
  const { product } = useProduct();

  const handleImport = (e) => {
    e.preventDefault();
    api
      .post(`/products/students/${product.uuid}/import-file`, {
        data: listValid,
        classroom_id: classroom,
      })
      .then(() => {
        notify({ message: 'Alunos importados com sucesso', type: 'success' });
        getStudents();
        setShow(false);
        setRequesting(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao importar alunos', type: 'error' });
      });
  };

  const onlyDigits = (formattedString) => formattedString.replace(/\D/g, '');

  const validateAndFormatFields = ({
    line_number,
    full_name,
    email,
    whatsapp,
    document_number,
  }) => {
    const errors = [];
    const fields = {
      full_name: full_name.trim().toLowerCase(),
      document_number: onlyDigits(document_number.trim()),
      whatsapp: onlyDigits(whatsapp.trim()),
      email,
    };

    const rawFields = {
      line_number,
      full_name,
      email,
      document_number,
      whatsapp,
    };

    if (!cpf.isValid(fields.document_number)) {
      errors.push({ field: 'cpf', message: 'CPF Inválido' });
    }

    if (!regexEmail(fields.email)) {
      errors.push({ field: 'email', message: 'E-mail Inválido' });
    }

    if (fields.whatsapp.length !== 11) {
      errors.push({
        field: 'whatsapp',
        message: 'Telefone deve conter 11 dígitos',
      });
    }

    if (fields.full_name.split(' ').length < 2) {
      errors.push({
        field: 'full_name',
        message: 'Campo nome deve conter nome e sobrenome',
      });
    }

    return { errors, fields, rawFields };
  };

  const onSubmit = async (data) => {
    const file = getValues('file')[0];
    let rows = null;
    await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = e.target.result;
        let readedData = xlsx.read(data, { type: 'binary' });
        const wsname = readedData.SheetNames[0];
        const ws = readedData.Sheets[wsname];

        const dataParse = xlsx.utils.sheet_to_json(ws, {
          header: 1,
          raw: false,
        });
        rows = dataParse;
        resolve();
      };
      reader.readAsBinaryString(file);
    });
    const values = [];
    const invalids = [];
    let error = false;
    for (const [index, row] of rows.entries()) {
      if (row.length !== 4) {
        notify({
          message:
            'As linhas devem conter os quatro itens obrigatórios: nome completo, e-mail, telefone, cpf',
          type: 'error',
        });
        error = true;
        break;
      }
      const [full_name, email, whatsapp, document_number] = row;
      const { fields, rawFields, errors } = validateAndFormatFields({
        line_number: index + 1,
        full_name: String(full_name),
        email: String(email),
        document_number: String(document_number),
        whatsapp: String(whatsapp),
      });
      if (errors.length === 0) {
        values.push(fields);
      } else {
        invalids.push(rawFields);
      }
    }

    if (!error) {
      const uniqueEmails = [];
      for (const data of values) {
        const exists = uniqueEmails.find((u) => u.email === data.email);
        if (!exists) {
          uniqueEmails.push(data);
        }
      }
      setListValid(uniqueEmails);
      setListInvalid(invalids);
      setClassroom(data.classroom);
      setNav('review');
    }
  };

  return (
    <div>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Importar alunos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {nav === 'input' && (
              <Row>
                <Col md={12} className='mb-4'>
                  <div>
                    <b>Instruções:</b> Ordem dos dados deve ser: nome, e-mail,
                    telefone (11 dígitos), cpf (11 dígitos)
                  </div>
                  <div className='d-block mt-2'>
                    <b>Exemplo:</b> Meu nome, meunome@email.com, 99999999999,
                    01234567890
                  </div>
                </Col>
                {product.type === 'video' && (
                  <Col md={12} className='form-group'>
                    <label htmlFor='classroom'>Turma</label>
                    <Form.Control
                      as='select'
                      id='classroom'
                      ref={register({ required: true })}
                      name='classroom'
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
                  <label htmlFor='name'>Importação em arquivo CSV, XLSX</label>
                  <Form.Control
                    id='file'
                    type='file'
                    ref={register({ required: true })}
                    name='file'
                    accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    className='form-control'
                  />
                </Col>
              </Row>
            )}
            {nav === 'review' && (
              <Row>
                <Col md={12}>
                  <b>{listValid.length} novos alunos</b> serão importados com
                  sucesso.
                </Col>
                {listInvalid.length > 0 && (
                  <>
                    <Col md={12} className='text-danger bold'>
                      porém {listInvalid.length} contém dados inválidos e não
                      serão importados.
                    </Col>
                    <Col md={12} className='mb-4'>
                      <table className='table table-sm'>
                        <thead>
                          <tr>
                            <th>Dados inválidos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listInvalid.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td className='text-danger bold'>
                                  Linha {item.line_number}
                                </td>
                                <td className='text-danger bold'>
                                  {item.full_name}
                                </td>
                                <td className='text-danger bold'>
                                  {item.email}
                                </td>
                                <td className='text-danger bold'>
                                  {item.whatsapp}
                                </td>
                                <td className='text-danger bold'>
                                  {item.document_number}
                                </td>
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
                  Enviamos um e-mail para cada um de seus alunos com o acesso ao
                  seu curso.
                </p>
                <p>
                  Por favor, peça que verifiquem a caixa de spam ou lixo
                  eletrônico das suas caixas de entrada.
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
                    <ButtonDS
                      size={'sm'}
                      variant='light'
                      onClick={() => {
                        setNav('input');
                      }}
                    >
                      Voltar
                    </ButtonDS>
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
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ImportArchive;
