import moment from 'moment';
import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import PageTitle from '../../jsx/layouts/PageTitle';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import api from '../../providers/api';
import ModalSubscription from './components/modal-subscription';
import { notify } from '../functions';
import MetricsCards from './components/MetricsCards';
import SubscriptionFilters from './components/SubscriptionFilters';
import SubscriptionsTable from './components/SubscriptionsTable';

const PageSubscriptions = () => {
  const [modalSubscriptionShow, setModalSubscriptionShow] = useState(false);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterParams, setFilterParams] = useState(null);
  const [records, setRecords] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [filterProperties, setFilterProperties] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRenewing, setSelectedRenewing] = useState('all');
  const [selectedCanceled, setSelectedCanceled] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [activePlans, setActivePlans] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  useEffect(() => {
    fetchFilters();
    fetchMetrics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchInput.trim());
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (selectedStatus === 'all' || !selectedStatus) {
      return;
    }

    if (selectedStatus !== 'active') {
      if (selectedRenewing !== 'all') {
        setSelectedRenewing('all');
      }
    }

    if (selectedStatus !== 'canceled') {
      if (selectedCanceled !== 'all') {
        setSelectedCanceled('all');
      }
    }
  }, [selectedStatus, selectedRenewing, selectedCanceled]);

  useEffect(() => {
    if (!filterProperties) return;

    const params = new URLSearchParams();

    if (selectedProduct && selectedProduct !== 'all') {
      params.set('product_uuid', selectedProduct);
    }

    if (selectedPlan && selectedPlan !== 'all') {
      params.set('plan_uuid', selectedPlan);
    }

    if (selectedStatus && selectedStatus !== 'all') {
      params.set('status', selectedStatus);
    }

    if (selectedPaymentMethod && selectedPaymentMethod !== 'all') {
      params.set('payment_method', selectedPaymentMethod);
    }

    if (
      selectedRenewing &&
      selectedRenewing !== 'all' &&
      (selectedStatus === 'active' ||
        !selectedStatus ||
        selectedStatus === 'all')
    ) {
      const now = moment();
      let days = 7;
      if (selectedRenewing === '15d') days = 15;
      if (selectedRenewing === '30d') days = 30;

      const startDate = now.format('YYYY-MM-DD');
      const endDate = now.clone().add(days, 'days').format('YYYY-MM-DD');

      params.set('next_charge', 'true');
      params.set('start_date', startDate);
      params.set('end_date', endDate);

      if (!selectedStatus || selectedStatus === 'all') {
        params.set('status', 'active');
      }
    }

    if (
      selectedCanceled &&
      selectedCanceled !== 'all' &&
      (selectedStatus === 'canceled' ||
        !selectedStatus ||
        selectedStatus === 'all')
    ) {
      if (!selectedStatus || selectedStatus === 'all') {
        params.set('status', 'canceled');
      }
      params.set('cancellation_type', selectedCanceled);
    }

    if (searchDebounced) {
      params.set('input', searchDebounced);
    }

    setFilterParams(params);
  }, [
    selectedProduct,
    selectedPlan,
    selectedStatus,
    selectedRenewing,
    selectedCanceled,
    selectedPaymentMethod,
    searchDebounced,
    filterProperties,
  ]);

  useEffect(() => {
    fetchData();
  }, [filterParams, currentPage, perPage]);

  const fetchData = () => {
    setLoading(true);
    const params = {
      size: perPage,
      page: currentPage,
    };

    if (filterParams) {
      filterParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    api
      .get('/subscriptions', {
        params,
      })
      .then((response) => {
        setRecords(response.data.rows);
        setTotalRows(response.data.count);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchMetrics = () => {
    setLoadingMetrics(true);
    api
      .get('/subscriptions/metrics')
      .then((response) => {
        setMetrics(response.data);
      })
      .catch(() => {
        setMetrics(null);
      })
      .finally(() => {
        setLoadingMetrics(false);
      });
  };

  const fetchFilters = () => {
    setLoadingFilters(true);
    api
      .get('/subscriptions/filters')
      .then((response) => {
        setFilterProperties(response.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoadingFilters(false);
      });
  };

  const handleProductChange = (e) => {
    const value = e.target.value;
    setSelectedProduct(value);
    setSelectedPlan('all');

    if (value !== 'all' && filterProperties) {
      const activeProduct = filterProperties.products.find(
        (item) => item.uuid === value
      );
      setActivePlans(activeProduct?.product_plans || []);
    } else {
      setActivePlans([]);
    }
  };

  const handlePlanChange = (e) => {
    setSelectedPlan(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleRenewingChange = (e) => {
    setSelectedRenewing(e.target.value);
  };

  const handleCanceledChange = (e) => {
    setSelectedCanceled(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const exportData = () => {
    setLoadingExport(true);
    const params = filterParams ? Object.fromEntries(filterParams) : {};
    api
      .get(`/subscriptions/export/data`, {
        responseType: 'blob',
        params,
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'assinaturas.xlsx');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .finally(() => setLoadingExport(false));
  };

  const renderPlan = (plan) => {
    return <>{plan.label}</>;
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionToCancel) return;

    try {
      await api.put(`/subscriptions/${subscriptionToCancel.uuid}/cancel`, {
        now: false,
      });
      notify({ message: 'Assinatura cancelada com sucesso', type: 'success' });
      setModalCancelShow(false);
      setSubscriptionToCancel(null);
      fetchData();
      fetchMetrics();
    } catch (error) {
      notify({ message: 'Falha ao cancelar assinatura', type: 'error' });
      setModalCancelShow(false);
    }
  };

  const openCancelModal = (subscription) => {
    setSubscriptionToCancel(subscription);
    setModalCancelShow(true);
  };

  // TODO: Descomentar quando o backend estiver pronto
  // const handleReprocessCharge = async (subscription) => {
  //   if (!window.confirm('Deseja reprocessar a cobrança desta assinatura?')) {
  //     return;
  //   }

  //   try {
  //     await api.post(`/subscriptions/${subscription.uuid}/reprocess-charge`);
  //     const today = new Date().toISOString().split('T')[0];
  //     localStorage.setItem(`reprocess_charge:${subscription.uuid}`, today);
  //     notify({
  //       message: 'Cobrança reprocessada com sucesso',
  //       type: 'success',
  //     });
  //     fetchData();
  //     fetchMetrics();
  //   } catch (error) {
  //     const errorMessage =
  //       error.response?.data?.message || 'Falha ao reprocessar cobrança';
  //     notify({
  //       message: errorMessage,
  //       type: 'error',
  //     });
  //     if (errorMessage.includes('já reprocessou')) {
  //       const today = new Date().toISOString().split('T')[0];
  //       localStorage.setItem(`reprocess_charge:${subscription.uuid}`, today);
  //     }
  //   }
  // };

  const handleSendCardUpdateLink = async (subscription) => {
    try {
      await api.post(
        `/subscriptions/${subscription.uuid}/send-card-update-link`
      );
      notify({
        message: 'Email com link de atualização de cartão enviado com sucesso',
        type: 'success',
      });
    } catch (error) {
      notify({
        message:
          error.response?.data?.message ||
          'Falha ao enviar link de atualização de cartão',
        type: 'error',
      });
    }
  };

  const renderViewDetails = (item) => {
    return (
      <div className='d-flex justify-content-center'>
        <ButtonDS
          size='icon'
          onClick={() => {
            setActiveSubscription(item);
            setModalSubscriptionShow(true);
          }}
          title='Ver detalhes'
        >
          <i className='bx bx-menu'></i>
        </ButtonDS>
      </div>
    );
  };

  const renderPrice = (amount) => {
    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  return (
    <>
      {modalSubscriptionShow && (
        <ModalGeneric
          show={modalSubscriptionShow}
          setShow={() => setModalSubscriptionShow(false)}
          title={'Assinatura'}
          centered
          size='lg'
        >
          <ModalSubscription
            setShow={() => setModalSubscriptionShow(false)}
            activeSubscription={activeSubscription}
            setActiveSubscription={setActiveSubscription}
            fetchData={fetchData}
            onCancelSubscription={openCancelModal}
            onSendCardUpdateLink={handleSendCardUpdateLink}
          />
        </ModalGeneric>
      )}

      <ConfirmAction
        title='Cancelar Assinatura'
        show={modalCancelShow}
        setShow={setModalCancelShow}
        handleAction={handleCancelSubscription}
        buttonText='Cancelar Assinatura'
        variant='danger'
        variantButton='danger'
        textAlert='Tem certeza que deseja cancelar esta assinatura? A ação não pode ser desfeita.'
        simpleConfirm
        centered
      />

      <section id='page-subscriptions'>
        <PageTitle title='Assinaturas' />

        <MetricsCards metrics={metrics} loadingMetrics={loadingMetrics} />

        <Row>
          <Col>
            <SubscriptionFilters
              filterProperties={filterProperties}
              loadingFilters={loadingFilters}
              selectedProduct={selectedProduct}
              selectedPlan={selectedPlan}
              selectedStatus={selectedStatus}
              selectedRenewing={selectedRenewing}
              selectedCanceled={selectedCanceled}
              selectedPaymentMethod={selectedPaymentMethod}
              searchInput={searchInput}
              activePlans={activePlans}
              loadingExport={loadingExport}
              onProductChange={handleProductChange}
              onPlanChange={handlePlanChange}
              onStatusChange={handleStatusChange}
              onRenewingChange={handleRenewingChange}
              onCanceledChange={handleCanceledChange}
              onPaymentMethodChange={handlePaymentMethodChange}
              onSearchChange={handleSearchChange}
              onExport={exportData}
            >
              <SubscriptionsTable
                records={records}
                loading={loading}
                totalRows={totalRows}
                perPage={perPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onPerRowsChange={handlePerRowsChange}
                renderPlan={renderPlan}
                renderPrice={renderPrice}
                renderViewDetails={renderViewDetails}
              />
            </SubscriptionFilters>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default PageSubscriptions;
