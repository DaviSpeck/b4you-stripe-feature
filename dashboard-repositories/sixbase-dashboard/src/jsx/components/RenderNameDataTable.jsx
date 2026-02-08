import React from 'react';

const RenderNameDataTable = ({ name, iconClassName, color = '#333' }) => {
  return (
    <div className='d-flex align-items-center'>
      <i
        className={iconClassName}
        style={{ fontSize: '24px', marginRight: '8px' }}
      />

      <span
        style={{
          color,
        }}
      >
        {name}
      </span>
    </div>
  );
};

export default RenderNameDataTable;
