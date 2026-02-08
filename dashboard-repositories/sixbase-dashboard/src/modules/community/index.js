import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import comoSeCadastrar from '../../images/como-se-cadastrar.mov';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import PageTitle from '../../jsx/layouts/PageTitle';
import { notify } from '../../modules/functions';
import api from '../../providers/api';

const PageCommunity = () => {
  const [registered, setRegistered] = useState();
  const [loading, setLoading] = useState(true);
  const [modalCancelShow, setModalCancelShow] = useState(false);

  const fetchData = () => {
    setLoading(true);
    api
      .get('/community')
      .then((response) => {
        setRegistered(response.data.registered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleRegister = () => {
    setLoading(true);

    api
      .post('/community')
      .then(() => {
        fetchData();
        notify({
          message: `Você se registrou na comunidade com sucesso`,
          type: 'success',
        });
      })
      .catch(() => {
        setLoading(false);
        notify({
          message: `Falha no registro da comunidade`,
          type: 'error',
        });
      });
  };

  const handleRemove = () => {
    setLoading(true);
    api
      .delete('/community')
      .then((response) => {
        setRegistered(response.data.registered);
        fetchData();
        notify({
          message: `Você saiu da comunidade com sucesso`,
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: `Falha ao sair da comunidade`,
          type: 'error',
        });
      })
      .finally(() => {
        setModalCancelShow(false);
        setLoading(false);
      });
  };

  const openLinkInNewTab = (url) => {
    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    if (newTab) newTab.opener = null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <section id='community-page'>
        <div className='d-flex justify-content-center'>
          <PageTitle title='Comunidade B4You' />
        </div>
        <div className='wrap-video mb-3'>
          <video src={comoSeCadastrar} controls />
        </div>
        <Row>
          <Col xl={12}>
            <h4 className='mt-5 text-center'>
              Conecte-se, compartilhe e cresça junto com nossa comunidade B4You!
            </h4>
          </Col>
        </Row>
        <div className='d-flex justify-content-center'>
          <div className='d-flex justify-content-around mt-2 flex-wrap w-50 m0-auto'>
            {registered ? (
              <>
                <ButtonDS
                  size='sm'
                  onClick={() =>
                    openLinkInNewTab('https://b4youcomunidade.circle.so')
                  }
                  className='mt-2'
                >
                  Acessar comunidade!
                </ButtonDS>
                <ButtonDS
                  variant='danger'
                  size='sm'
                  onClick={() => setModalCancelShow(true)}
                  outline
                  className='mt-2'
                >
                  Sair da comunidade
                </ButtonDS>
              </>
            ) : (
              <ButtonDS
                onClick={() => {
                  handleRegister();
                }}
              >
                {loading ? 'Carregando...' : 'Registre-se'}
              </ButtonDS>
            )}
          </div>
        </div>
      </section>
      <ConfirmAction
        title={'Sair da counidade'}
        show={modalCancelShow}
        setShow={setModalCancelShow}
        handleAction={handleRemove}
        buttonText={'Sair da comunidade'}
        haveLoader={false}
        simpleConfirm
        centered
        textAlert={'Você pode voltar a comunidade a qualquer momento'}
        variant={'warning'}
        variantButton={'warning'}
        description={
          'Ao sair você perderá benefícios, lives especiais e aulas exclusivas.'
        }
      />
    </>
  );
};

export default PageCommunity;
