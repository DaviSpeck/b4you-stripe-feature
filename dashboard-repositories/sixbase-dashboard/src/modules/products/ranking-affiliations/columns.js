import { Avatar } from '@material-ui/core';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { currency } from '../../functions';
import { capitalizeName } from '../../../utils/commons';

export const columns = ({
  currentPage,
  perPage,
  openModal,
  setOpenModal,
  setSelectedUser,
}) => [
  {
    name: '',
    width: '80px',
    cell: (_, index) => `${(currentPage - 1) * perPage + index + 1}º`,
  },
  {
    name: 'Nome',
    width: '230px',
    cell: (item) => (
      <div className='d-flex align-items-center'>
        <Avatar
          src={item?.profile_picture}
          style={{
            width: '30px',
            height: '30px',
            marginRight: '10px',
          }}
        />

        <OverlayTrigger
          placement='top'
          overlay={<Tooltip id={`tooltip-top`}>{item.full_name}</Tooltip>}
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
            {capitalizeName(item.full_name)}
          </p>
        </OverlayTrigger>
      </div>
    ),
  },
  {
    name: 'E-mail',
    width: '300px',
    cell: (item) => item.email,
  },
  {
    name: 'Nº de Vendas',
    width: '180px',
    cell: (item) => item.total_items_sold,
  },
  {
    name:
      new Date('2025-07-30') > new Date()
        ? `Nº de Cliques (Inicio da contagem 30/07/2025)`
        : 'Nº de Cliques',
    width: new Date('2025-07-30') > new Date() ? '380px' : '180px',
    cell: (item) => item.click_amount ?? 0,
  },
  {
    name: 'Total em Comissões',
    width: '220px',
    cell: (item) => currency(item.total_commission),
  },
  {
    name: 'Total em Faturamento',
    width: '220px',
    cell: (item) => currency(item.total_sales_value),
  },
  {
    name: 'Ações',
    width: '80px',
    cell: (item) => (
      <ButtonDS
        size='icon'
        variant='primary'
        onClick={() => {
          setOpenModal(!openModal);
          setSelectedUser(item);
        }}
      >
        <i className='bx bxs-file'></i>
      </ButtonDS>
    ),
  },
];
