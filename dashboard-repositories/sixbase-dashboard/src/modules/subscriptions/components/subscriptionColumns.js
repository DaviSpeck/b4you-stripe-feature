import memoizeOne from 'memoize-one';
import moment from 'moment';
import BadgeDS from '../../../jsx/components/design-system/BadgeDS';

export const getSubscriptionColumns = memoizeOne(
  (renderPlan, renderPrice, renderViewDetails) => [
    {
      name: 'Produto',
      cell: (item) => item.product.name,
      sortable: false,
    },
    {
      name: 'Cliente',
      cell: (item) => item.student.full_name,
      sortable: false,
    },
    {
      name: 'Plano',
      cell: (item) => renderPlan(item.plan),
      sortable: false,
    },
    {
      name: 'Preço',
      cell: (item) => renderPrice(item.plan.price),
      sortable: false,
      width: '110px',
    },
    {
      name: 'Próx Cobrança',
      cell: (item) => moment(item.next_charge).format('DD/MM/YYYY'),
      sortable: false,
      width: '160px',
      center: true,
    },
    {
      name: 'Método Pagamento',
      cell: (item) => item.payment_method_label || 'Cartão de crédito',
      sortable: false,
      width: '180px',
    },
    {
      name: 'Status',
      cell: (item) => (
        <BadgeDS variant={`${item.status.color}`} disc>
          {item.status.name}
        </BadgeDS>
      ),
      sortable: false,
      width: '180px',
    },
    {
      name: 'Ações',
      cell: (item) => renderViewDetails(item),
      sortable: false,
      center: true,
      width: '100px',
    },
  ]
);
