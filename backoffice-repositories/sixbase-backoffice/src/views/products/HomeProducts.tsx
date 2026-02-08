import React, { useState, useEffect, FC } from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../../utility/hooks/useSkin';
import {
  Card,
  CardBody,
  FormGroup,
  Input,
  Label,
  Badge,
  Col,
  Row,
} from 'reactstrap';
import { api } from '../../services/api';
import memoizeOne from 'memoize-one';
import { Box, Calendar, Info, Settings } from 'react-feather';
import { Link } from 'react-router-dom';
import '../../assets/scss/pages/producer.scss';
import StatisticsCards from '../../@core/components/statistics-card';
import TooltipItem from '../reports/components/ToolTipItem';
import { Product, ApiResponse, Column } from '../../interfaces/products.interface';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';


const columns = memoizeOne((): Column[] => [
  {
    name: 'Nome',
    cell: (row: Product) => row.name,
  },
  {
    name: 'Produtor',
    cell: (row: Product) => row.producer.full_name,
  },
  {
    name: 'Pagamento',
    cell: (row: Product) => row.payment_type,
  },
  {
    name: 'Tipo',
    cell: (row: Product) => row.type,
  },
  {
    name: 'Email de suporte',
    cell: (row: Product) => row.support_email || '-',
    width: '170px',
  },
  {
    name: 'WhatsApp de suporte',
    cell: (row: Product) => row.support_whatsapp || '-',
    width: '170px',
  },
  {
    name: 'Garantia',
    cell: (row: Product) => row.warranty,
  },
  {
    name: 'Detalhes',
    center: true,
    cell: (row: Product) => {
      return (
        <Link to={`/producer/${row.producer.uuid}/product/${row.uuid}`}>
          <Badge color="primary" className="view-details">
            <Settings size={20} />
          </Badge>
        </Link>
      );
    },
  },
]);

const HomeProducts: FC = () => {
  const { skin } = useSkin();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProductsAll, setTotalProductsAll] = useState<number>(0);
  const [productsCreatedInPeriod, setProductsCreatedInPeriod] = useState<number>(0);
  const [productsWithSalesLast30Days, setProductsWithSalesLast30Days] =
    useState<number>(0);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [inputFilter, setInputFilter] = useState<string>('');
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
  const [calendar, setCalendar] = useState<Date[]>([sevenDaysAgo, today]);
  const [startDate, setStartDate] = useState<string>(formatDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState<string>(formatDate(today));
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProducts = async (
    page: number,
    newPerPage: number | null = null,
  ): Promise<void> => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append(
        'size',
        (newPerPage ? newPerPage : recordsPerPage).toString(),
      );
      query.append('input', inputFilter);
      if (startDate) query.append('start_date', startDate);
      if (endDate) query.append('end_date', `${endDate} 23:59:59`);

      const response = await api.get<ApiResponse>(
        `/products/all?${query.toString()}`,
      );
      const { info } = response.data;
      setProducts(info.rows);
      setTotalRows(info.pagination.total);
      setTotalProductsAll(info.metrics.totalProductsAll);
      setProductsCreatedInPeriod(info.metrics.productsCreatedInPeriod);
      setProductsWithSalesLast30Days(info.metrics.productsWithSalesLast30Days);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (
    newPerPage: number,
    page: number,
  ): Promise<void> => {
    await fetchProducts(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page: number): void => {
    fetchProducts(page - 1);
  };

  const handleDateChange = (dates: Date[]) => {
    if (!dates || dates.length < 2) {
      setCalendar(dates || []);
      return;
    }
    const [start, end] = dates;
    if (start && end) {
      setCalendar([start, end]);
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  };

  useEffect(() => {
    fetchProducts(0);
  }, [inputFilter, startDate, endDate]);

  return (
    <section id="pageHomeProducts">
      <h2 className="mb-2">Produtos</h2>

      <div
        className="d-flex wrap-info text-center"
        style={{
          minWidth: '284px',
          cursor: 'pointer',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <TooltipItem
          item={{
            placement: 'right',
            text: 'Quantidade total de produtos cadastrados na plataforma.',
          }}
          id={1}
        >
          <StatisticsCards
            iconBg="light"
            icon={<Box />}
            stat={
              <div className="d-flex justify-content-center">
                {totalProductsAll}
                <Info size={14} style={{ marginTop: 4, marginLeft: 6 }} />
              </div>
            }
            statTitle="Total de produtos cadastrados"
            hideChart
            style={{ background: 'rgb(29, 36, 54)' }}
          />
        </TooltipItem>
        <TooltipItem
          item={{
            placement: 'right',
            text: 'Quantidade de produtos criados dentro do intervalo de datas selecionado.',
          }}
          id={2}
        >
          <StatisticsCards
            iconBg="light"
            icon={<Box />}
            stat={
              <div className="d-flex justify-content-center">
                {productsCreatedInPeriod}
                <Info size={14} style={{ marginTop: 4, marginLeft: 6 }} />
              </div>
            }
            statTitle="Produtos criados no período"
            hideChart
            style={{ background: 'rgb(29, 36, 54)' }}
          />
        </TooltipItem>
        <TooltipItem
          item={{
            placement: 'right',
            text: 'Produtos que tiveram ao menos uma venda aprovada nos últimos 30 dias.',
          }}
          id={3}
        >
          <StatisticsCards
            iconBg="light"
            icon={<Box />}
            stat={
              <div className="d-flex justify-content-center">
                {productsWithSalesLast30Days}
                <Info size={14} style={{ marginTop: 4, marginLeft: 6 }} />
              </div>
            }
            statTitle="Produtos com vendas (30 dias)"
            hideChart
            style={{ background: 'rgb(29, 36, 54)' }}
          />
        </TooltipItem>
      </div>
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <Row>
                <Col md={5}>
                  <FormGroup className="filters">
                    <Label>Nome do produto</Label>
                    <Input
                      onChange={({
                        target,
                      }: React.ChangeEvent<HTMLInputElement>) => {
                        setTimeout(() => {
                          setInputFilter(target.value);
                        }, 1000);
                      }}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <Label className="form-label" for="range-picker"></Label>
                  <div className="d-flex align-items-center">
                    <Calendar size={15} />
                    <Flatpickr
                      id="range-picker"
                      className="form-control border-0 shadow-none bg-transparent"
                      value={calendar}
                      onChange={handleDateChange}
                      options={{
                        mode: 'range',
                        dateFormat: 'd/m/Y',
                      }}
                    />
                  </div>
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
            paginationTotalRows={totalRows}
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
};

export default HomeProducts;