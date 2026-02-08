import '../../../scss/components/design-system/buttonDS.scss';

const ButtonDS = ({
  variant = 'primary',
  size = 'md',
  children = 'Clique aqui',
  outline = '',
  buttonWhite = '',
  className,
  iconLeft,
  iconRight,
  style,
  fullWidth = false,
  ...rest
}) => {
  return (
    <button
      className={`buttonDS buttonDS-${variant} buttonDS-size-${size} ${
        iconRight ? 'iconRight' : ''
      } ${iconLeft ? 'iconLeft' : ''}${outline && 'outline'}
      ${buttonWhite && 'white'} ${className} ${fullWidth ? 'w-100' : ''}`}
      {...rest}
      style={style}
    >
      {iconLeft && <i className={`bx ${iconLeft} buttonDS-iconLeft`} />}
      {children}
      {iconRight && <i className={`bx ${iconRight} buttonDS-iconRight`} />}
    </button>
  );
};

export default ButtonDS;
