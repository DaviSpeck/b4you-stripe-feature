import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import { notify } from '../../functions';
import LoadingIconB4Y from '../../../jsx/components/LoadingIconB4Y';
import { ReferralTerm } from './referral-term';
import { Dashboard } from './dashboard';

export function PageReferral() {
  const [referralData, setReferralData] = useState(null);

  const [isGettingReferralData, setIsGettingReferralData] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await api.post('/referral');
      notify({
        message: 'Participação do programa aceita com sucesso',
        type: 'success',
      });
    } catch (error) {
      notify({
        message: 'Falha ao participar do programa',
        type: 'error',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleGetReferral = async () => {
    try {
      const res = await api.get('/referral');
      setReferralData(res.data);
    } catch (error) {
      return error;
    } finally {
      setIsGettingReferralData(false);
    }
  };

  useEffect(() => {
    handleGetReferral();
  }, []);

  if (isGettingReferralData) {
    return (
      <div className='loading'>
        <LoadingIconB4Y />
      </div>
    );
  }

  if (referralData && !referralData.has_referral) {
    return (
      <ReferralTerm
        isAccepting={isAccepting}
        isLoading={isGettingReferralData}
        onAccept={handleAccept}
      />
    );
  }

  return <Dashboard balance={referralData} />;
}
