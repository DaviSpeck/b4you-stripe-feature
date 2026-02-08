import { createContext, useContext } from 'react';
import { useKonduto } from './useKonduto';

const KondutoContext = createContext();

/**
 * Provider do Konduto que suporta duas instâncias com chaves diferentes
 * @param {Object} props
 * @param {string} props.primaryKey - Chave pública primária do Konduto
 * @param {string} props.secondaryKey - Chave pública secundária do Konduto
 * @param {boolean} props.autoLoad - Se deve carregar automaticamente
 * @param {React.ReactNode} props.children - Componentes filhos
 */

export const DualKondutoProvider = ({
  primaryKey = 'PCFCF226F32',
  secondaryKey = 'P5B36A902EC',
  autoLoad = false,
  children,
}) => {
  const primaryKonduto = useKonduto(primaryKey, autoLoad, 'PRIMARY', false);
  // Isola a instância secundária em um iframe para evitar conflito de contexto
  const secondaryKonduto = useKonduto(secondaryKey, autoLoad, 'SECONDARY', true);

  const contextValue = {
    // Instância primária
    primary: primaryKonduto,
    // Instância secundária
    secondary: secondaryKonduto,
    // Métodos combinados para compatibilidade
    sendEvent: async (eventType, pageCategory) => {
      await primaryKonduto.sendEvent(eventType, pageCategory);
      await secondaryKonduto.sendEvent(eventType, pageCategory);
    },
    // Métodos específicos para a instância primária
    sendEventPrimary: async (eventType, pageCategory) => {
      await primaryKonduto.sendEvent(eventType, pageCategory);
    },
    setCustomerIdPrimary: async (customerId) => {
      await primaryKonduto.setCustomerId(customerId);
    },
    setSessionIdPrimary: async (sessionId) => {
      await primaryKonduto.setSessionId(sessionId);
    },
    // Métodos específicos para a instância secundária
    sendEventSecondary: async (eventType, pageCategory) => {
      await secondaryKonduto.sendEvent(eventType, pageCategory);
    },
    setCustomerIdSecondary: async (customerId) => {
      await secondaryKonduto.setCustomerId(customerId);
    },
    setSessionIdSecondary: async (sessionId) => {
      await secondaryKonduto.setSessionId(sessionId);
    },
    setCustomerId: async (customerId) => {
      await primaryKonduto.setCustomerId(customerId);
      await secondaryKonduto.setCustomerId(customerId);
    },
    setSessionId: async (sessionId) => {
      await primaryKonduto.setSessionId(sessionId);
      await secondaryKonduto.setSessionId(sessionId);
    },
    getCustomerId: () => {
      const customerId =
        primaryKonduto.getCustomerId() || secondaryKonduto.getCustomerId();

      return customerId;
    },
    isLoaded: primaryKonduto.isLoaded && secondaryKonduto.isLoaded,
  };

  return (
    <KondutoContext.Provider value={contextValue}>
      {children}
    </KondutoContext.Provider>
  );
};

/**
 * Hook para usar o contexto do Konduto dual
 * @returns {Object} Funções e estado do Konduto (ambas as instâncias)
 */
export const useDualKondutoContext = () => {
  const context = useContext(KondutoContext);

  if (!context) {
    throw new Error(
      'useDualKondutoContext deve ser usado dentro de um DualKondutoProvider'
    );
  }

  return context;
};

/**
 * Hook para usar apenas a instância primária do Konduto
 * @returns {Object} Funções e estado da instância primária
 */
export const usePrimaryKonduto = () => {
  const context = useContext(KondutoContext);

  if (!context) {
    throw new Error(
      'usePrimaryKonduto deve ser usado dentro de um DualKondutoProvider'
    );
  }

  return context.primary;
};

/**
 * Hook para usar apenas a instância secundária do Konduto
 * @returns {Object} Funções e estado da instância secundária
 */
export const useSecondaryKonduto = () => {
  const context = useContext(KondutoContext);

  if (!context) {
    throw new Error(
      'useSecondaryKonduto deve ser usado dentro de um DualKondutoProvider'
    );
  }

  return context.secondary;
};

export default DualKondutoProvider;
