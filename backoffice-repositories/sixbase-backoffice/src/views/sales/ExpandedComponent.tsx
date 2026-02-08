import React, { FC } from 'react';
import { FormatBRL } from '../../utility/Utils';

import Avatar from '../../@core/components/avatar';
import type { AvatarProps } from '../../@core/components/avatar';

import * as Icon from 'react-feather';

import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Col,
  Row,
} from 'reactstrap';
import { ExpandedComponentProps, Transaction } from '../../interfaces/sales.interface';

const resolvePaymentMethod = (payment_method: string): string => {
  if (payment_method === 'billet') return 'Boleto';
  if (payment_method === 'pix') return 'PIX';

  return '';
};

const CardTransactions: FC<ExpandedComponentProps> = ({ data }) => {
  const transactionsArr: Transaction[] = data.products.map((p) => {
    return {
      id: p.id,
      items: [
        {
          title: 'Produto',
          color: 'light-primary',
          subtitle: p.name,
          amount: FormatBRL(p.gross_amount),
          Icon: Icon['Box'],
          neutral: true,
        },
        {
          title: 'Valor Líquido',
          color: 'light-warning',
          subtitle: 'Valor recebido pelo estudante',
          amount: FormatBRL(p.net_amount_student),
          Icon: Icon['DollarSign'],
          neutral: true,
        },
        {
          title: 'Service Fee',
          color: 'light-success',
          subtitle: 'Taxa de serviço',
          amount: `+ ${FormatBRL(p.fee_total_amount_service)}`,
          Icon: Icon['DollarSign'],
        },
        {
          title: 'PSP Fees',
          color: 'light-danger',
          subtitle: 'Taxa de processamento',
          amount: `- ${FormatBRL(p.fee_total_amount_psp)}`,
          Icon: Icon['DollarSign'],
          down: true,
        },
        {
          title: 'Taxes',
          color: 'light-danger',
          subtitle: 'Impostos',
          amount: `- ${FormatBRL(p.tax_variable_amount)}`,
          Icon: Icon['DollarSign'],
          down: true,
        },
        {
          title: 'Net Profit',
          color: 'light-info',
          subtitle: 'Lucro liquido',
          amount: `+ ${FormatBRL(p.net_profit)}`,
          Icon: Icon['TrendingUp'],
        },
      ],
    };
  });

  const renderTransactions = (): React.ReactNode => {
    return transactionsArr.map((item) => {
      if (item) {
        return (
          <Col sm="6" key={item.id}>
            <Card className="card-transaction">
              <CardHeader>
                <CardTitle tag="h4">Sale Item # {item.id}</CardTitle>
                {/* <Icon.MoreVertical size={18} className="cursor-pointer" /> */}
              </CardHeader>
              <CardBody>
                {item.items.map((it) => {
                  return (
                    <div key={it.title} className="transaction-item">
                      <div className="d-flex">
                        <Avatar
                          className="rounded"
                          color={it.color as AvatarProps['color']}
                          icon={<it.Icon size={18} />}
                        />
                        <div>
                          <h6 className="transaction-title">{it.title}</h6>
                          <small>{it.subtitle}</small>
                        </div>
                      </div>
                      <div
                        className={`fw-bolder ${
                          it.down
                            ? 'text-danger'
                            : !it.neutral
                            ? 'text-success'
                            : ''
                        }`}
                      >
                        {it.amount}
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </Col>
        );
      }
      return <div key={item.id}></div>;
    });
  };

  return <Row noGutters>{renderTransactions()}</Row>;
};

export default CardTransactions;
