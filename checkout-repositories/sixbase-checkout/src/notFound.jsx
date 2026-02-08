import { GoArrowLeft } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        style={{
          width: '180px',
          height: '180px',
        }}
        src='./error.gif'
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h3
          style={{
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: '500',
            color: '#424242',
          }}
        >
          Ops! Oferta não encontrada
        </h3>
        <p
          style={{
            textAlign: 'center',
            fontSize: '1.25rem',
            color: '#424242',
          }}
        >
          A oferta que você está procurando não está <br /> disponível no
          momento.
        </p>
      </div>
      <div className='flex gap-3'>
        <button
          style={{
            cursor: 'pointer',
            border: '2px solid #5BEBD4',
            backgroundColor: 'transparent',
            padding: '4px',
            width: '100px',
            borderRadius: '8px',
          }}
          onClick={() => navigate(-1)}
        >
          <GoArrowLeft />
          Voltar
        </button>
      </div>
    </main>
  );
}
