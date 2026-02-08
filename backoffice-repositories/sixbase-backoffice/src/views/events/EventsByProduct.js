import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Breadcrumb,
  BreadcrumbItem,
  Col,
  Row,
  Table,
} from 'reactstrap';
import { api } from '@services/api';
import { Box, Info, Percent, Settings } from 'react-feather';
import '../../assets/scss/pages/producer.scss';
import StatisticsCards from '../../@core/components/statistics-card';
import Flatpickr from 'react-flatpickr';
import { Calendar } from 'react-feather';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import { Link, useParams } from 'react-router-dom';

import moment from 'moment';

export default function EventsByProduct() {
  let { productUuid } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events , setEvents] = useState({});
  const [filter, setFilter] = useState({
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append(
        'start_date',
        moment(filter.calendar[0]).format('YYYY-MM-DD'),
      );
      query.append('end_date', moment(filter.calendar[1]).format('YYYY-MM-DD'));

      const response = await api.get(`/events/product/${productUuid}?${query.toString()}`);
      const {
        data: { info },
      } = response;

      setEvents(info.events);

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!product) {
      fetchProduct();
    }
    fetchEvents();
  }, [filter]);

  const fetchProduct = () => {
    api
      .get(`/products/${productUuid}`)
      .then((r) => setProduct(r.data))
      .catch((e) => console.log(e));
  };

  if (!product) return null;
  return (
    <section id="pageEventsByProduct">
      <Row>
        <Col md={8}>
          <h2>{product.name}</h2>
          <Breadcrumb className="mb-1">
            <BreadcrumbItem>
              <Link to="/events">Conversões</Link>
            </BreadcrumbItem>
            <BreadcrumbItem active>
              <span>Produto</span>
            </BreadcrumbItem>
          </Breadcrumb>
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
      {/* <h2 className="mb-2">Conversões e eventos</h2> */}
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
              <div className="d-flex justify-content-center">{`${Number(events.conversion_rate_checkout || 0).toFixed(1)}%`}</div>
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
            stat={<div className="d-flex justify-content-center">{'0%'}</div>}
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
              <div className="d-flex justify-content-center">{`${Number(events.total_sales_rate || 0).toFixed(1)}%`}</div>
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
            stat={<div className="d-flex justify-content-center">{'0%'}</div>}
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
              <div className="d-flex justify-content-center">{`${Number(events.abandonment_rate_checkout || 0).toFixed(1)}%`}</div>
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
                {events.page_load_checkout}
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
              <Table hover>
                <thead>
                  <tr>
                    <div
                      className="title-table"
                      style={{ color: '#349888', fontSize: '21px' }}
                    >
                      Detalhes
                    </div>
                  </tr>
                </thead>
                <tbody>
                <tr>
                    <th scope="row">Taxa de conversão</th>
                    <td>{events?.conversion_rate_checkout}%</td>
                  </tr>
                  <tr>
                    <th scope="row">Visitas únicas</th>
                    <td>{events?.page_load_checkout}</td>
                  </tr>
                  <tr>
                    <th scope="row">Cliques no botão de compra</th>
                    <td>{events?.button_click_checkout}</td>
                  </tr>
                  <tr>
                    <th scope="row">Vendas aprovadas</th>
                    <td>{events?.sales_paid}</td>
                  </tr>
                  <tr>
                    <th scope="row">Vendas não pagas</th>
                    <td>{events?.sales_unpaid}</td>
                  </tr>
                  <tr>
                    <th scope="row">Taxa de abandono</th>
                    <td>{events?.abandonment_rate_checkout}%</td>
                  </tr>
                  <tr>
                    <th scope="row">Taxa de conversão upsell</th>
                    <td>{events?.name}</td>
                  </tr>
                  <tr>
                    <th scope="row">Visitas únicas upsell</th>
                    <td>{events?.page_load_upsell}</td>
                  </tr>
                  <tr>
                    <th scope="row">Cliques no botão de compra upsell</th>
                    <td>{events?.total_sales_upsell}</td>
                  </tr>
                  <tr>
                    <th scope="row">Vendas aprovadas upsell</th>
                    <td>{events?.sales_paid_upsell}</td>
                  </tr>
                  <tr>
                    <th scope="row">Vendas reprovadas upsell</th>
                    <td>{events?.sales_unpaid_upsell}</td>
                  </tr>
                  <tr>
                    <th scope="row">Taxa de abandono upsell</th>
                    <td>{events?.abandonment_rate_upsell}</td>
                  </tr>

                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </section>
  );
}