import { FaCircleCheck } from 'react-icons/fa6';
import './style.scss';

export const HeaderStep = ({ stepColorBackground, stepColor, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className='header-steps-container'
      style={{ backgroundColor: stepColorBackground }}
    >
      <div className='wrapper-steps-items'>
        <HeaderStep.Item label='Pedido' color={stepColor} status='checked' />
        <HeaderStep.Item
          label='Compra efetuada'
          color={stepColor}
          status='checked'
        />
        <HeaderStep.Item
          label='Você está aqui'
          color={stepColor}
          status='current'
        />
        <HeaderStep.Item
          label='Pedido Finalizado'
          color={stepColor}
          status='pending'
          isLast
        />
      </div>
    </div>
  );
};

// eslint-disable-next-line react/display-name
HeaderStep.Item = ({ label, color, status, isLast = false }) => {
  return (
    <div
      className='wrapper-item-step'
      {...(isLast && {
        style: { width: '20px' },
      })}
    >
      <div className='wrapper-item'>
        {status === 'current' && (
          <div className='current-step'>
            <div style={{ backgroundColor: color }} />
          </div>
        )}

        {status === 'pending' && <div className='uncheck-step' />}

        {status === 'checked' && (
          <FaCircleCheck className='block' color={color} />
        )}

        {!isLast && (
          <div
            className='header-step-line'
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      <span
        className='label-header-item-step'
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
};