import React from 'react';
import '../../../scss/components/design-system/badgeDS.scss';

const BadgeDS = ({
  variant = 'success',
  disc = false,
  size = 'md',
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={`badgeDS badgeDS-${variant} badgeDS-size-${size} ${className}`}
      {...rest}
    >
      <span className={`${disc ? 'disc' : ''}`}>{children}</span>
    </div>
  );
};

export default BadgeDS;
