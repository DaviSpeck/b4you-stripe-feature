import { useCallback, useEffect, useState } from 'react';
import { ActionBar } from './actionBar';
import { PendingAfiiliatesTable } from './table';
import api from '../../../providers/api';
import { notify } from '../../functions';
import PageTitle from '../../../jsx/layouts/PageTitle';

export default function PagePendingAffiliates() {
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchParams, setSearchParams] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLineAction, setIsLoadingLineAction] = useState(false);
  const [isLoadingFilterActions, setIsLoadingFilterActions] = useState(false);

  const getPendingAffiliates = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(
        `/affiliates/pending?size=${perPage}&page=${page - 1}&${searchParams}`
      );
      setIsLoading(false);
      setTableData(res.data.rows);
      setTotalRows(res.data.count);
    } catch (error) {
      notify({
        message:
          'Não foi possível buscar os pedidos de afiliação. Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, page, perPage]);

  const handleChangePage = (page) => setPage(page);

  const handleChangePageSize = (size) => setPerPage(size);

  useEffect(() => {
    getPendingAffiliates();
  }, [searchParams, page, perPage]);

  return (
    <section id='pageAffiliates'>
      <div className='page-title-wrap'>
        <PageTitle title='Afiliados pendentes' />
      </div>
      <ActionBar
        refreshData={getPendingAffiliates}
        isLoading={isLoading || isLoadingFilterActions}
        onLoading={(value) => setIsLoadingFilterActions(value)}
        onFilter={(search) => setSearchParams(search)}
        isDisabled={
          isLoading || tableData.length === 0 || isLoadingFilterActions
        }
      />
      <PendingAfiiliatesTable
        tableData={tableData}
        perPage={perPage}
        totalRows={totalRows}
        isLoading={isLoading}
        isLoadingLineAction={isLoadingLineAction}
        onRefresh={getPendingAffiliates}
        onPageChange={handleChangePage}
        onPageSize={handleChangePageSize}
        onLoadingLineAction={(isLoading) => setIsLoadingLineAction(isLoading)}
      />
    </section>
  );
}
