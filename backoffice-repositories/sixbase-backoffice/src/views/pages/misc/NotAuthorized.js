import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { Power } from 'react-feather';
import { useSkin } from '../../../utility/hooks/useSkin';
import { handleLogout } from '../../../redux/authentication';
import '@styles/base/pages/page-misc.scss';
import notAuthorizedDark from '@src/assets/images/pages/not-authorized-dark.svg';
import notAuthorizedLight from '@src/assets/images/pages/not-authorized.svg';

const NotAuthorized = () => {
  const { skin } = useSkin();
  const dispatch = useDispatch();

  const source = skin === 'dark' ? notAuthorizedDark : notAuthorizedLight;

  const handleLogoutClick = () => {
    dispatch(handleLogout());
  };

  return (
    <main className="misc-wrapper">
      <Link className="brand-logo" to="/">
        <svg viewBox="0 0 139 95" version="1.1" height="28">
          <defs>
            <linearGradient
              x1="100%"
              y1="10.5%"
              x2="50%"
              y2="89.5%"
              id="linearGradient-1"
            >
              <stop stopColor="#000000" offset="0%"></stop>
              <stop stopColor="#FFFFFF" offset="100%"></stop>
            </linearGradient>
            <linearGradient
              x1="64%"
              y1="46%"
              x2="37%"
              y2="100%"
              id="linearGradient-2"
            >
              <stop stopColor="#EEEEEE" stopOpacity="0" offset="0%"></stop>
              <stop stopColor="#FFFFFF" offset="100%"></stop>
            </linearGradient>
          </defs>
          <g fill="none" fillRule="evenodd">
            <path
              d="M0,0 L39.18,0 L69.34,32.25 L101.42,0 L138.78,0 L138.78,29.80 C137.95,37.35 135.78,42.55 132.26,45.41 C128.73,48.28 112.33,64.52 83.06,94.14 L56.27,94.14 L6.71,44.41 C2.46,39.98 0.34,35.10 0.34,29.80 C0.34,24.49 0.23,14.56 0,0 Z"
              className="text-primary"
              style={{ fill: 'currentColor' }}
            ></path>
            <path
              d="M69.34,32.25 L101.42,0 L138.78,0 L138.78,29.80 C137.95,37.35 135.78,42.55 132.26,45.41 C128.73,48.28 112.33,64.52 83.06,94.14 L56.27,94.14 L32.84,70.50 L69.34,32.25 Z"
              fill="url(#linearGradient-1)"
              opacity="0.2"
            ></path>
          </g>
        </svg>
        <h2 className="brand-text text-primary ms-1">Backoffice</h2>
      </Link>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="misc-inner p-2 p-sm-3">
        <div className="w-100 text-center">
          <h2 className="mb-1">Acesso não autorizado 🔒</h2>
          <p className="mb-2 text-muted">
            Você não tem permissão para acessar esta página.
            <br />
            Verifique suas credenciais ou entre em contato com o administrador
            do sistema.
          </p>

          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center mb-1">
            <Button tag={Link} to="/" color="primary" className="btn-sm-block d-flex gap-2 justify-content-between">
              Voltar ao início
            </Button>
            <Button
              tag={Link}
              to="/login"
              color="secondary"
              className="btn-sm-block d-flex gap-2 justify-content-between"
              onClick={handleLogoutClick}
            >
              <Power size={16} className="me-1" />
              Sair
            </Button>
          </div>

          <div className="mt-2">
            <img
              className="img-fluid"
              src={source}
              alt="Página de acesso não autorizado"
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotAuthorized;
