import { useMemo, useState } from 'react';
import FilterListing from '../../../jsx/components/FilterListing';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import './style.scss';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';

export const ActionBar = (props) => {
  const [filters, setFilters] = useState(null);

  const { refreshData, isDisabled, isLoading, onLoading, onFilter } = props;

  useMemo(() => {
    onFilter(filters);
  }, [filters]);

  return (
    <div>
      <FilterListing
        pageFilter={'affiliatesRequests'}
        placeHolder={'Digite o que deseja...'}
        setFilterParams={(searchParams) => setFilters(searchParams.toString())}
      />
      <div className='wrapper-btn-actions'>
        <ActionBar.AcceptAll
          searchParams={filters}
          tableRefresh={refreshData}
          isDisabled={isDisabled}
          isLoading={isLoading}
          onLoading={onLoading}
        />
        <ActionBar.RefuseAll
          searchParams={filters}
          tableRefresh={refreshData}
          isDisabled={isDisabled}
          isLoading={isLoading}
          onLoading={onLoading}
        />
        <ActionBar.Export searchParams={filters} isDisabled={isDisabled} />
      </div>
    </div>
  );
};

// eslint-disable-next-line react/display-name
ActionBar.Export = function (props) {
  const { searchParams, isDisabled } = props;

  const handleExportExcel = () => {
    try {
      api.get(`affiliates/pending/export?${searchParams}`);
      notify({
        message: 'Planilha enviada por email.',
        type: 'success',
      });
    } catch (error) {
      notify({
        message:
          'Não foi possível enviar a planilha por email. Tente novamente mais tarde',
        type: 'error',
      });
    }
  };

  return (
    <ButtonDS
      className='ml-2'
      variant={'success'}
      size='md'
      disabled={isDisabled}
      iconLeft={'bxs-file-export'}
      onClick={handleExportExcel}
    >
      Exportar
    </ButtonDS>
  );
};

// eslint-disable-next-line react/display-name
ActionBar.AcceptAll = function (props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { searchParams, tableRefresh, isDisabled, isLoading, onLoading } =
    props;

  const onAcceptClick = async () => {
    try {
      onLoading(true);
      await api.put(`/affiliates/pending/all/2?${searchParams}`);
      notify({ message: 'Salvo com sucesso', type: 'success' });
      tableRefresh();
    } catch (error) {
      notify({ message: 'Falha ao salvar', type: 'error' });
    } finally {
      onLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <ButtonDS
        size='md'
        disabled={isDisabled}
        onClick={() => setIsModalOpen(true)}
      >
        {!isLoading ? 'Aceitar todos' : 'Carregando...'}
      </ButtonDS>
      <ConfirmAction
        title={'Aceitar todos afiliados'}
        show={isModalOpen}
        setShow={setIsModalOpen}
        handleAction={onAcceptClick}
        buttonText={'Aceitar todos'}
        variant={'primary'}
        variantButton={'primary'}
        textAlert={'Você deseja aceitar todos os afiliados?'}
        simpleConfirm
        centered
        className='mt-2'
        haveLoader={false}
      />
    </>
  );
};

// eslint-disable-next-line react/display-name
ActionBar.RefuseAll = function (props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { searchParams, tableRefresh, isDisabled, isLoading, onLoading } =
    props;

  const onRejectClick = async () => {
    try {
      onLoading(true);
      await api.put(`/affiliates/pending/all/4?${searchParams}`);
      notify({ message: 'Salvo com sucesso', type: 'success' });
      tableRefresh();
    } catch (error) {
      notify({ message: 'Falha ao salvar', type: 'error' });
    } finally {
      onLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <ButtonDS
        variant='danger'
        className='ml-2'
        size='md'
        disabled={isDisabled}
        onClick={() => setIsModalOpen(true)}
      >
        {!isLoading ? 'Rejeitar todos' : 'Carregando...'}
      </ButtonDS>
      <ConfirmAction
        title={'Rejeitar todos afiliados'}
        show={isModalOpen}
        setShow={setIsModalOpen}
        handleAction={onRejectClick}
        buttonText={'Rejeitar todos'}
        variant={'danger'}
        variantButton={'danger'}
        textAlert={'Você deseja rejeitar todos os afiliados?'}
        simpleConfirm
        centered
        className='mt-2'
        haveLoader={false}
      />
    </>
  );
};
