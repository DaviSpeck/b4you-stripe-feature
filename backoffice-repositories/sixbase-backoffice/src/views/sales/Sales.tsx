import React, { useEffect, useState, FC } from 'react';
import DataTable from 'react-data-table-component';
import { Card, CardBody, CardHeader, CardTitle, Label } from 'reactstrap';
import { api } from '../../services/api';
import { FormatBRL } from '../../utility/Utils';
import moment from 'moment';
import ExpandedComponent from './ExpandedComponent';
import StatsCard from './StatsCard';
import Flatpickr from 'react-flatpickr';
import memoize from 'memoize-one';
import '../../assets/scss/react/libs/flatpickr/flatpickr.scss';
import {
  Column,
  SalesRecord,
  FilterState,
  ApiResponse,
  Metrics,
} from '../../interfaces/sales.interface';
import { useSkin } from '../../utility/hooks/useSkin';

const columns = memoize((): Column[] => [
  {
    name: 'Date',
    cell: ({ created_at }: SalesRecord) => {
      return moment(created_at).format('DD/MM/YYYY HH:mm');
    },
  },
  {
    name: 'Products',
    center: true,
    cell: ({ products }: SalesRecord) => {
      return products.length;
    },
  },
  {
    name: 'Amount',
    cell: (row: SalesRecord) => {
      const { products } = row;

      const amount = FormatBRL(
        products.reduce((acc, obj) => (acc += obj.price), 0),
      );

      return <span className="fw-bolder">{amount}</span>;
    },
  },
  {
    name: 'Service Fees',
    cell: (row: SalesRecord) => {
      const { products } = row;
      const serviceFees = FormatBRL(
        products.reduce(
          (acc, obj) =>
            (acc +=
              obj.fee_total_amount_service + obj.fee_total_amount_over_psp),
          0,
        ),
      );
      return <span className="fw-bolder text-success">+ {serviceFees}</span>;
    },
  },
  {
    name: 'Fees',
    cell: (row: SalesRecord) => {
      const { products } = row;
      const fees = FormatBRL(
        products.reduce((acc, obj) => (acc += obj.fee_total_amount_psp), 0),
      );
      return <span className="fw-bolder text-danger">- {fees}</span>;
    },
  },
  {
    name: 'Taxes',
    cell: (row: SalesRecord) => {
      const { products } = row;
      const taxes = FormatBRL(
        products.reduce((acc, obj) => (acc += obj.tax_variable_amount), 0),
      );
      return <span className="fw-bolder text-danger">- {taxes}</span>;
    },
  },
  {
    name: 'Net Profit',
    cell: (row: SalesRecord) => {
      const { products } = row;
      const net_profit = FormatBRL(
        products.reduce((acc, obj) => (acc += obj.net_profit), 0),
      );
      return <span className="fw-bolder text-success">+ {net_profit}</span>;
    },
  },
]);

const Sales: FC = () => {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    page: 1,
    size: 10,
    totalRows: 0,
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });
  const { skin } = useSkin();

  function handlePageChange(page: number): void {
    setFilter((prev) => ({ ...prev, page: page }));
  }

  function handleRowsPerPageChange(rowsPerPage: number): void {
    setFilter((prev) => ({ ...prev, size: rowsPerPage }));
  }

  useEffect(() => {
    async function getMetrics(): Promise<void> {
      try {
        const query = new URLSearchParams({
          start: filter.calendar[0].toISOString(),
          end: filter.calendar[1].toISOString(),
        });

        const response = await api.get<Metrics>(`financial/metrics?${query}`);
        if (response.data) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    async function getSales(): Promise<void> {
      try {
        const query = new URLSearchParams({
          page: filter.page.toString(),
          size: filter.size.toString(),
          start: filter.calendar[0].toISOString(),
          end: filter.calendar[1].toISOString(),
        });
        const response = await api.get<ApiResponse>(`financial?${query}`);

        if (response.data) {
          const { count, rows } = response.data;
          setSales(rows);
          setFilter((prev) => ({ ...prev, totalRows: count }));
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (filter.calendar.length === 2) {
      getMetrics();
      getSales();
    }

    return () => {
      setMetrics(null);
      setSales([]);
    };
  }, [filter.calendar, filter.page, filter.size]);

  return (
    <section id="pageSales">
      <Card>
        <CardBody>
          <Label className="form-label" for="range-picker">
            Range
          </Label>
          <Flatpickr
            value={filter.calendar}
            id="range-picker"
            className="form-control"
            onChange={(date: Date[]) =>
              setFilter((prev) => ({ ...prev, calendar: date }))
            }
            options={{
              mode: 'range',
              dateFormat: 'd/m/Y',
              // defaultDate: ["2020-02-01", "2020-02-15"],
            }}
          />
        </CardBody>
      </Card>
      <StatsCard cols={{ md: '3', sm: '6', xs: '12' }} metrics={metrics} />
      <Card>
        <CardHeader>
          <CardTitle>Sales</CardTitle>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={columns()}
            data={sales}
            expandableRows
            expandableRowsComponent={ExpandedComponent}
            pagination
            paginationServer
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
            paginationTotalRows={filter.totalRows}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
          {/* {sales.map((s) => (
            <ExpandedComponent data={s} />
          ))} */}
        </CardBody>
      </Card>
    </section>
  );
};

export default Sales;
