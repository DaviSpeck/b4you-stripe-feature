import { FC } from 'react';
import { Row, Col } from 'reactstrap';
import { useCreatorsData } from '../../hooks/useCreatorsData';
import CreatorFiltersSection from '../../components/creators/CreatorFiltersSection';
import PerformanceChartSection from '../../components/creators/PerformanceChartSection';
import SummaryCards from '../../components/creators/SummaryCards';
import CreatorsStatsCards from '../../components/creators/CreatorsStatsCards';
import CreatorsTable from '../../components/creators/CreatorsTable';
import CreatorsKPIs from '../../components/creators/CreatorsKPIs';
import InfoTooltip from 'components/common/InfoTooltip';
import { useSkin } from 'utility/hooks/useSkin';

const Creators: FC = () => {
  const {
    creators,
    pagination,
    creatorsScope,
    setCreatorsScope,
    summary,
    basicStats,
    newCreatorsStats,
    revenueStats,
    conversionStats,
    performanceChartData,
    chartScope,
    setChartScope,
    loading,
    loadingPerformanceChart,
    summaryLoading,
    error,
    setError,
    filters,
    producers,
    products,
    showCreatorsKpis,
    setShowCreatorsKpis,
    seriesVisible,

    // Handlers
    handleFiltersChange,
    handleDateChange,
    handleSearchChange,
    handleSortChange,
    handleOriginChange,
    handleVerifiedChange,
    handleExportCSV,
    toggleSeriesVisible,
    fetchCreators,
  } = useCreatorsData();

  const { skin } = useSkin();
  const isDark = skin === 'dark';

  const handleRetry = () => {
    setError(null);
    fetchCreators();
  };

  return (
    <div className="creators-page container-xxl">
      {/* Título da página */}
      <Row className="mb-1">
        <Col>
          <h2 className="text-white">Creators</h2>
          <div
            className="d-flex align-items-center small"
            style={{
              color: isDark ? '#cbd5e1' : '#64748b',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <InfoTooltip
              content={`• Um Creator é qualquer usuário que já realizou ao menos uma venda como afiliado.
• São consideradas apenas comissões em status waiting ou released.
• Vendas como produtor, coprodutor, gerente ou fornecedor não impedem que o usuário seja considerado Creator.`}
              size={12}
            />
            Apenas creators que já realizaram venda como afiliado.
          </div>
        </Col>
      </Row>

      {/* Seção de Filtros */}
      <CreatorFiltersSection
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onDateChange={handleDateChange}
        producers={producers}
        products={products}
        summary={summary}
        basicStatsLoading={basicStats.loading}
      />

      {/* Cards de Métricas Gerais */}
      <SummaryCards
        summary={summary}
        loading={summaryLoading}
        basicStatsLoading={basicStats.loading}
        revenueStatsLoading={revenueStats.loading}
        conversionStatsLoading={conversionStats.loading}
      />

      {/* Cards de Estatísticas Creators */}
      <CreatorsStatsCards
        summary={summary}
        loading={summaryLoading}
        newCreatorsStatsLoading={newCreatorsStats.loading}
      />

      {/* Gráfico de Performance */}
      <PerformanceChartSection
        data={performanceChartData}
        loading={loadingPerformanceChart}
        chartScope={chartScope}
        onChartScopeChange={setChartScope}
        seriesVisible={seriesVisible}
        onToggleSeriesVisible={toggleSeriesVisible}
      />

      {/* KPIs Personalizados - Creators */}
      <CreatorsKPIs
        showCreatorsKpis={showCreatorsKpis}
        setShowCreatorsKpis={setShowCreatorsKpis}
      />

      {/* Tabela de Creators */}
      <CreatorsTable
        creators={creators}
        fetchCreators={fetchCreators}
        pagination={pagination}
        loading={loading}
        error={error}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onOriginChange={handleOriginChange}
        onVerifiedChange={handleVerifiedChange}
        onRetry={handleRetry}
        onExportCSV={handleExportCSV}
        creatorsScope={creatorsScope}
        onCreatorsScopeChange={setCreatorsScope}
      />
    </div>
  );
};

export default Creators;
