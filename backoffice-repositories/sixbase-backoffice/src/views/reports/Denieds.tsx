import React, { useEffect, useState, FC } from 'react';
import { api } from '../../services/api';
import { Spinner } from 'reactstrap';
import memoizeOne from 'memoize-one';
import DataTable from 'react-data-table-component';
import { Calendar } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import '@styles/react/libs/charts/recharts.scss';
import moment from 'moment';
import { DeniedRecord, FilterState } from '../../interfaces/reports.interface';
import { useSkin } from '../../utility/hooks/useSkin';

const columns = memoizeOne(() => [
  {
    name: 'Detalhes',
    cell: (row: DeniedRecord) => row.provider_response_details,
    minWidth: '750px',
  },
  {
    name: 'Numero de ocorrências',
    cell: (row: DeniedRecord) => row.total_ocorrencias,
  },
  {
    name: 'Porcentagem(%)',
    cell: (row: DeniedRecord) => row.porcentagem.toFixed(2),
  },
]);

const Denieds: FC = () => {
  const [records, setRecords] = useState<DeniedRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterState>({
    calendar: [moment().startOf('month').toDate(), moment().toDate()],
  });
  const { skin } = useSkin();

  useEffect(() => {
    fetchData();
  }, [filter.calendar]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.get<DeniedRecord[]>(
        `metrics/denieds?start_date=${moment(filter.calendar[0]).format(
          'YYYY-MM-DD',
        )}&end_date=${moment(filter.calendar[1]).format('YYYY-MM-DD')}`,
      );
      setRecords(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  return (
    <div>
      <div className="d-flex align-items-center ml-2">
        <Calendar size={15} className="ml-2" />
        <Flatpickr
          className="form-control flat-picker bg-transparent border-0 shadow-none"
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
      <div>
        <DataTable
          columns={columns()}
          data={records}
          progressPending={loading}
          progressComponent={<Spinner />}
          noDataComponent={<>Não há resultado</>}
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
        />
      </div>
    </div>
  );
};

export default Denieds;
