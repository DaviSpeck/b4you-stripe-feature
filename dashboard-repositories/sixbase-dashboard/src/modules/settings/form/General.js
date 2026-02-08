import { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { Link, useHistory } from 'react-router-dom';
import Avatar from '../../../jsx/components/Avatar';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api.js';
import { useUser } from '../../../providers/contextUser';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import moment from 'moment';

const General = ({ data, setData }) => {
  const { user, setUser } = useUser();
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestingEmail, setRequestingEmail] = useState(false);
  const [modalChangeMail, setModalChangeMail] = useState(false);
  const [tabContent, setTabContent] = useState('1');
  const [newEmailValue, setNewEmailValue] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(false);
  const { register, handleSubmit, errors, formState, reset } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;
  const history = useHistory();

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data]);

  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      setImage(img);
    }
  };

  useEffect(() => {
    if (image) {
      const formData = new FormData();
      formData.append('profile_picture', image);

      setIsUploading(true);

      api
        .put('/users/profile/avatar', formData, {
          headers: {
            files_data: JSON.stringify([
              {
                type: image.type,
                size: image.size,
              },
            ]),
          },
        })
        .then((response) => {
          setIsUploading(false);
          setUser({
            ...user,
            profile_picture: response.data.profile_picture,
          });
        })
        .catch(() => {
          setIsUploading(false);
        });
    }
  }, [image]);

  const onSubmit = (data) => {
    setRequesting(true);

    let { birth_date } = data;
    if (birth_date) {
      data.birth_date = moment(birth_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }

    api
      .put('/users/profile/general', data)
      .then((response) => {
        notify({
          message: 'Dados salvos com sucesso',
          type: 'success',
        });
        setRequesting(false);
        setData(response.data);
        setUser((prev) => ({
          ...prev,
          ...response.data.general,
        }));
      })
      .catch(() => {
        notify({
          message: 'Falha ao salvar os dados',
          type: 'error',
        });
        setRequesting(false);
      });
  };

  const changeAccountCollaboration = (uuidCollaborator) => {
    setRequesting(true);

    api
      .put(`/auth/change-account/${uuidCollaborator}`)
      .then((response) => {
        if (response?.data) {
          setUser(response.data);
        } else {
          setUser((prevUser) => ({
            ...prevUser,
            current_account: uuidCollaborator,
          }));
        }
        notify({ message: 'Conta alternada com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Falha ao trocar de conta', type: 'error' });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const updateEmail = (data) => {
    if (tabContent === '1') {
      setRequestingEmail(true);
      setNewEmailValue(data.newEmail);
      api
        .put('/users/email', {
          email: data.newEmail,
        })
        .then(() => {
          setTabContent('2');
        })
        .catch((err) => {
          if (err?.response?.data?.message) {
            notify({
              message: err.response.data.message,
              type: 'error',
            });
          } else {
            notify({
              message: 'Falha ao solicitar alteração de email',
              type: 'error',
            });
          }
        })
        .finally(() => setRequestingEmail(false));
    } else {
      setRequestingEmail(true);
      api
        .post('/users/email-update', {
          current_token: data.current_token,
          new_token: data.new_token,
        })
        .then(() => {
          setTabContent('3');
          notify({
            message: 'Solicitar de alteração de email realizada com sucesso',
            type: 'success',
          });
        })
        .catch((e) => {
          notify({
            message: `${e?.response?.data?.message}`,
            type: 'error',
          });
        })
        .finally(() => setRequestingEmail(false));
    }
  };

  const handleDeleteAccount = () => {
    api
      .delete('/users/')
      .then(() => {
        history.push('/acessar');
      })
      .catch(() => {
        notify({
          message: 'Erro ao tentar excluir a conta, por favor, tente novamente',
          type: 'error',
        });
      });
  };

  return (
    <>
      <h4>Dados Gerais</h4>
      <Modal
        show={modalChangeMail}
        onHide={() => setModalChangeMail(false)}
        centered
        backdrop='static'
      >
        <Modal.Header closeButton={tabContent !== '3'}>
          <Modal.Title>
            {tabContent === '1' ? 'Alterar e-mail' : 'Confirmação'}
          </Modal.Title>
        </Modal.Header>
        <form action='' onSubmit={handleSubmit(updateEmail)}>
          <Modal.Body>
            {tabContent === '1' ? (
              <div className='form-group'>
                <label>Novo e-mail</label>
                <Form.Control
                  isInvalid={errors.newEmail}
                  type='email'
                  name='newEmail'
                  className='input-default'
                  ref={register({
                    required: 'Campo obrigatório.',
                    pattern: {
                      value:
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      message: 'Email incorreto.',
                    },
                  })}
                />
                <div className='form-error'>
                  {errors.newEmail && <span>{errors.newEmail.message}</span>}
                </div>
              </div>
            ) : tabContent === '2' ? (
              <div>
                <h4 className='mb-4'>Código de segurança</h4>
                <p>
                  Enviamos dois códigos de segurança. No primeiro campo digite o
                  código enviado para o e-mail <b>{user.email}</b> (atual), no
                  segundo campo digite o código enviado para o e-mail{' '}
                  <b>{newEmailValue}</b> (novo).
                </p>
                <div className='form-group'>
                  <label>
                    Token enviado para <b>{user.email}</b>
                  </label>
                  <Form.Control
                    isInvalid={errors.email}
                    type='text'
                    name='current_token'
                    className='input-default'
                    placeholder={`Código e-mail atual`}
                    ref={register({
                      required: 'Campo obrigatório.',
                    })}
                  />
                  <label style={{ fontSize: '12px' }}>
                    *Difere maiscúlas de minúsculas
                  </label>
                  <div className='form-error'>
                    {errors.current_token && (
                      <span>{errors.current_token.message}</span>
                    )}
                  </div>
                  <label>
                    Token enviado para <b>{newEmailValue}</b>
                  </label>
                  <Form.Control
                    isInvalid={errors.email}
                    type='text'
                    name='new_token'
                    className='input-default'
                    placeholder={`Código e-mail novo`}
                    ref={register({
                      required: 'Campo obrigatório.',
                    })}
                  />
                  <label style={{ fontSize: '12px' }}>
                    *Difere maiscúlas de minúsculas
                  </label>
                  <div className='form-error'>
                    {errors.new_token && (
                      <span>{errors.new_token.message}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className='d-flex justify-content-center'>
                  <i
                    className='bx bx-check'
                    style={{ fontSize: 100, color: '#008000' }}
                  />
                </div>
                <h4 className='text-center'>E-mail alterado com sucesso</h4>
                <p className='mt-4'>
                  Ao clicar no botão abaixo você será redirecionado a página de
                  login.
                </p>
                <p>
                  Utilize o novo e-mail ({newEmailValue}) para entrar na sua
                  conta.{' '}
                </p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className='d-flex justify-content-end'>
            {tabContent === '1' ? (
              <Button
                variant='primary'
                disabled={!isValid || requestingEmail}
                type='submit'
              >
                {requestingEmail ? 'Carregando...' : 'Continuar'}
              </Button>
            ) : tabContent === '2' ? (
              <Button
                variant='primary'
                disabled={!isValid || requestingEmail}
                type='submit'
              >
                {requestingEmail ? 'Carregando...' : 'Trocar e-mail'}
              </Button>
            ) : (
              <Link to='/acessar'>
                <Button variant='primary'>Entrar com novo email</Button>
              </Link>
            )}
          </Modal.Footer>
        </form>
      </Modal>

      <form
        action=''
        onSubmit={handleSubmit(onSubmit)}
        style={{ overflow: 'hidden' }}
      >
        {user.collaborations.length > 1 && (
          <Row>
            <Col md={6}>
              <div className='form-group mt-4'>
                <label>Conta selecionada</label>
                <select
                  ref={register}
                  className='form-control'
                  style={{ height: 54.2 }}
                  onChange={(e) => changeAccountCollaboration(e.target.value)}
                  value={user.current_account || user.uuid}
                >
                  {user.collaborations.map((item) => (
                    <option
                      key={item.uuid}
                      value={item.uuid}
                      selected={item.uuid === user.uuid && 'selected'}
                    >
                      {item.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </Col>
          </Row>
        )}
        <Row>
          <Col md={6}>
            <div className='form-group'>
              <label>Nome</label>
              <Form.Control
                ref={register({ required: true })}
                isInvalid={errors.first_name}
                type='text'
                className='form-control input-default '
                name='first_name'
              />
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label>Sobrenome</label>
              <Form.Control
                ref={register({ required: true })}
                isInvalid={errors.last_name}
                type='text'
                className='form-control input-default '
                name='last_name'
              />
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label>WhatsApp</label>
              <InputMask
                name='whatsapp'
                ref={register}
                className='form-control'
                mask='99 99999 9999'
              />
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label>Instagram</label>
              <Form.Control
                name='instagram'
                ref={register}
                className='form-control'
              />
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label>CPF</label>
              <InputMask
                name='masked_document_number'
                ref={register}
                className='form-control'
                disabled
              />
            </div>
          </Col>
          <Col md={6}>
            <div className='form-group'>
              <label>Data de nascimento</label>
              <InputMask
                ref={register({
                  required: true,
                  validate: (value) => {
                    if (value) {
                      const date = moment(value, 'DD/MM/YYYY');
                      if (date.isValid() && date.isBefore(moment())) {
                        return true;
                      }
                      return false;
                    }
                  },
                })}
                className='form-control'
                mask='99/99/9999'
                name='birth_date'
                placeholder='__/__/____'
              />
              <div className='form-error mt-2'>
                <span>{errors?.birth_date && 'Insira uma data válida.'}</span>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <div className='form-group'>
              <label>E-mail</label>
              <InputMask
                name='email'
                ref={register}
                className='form-control'
                disabled
              />
            </div>
          </Col>
          <Col md={6} className='d-flex justify-content-start align-items-end'>
            <div className='form-group'>
              <div
                className='buttonDS buttonDS-primary buttonDS-size-md'
                onClick={() => setModalChangeMail(true)}
              >
                Alterar e-mail
              </div>
            </div>
          </Col>

          <Col md={12}>
            <div className='form-group'>
              <label className='d-block'>Foto de Perfil</label>
              <div className='c-img'>
                <Avatar src={user.profile_picture} />
                {isUploading && (
                  <div className='uploading'>
                    <i className='fa fa-spinner fa-spin'></i>
                  </div>
                )}
              </div>
              <input
                type='file'
                className='form-control input-default '
                name='image'
                onChange={onImageChange}
              />
            </div>
          </Col>
        </Row>
        <div className='d-flex justify-content-between mt-3'>
          <ButtonDS
            variant='danger'
            size='sm'
            type='submit'
            disabled={!isValid || requesting}
            outline
            onClick={(e) => {
              e.preventDefault();
              setDeleteAccount(true);
            }}
          >
            {!requesting ? 'Excluir conta' : 'salvando...'}
          </ButtonDS>
          <ButtonDS
            variant='primary'
            size='sm'
            type='submit'
            disabled={!isValid || requesting}
          >
            {!requesting ? 'Salvar Informações' : 'salvando...'}
          </ButtonDS>
          {deleteAccount && (
            <ConfirmAction
              show={deleteAccount}
              setShow={setDeleteAccount}
              handleAction={handleDeleteAccount}
              title={'Excluir conta'}
              buttonText={'Excluir'}
              iconLeft={'bx-trash-alt'}
              centered
            />
          )}
        </div>
      </form>
    </>
  );
};

export default General;
