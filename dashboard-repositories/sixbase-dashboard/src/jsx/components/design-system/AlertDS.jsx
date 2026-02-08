import React from 'react';
import { Col, Row } from 'react-bootstrap';
import '../../../scss/components/design-system/alertDS.scss';

const AlertDS = ({
  variant = 'danger',
  size = 'md',
  warn = 'Aviso:',
  text = 'Há algo de errado',
  icon = 'bx-error',
  textButton,
  className = '',
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
        <span className='alertDS-heading'>{warn}</span>
      </div>
      <span
        className='alertDS-text'
        dangerouslySetInnerHTML={{ __html: text }}
      />
      {children}
    </div>
  );
};

export default AlertDS;
