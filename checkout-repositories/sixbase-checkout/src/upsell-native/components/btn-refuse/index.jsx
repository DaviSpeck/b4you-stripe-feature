import { useNavigate, useParams } from 'react-router-dom';
import './style.scss';

export const BtnUpsellRefuse = ({
  btnTextRefuse,
  btnTextColorRefuse,
  btnTextRefuseSize,
}) => {
  const { uuidSaleItem } = useParams();
  const navigate = useNavigate();

  function handleRefuse() {
    if (!uuidSaleItem) return;

    navigate(`/compra-realizada/${uuidSaleItem}`, {
      replace: true,
    });
  }

  return (
    <button
      className='btn-refuse'
      style={{
        color: btnTextColorRefuse,
        fontSize: `${btnTextRefuseSize}px`,
      }}
      onClick={handleRefuse}
    >
      {btnTextRefuse}
    </button>
  );
};