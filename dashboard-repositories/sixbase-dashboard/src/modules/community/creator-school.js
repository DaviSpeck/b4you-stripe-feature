import { Col, Row } from 'react-bootstrap';

import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import PageTitle from '../../jsx/layouts/PageTitle';
import { notify } from '../../modules/functions';
import { apiMembership } from '../../providers/api';
import { useUser } from '../../providers/contextUser';

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome');
};

export const CreatorSchool = () => {
  const { user } = useUser();
  let host = window.location.host;

  const membersAreaSubdomain =
    host.includes('sandbox') || host.includes('localhost')
      ? 'sandbox-membros'
      : 'membros';

  const openLinkInNewTab = (url) => {
    if (isSafari()) {
      window.location.href = url;
      return;
    }

    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    if (newTab) newTab.opener = null;
  };

  const handleLoginCreator = async () => {
    try {
      const response = await apiMembership.post('/auth/creator-school', {
        email: user.email,
      });

      openLinkInNewTab(
        `https://${membersAreaSubdomain}.b4you.com.br/acessar/${response.data.sessionId}`
      );
    } catch (err) {
      notify({
        message: `Falha ao entrar na Escola Creators`,
        type: 'error',
      });
    }
  };

  return (
    <>
      <section id='community-page'>
        <div className='d-flex justify-content-center'>
          <PageTitle title='Escola Creator' />
        </div>
        {/* <div className='wrap-video mb-3'>
          <video src={comoSeCadastrar} controls />
        </div> */}
        <Row>
          <Col xl={12}>
            <h4 className='text-center'>
              Conecte-se, compartilhe e cresça junto com nossa Escola Creator!
            </h4>
          </Col>
        </Row>
        <div className='d-flex justify-content-center'>
          <div className='d-flex justify-content-around mt-2 flex-wrap w-50 m0-auto'>
            <ButtonDS size='sm' onClick={handleLoginCreator} className='mt-2'>
              Acessar Escola Creator!
            </ButtonDS>
          </div>
        </div>
      </section>
    </>
  );
};
