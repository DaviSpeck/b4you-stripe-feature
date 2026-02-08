import { IoHandLeftSharp } from 'react-icons/io5';
import { MdOutlineKeyboardDoubleArrowDown } from 'react-icons/md';
import './style.scss';

export const MessageNotClose = (props) => {
  const { data } = props;

  const { alertNotClosePrimaryColor, alertNotClosePrimaryTextColor } = data;

  return (
    <div className='container-message'>
      <div
        className='wrapper-message'
        style={{ backgroundColor: alertNotClosePrimaryColor }}
      >
        <div className='message-icon'>
          <IoHandLeftSharp size={25} color={alertNotClosePrimaryColor} />
        </div>
        <div className='warpper-message'>
          <h4 style={{ color: alertNotClosePrimaryTextColor }}>
            Não feche essa página!
          </h4>
          <span style={{ color: alertNotClosePrimaryTextColor }}>
            Não aperte o botão voltar para evitar cobrança duplicada
          </span>
        </div>
      </div>
      <MdOutlineKeyboardDoubleArrowDown
        className='icon-arrow-message'
        size={30}
      />
    </div>
  );
};
