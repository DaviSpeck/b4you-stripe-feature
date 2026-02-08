import { useEffect, useState, FC } from 'react';
import { FormatBRL } from '../../utility/Utils';
import '../../assets/scss/pages/costs.scss';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  TabPane,
  Table,
} from 'reactstrap';
import { Activity, BarChart, Calendar, DollarSign, Info } from 'react-feather';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import StatisticsCards from './components/StatisticsCard';
import { api } from '../../services/api';
import TooltipItem from './components/ToolTipItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SalesData, FilterState } from '../../interfaces/reports.interface';

const Sales: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sales, setSales] = useState<SalesData | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });

  const fetchSales = (): void => {
    setLoading(true);
    api
      .get(
        `/reports?start_date=${moment(filter.calendar[0]).format(
          'YYYY-MM-DD',
        )}&end_date=${moment(filter.calendar[1]).format('YYYY-MM-DD')}`,
      )
      .then((r) => setSales(r.data))
      .catch((err) => console.log(err));
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, [filter]);

  return (
    <>
      <div className="pb-2 d-flex justify-content-start">
        <div className="d-flex align-items-center">
          <Calendar size={15} />
          <Flatpickr
            className="form-control flat-picker bg-transparent border-0 shadow-none"
            style={{ width: '205px' }}
            value={filter.calendar}
            onChange={(date: Date[]) =>
              setFilter((prev) => ({ ...prev, calendar: date }))
            }
            options={{
              mode: 'range',
              // eslint-disable-next-line no-mixed-operators
              dateFormat: 'd/m/Y',
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Saldo</h2>
          </CardTitle>
        </CardHeader>
        <CardBody className="d-flex p-0 flex-wrap">
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'light'}
              icon={<DollarSign />}
              stat={
                !sales ? <LoadingSpinner /> : FormatBRL(sales?.balance_total)
              }
              statTitle={'Total a repassar'}
            />
          </div>
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'light'}
              icon={<DollarSign />}
              stat={
                !sales ? <LoadingSpinner /> : FormatBRL(sales?.pending_total)
              }
              statTitle={'Total a liberar'}
            />
          </div>
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'light'}
              icon={<DollarSign />}
              stat={
                !sales ? (
                  <LoadingSpinner />
                ) : (
                  FormatBRL(sales?.balance_total + sales?.pending_total)
                )
              }
              statTitle={'Total a repassar + Total a liberar'}
            />
          </div>
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'danger'}
              icon={<DollarSign />}
              stat={
                !sales ? (
                  <LoadingSpinner />
                ) : (
                  FormatBRL(sales?.balance_total_negative)
                )
              }
              statTitle={'Total contas negativas'}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Vendas</h2>
          </CardTitle>
        </CardHeader>
        <CardBody className="d-flex p-0 flex-wrap">
          <div className="d-flex flex-wrap w-100">
            <div className="wrap-info">
              <StatisticsCards
                iconBg={'primary'}
                icon={<BarChart />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(sales?.sales.gross_percentage)
                  )
                }
                statTitle={'Bruto tarifa variável'}
              />
            </div>

            <div className="wrap-info">
              <StatisticsCards
                iconBg={'primary'}
                icon={<BarChart />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(sales?.sales.gross_fixed)
                  )
                }
                statTitle={'Bruto tarifa fixa'}
              />
            </div>
            <div className="wrap-info">
              <StatisticsCards
                iconBg={'primary'}
                icon={<BarChart />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(sales?.sales.installment_amount)
                  )
                }
                statTitle={'Bruto tarifa parcelamento'}
              />
            </div>
            <div className="wrap-info">
              <StatisticsCards
                iconBg={'info'}
                icon={<Activity />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(sales?.sales.gross_profit)
                  )
                }
                statTitle={'Bruto Total'}
              />
            </div>
            <div className="wrap-info">
              <StatisticsCards
                iconBg={'danger'}
                icon={<Activity />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(sales?.sales.cost_total)
                  )
                }
                statTitle={'Custo total'}
              />
            </div>
            <div className="wrap-info">
              <StatisticsCards
                iconBg={'success'}
                icon={<DollarSign />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(sales?.sales.net_profit)
                  )
                }
                statTitle={'Líquido'}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Saques</h2>
          </CardTitle>
        </CardHeader>
        <CardBody className="d-flex p-0 flex-wrap">
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'primary'}
              icon={<BarChart />}
              stat={
                !sales ? (
                  <LoadingSpinner />
                ) : (
                  FormatBRL(sales?.withdrawals.gross_profit)
                )
              }
              statTitle={'Bruto'}
            />
          </div>
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'success'}
              icon={<DollarSign />}
              stat={
                !sales ? (
                  <LoadingSpinner />
                ) : (
                  FormatBRL(sales?.withdrawals.net_profit)
                )
              }
              statTitle={'Líquido'}
            />
          </div>
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'light'}
              icon={<DollarSign />}
              stat={
                !sales ? (
                  <LoadingSpinner />
                ) : (
                  FormatBRL(sales?.pending_withdrawals || 0)
                )
              }
              statTitle={'Saques Pendentes'}
            />
          </div>
          <div className="wrap-info">
            <StatisticsCards
              iconBg={'light'}
              icon={<DollarSign />}
              stat={
                !sales ? (
                  <LoadingSpinner />
                ) : (
                  FormatBRL(sales?.withdrawals?.withdrawal_amount || 0)
                )
              }
              statTitle={'Saques Efetuados'}
            />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Lucro Total</h2>
          </CardTitle>
        </CardHeader>
        <CardBody className="d-flex p-0 flex-wrap">
          <div className="wrap-info">
            <TooltipItem
              item={{
                placement: 'top',
                text: (
                  <ul>
                    <li>
                      <div>Vendas Bruto Total</div>
                      <div>{FormatBRL(sales?.sales.gross_profit)}</div>
                    </li>
                    <li>
                      <div>Saques Bruto</div>
                      <div>{FormatBRL(sales?.withdrawals.gross_profit)}</div>
                    </li>
                    <li className="last">
                      <div>Total</div>
                      <div>
                        {FormatBRL(
                          sales?.withdrawals.gross_profit +
                            sales?.sales.gross_profit,
                        )}
                      </div>
                    </li>
                  </ul>
                ),
              }}
              id={0}
            >
              <StatisticsCards
                iconBg={'primary'}
                icon={<BarChart />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(
                      sales?.withdrawals.gross_profit +
                        sales?.sales.gross_profit,
                    )
                  )
                }
                statTitle={'Bruto'}
                className="pointer"
              />
              <Info size={18} style={{ marginTop: 4 }} />
            </TooltipItem>
          </div>
          <div>
            <TooltipItem
              item={{
                placement: 'top',
                text: (
                  <ul>
                    <li>
                      <div>Vendas Líquido</div>
                      <div>{FormatBRL(sales?.sales.net_profit)}</div>
                    </li>
                    <li>
                      <div>Saques Líquido</div>
                      <div>{FormatBRL(sales?.withdrawals.net_profit)}</div>
                    </li>
                    <li className="last">
                      <div>Total</div>
                      <div>
                        {FormatBRL(
                          sales?.withdrawals.net_profit +
                            sales?.sales.net_profit,
                        )}
                      </div>
                    </li>
                  </ul>
                ),
              }}
              id={1}
            >
              <StatisticsCards
                iconBg={'success'}
                icon={<DollarSign />}
                stat={
                  !sales ? (
                    <LoadingSpinner />
                  ) : (
                    FormatBRL(
                      sales?.withdrawals.net_profit + sales?.sales.net_profit,
                    )
                  )
                }
                statTitle={'Líquido'}
              />
              <Info size={18} style={{ marginTop: 4 }} />
            </TooltipItem>
          </div>
        </CardBody>
      </Card>
      {sales?.sales.card && (
        <>
          <div
            className="d-flex justify-content-between align-items-center mt-3 mb-2"
            style={{ maxWidth: 556 }}
          >
            <h2>Parcelamento Cartão</h2>
            <p className="h5 pt-0 pb-0">
              Quantidade de Vendas: {sales.sales.card.count}
            </p>
          </div>

          <TabPane>
            <Table className={'w-50'}>
              <thead>
                <tr>
                  <th>Parcelas</th>
                  <th>Vendas</th>
                  <th>Porcentagem</th>
                  <th>Total</th>
                </tr>
              </thead>
              {sales.sales.card.installments.map((item) => {
                return (
                  <tbody key={item.installments}>
                    <tr>
                      <th scope="row" className={'w-50'}>
                        {item.installments}
                      </th>
                      <th>{item.count}</th>
                      <th>
                        {Number(item.percentage / 100).toLocaleString(
                          undefined,
                          {
                            style: 'percent',
                            minimumFractionDigits: 2,
                          },
                        )}
                      </th>
                      <th>{FormatBRL(item.total)}</th>
                    </tr>
                  </tbody>
                );
              })}
            </Table>
          </TabPane>
        </>
      )}
    </>
  );
};

export default Sales;
