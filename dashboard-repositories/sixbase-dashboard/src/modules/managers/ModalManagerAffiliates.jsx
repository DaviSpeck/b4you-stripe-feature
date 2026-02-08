import { Divider } from '@material-ui/core';
import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';
import { currency } from '../functions';

export default function ModalManagerAffiliates({
  itemSelected,
  onTotalChange,
}) {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [name, setName] = useState('');
  const [filter, setFilter] = useState('1');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [hasSalesOnly, setHasSalesOnly] = useState(false);

  const getAffiliates = async (
    affiliateName = name,
    filterSelected = filter,
    pageParam = page,
    perPageParam = perPage,
    hasSalesParam = hasSalesOnly
  ) => {
    try {
      setLoading(true);

      let column;
      let direction;

      switch (filterSelected) {
        case '1':
          column = 'full_name';
          direction = 'ASC';
          break;
        case '2':
          column = 'full_name';
          direction = 'DESC';
          break;
        case '3':
          column = 'total_items_sold';
          direction = 'DESC';
          break;
        case '4':
          column = 'total_items_sold';
          direction = 'ASC';
          break;
        case '5':
          column = 'commission';
          direction = 'DESC';
          break;
        case '6':
          column = 'commission';
          direction = 'ASC';
          break;
        case '7':
          column = 'commission_amount';
          direction = 'DESC';
          break;
        case '8':
          column = 'commission_amount';
          direction = 'ASC';
          break;
        case '9':
          column = 'created_at';
          direction = 'DESC';
          break;
        case '10':
          column = 'created_at';
          direction = 'ASC';
          break;
        default:
          column = 'full_name';
          direction = 'ASC';
          break;
      }

      const params = new URLSearchParams({
        product: itemSelected.id_product,
        manager: itemSelected.id,
        column,
        direction,
        page: pageParam,
        size: perPageParam,
      });

      if (affiliateName) {
        params.set('name', affiliateName);
      }

      if (hasSalesParam) {
        params.set('has_sales', 'true');
      }

      const url = `/managers/affiliatesByManagerAndProduct?${params.toString()}`;

      const { data } = await api.get(url);

      const rows = data?.rows ?? data ?? [];
      const total = data?.count ?? rows.length;

      setRecords(rows);
      setTotalRows(total);
      onTotalChange?.(total);
      setPage(pageParam);
      setPerPage(perPageParam);
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  };

  const columnsAffiliates = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Afiliado' iconClassName='bx bx-user' />,
      width: '200px',
      cell: (item) => (
        <div>
          {item.full_name.charAt(0).toUpperCase() + item.full_name.slice(1)}
        </div>
      ),
    },
    {
      name: (
        <RenderNameDataTable name='E-mail' iconClassName='bx bx-envelope' />
      ),
      width: '230px',
      cell: (item) => <div>{item.email}</div>,
    },
    {
      name: <RenderNameDataTable name='Vendas' iconClassName='bx bx-package' />,
      width: '150px',
      cell: (item) => item.total_items_sold,
    },
    {
      name: (
        <RenderNameDataTable name='Comissão' iconClassName='bx bx-dollar' />
      ),
      width: '180px',
      cell: (item) => item.commission + `%`,
    },
    {
      name: (
        <RenderNameDataTable
          name='Total Comissão'
          iconClassName='bx bx-money'
        />
      ),
      width: '200px',
      cell: (item) => currency(item.commission_amount),
    },
    {
      name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
      width: '120px',
      cell: (item) => (
        <BadgeDS variant={item.status.color}>{item.status.label}</BadgeDS>
      ),
    },
  ]);

  const [debouncedName, setDebouncedName] = useState(name);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(name);
    }, 300);
    return () => clearTimeout(handler);
  }, [name]);

  useEffect(() => {
    if (!itemSelected) return;
    getAffiliates(debouncedName, filter, page, perPage, hasSalesOnly);
  }, [debouncedName, filter, hasSalesOnly, page, perPage, itemSelected]);

  const handlePageChange = (pageNumber) => {
    const newPage = pageNumber - 1;
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, pageNumber) => {
    const newPage = pageNumber - 1;
    setPerPage(newPerPage);
    setPage(newPage);
  };

  return (
    <>
      <div className='mb-3 mb-lg-4'>
        <div className='d-flex flex-column flex-lg-row w-100 align-items-center'>
          <input
            type='text'
            name='name'
            className='form-control col-12 col-lg-6 mb-3 mb-lg-0'
            placeholder='Digite o nome do afiliado'
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setPage(0);
            }}
          />

          <select
            className='form-control col-12 col-lg-3 mb-3 mb-lg-0 ml-lg-2'
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
          >
            <option value='1'>Nome (A-Z)</option>
            <option value='2'>Nome (Z-A)</option>
            <option value='3'>Vendas (Maior-Menor)</option>
            <option value='4'>Vendas (Menor-Maior)</option>
            <option value='5'>Comissão (Maior-Menor)</option>
            <option value='6'>Comissão (Menor-Maior)</option>
            <option value='7'>Total Comissão (Maior-Menor)</option>
            <option value='8'>Total Comissão (Menor-Maior)</option>
          </select>

          <div className='d-flex align-items-center col-12 col-lg-3 mb-3 mb-lg-0 ml-lg-2'>
            <input
              type='checkbox'
              id='has-sales-only'
              className='mr-2'
              checked={hasSalesOnly}
              onChange={(e) => {
                const checked = e.target.checked;
                setHasSalesOnly(checked);
                setPage(0);
              }}
            />
            <label htmlFor='has-sales-only' className='mb-0'>
              Afiliados com vendas
            </label>
          </div>
        </div>

        <div className='d-flex flex-column flex-lg-row justify-content-end align-items-stretch mt-2'>

          <button
            className='d-flex align-items-center justify-content-center col-12 col-lg-2 py-2 rounded bg-transparent text-primary border-1'
            onClick={() => {
              setName('');
              setFilter('1');
              setHasSalesOnly(false);
              setPage(0);
            }}
          >
            <i className='bx bx-reset mr-1'></i>
            Resetar
          </button>
        </div>
      </div>

      <Divider className='mb-3' />

      <DataTable
        columns={columnsAffiliates()}
        data={records}
        striped
        highlightOnHover
        progressPending={loading}
        progressComponent={<Loader title='Carregando...' />}
        noDataComponent={<NoDataComponentContent />}
        responsive
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        paginationDefaultPage={page + 1}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: true,
          selectAllRowsItemText: 'Todos',
        }}
      />
    </>
  );
}
