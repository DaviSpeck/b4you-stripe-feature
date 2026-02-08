import { useEffect, useRef } from 'react';

/**
 * Hook customizado para integração com Konduto
 * @param {string} publicKey - Chave pública do Konduto
 * @param {boolean} autoLoad - Se deve carregar automaticamente (padrão: false para SPAs)
 * @param {string} instanceName - Nome da instância para logs (opcional)
 */
export const useKonduto = (
  publicKey,
  autoLoad = false,
  instanceName = 'KONDUTO'
) => {
  const isInitialized = useRef(false);
  const kondutoLoaded = useRef(false);
  const loadingPromiseRef = useRef(null);

  // Lazy loader: carrega o SDK somente quando necessário
  const ensureSdkLoaded = () => {
    if (kondutoLoaded.current) return Promise.resolve();
    if (loadingPromiseRef.current) return loadingPromiseRef.current;

    loadingPromiseRef.current = new Promise((resolve) => {
      // Inicializar o array global do Konduto
      window.__kdt = window.__kdt || [];
      // Configurar a chave pública e controlar o post_on_load
      window.__kdt.push({ public_key: publicKey });
      window.__kdt.push({ post_on_load: false });

      // Carregar o script do Konduto
      const script = document.createElement('script');
      script.id = `kdtjs-${instanceName.toLowerCase()}`;
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://i.k-analytix.com/k.js';

      script.onload = () => {
        kondutoLoaded.current = true;
        isInitialized.current = true;
        resolve();
      };

      script.onerror = () => {
        resolve();
      };

      const body = document.getElementsByTagName('body')[0];
      body.parentNode.insertBefore(script, body);
    });

    return loadingPromiseRef.current;
  };

  // Cleanup function on unmount
  useEffect(() => {
    if (autoLoad) {
      ensureSdkLoaded();
    }
  }, [autoLoad]);

  useEffect(() => {
    return () => {
      const existingScript = document.getElementById(
        `kdtjs-${instanceName.toLowerCase()}`
      );
      if (existingScript) {
        existingScript.remove();
      }
      loadingPromiseRef.current = null;
      kondutoLoaded.current = false;
      isInitialized.current = false;
    };
  }, [instanceName]);

  /**
   * Envia um evento de navegação para o Konduto
   * @param {string} eventType - Tipo do evento (geralmente 'page')
   * @param {string} pageCategory - Categoria da página
   */
  const sendEvent = (eventType = 'page', pageCategory = 'home') => {
    return new Promise((resolve) => {
      const trySend = () => {
        if (
          typeof window.Konduto !== 'undefined' &&
          typeof window.Konduto.sendEvent !== 'undefined'
        ) {
          // Empurra a chave no exato momento do envio para evitar condições de corrida
          window.__kdt = window.__kdt || [];
          window.__kdt.push({ public_key: publicKey });
          window.Konduto.sendEvent(eventType, pageCategory);
          resolve();
          return true;
        }
        return false;
      };

      if (trySend()) return;

      // Carrega o SDK sob demanda e tenta novamente
      ensureSdkLoaded().then(() => {
        trySend();
      });

      const period = 200;
      const limit = 20 * 1000; // 20 segundos
      let elapsed = 0;

      const intervalID = setInterval(() => {
        elapsed += period;
        if (trySend()) {
          clearInterval(intervalID);
          return;
        }
        if (elapsed >= limit) {
          clearInterval(intervalID);
          resolve();
        }
      }, period);
    });
  };

  /**
   * Identifica o visitante com um ID de cliente
   * @param {string} customerId - ID do cliente
   */
  const setCustomerId = async (customerId) => {
    if (!customerId) {
      return;
    }

    await ensureSdkLoaded();
    window.__kdt = window.__kdt || [];
    // Força o contexto para a chave pública desta instância antes de enviar o ID
    window.__kdt.push({ public_key: publicKey });
    window.__kdt.push({ customer_id: customerId });
  };

  const getCustomerId = () => {
    if (!window.__kdt) {
      return null;
    }

    // procura o último objeto que tenha customer_id
    const customer = [...window.__kdt]
      .reverse()
      .find((item) => item.customer_id);

    const customerId = customer ? customer.customer_id : null;

    return customerId;
  };

  /**
   * Define um ID de sessão personalizado
   * @param {string} sessionId - ID da sessão
   */
  const setSessionId = async (sessionId) => {
    if (!sessionId) {
      return;
    }

    await ensureSdkLoaded();
    window.__kdt = window.__kdt || [];
    // Força o contexto para a chave pública desta instância antes de enviar a sessão
    window.__kdt.push({ public_key: publicKey });
    window.__kdt.push({ session_id: sessionId });
  };

  return {
    sendEvent,
    setCustomerId,
    setSessionId,
    isLoaded: kondutoLoaded.current,
    getCustomerId,
  };
};
