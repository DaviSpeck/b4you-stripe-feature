import React from 'react';

const Currency = ({ amount }) => {
  return (
    <span>
      {Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(amount)}
    </span>
  );
};

export default Currency;
