import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { Card, CardBody, FormGroup, Input, Label, Col, Row } from 'reactstrap';
import { api } from '@services/api';
import memoizeOne from 'memoize-one';
import { Box, Info, Percent, Settings } from 'react-feather';
import { Link } from 'react-router-dom';
import '../../assets/scss/pages/producer.scss';
import StatisticsCards from '../../@core/components/statistics-card';
import Flatpickr from 'react-flatpickr';
import { Calendar } from 'react-feather';
import '@styles/react/libs/flatpickr/flatpickr.scss';

import moment from 'moment';
import { useSkin } from '../../utility/hooks/useSkin';

const columns = memoizeOne(() => [
  {
    name: 'Produto',
    cell: (row) => (
      <Link to={`/events/product/${row?.product_uuid}`}>
        {row?.product_name}
      </Link>
    ),
  },
  {
    name: 'Visitas',
    cell: (row) => row.page_load_checkout,
  },
  {
    name: 'Ação compra',
    cell: (row) => row.button_click_checkout,
  },
  {
    name: 'Pagos',
    cell: (row) => row.sales_paid,
  },
  {
    name: 'Não pagos',
    cell: (row) => row.sales_unpaid,
  },
  {
    name: 'Visitas Upsell',
    cell: (row) => row.page_load_upsell,
  },
  {
    name: 'Ação compra psell',
    cell: (row) => row.button_click_upsell,
  },
  {
    name: 'Upsell pago',
    cell: (row) => row.sales_paid_upsell,
  },
  {
    name: 'Upsell não pago',
    cell: (row) => row.sales_paid_upsell,
  },
]);

export default function HomeProducts() {
  const [products, setProducts] = useState([]);
  // const [totalProducts, setTotalProducts] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [inputFilter, setInputFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState({
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });
  const { skin } = useSkin();

  const fetchProductsEvents = async (page, newPerPage = null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('input', inputFilter);
      query.append(
        'start_date',
        moment(filter.calendar[0]).format('YYYY-MM-DD'),
      );
      query.append('end_date', moment(filter.calendar[1]).format('YYYY-MM-DD'));

      const response = await api.get(`/events/all?${query.toString()}`);
      const {
        data: { info },
      } = response;

      setStats(info.stats);

      setProductsCount(info.count);
      setProducts(info.rows);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (newPerPage, page) => {
    await fetchProductsEvents(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page) => {
    fetchProductsEvents(page - 1);
  };

  useEffect(() => {
    fetchProductsEvents(0);
  }, [inputFilter, filter]);

  return (
    <section id="pageHomeProducts">
      <h2 className="mb-2">Conversões e eventos</h2>
      <div
        className="d-flex"
        style={{
          minWidth: '284px',
        }}
      >
        <div className="mx-1 w-100">
          <StatisticsCards
            iconBg={'light'}
            className={'w-100'}
            icon={<Percent />}
            stat={
              <div className="d-flex justify-content-center">{`${stats.conversion_rate_checkout}%`}</div>
            }
            statTitle={'Conversão Total'}
            hideChart={true}
            style={{
              background: 'rgb(29, 36, 54)',
            }}
          />
        </div>
        <div className="mx-1 w-100">
          <StatisticsCards
            iconBg={'light'}
            className={'w-100'}
            icon={<Percent />}
            stat={
              <div className="d-flex justify-content-center">{`${stats.total_rate_converion_upsell}%`}</div>
            }
            statTitle={'Conversão Upsell'}
            hideChart={true}
            style={{
              background: 'rgb(29, 36, 54)',
            }}
          />
        </div>
        <div className="mx-1 w-100">
          <StatisticsCards
            iconBg={'light'}
            className={'w-100'}
            icon={<Percent />}
            stat={
              <div className="d-flex justify-content-center">{`${stats.total_sales_rate}%`}</div>
            }
            statTitle={'Total finalização'}
            hideChart={true}
            style={{
              background: 'rgb(29, 36, 54)',
            }}
          />
        </div>
        <div className="mx-1 w-100">
          <StatisticsCards
            iconBg={'light'}
            className={'w-100'}
            icon={<Percent />}
            stat={
              <div className="d-flex justify-content-center">{`${stats.total_rate_upsell}%`}</div>
            }
            statTitle={'Finalização upsell'}
            hideChart={true}
            style={{
              background: 'rgb(29, 36, 54)',
            }}
          />
        </div>
        <div className="mx-1 w-100">
          <StatisticsCards
            iconBg={'light'}
            className={'w-100'}
            icon={<Percent />}
            stat={
              <div className="d-flex justify-content-center">{`${stats.total_abandonment_rate}%`}</div>
            }
            statTitle={'Taxa de abandono'}
            hideChart={true}
            style={{
              background: 'rgb(29, 36, 54)',
            }}
          />
        </div>
        <div className="mx-1 w-100">
          <StatisticsCards
            iconBg={'light'}
            className={'w-100'}
            icon={<Percent />}
            stat={
              <div className="d-flex justify-content-center">
                {stats.page_load_checkout}
              </div>
            }
            statTitle={'Total Visitas'}
            hideChart={true}
            style={{
              background: 'rgb(29, 36, 54)',
            }}
          />
        </div>
      </div>
      <Row>
        <Col>
          <Card>
            <CardBody>
              <Row>
                <Col md={8}>
                  <FormGroup className="filters">
                    <Label>Nome do produto</Label>
                    <Input
                      onChange={({ target }) => {
                        setTimeout(() => {
                          setInputFilter(target.value);
                        }, 1000);
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup className="filters">
                    <Label>Periodo</Label>

                    <div className="d-flex align-items-center ml-2">
                      <Calendar size={15} className="ml-2" />
                      <Flatpickr
                        className="form-control flat-picker bg-transparent border-0 shadow-none"
                        value={filter.calendar}
                        onChange={(date) =>
                          setFilter((prev) => ({ ...prev, calendar: date }))
                        }
                        options={{
                          mode: 'range',
                          // eslint-disable-next-line no-mixed-operators
                          dateFormat: 'd/m/Y',
                        }}
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card>
        <CardBody>
          <DataTable
            columns={columns()}
            data={products}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={productsCount}
            onChangeRowsPerPage={handleRecordsPerPageChange}
            onChangePage={handleRecordsPageChange}
            noDataComponent={'Não existem produtos para o nome pesquisado'}
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: false,
            }}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        </CardBody>
      </Card>
    </section>
  );
}
