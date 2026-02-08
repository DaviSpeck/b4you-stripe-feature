import { IoHandLeftSharp } from 'react-icons/io5';
import { MdOutlineKeyboardDoubleArrowDown } from 'react-icons/md';
import './style.scss';

export const CardMessageNotClose = ({
  alertNotClosePrimaryColor,
  alertNotClosePrimaryTextColor,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className='wrapper-not-close-message'>
      <div
        className='wrapper-information'
        style={{ backgroundColor: alertNotClosePrimaryColor }}
      >
        <div className='icon-handle-message-not-close'>
          <IoHandLeftSharp
            style={{ fontSize: '1.5rem' }}
            color={alertNotClosePrimaryColor}
          />
        </div>

        <div className='wrapper-text-message-not-close'>
          <h4 style={{ color: alertNotClosePrimaryTextColor }}>
            Não feche essa página!
          </h4>
          <span style={{ color: alertNotClosePrimaryTextColor }}>
            Não aperte o botão voltar para evitar cobrança duplicada
          </span>
        </div>
      </div>

      <MdOutlineKeyboardDoubleArrowDown
        className='arrow-down'
        size={30}
      />
    </div>
  );
};
