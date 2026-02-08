import { useEffect } from 'react';
import { useDualKondutoContext } from './DualKondutoProvider';

/**
 * Componente para rastrear automaticamente mudanças de página
 * @param {Object} props
 * @param {string} props.pageCategory - Categoria da página atual
 * @param {string} props.eventType - Tipo do evento (padrão: 'page')
 */
export const PageTracker = ({ pageCategory = 'home', eventType = 'page' }) => {
  const { sendEvent } = useDualKondutoContext();

  useEffect(() => {
    sendEvent(eventType, pageCategory);
  }, [pageCategory, eventType, sendEvent]);

  return null;
};
