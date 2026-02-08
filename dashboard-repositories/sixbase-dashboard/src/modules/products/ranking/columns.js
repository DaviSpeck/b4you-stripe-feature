import memoizeOne from 'memoize-one';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ProductNoImg from '../../../images/produto-sem-foto.jpg';
import { currency } from '../../functions';

const columns = memoizeOne((currentPage, perPage) => [
  {
    name: '',
    width: '60px',
    cell: (_, index) => `${(currentPage - 1) * perPage + index + 1}º`,
  },
  {
    name: '',
    width: '80px',
    cell: (item) => (
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
        }}
      >
        <img
          src={item.cover || ProductNoImg}
          alt={item.product}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
  },
  {
    name: 'Nome',
    width: '300px',
    cell: (item) => (
      <div className='d-flex align-items-center'>
        <OverlayTrigger
          placement='top'
          overlay={<Tooltip id={`tooltip-top`}>{item.product}</Tooltip>}
        >
          <p
            style={{
              maxWidth: '25ch',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0px',
            }}
          >
            {item.product}
          </p>
        </OverlayTrigger>
      </div>
    ),
  },
  {
    name: 'Categoria',
    width: '280px',
    cell: (item) => (
      <div className='d-flex align-items-center'>
        <OverlayTrigger
          placement='top'
          overlay={<Tooltip id={`tooltip-top`}>{item.category}</Tooltip>}
        >
          <p
            style={{
              maxWidth: '30ch',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0px',
            }}
          >
            {item.category}
          </p>
        </OverlayTrigger>
      </div>
    ),
  },
  {
    name: 'Faturamento',
    width: '200px',
    cell: (item) => currency(item.total_sales),
  },
  {
    name: 'Volume de vendas',
    width: '170px',
    cell: (item) => item.total_sold,
  },
]);

export default columns;
