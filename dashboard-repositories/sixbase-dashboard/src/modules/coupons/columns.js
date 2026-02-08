import memoizeOne from 'memoize-one';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import formatDate from '../../utils/formatters';
import { currency } from '../functions';

const columns = memoizeOne((currentPage, perPage) => [
  {
    name: '',
    width: '80px',
    cell: (_, index) => `${(currentPage - 1) * perPage + index + 1}º`,
  },
  {
    name: 'Nome',
    cell: (item) => (
      <div className='d-flex align-items-center'>
        <OverlayTrigger
          placement='top'
          overlay={<Tooltip id={`tooltip-top`}>{item.coupon}</Tooltip>}
        >
          <p
            style={{
              maxWidth: '15ch',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0px',
            }}
          >
            {item.coupon}
          </p>
        </OverlayTrigger>
      </div>
    ),
    width: '200px',
  },
  {
    name: 'Faturamento',
    cell: (item) => currency(item.total_sales),
    width: '200px',
  },
  {
    name: 'Nº de usos',
    cell: (item) => item.total_sold,
    width: '120px',
  },
  {
    name: 'Desconto concedido',
    cell: (item) => currency(item.total_discount || 0),
    width: '200px',
  },
  {
    name: 'Último uso',
    cell: (item) => (item.used_at ? formatDate(item.used_at) : '-'),
    width: '200px',
  },
]);

export default columns;
