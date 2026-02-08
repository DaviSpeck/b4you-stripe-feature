import ImageCoin from '../../../../../images/coin-indique.png';
import { LuCopy, LuCopyCheck } from 'react-icons/lu';
import './style.scss';
import { useState } from 'react';

export function DisclosureLink(props) {
  const { link } = props;

  return (
    <div className='link-affiliate-wrapper'>
      <span className='title'>Indique e Ganhe</span>
      <div className='wrapper-content'>
        <div className='content-title'>
          <img src={ImageCoin} />
          <div className='title'>
            <h3>Link de divulgação</h3>
            <p>
              Ganhe 10% de comissão sobre a taxa de intermediação da B4You, das
              pessoas que você indicar, por 12 meses.
            </p>
          </div>
        </div>
        <DisclosureLink.CopyInput link={link} />
      </div>
    </div>
  );
}

// eslint-disable-next-line react/display-name
DisclosureLink.CopyInput = function (props) {
  const [isCopy, setIsCopy] = useState(false);

  const { link } = props;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopy(true);
      setTimeout(() => setIsCopy(false), 1000);
    } catch (err) {
      return err;
    }
  };

  return (
    <div
      className='input-copy-url-wrapper'
      onClick={() => !isCopy && handleCopy()}
      {...(isCopy && {
        style: { borderColor: 'green' },
      })}
    >
      <span
        className='url-copy'
        {...(isCopy && {
          style: { color: 'green' },
        })}
      >
        {link}
      </span>
      <button
        className='btn-copy'
        {...(isCopy && {
          style: { color: 'green' },
        })}
      >
        {isCopy ? <LuCopyCheck size={20} /> : <LuCopy size={20} />}
        Copiar
      </button>
    </div>
  );
};
