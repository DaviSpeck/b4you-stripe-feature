import { useEffect, useRef } from 'react';
import Turnstile from 'react-turnstile';
import { toast } from 'react-toastify';

export function TurnstileChallenge({
  isOpen,
  siteKey,
  onSuccess,
  onExpire,
  theme = 'light',
}) {
  const hasResolved = useRef(false);
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.includes('sandbox') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

  useEffect(() => {
    if (isDev && isOpen && siteKey && !hasResolved.current) {
      hasResolved.current = true;
      onSuccess('mock-token-localhost');
    }
  }, [isDev, isOpen, siteKey, onSuccess]);

  useEffect(() => {
    if (!isOpen) {
      hasResolved.current = false;
    }
  }, [isOpen, siteKey]);

  if (!isOpen || !siteKey || isDev) {
    return null;
  }

  return (
    <Turnstile
      sitekey={siteKey}
      onSuccess={(token) => {
        if (hasResolved.current) {
          return;
        }

        hasResolved.current = true;
        onSuccess(token);
      }}
      options={{ theme }}
      refreshExpired='auto'
      onExpire={() => {
        hasResolved.current = false;
        if (onExpire) {
          onExpire();
        }
      }}
      onError={() => {
        toast.error(
          'Não foi possível validar o desafio de segurança. Recarregue a página ou tente novamente.'
        );
        hasResolved.current = false;
        if (onExpire) {
          onExpire();
        }
      }}
    />
  );
}
