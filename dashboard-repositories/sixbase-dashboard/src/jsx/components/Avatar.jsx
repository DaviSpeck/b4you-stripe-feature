import React from 'react';
import placeholder from '../../images/avatar-placeholder.png';

const Avatar = ({ src, className, width = null }) => {
  return (
    <img
      className={className}
      src={src ? src : placeholder}
      alt=''
      style={width ? { width: width, height: width } : null}
    />
  );
};

export default Avatar;
