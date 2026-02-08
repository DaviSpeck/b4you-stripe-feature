import BadgeDS from '../../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import RenderNameDataTable from '../../../jsx/components/RenderNameDataTable';
import { currency } from '../../functions';

export const columns = (setEdit, setShowModalDelete, setSelectedSupplier) => [
  {
    name: <RenderNameDataTable name='E-mail' iconClassName='bx bx-envelope' />,
    format: (item) => <div>{item.email}</div>,
    selector: 'email',
    width: '320px',
  },
  {
    name: <RenderNameDataTable name='Comissão' iconClassName='bx bx-money' />,
    format: (item) => <div>{currency(item.amount)}</div>,
    selector: 'amount',
    width: '180px',
  },
  {
    name: (
      <RenderNameDataTable name='Recebe frete?' iconClassName='bx bx-package' />
    ),
    format: (item) => (
      <div>
        {item.receives_shipping_amount ? (
          <i className='bx bx-check size-1' style={{ color: '#00a94f' }} />
        ) : (
          <i className='bx bx-x size-1' style={{ color: '#e9453a' }} />
        )}
      </div>
    ),
    selector: 'receives_shipping_amount',
    width: '180px',
    center: true,
  },
  {
    name: <RenderNameDataTable name='Status' iconClassName='bx bx-stats' />,
    cell: (item) => {
      return <BadgeDS variant={item.status.key}>{item.status.label}</BadgeDS>;
    },
    center: true,
    selector: 'status',
    width: '180px',
  },
  {
    name: <RenderNameDataTable name='Ações' iconClassName='bx bx-menu' />,
    format: (item) => (
      <div className='d-flex justify-content-start'>
        <div className='mr-2'>
          <ButtonDS
            size={'icon'}
            variant='primary'
            disabled={!item.status}
            onClick={() => {
              setEdit(true);
              setSelectedSupplier(item);
            }}
          >
            <i className='bx bxs-pencil'></i>
          </ButtonDS>
        </div>

        <div>
          <ButtonDS
            size={'icon'}
            variant='danger'
            onClick={() => {
              setShowModalDelete(true);
              setSelectedSupplier(item);
            }}
          >
            <i className='bx bx-x' style={{ fontSize: 20 }}></i>
          </ButtonDS>
        </div>
      </div>
    ),
    selector: 'actions',
    center: true,
  },
];
