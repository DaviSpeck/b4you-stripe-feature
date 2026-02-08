import { FaCircleExclamation } from 'react-icons/fa6';
import './style.scss';

export const HeaderText = ({ backgroundColor, textColor, text, isVisible }) => {
  if (!isVisible) return null;

  return (
    <header
      className='container-header-text'
      style={{ backgroundColor }}
    >
      <div
        className='unique-chance'
        style={{ borderRight: `2px solid ${textColor}` }}
      >
        <FaCircleExclamation color={textColor} size={20} />
        <span
          className='unique-chance-text'
          style={{ color: textColor }}
        >
          CHANCE ÚNICA!
        </span>
      </div>

      <h1 style={{ color: textColor }}>
        {text}
      </h1>
    </header>
  );
};