import React, { createContext, useContext } from 'react';
import { useKonduto } from './useKonduto';

const KondutoContext = createContext();

/**
 * Provider do Konduto que disponibiliza as funções para toda a aplicação
 * @param {Object} props
 * @param {string} props.publicKey - Chave pública do Konduto
 * @param {boolean} props.autoLoad - Se deve carregar automaticamente
 * @param {React.ReactNode} props.children - Componentes filhos
 */
export const KondutoProvider = ({
  publicKey = 'PCFCF226F32', // Chave de exemplo da documentação
  autoLoad = false,
  children,
}) => {
  const konduto = useKonduto(publicKey, autoLoad);

  return (
    <KondutoContext.Provider value={konduto}>
      {children}
    </KondutoContext.Provider>
  );
};

/**
 * Hook para usar o contexto do Konduto
 * @returns {Object} Funções e estado do Konduto
 */
export const useKondutoContext = () => {
  const context = useContext(KondutoContext);

  if (!context) {
    throw new Error(
      'useKondutoContext deve ser usado dentro de um KondutoProvider'
    );
  }

  return context;
};

export default KondutoProvider;
