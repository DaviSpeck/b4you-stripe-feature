import { useEffect, useState } from 'react';
import api from '../../providers/api';
import { useUser } from '../../providers/contextUser';
import Loader from '../../utils/loader';
import FirstSteps from './first-steps';
import Metrics from './metrics';
import WelcomeVideoModal from '../../jsx/components/WelcomeVideoModal';
import useWelcomeVideo from '../../hooks/useWelcomeVideo';
import { useVeryfyAccountAlert } from '../../hooks/useVerifyAccountAlert';
import { ModalVerifyAccountAlert } from '../../jsx/components/verifyAccountAlerModal';

const components = {
  'first-steps': FirstSteps,
  metrics: Metrics,
  creator: FirstSteps,
  dreams: Metrics,
};

const PageDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [nav, setNav] = useState('first-steps');

  const { user } = useUser();
  const { isModalOpen, onClose } = useVeryfyAccountAlert();
  const { showVideoModal, userType, handleVideoComplete, handleCloseModal } =
    useWelcomeVideo();

  useEffect(() => {
    api
      .get('/metrics')
      .then((r) => {
        if (r.data.user_has_sale) {
          setNav('metrics');
        } else {
          if (user.user_type === 3) {
            setNav('dreams');
            return;
          }
          if (user.type === 4) {
            setNav('dreams');
            return;
          }
          if (user.type === 'creator') {
            setNav('creator');
            return;
          }

          setNav('first-steps');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id='PageDashboard'>
        <Loader />
      </section>
    );
  }

  const Component = components[nav];

  return (
    <section id='PageDashboard'>
      <Component setNav={setNav} />
      <ModalVerifyAccountAlert isOpen={isModalOpen} onClose={onClose} />
      <WelcomeVideoModal
        show={showVideoModal}
        onClose={handleCloseModal}
        userType={userType}
        onVideoComplete={handleVideoComplete}
      />
    </section>
  );
};

export default PageDashboard;
