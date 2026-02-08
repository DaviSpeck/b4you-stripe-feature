import { useEffect, useState } from 'react';
import UploadImage from '../../jsx/components/UploadImage';
import { Card, Col, Form, Row } from 'react-bootstrap';
import api from '../../providers/api';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import AlertModal from '../../jsx/layouts/AlertModal';
import { notify } from '../functions';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';

const MarketContent = ({
  handleSubmitMarket,
  register,
  uuidProduct,
  statusMarket,
  handleSubmit,
  setRequesting,
}) => {
  const [images, setImages] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [modalCancelShow, setModalCancelShow] = useState(false);

  const setImg_link = (uuid, link, key) => {
    setImages((prev) => [...prev, { uuid: uuid, file: link, key: key }]);
  };

  const fetchImages = () => {
    api
      .get(`products/images/${uuidProduct}/general`)
      .then((r) => {
        api
          .get(`products/images/${uuidProduct}/market-cover`)
          .then((response) => {
            const allImages = [...r.data, ...response.data];
            setImages(
              allImages.map((item) => ({
                ...item,
                key: item.type.key,
              }))
            );
          })
          // eslint-disable-next-line
          .catch((e) => console.error(e));
      })
      // eslint-disable-next-line
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const removeImage = (route, item) => {
    setIsRemoving(true);
    api
      .delete(route)
      .then(() => {
        setImages((prev) =>
          prev.filter((element) => element.uuid !== item.uuid)
        );
      })
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err.response);
      });
    setIsRemoving(false);
  };

  const onSubmit = (data) => {
    api
      .put(`/products/affiliate/${uuidProduct}`, data)
      .then(() => {
        notify({
          message: 'Salvo com sucesso',
          type: 'success',
        });
        setRequesting(false);
      })
      .catch(() => {
        notify({
          message: 'Erro ao salvar',
          type: 'error',
        });
        setRequesting(false);
      });
  };

  return (
    <>
      {modalCancelShow && (
        <AlertModal
          show={modalCancelShow}
          setShow={setModalCancelShow}
          handleAction={handleSubmitMarket}
          title='Informação'
          textDetails='Analisaremos o conteúdo do produto e em caso de aprovação, seu produto estará listado na vitrine de afiliados'
          textInfo={`Status atual: ${statusMarket?.label || 'Não informado'}`}
        />
      )}

      <Row>
        <Col md={12} className='mb-3'>
          <h4>Vitrine</h4>
          <small>
            Configure os requisitos para a visualização do seu produto na
            vitrine.
          </small>
        </Col>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Row className='d-flex align-items-center'>
                {statusMarket && (
                  <Col md='3' className='d-flex align-items-center'>
                    <p className='m-0'>
                      Status atual:{' '}
                      <BadgeDS
                        variant={
                          statusMarket?.label === 'Desativado'
                            ? 'danger'
                            : statusMarket?.label === 'Pendente'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {statusMarket?.label}
                      </BadgeDS>
                    </p>
                  </Col>
                )}
                {!statusMarket && (
                  <Col md='3' className='d-flex align-items-center'>
                    <p className='m-0'>
                      Status atual: <b>Não informado</b>
                    </p>
                  </Col>
                )}
                <Col md='9' className='d-flex justify-content-end'>
                  <ButtonDS
                    disabled={
                      statusMarket &&
                      (statusMarket?.label === 'Ativo' ||
                        statusMarket?.label === 'Pendente')
                        ? true
                        : false
                    }
                    variant={
                      statusMarket?.label === 'Ativo' ? 'success' : 'primary'
                    }
                    onClick={() => setModalCancelShow(true)}
                  >
                    {statusMarket && statusMarket?.label === 'Ativo'
                      ? 'Produto Aceito'
                      : 'Solicitar'}
                  </ButtonDS>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={12} className='mb-3'>
          <h4>Solicitações</h4>
          <small>Defina as configurações de solicitações do seu produto.</small>
        </Col>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <label>Listar na Vitrine</label>
                    <div className='mb-2'>
                      <small>
                        Deseja que o seu produto seja exibido na vitrine da
                        B4you?
                      </small>
                    </div>
                    <Form.Control
                      ref={register}
                      as='select'
                      name='list_on_market'
                    >
                      <option value={'true'}>Sim</option>
                      <option value={'false'}>Não</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <label>Aprovação</label>
                    <div className='mb-2'>
                      <small>
                        Habilitar a aprovação automática ou realizar as
                        aprovações manualmente?
                      </small>
                    </div>

                    <Form.Control
                      ref={register}
                      as='select'
                      name='manual_approve'
                    >
                      <option value='0'>Automática</option>
                      <option value='1'>Manual</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <label>A Cada Nova Solicitação</label>
                    <div className='mb-2'>
                      <small>
                        Ao receber uma nova solicitação de afiliação, gostaria
                        de ser notificado via E-mail?
                      </small>
                    </div>
                    <Form.Control
                      ref={register}
                      as='select'
                      name='email_notification'
                    >
                      <option value='1'>Notificar Por E-mail</option>
                      <option value='0'>Não Me Notificar</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <h4>Imagens</h4>
      <small>Escolha as melhores imagens para exibir o seu produto.</small>
      <Card className='mt-4'>
        <Card.Body>
          <Row>
            <Col>
              <label htmlFor=''>
                <i className='bx bx-camera' /> Capa da vitrine
              </label>
              <p>
                Adicione imagens de capa para representar o seu produto na aba
                vitrine. Clique em “Escolher arquivo” para carregar as imagens
                escolhidas.
              </p>

              <p>Quantidade máxima permitida: 3</p>
              <UploadImage
                route={`products/images/${uuidProduct}/market-cover`}
                multiple={false}
                field={'general'}
                setMarketImg={(item) => {
                  setImg_link(item.uuid, item.url, item.type.key);
                }}
                verifyLength={{ height: 310, width: 310 }}
              />
              <small className='d-block mt-2'>
                Dimensão esperada 310 x 310 px
              </small>
              <div
                className='d-flex mt-2 '
                style={{ flexWrap: 'wrap', gap: '10px' }}
              >
                {images
                  .filter((item) => item.key === 'market-cover')
                  .map((element) => {
                    const route = `products/images/${uuidProduct}/general/${element.uuid}`;
                    return (
                      <div
                        className='d-flex flex-column mr-3'
                        key={element.uuid}
                      >
                        <img
                          className='img-fluid'
                          src={element.file}
                          style={{ maxWidth: 250 }}
                        />
                        <div className='remove-image mt-1'>
                          {!isRemoving ? (
                            <ButtonDS
                              type='submit'
                              variant='danger'
                              onClick={() => removeImage(route, element)}
                              size='icon'
                              outline
                            >
                              <i
                                className='bx bx-x'
                                style={{ fontSize: 20 }}
                              ></i>
                            </ButtonDS>
                          ) : (
                            <div className='d-block'>
                              <div className='d-flex align-items-center text-danger'>
                                <i
                                  className='bx bx-loader-alt bx-spin mr-2'
                                  style={{ fontSize: 20 }}
                                />
                                <small>Removendo...</small>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Row>
            <Col>
              <label htmlFor=''>
                <i className='bx bx-camera' /> Imagens do produto
              </label>
              <p>
                Adicione imagens informativas na descrição do seu produto para
                descrevê-lo melhor aos afiliados. Clique em “Escolher arquivo”
                para carregar as imagens escolhidas.
              </p>
              <p>Quantidade recomendada: 3</p>

              <UploadImage
                route={`products/images/${uuidProduct}/general`}
                multiple={true}
                field={'general'}
                setMarketImg={(item) => {
                  setImg_link(item.uuid, item.url, item.type.key);
                }}
                verifyLength={{ width: 610, height: 420 }}
              />
              <small className='d-block mt-2'>
                Dimensão esperada 610 x 420 px
              </small>
              <div
                className='d-flex mt-2 '
                style={{ flexWrap: 'wrap', gap: '10px' }}
              >
                {images
                  .filter((item) => item.key === 'market-content')
                  .map((element) => {
                    const route = `products/images/${uuidProduct}/general/${element.uuid}`;
                    return (
                      <div
                        className='d-flex flex-column mr-3'
                        key={element.uuid}
                      >
                        <img
                          className='img-fluid'
                          src={element.file}
                          style={{ maxWidth: 250 }}
                        />
                        <div className='remove-image mt-1'>
                          {!isRemoving ? (
                            <ButtonDS
                              type='submit'
                              variant='danger'
                              onClick={() => removeImage(route, element)}
                              size='icon'
                              outline
                            >
                              <i
                                className='bx bx-x'
                                style={{ fontSize: 20 }}
                              ></i>
                            </ButtonDS>
                          ) : (
                            <div className='d-block'>
                              <div className='d-flex align-items-center text-danger'>
                                <i
                                  className='bx bx-loader-alt bx-spin mr-2'
                                  style={{ fontSize: 20 }}
                                />
                                <small>Removendo...</small>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row>
        <Col className=' d-flex justify-content-end'>
          <ButtonDS onClick={handleSubmit(onSubmit)}>Salvar</ButtonDS>
        </Col>
      </Row>
    </>
  );
};

export default MarketContent;
