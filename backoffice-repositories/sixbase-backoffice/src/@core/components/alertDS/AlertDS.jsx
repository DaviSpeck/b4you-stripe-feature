import React from 'react';
import './alertDS.scss';

const AlertDS = ({
  variant = 'danger',
  size = 'md',
  warn = 'Aviso:',
  text = 'Há algo de errado',
  icon = 'bx-error',
  textButton,
  className,
  style,
  buttonWhite = true,
  children,
  ...rest
}) => {
  return (
    <div
      className={`alertDS alertDS-${variant} alertDS-size-${size} ${className}`}
      {...rest}
      style={style}
    >
      <div
        className={icon && 'alertDS-wrap-icon'}
        style={{ display: !icon && 'none' }}
      >
        <i className={`bx ${icon}`}></i>
        <span className="alertDS-heading">{warn}</span>
      </div>
      <span className="alertDS-text">{text}</span>
      {children}
    </div>
  );
};

export default AlertDS;
