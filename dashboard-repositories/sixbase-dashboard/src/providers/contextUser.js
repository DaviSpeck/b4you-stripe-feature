import { createContext, useContext, useState } from 'react';

export const UserContext = createContext();
export const useUser = () => useContext(UserContext);

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,

    verified_pagarme: user.verified_pagarme ?? null,
    verified_company_pagarme: user.verified_company_pagarme ?? null,
    verified_pagarme_3: user.verified_pagarme_3 ?? null,
    verified_company_pagarme_3: user.verified_company_pagarme_3 ?? null,

    bank_account: user.bank_account ?? null,
    address: user.address ?? null,

    collaborations: Array.isArray(user.collaborations)
      ? user.collaborations
      : [],

    features:
      user.features && typeof user.features === 'object'
        ? user.features
        : null
  };
};

const UserProvider = (props) => {
  const [user, _setUser] = useState(null);

  const setUser = (data) => {
    if (!data) {
      _setUser(null);
      return;
    }

    _setUser((prev) =>
      normalizeUser({
        ...prev,
        ...data,
      })
    );
  };

  return (
    <UserContext.Provider value={{ user, setUser }} {...props} />
  );
};

export default UserProvider;