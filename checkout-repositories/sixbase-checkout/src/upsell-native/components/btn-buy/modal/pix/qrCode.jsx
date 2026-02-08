import { useEffect, useRef, useState } from 'react';
import { LuCopy, LuCopyCheck } from 'react-icons/lu';
import './style.scss';

export function QrCodeComponent(props) {
  const { qrCodeImage, qrCode } = props;

  if (!qrCode || !qrCodeImage) return null;

  return (
    <div className='wrapper-qr-code'>
      <QrCodeComponent.Copy qrCodeImage={qrCodeImage} qrCode={qrCode} />
    </div>
  );
}

// eslint-disable-next-line react/display-name
QrCodeComponent.Copy = function ({ qrCodeImage, qrCode }) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(qrCode);
      setIsCopied(true);

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      setIsCopied(true);

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className='wrapper'>
      <h2>Clique e copie o código Pix abaixo</h2>

      <img src={qrCodeImage} alt='QR Code Pix' />

      <div
        className='wrapper-code-copy-icon'
        role='button'
        aria-label='Copiar código Pix'
        tabIndex={0}
        onClick={handleCopy}
        onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
        {...(isCopied && {
          style: { borderColor: 'green' },
        })}
      >
        <div className='icon-code-copy'>
          {!isCopied ? (
            <LuCopy size={20} />
          ) : (
            <LuCopyCheck size={20} style={{ color: 'green' }} />
          )}
        </div>

        <span
          className='code-copy'
          {...(isCopied && {
            style: { color: 'green' },
          })}
        >
          {qrCode}
        </span>
      </div>
    </div>
  );
};