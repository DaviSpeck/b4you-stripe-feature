import RenderNameDataTable from '../../../../../jsx/components/RenderNameDataTable';
import formatDate from '../../../../../utils/formatters';
import { AcceptAction } from './accept';
import { RefuseAction } from './refuse';
import { WhatsappAction } from './whatsapp';

export const tableColumns = ({ onRefresh, isLoading, onLoading }) => [
  {
    name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
    sortable: false,
    cell: (item) => <b>{item.product.name}</b>,
  },
  {
    name: <RenderNameDataTable name='Afiliado' iconClassName='bx bx-user' />,
    cell: (item) => (
      <div>
        <div>
          <b>{item?.user}</b>
        </div>
        <div>{item?.email}</div>
      </div>
    ),
    sortable: false,
  },
  {
    name: <RenderNameDataTable name='Comissão' iconClassName='bx bx-tag' />,
    cell: (item) =>
      item?.subscription_fee ? (
        <div className='d-flex flex-column text-center'>
          <div>
            <b>{item?.commission}%</b> (recorrência)
          </div>
          <div>
            <b>{item?.subscription_fee_commission}%</b> (adesão)
          </div>
          <div>
            <b>Regra de comissão:</b>
            <br />
            {item?.subscription_fee_only
              ? 'Apenas adesão'
              : 'Adesão + Recorrência'}
          </div>
        </div>
      ) : (
        <div
          className='text-center w-100'
          style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}
        >
          {item?.commission}%
        </div>
      ),
    sortable: false,
    center: true,
  },
  {
    name: (
      <RenderNameDataTable name='Requisitado em' iconClassName='bx bx-flag' />
    ),
    sortable: false,
    center: true,
    cell: (item) => formatDate(item?.date),
  },
  {
    name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
    center: true,
    sortable: false,
    cell: (item) => {
      return (
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'end',
            gap: '8px',
          }}
        >
          <AcceptAction
            inviteId={item.uuid}
            onRefresh={onRefresh}
            isLoading={isLoading}
            onLoading={onLoading}
          />
          <RefuseAction
            inviteId={item.uuid}
            onRefresh={onRefresh}
            isLoading={isLoading}
            onLoading={onLoading}
          />
          <WhatsappAction number={item.whatsapp} />
        </div>
      );
    },
  },
];
