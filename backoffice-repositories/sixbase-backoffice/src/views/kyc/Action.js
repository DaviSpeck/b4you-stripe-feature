import React, { Fragment, useEffect, useState } from 'react';
import Avatar from '@components/avatar';
import { toast, Slide } from 'react-toastify';
import { AlertTriangle, CheckCircle, ThumbsUp, XCircle } from 'react-feather';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  Table,
} from 'reactstrap';
import { api } from '@services/api';
import moment from 'moment';

const ToastContent = ({ title, color, details, icon }) => (
  <Fragment>
    <div className="toastify-header">
      <div className="title-wrapper">
        <Avatar size="sm" color={color} icon={icon} />
        <h6 className="toast-title fw-bold">{title}</h6>
      </div>
    </div>
    <div className="toastify-body">
      <span>{details}</span>
    </div>
  </Fragment>
);

export default function Action({ show, toggle, action, identity, type }) {
  const [details, setDetails] = useState('');
  const [submiting, setSubmiting] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState([{}]);

  useEffect(() => {
    if (!show) {
      setDetails('');
      setSubmiting(false);
    }
  }, [show]);

  useEffect(() => {
    const getUserHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/kyc/info/${identity}`);
        setUserHistory(response.data.verifications);
        setAddress(response.data.user);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    if (action === 'info') {
      getUserHistory();
    }
  }, [action, identity]);

  const submit = async () => {
    setSubmiting(true);
    try {
      let endpoint = '/kyc/cpf/approve';
      if (action !== 'approve') endpoint = '/kyc/cpf/reprove';
      if (type !== 'cpf') {
        endpoint = '/kyc/cnpj/approve';
        if (action !== 'approve') endpoint = '/kyc/cnpj/reprove';
      }

      let body = {
        uuid: identity,
      };

      if (action !== 'approve') body.details = details;

      const response = await api.post(endpoint, body);
      if (response.status === 200) {
        // show success
        toast.success(
          <ToastContent
            title={
              action === 'approve'
                ? 'Documento aprovado!'
                : 'Documento reprovado!'
            }
            color={'success'}
            details={
              action === 'approve'
                ? 'Em alguns instantes o produtor, coprodutor ou afiliado receberá um e-mail confirmando a aprovação dos documentos.'
                : 'Em alguns instantes o produtor, coprodutor ou afiliado receberá um e-mail com a reprovação dos documentos, informando os detalhes do motivo da reprovação.'
            }
            icon={<CheckCircle size={12} />}
          />,
          {
            icon: false,
            transition: Slide,
            autoClose: 5000,
          },
        );

        toggle(null, null, null, true);
      }
    } catch (error) {
      toast.error(
        <ToastContent
          title={'Falha ao aprovar documento!'}
          color={'danger'}
          details={
            'Ocorreu um erro ao aprovar os documentos, entre em contato com o suporte técnico para averiguar o problema.'
          }
          icon={<AlertTriangle size={12} />}
        />,
        {
          icon: false,
          transition: Slide,
          autoClose: 5000,
        },
      );
      toggle(null, null, null, true);
    }
    setSubmiting(false);
  };

  const renderApprove = () => {
    return (
      <>
        <ModalHeader>
          Deseja <b className="uppercase">aprovar</b> a documentação?
        </ModalHeader>
        <ModalBody>
          <div>
            <div className="details">
              <b>Esta ação não é reversível!</b>
              <br />
              Ao aprovar um documento, o produtor, coprodutor ou afilado irá
              receber um alerta pelo e-mail confirmando a aprovação dos
              documentos enviados.
            </div>
            <div className="details">
              <b>Deseja realmente aprovar?</b>
            </div>
            <div className="action-buttons">
              <Button
                color="danger"
                size="sm"
                onClick={() => toggle()}
                disabled={submiting}
              >
                <div>
                  {submiting ? <Spinner size="sm" /> : <XCircle size={16} />}
                  <span>Não, Cancelar!</span>
                </div>
              </Button>
              <Button
                color="success"
                size="sm"
                onClick={() => submit()}
                disabled={submiting}
              >
                <div>
                  {submiting ? <Spinner size="sm" /> : <ThumbsUp size={16} />}
                  <span>Sim !</span>
                </div>
              </Button>
            </div>
          </div>
        </ModalBody>
      </>
    );
  };

  const renderReprove = () => {
    return (
      <>
        <ModalHeader>
          Deseja <b className="uppercase">reprovar</b> a documentação?
        </ModalHeader>
        <ModalBody>
          <div>
            <div className="details">
              <b>Esta ação não é reversível!</b>
              <br />
              Ao reprovar um documento, o produtor, coprodutor ou afilado irá
              receber um alerta pelo e-mail confirmando a reprovação dos
              documentos enviados, juntamente aos detalhes descritos no cambo
              abaixo.
            </div>
            <div className="details-textarea">
              <Label>Detalhes</Label>
              <Input
                type="textarea"
                rows={4}
                onChange={({ target }) => setDetails(target.value)}
              />
            </div>
            <div className="details">
              <b>Deseja realmente reprovar?</b>
            </div>
            <div className="action-buttons">
              <Button
                color="danger"
                size="sm"
                onClick={() => toggle()}
                disabled={submiting}
              >
                <div>
                  {submiting ? <Spinner size={'sm'} /> : <XCircle size={16} />}
                  <span>Não, Cancelar!</span>
                </div>
              </Button>
              <Button
                color="success"
                size="sm"
                onClick={() => submit()}
                disabled={submiting}
              >
                <div>
                  {submiting ? <Spinner size={'sm'} /> : <ThumbsUp size={16} />}
                  <span>Sim !</span>
                </div>
              </Button>
            </div>
          </div>
        </ModalBody>
      </>
    );
  };

  const [open, setOpen] = useState('1');
  const toggleAccordion = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };

  const renderInfo = () => {
    return (
      <>
        <ModalHeader toggle={toggle}>Informações deste usuário</ModalHeader>

        <ModalBody>
          <div>
            <div className="details">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center p-2">
                  <div className="me-2">Carregando histórico</div>
                  <Spinner />
                </div>
              ) : (
                <div>
                  <div className="justify-content-between mb-1">
                    <Accordion open={open} toggle={toggleAccordion}>
                      <AccordionItem>
                        <AccordionHeader targetId="0">
                          <span
                            style={{
                              fontWeight: 500,
                              color: '#349888',
                              fontSize: '18px',
                            }}
                          >
                            Endereço
                          </span>
                        </AccordionHeader>
                        <AccordionBody accordionId="0">
                          <Table>
                            <tbody>
                              <tr>
                                <th>Cidade</th>
                                <th>{address.city || 'Não informado'}</th>
                              </tr>
                              <tr>
                                <th>Estado</th>
                                <th>{address.state || 'Não informado'}</th>
                              </tr>
                              <tr>
                                <th>Rua</th>
                                <th>{address.street || 'Não informado'}</th>
                              </tr>
                              <tr>
                                <th>Número</th>
                                <th>
                                  {address.number
                                    ? `nº ${address.number}`
                                    : 'Não informado'}
                                </th>
                              </tr>
                              <tr>
                                <th>Bairro</th>
                                <th>
                                  {address.neighborhood || 'Não informado'}
                                </th>
                              </tr>
                              <tr>
                                <th>Complemento</th>
                                <th>{address.complement || 'Não informado'}</th>
                              </tr>
                              <tr>
                                <th>CEP</th>
                                <th>{address.zipcode || 'Não informado'}</th>
                              </tr>

                              <tr>
                                <th>País</th>
                                <th>{address.country || 'Não informado'}</th>
                              </tr>
                            </tbody>
                          </Table>
                        </AccordionBody>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Criado em</th>
                        <th>Atualizado em</th>
                        <th>Status</th>
                        <th>Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userHistory.map((element) => {
                        return (
                          <tr>
                            <td>
                              {moment(element.created_at).format(
                                'DD/MM/YYYY HH:mm',
                              )}
                            </td>
                            <td>
                              {moment(element.updated).format(
                                'DD/MM/YYYY HH:mm',
                              )}
                            </td>
                            <td>{element.status}</td>
                            <td>{element.details}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </>
    );
  };

  return (
    <Modal
      id="modalKycActions"
      isOpen={show}
      toggle={toggle}
      centered
      size={action === 'info' ? 'lg' : 'sm'}
    >
      {action === 'approve'
        ? renderApprove()
        : action === 'reprove'
        ? renderReprove()
        : renderInfo()}
    </Modal>
  );
}
