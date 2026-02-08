import { useEffect, useState } from 'react';
import { useUser } from '../providers/contextUser';

export const useVeryfyAccountAlert = () => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { user } = useUser();

  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? match[2] : null;
  };

  const setCookie = (name, value, hours) => {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  };

  useEffect(() => {
    // ⛔ ainda não temos usuário
    if (!user) return;

    const isAlert = getCookie('isAlertOpen');
    if (isAlert) return;

    const {
      verified_pagarme_3,
      verified_company_pagarme_3,
      verified_pagarme,
      verified_company_pagarme,
    } = user;

    const verificationStatusList = [
      verified_pagarme,
      verified_pagarme_3,
      verified_company_pagarme,
      verified_company_pagarme_3,
    ];

    if (verificationStatusList.includes(3)) return;

    setIsAlertOpen(true);
    setCookie('isAlertOpen', true, 4);
  }, [user]);

  return {
    isModalOpen: isAlertOpen,
    onClose: () => setIsAlertOpen(false),
  };
};