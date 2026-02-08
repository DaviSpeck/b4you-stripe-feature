import React from 'react';
import { Modal } from 'react-bootstrap'; // Or use any modal library or custom styles

const CouponCreated = ({ show, onClose, couponCode }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'green', fontSize: '48px' }}>
          <i class='bx bxs-check-circle'></i>
        </div>
        <h3 style={{ fontWeight: 'bold' }}>Cupom criado com sucesso!</h3>

        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#f8f9fa',
          }}
        >
          <h4 style={{ fontWeight: 'bold', margin: '0', fontSize: '18px' }}>
            {couponCode}
          </h4>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
            gap: '10px',
          }}
        >
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              background: '#ddd',
              color: '#333',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Concluir
          </button>
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              background: 'green',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
            onClick={() => alert('Compartilhar código!')}
          >
            Compartilhar código <i class='bx bx-share-alt'></i>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CouponCreated;
