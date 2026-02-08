import moment from 'moment';
import { useEffect, useState } from 'react';
import { Button, Card, Modal, Row, Spinner } from 'react-bootstrap';
import CreatorSvg from '../../images/creator/creator';
import CalendarInline from '../../jsx/components/CalendarInline';
import api from '../../providers/api';
import { currency } from '../functions';
import ApexChart from './ApexChart';
import Conversion from './conversion';
import Methods from './methods';
import Status from './status';
import FilterListing from '../../jsx/components/FilterListing';

function closeParam() {
  if (sessionStorage.getItem('closeModal') === 'false') {
    return false;
  }

  return moment().diff(moment('2024-10-09 21:00:00'), 'seconds') <= 0;
}

const Metrics = () => {
  const [salesInfo, setSalesInfo] = useState(null);
  const [show, setShow] = useState(false);
  const [showCreator, setShowCreator] = useState(closeParam());
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [, setLoadingStatus] = useState(true);
  const [filterDates, setFilterDates] = useState({
    start: moment().subtract(13, 'days').toDate(),
    end: moment().toDate(),
    option: 4,
  });
  const [chartSales, setChartSales] = useState({});
  const [, setStatusChart] = useState({});
  const [series, setSeries] = useState([
    {
      name: '',
      data: [],
    },
    {
      name: '',
      data: [],
    },
  ]);
  const [options, setOptions] = useState({});
  const [metricMethod, setMetricMethod] = useState(null);
  const [metricStatus, setMetricStatus] = useState(null);
  const [metricConversion, setMetricConversion] = useState(null);
  const [screenSize, setScreenSize] = useState(null);
  const [filterParams, setFilterParams] = useState(new URLSearchParams());

  const paramsChart = () => {
    return {
      start_date: moment(filterDates.start, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      end_date: moment(filterDates.end, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    };
  };

  const params = () => {
    const productParam = filterParams.get('product') || '';
    return {
      start_date: moment(filterDates.start, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      end_date: moment(filterDates.end, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      product_uuid: productParam,
    };
  };

  const fetchData = () => {
    getMetricMethod();
    getMetricStatus();
    getMetricConversion();
    salesMetrics();
    getSalesInfo();
    getChartStatus();
  };

  const getMetricStatus = () => {
    setLoading(true);
    api
      .get('/metrics/status', { params: params() })
      .then((response) => {
        setMetricStatus(response.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const getMetricConversion = () => {
    api
      .get('/metrics/conversion', { params: params() })
      .then((response) => {
        setMetricConversion(response.data);
      })
      .catch(() => {});
  };

  const getMetricMethod = () => {
    api
      .get('/metrics/payment-methods', { params: params() })
      .then((response) => {
        setMetricMethod(response.data);
      })
      .catch(() => {});
  };

  const salesMetrics = () => {
    api
      .get('/metrics/v2/chart', { params: params() })
      .then((response) => {
        setChartSales(response.data);
        setLoadingChart(false);
      })
      .catch(() => {});
  };

  const getSalesInfo = () => {
    api
      .get('/metrics/v2/sales', { params: params() })
      .then((response) => {
        setSalesInfo(response.data);
        setLoading(false);
      })
      .catch(() => {});
  };

  const getChartStatus = () => {
    api
      .get('/metrics/v2/status', { params: params() })
      .then((response) => {
        setStatusChart(response.data);
        setLoadingStatus(false);
      })
      .catch(() => {});
  };

  const CreatorText = () => {
    if (moment().diff(moment('2024-10-07 23:59:59'), 'seconds') <= 0) {
      return (
        <>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            Aprenda a lucrar até{' '}
            <span style={{ color: '#00C896' }}>R$10.000</span> por mês como
            creator.
          </div>
          <div>
            Treinamento <b>100% gratuito e online,</b> dia 09/10 às 20h.
          </div>{' '}
        </>
      );
    }
    if (moment().diff(moment('2024-10-08 23:59:59'), 'seconds') <= 0) {
      return (
        <>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            É amanhã! O lançamento da
            <span style={{ color: '#00C896' }}> Escola Creator</span> está
            chegando.
          </div>
          <div>
            Treinamento <b>100% gratuito e online</b> sobre o método que está
            fazendo nossos creators <b>lucrarem até R$10.000 por mês</b>.
          </div>{' '}
        </>
      );
    }

    return (
      <>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          Não perca! Hoje, às 20h, lançamento da
          <span style={{ color: '#00C896' }}> Escola Creator</span>
        </div>
        <div style={{ fontSize: 14, marginTop: 8 }}>
          Treinamento <b>100% gratuito e online</b> sobre o método que está
          fazendo nossos creators <b>lucrarem até R$10.000 por mês</b>.
        </div>{' '}
      </>
    );
  };

  const closeModal = () => {
    sessionStorage.setItem('closeModal', 'false');
    setShowCreator(false);
  };

  useEffect(() => {
    fetchData();
    setShow(false);
  }, [filterParams, filterDates]);

  useEffect(() => {
    if (Object.keys(chartSales).length) {
      const start = chartSales.labels[0];
      const end = chartSales.labels[chartSales.labels.length - 1];

      let max = 31;
      if (window.innerWidth > 998) {
        max = 31;
      } else {
        max = 8;
      }
      if (chartSales.last_month.length) {
        setSeries([
          {
            name: `${moment(start).format('DD MMM')} - ${moment(end).format(
              'DD MMM'
            )}`,
            data: chartSales.current_month,
          },
          {
            name: `${moment(chartSales.labels_last_month[0]).format(
              'DD MMM'
            )} - ${moment(
              chartSales.labels_last_month[
                chartSales.labels_last_month.length - 1
              ]
            ).format('DD MMM')}`,
            data: chartSales.last_month,
          },
        ]);
        setOptions(() => ({
          chart: {
            height: 350,
            type: 'area',
            toolbar: {
              show: false,
            },
          },
          colors: ['#001432', '#5BEBD4'],
          dataLabels: {
            enabled: false,
          },

          stroke: {
            show: true,
            curve: 'smooth',
            lineCap: 'butt',
            colors: undefined,
            width: [3, 2],
          },
          yaxis: {
            show: false,
            labels: {
              formatter: (value) => currency(value),
            },
          },

          xaxis: {
            type: 'datetime',
            categories: chartSales.labels.map((c) => {
              return moment(c).format('DD/MM');
            }),
            labels: {
              show: chartSales.labels.length <= max,
              datetimeUTC: true,
              datetimeFormatter: {
                year: 'yyyy',
                month: "MMM 'yy",
                day: 'dd MMM',
                hour: 'HH:mm',
              },
            },
          },
          tooltip: {
            custom: ({ series, dataPointIndex }) => {
              const currentMonth = series[0][dataPointIndex];
              const lastMonth = series[1][dataPointIndex];
              if (series[0] && series[1]) {
                return `<div id='custom-tooltip-chart'>
                <div class='item'>${moment(
                  chartSales.labels[dataPointIndex]
                ).format('DD MMM')}: <span class='value'>${currency(
                  currentMonth
                )}</span>
                  </div>
              <div class='item'>${moment(
                chartSales.labels_last_month[dataPointIndex]
              ).format('DD MMM')}: <span class='value'>${currency(
                  lastMonth
                )}</span>
                </div>
             
              </div>`;
              }
            },
          },
          legend: {
            show: false,
            showForNullSeries: true,
            showForZeroSeries: true,
            horizontalAlign: 'center',
            fontSize: 14,
            fontWeight: 600,
            markers: {
              width: 14,
              height: 14,
              radius: 100,
              offsetX: -5,
              offsetY: 0,
              strokeColors: '#ff0000',
              strokeWidth: 2,
              strokeOpacity: 1,
              strokeDashArray: 0,
            },
            itemMargin: {
              horizontal: 20,
            },
          },
        }));
      } else {
        setSeries([
          {
            name: `${moment(start).format('MMM')} - ${moment(end).format(
              'MMM'
            )}`,
            data: chartSales.current_month.map((value, index) => ({
              x: moment(chartSales.labels[index]).format('MM/YY'),
              y: value,
            })),
          },
        ]);
        setOptions(() => ({
          chart: {
            height: 350,
            type: 'area',
            toolbar: {
              show: false,
            },
          },
          stroke: {
            curve: 'smooth',
            width: 3,
          },
          colors: ['#001432'],
          dataLabels: {
            enabled: false,
          },
          yaxis: {
            show: false,
            labels: {
              formatter: (value) => currency(value),
            },
          },
          tooltip: {
            custom: ({ series, dataPointIndex }) => {
              const lastMonth = series[0][dataPointIndex];
              if (series[0]) {
                return `<div id='custom-tooltip-chart'>
                    <div class='item'>
                    ${moment(chartSales.labels[dataPointIndex]).format(
                      'MMM YYYY'
                    )}:
                    <span class='value'>${currency(lastMonth)}</span>
                    </div>
                </div>`;
              }
            },
          },
          xaxis: {
            type: 'category',
            categories: chartSales.labels.map((c) => {
              return moment(c).format('MM/yy');
            }),
            labels: {
              show: chartSales.labels.length <= max,
              datetimeUTC: true,
              datetimeFormatter: {
                year: 'yyyy',
                month: "MMM 'yy",
                day: 'dd MMM',
                hour: 'HH:mm',
              },
            },
          },
          legend: {
            show: false,
            showForNullSeries: true,
            showForZeroSeries: true,
            horizontalAlign: 'left',
            fontSize: 14,
            fontWeight: 600,
            markers: {
              width: 32,
              height: 10,
              radius: 4,
              offsetX: -5,
              offsetY: 0,
            },
            itemMargin: {
              horizontal: 20,
              vertical: 6,
            },
          },
        }));
      }
    }
  }, [chartSales]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setScreenSize('mobile');
    } else {
      setScreenSize('desktop');
    }
  }, []);

  return (
    <div id='metrics'>
      <Modal show={showCreator} onHide={closeModal} centered>
        <Modal.Body>
          <div className='text-center'>
            <CreatorSvg style={{ marginTop: 20, marginBottom: 20 }} />
            <CreatorText />
            <Button
              style={{
                backgroundColor: '#5bebd4',
                borderColor: '#5bebd4',
                color: '#000',
              }}
              size='lg'
              className='mt-3 btn-block'
              onClick={() => {
                window.open(
                  'https://escolacreator.com.br/?utm_source=popup&utm_medium=dashboard&utm_campaign=captacao_escolacreator',
                  '_blank'
                );
              }}
            >
              Saiba mais
            </Button>
            <p className='mt-3' onClick={closeModal}>
              <a href='#' className='text-muted'>
                Acessar dashboard B4You
              </a>
            </p>
          </div>
        </Modal.Body>
      </Modal>

      <div className='d-flex  align-items-center mb-4'>
        <div className='pagetitle-dashboard'>Dashboard</div>
        {screenSize === 'desktop' && (
          <div className='wrap-calendar desktop'>
            <CalendarInline
              value={[filterDates.start, filterDates.end]}
              defaultActiveOption={filterDates.option}
              onChange={(e) => {
                setFilterDates((prev) => ({
                  ...prev,
                  start: e[0],
                  end: e[1],
                }));
              }}
              maxDate={new Date()}
              show={show}
              setShow={setShow}
              className='calendar-inline'
            />
          </div>
        )}
        <div className= 'filter-listing-wrapper'>
          <FilterListing
            pageFilter='dashboard'
            filterParams={filterParams}
            setFilterParams={setFilterParams}  // <-- aqui precisa estar definido!
            exportUrl=''
            hideSearch={true}
          />
        </div>
      </div>

      <section id='page-metrics'>
        <div className='wrap-list'>
          <div className='list-infos'>
            <Card className='item'>
              <div className='top'>
                <div className='text'>Total faturado</div>
                <div className='value'>
                  {!loading ? (
                    salesInfo?.gross_total === undefined ? (
                      <Spinner animation='border' role='status' />
                    ) : (
                      currency(salesInfo?.gross_total)
                    )
                  ) : (
                    <Spinner animation='border' role='status' />
                  )}
                </div>
              </div>
            </Card>
            <Card className='item'>
              <div className='top'>
                <div className='text'>Total líquido</div>
                <div className='value'>
                  {!loading ? (
                    salesInfo?.net_total === undefined ? (
                      <Spinner animation='border' role='status' />
                    ) : (
                      currency(salesInfo?.net_total)
                    )
                  ) : (
                    <Spinner animation='border' role='status' />
                  )}
                </div>
              </div>
            </Card>
            <Card className='item'>
              <div className='top'>
                <div className='text'>Transações</div>
                <div className='value'>
                  {!loading ? (
                    salesInfo?.transaction_count === undefined ? (
                      <Spinner animation='border' role='status' />
                    ) : (
                      salesInfo?.transaction_count
                    )
                  ) : (
                    <Spinner animation='border' role='status' />
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div>
            {screenSize === 'mobile' && (
              <div className='wrap-calendar-mobile mobile'>
                <CalendarInline
                  value={[filterDates.start, filterDates.end]}
                  defaultActiveOption={filterDates.option}
                  onChange={(e) => {
                    setFilterDates((prev) => ({
                      ...prev,
                      start: e[0],
                      end: e[1],
                    }));
                  }}
                  maxDate={new Date()}
                  show={show}
                  setShow={setShow}
                  className='calendar-inline'
                />
              </div>
            )}
          </div>

          <Card className='card-chart'>
            <Card.Body>
              <div className='chart-info'>
                <div className='left'>
                  <div>
                    <div className='title'>
                      {!loadingChart ? (
                        <div className='d-flex flex-column'>
                          {currency(chartSales.total)}

                          {chartSales.porcentage && (
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 400,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                color: chartSales.porcentage.isPositive
                                  ? '#00C896'
                                  : '#FF4D4F',
                              }}
                            >
                              <i
                                className={`${
                                  chartSales.porcentage.isPositive
                                    ? 'bx bx-trending-up'
                                    : 'bx bx-trending-down'
                                }`}
                              />{' '}
                              {chartSales.porcentage.value} vs mês anterior
                            </span>
                          )}
                        </div>
                      ) : (
                        <Spinner animation='border' role='status' />
                      )}
                    </div>
                  </div>
                </div>

                <div className='right mobile'>
                  <img
                    src={`https://i.ibb.co/8dnMgLN/logo-app-maior.png`}
                    style={{ maxWidth: 30 }}
                  />
                </div>
              </div>

              <ApexChart series={series} options={options} />
            </Card.Body>
          </Card>
        </div>

        <Row className='mt-5 row-status'>
          <div className='col-lg-4 col-md-12'>
            <h4 className='custom-h4 mb-3'>Por meio de pagamento</h4>
            <Card>
              <Card.Body>
                <Methods metrics={metricMethod} />
              </Card.Body>
            </Card>
          </div>
          <div className='col-lg-4 col-md-12'>
            <h4 className='custom-h4 mb-3'>Por status</h4>
            <Card>
              <Card.Body>
                <Status metrics={metricStatus} />
              </Card.Body>
            </Card>
          </div>
          <div className='col-lg-4 col-md-12'>
            <h4 className='custom-h4 mb-3'>Por conversão</h4>
            <Card>
              <Card.Body>
                <Conversion metrics={metricConversion} />{' '}
              </Card.Body>
            </Card>
          </div>
        </Row>
      </section>
    </div>
  );
};

export default Metrics;
