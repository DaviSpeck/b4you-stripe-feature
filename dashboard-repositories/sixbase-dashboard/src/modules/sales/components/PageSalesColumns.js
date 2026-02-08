import memoizeOne from 'memoize-one';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import BadgeDS from '../../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import Method from '../../../jsx/components/Method';
import RenderNameDataTable from '../../../jsx/components/RenderNameDataTable';
import { capitalizeName } from '../../../utils/commons';
import formatDate from '../../../utils/formatters';
import { currency } from '../../functions';

export const columns = memoizeOne(
  (setModalSaleShow, setActiveSale, getStatusName) => [
    {
      name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
      cell: (item) => (
        <div className='d-flex align-items-center flex-wrap'>
          <div className='w-100'>
            <OverlayTrigger
              placement='top'
              overlay={<Tooltip id={`tooltip-top`}>{item.role.label}</Tooltip>}
            >
              <span className='pointer'>{item.product.name}</span>
            </OverlayTrigger>
            <small className='d-block'>{formatDate(item.created_at)}</small>
          </div>
          <div className='d-flex mb-1'>
            {item.type.type !== 'main' && (
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {item.type.type === 'upsell' ? 'Upsell' : 'Order Bump'}
                  </Tooltip>
                }
              >
                <BadgeDS
                  variant={`${
                    item.type.type === 'upsell' ? 'warning' : 'primary'
                  }`}
                  size='icon'
                  className={'pointer mr-1'}
                  style={{ minWidth: '39px' }}
                >
                  {item.type.type === 'upsell' ? 'UP' : 'OB'}
                </BadgeDS>
              </OverlayTrigger>
            )}
            {item?.coupon_sale?.coupon && (
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {`Cupom: ${item.coupon_sale.coupon}`}
                  </Tooltip>
                }
              >
                <BadgeDS
                  variant={`success`}
                  size='icon'
                  className={'pointer d-flex aling-items-center mr-1'}
                  style={{ minWidth: '39px', maxHeight: '30px' }}
                >
                  <i
                    className='bx bx-purchase-tag'
                    style={{ fontSize: 16, marginTop: 3, marginLeft: 2 }}
                  ></i>
                </BadgeDS>
              </OverlayTrigger>
            )}
          </div>
        </div>
      ),
      width: '180px',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Cliente' iconClassName='bx bx-user' />,
      cell: (item) => item.student.full_name,
      width: '180px',
      sortable: true,
    },
    {
      name: (
        <RenderNameDataTable name='Método' iconClassName='bx bx-credit-card' />
      ),
      cell: (item) => <Method type={item.payment_method} />,
      width: '120px',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Valor' iconClassName='bx bx-money' />,
      cell: (item) => currency(item.price),
      sortable: true,
    },
    {
      name: (
        <RenderNameDataTable
          name='Comissão'
          iconClassName='bx bx-dollar-circle'
        />
      ),
      cell: (item) => currency(item.commission_amount),
      sortable: true,
      minWidth: '140px',
    },
    {
      name: <RenderNameDataTable name='Afiliado' iconClassName='bx bx-user' />,
      cell: (item) =>
        item.has_affiliate
          ? capitalizeName(item.affiliate.user.full_name)
          : '-',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
      cell: (item) => (
        <BadgeDS
          variant={item.status.color}
          disc
          title={item.status.name}
          className={'pointer'}
        >
          {getStatusName(item.status.key)}
        </BadgeDS>
      ),
      width: '120px',
    },
    {
      name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
      cell: (item) => (
        <ButtonDS
          size={'icon'}
          variant='primary'
          onClick={() => {
            setModalSaleShow(true);
            setActiveSale(item);
          }}
        >
          <i className='bx bxs-file'></i>
        </ButtonDS>
      ),
      center: true,
      width: '110px',
    },
  ]
);
