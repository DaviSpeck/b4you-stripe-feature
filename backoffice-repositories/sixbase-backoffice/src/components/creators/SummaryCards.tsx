import { FC, useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Tag, TrendingUp } from 'react-feather';
import { Col, Row, Spinner } from 'reactstrap';
import { CreatorSummary } from '../../interfaces/creators.interface';
import { FormatBRL } from '../../utility/Utils';
import { useSkin } from '../../utility/hooks/useSkin';
import InfoTooltip from '../common/InfoTooltip';

interface SummaryCard {
  title: string;
  value: string;
  numericValue: number;
  icon: any;
  iconBgColor: string;
  isMonetary: boolean;
  isPercentage: boolean;
  tooltip: string;
}

interface SummaryCardsProps {
  summary: CreatorSummary;
  loading?: boolean;
  isInitialLoad?: boolean;
  basicStatsLoading?: boolean;
  revenueStatsLoading?: boolean;
  conversionStatsLoading?: boolean;
}

const SummaryCards: FC<SummaryCardsProps> = ({
  summary,
  loading = false,
  isInitialLoad = false,
  basicStatsLoading = false,
  revenueStatsLoading = false,
  conversionStatsLoading = false,
}) => {
  const { skin } = useSkin();
  const [animatedValues, setAnimatedValues] = useState<{
    [key: number]: number;
  }>({});

  const isDark = skin === 'dark';

  const cardStyles = {
    background: isDark ? '#283046' : '#ffffff',
    border: isDark ? '1px solid #404656' : '1px solid #f0f0f0',
    boxShadow: isDark
      ? '0 2px 8px rgba(0, 0, 0, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const textStyles = {
    title: {
      color: isDark ? '#b4b7bd' : '#666',
    },
    value: {
      color: isDark ? '#ffffff' : '#333',
    },
  };

  const metricsCards: SummaryCard[] = [
    {
      title: 'Total de Vendas',
      value: summary.totalSales.toLocaleString(),
      numericValue: summary.totalSales,
      icon: ShoppingCart,
      iconBgColor: '#3b82f6',
      isMonetary: false,
      isPercentage: false,
      tooltip:
        'Número total de vendas pagas realizadas por creators atuando como afiliados no período selecionado.'
    },
    {
      title: 'Renda Gerada',
      value: FormatBRL(summary.totalRevenue),
      numericValue: summary.totalRevenue,
      icon: DollarSign,
      iconBgColor: '#10b981',
      isMonetary: true,
      isPercentage: false,
      tooltip:
        'Soma do valor total das vendas pagas geradas por creators atuando como afiliados no período selecionado.'
    },
    {
      title: 'Ticket Médio',
      value: FormatBRL(summary.averageTicket),
      numericValue: summary.averageTicket,
      icon: Tag,
      iconBgColor: isDark ? '#FFC107' : '#FFD54F',
      isMonetary: true,
      isPercentage: false,
      tooltip:
       'Cálculo: Renda Gerada ÷ Total de Vendas. Representa o valor médio por venda afiliada no período selecionado.'
    },
    {
      title: 'B4You Recebeu',
      value: FormatBRL(summary.totalB4youFee),
      numericValue: summary.totalB4youFee,
      icon: DollarSign,
      iconBgColor: '#8b5cf6',
      isMonetary: true,
      isPercentage: false,
      tooltip:
        'Valor total recebido pela B4You (taxa da plataforma) sobre vendas realizadas por creators como afiliados no período selecionado.'
    },
    {
      title: 'Conversão por Clique',
      value: `${(summary.averageConversionRate || 0).toFixed(2)}%`,
      numericValue: summary.averageConversionRate,
      icon: TrendingUp,
      iconBgColor: isDark ? '#BA68C8' : '#AB47BC',
      isMonetary: false,
      isPercentage: true,
      tooltip:
        'Cálculo: (Vendas afiliadas ÷ Cliques afiliados) × 100. Mede a taxa de conversão dos links de creators no período selecionado. Nem todos os cliques são capturados, podendo haver variações nos dados.'
    },
    {
      title: 'Primeira venda',
      value: `${summary.firstSale || 0}`,
      numericValue: summary.firstSale,
      icon: DollarSign,
      iconBgColor: isDark ? '#c87d68' : '#c4664c',
      isMonetary: false,
      isPercentage: false,
      tooltip:
        'Quantidade de creators cuja primeira venda como afiliado ocorreu dentro do período selecionado.'
    },
  ];

  useEffect(() => {
    const duration = loading ? 800 : 1000;
    const fps = 60;
    const frames = (duration / 1000) * fps;
    const intervals: NodeJS.Timeout[] = [];
    const allCards = [...metricsCards];

    allCards.forEach((card, index) => {
      const targetValue = loading
        ? card.isMonetary || card.isPercentage
          ? card.numericValue
          : Math.random() * (card.numericValue * 0.3 + 100)
        : card.numericValue;
      const increment = targetValue / frames;
      let currentFrame = 0;

      const interval = setInterval(() => {
        currentFrame++;
        const currentValue = loading
          ? Math.max(
              0,
              (animatedValues[index] ?? 0) +
                (Math.random() * increment - increment * 0.3),
            )
          : Math.min(increment * currentFrame, targetValue);

        setAnimatedValues((prev) => ({
          ...prev,
          [index]: loading ? Math.abs(currentValue) : currentValue,
        }));

        if (!loading && currentFrame >= frames) {
          clearInterval(interval);
          setAnimatedValues((prev) => ({
            ...prev,
            [index]: targetValue,
          }));
        }
      }, duration / frames);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [
    loading,
    summary.totalSales,
    summary.totalRevenue,
    summary.averageTicket,
    summary.totalB4youFee,
    summary.averageConversionRate,
    summary.totalCreatorsRegistered,
    summary.totalCreatorsActive,
    summary.firstSale
  ]);

  const renderCards = (cards: SummaryCard[], startIndex: number = 0) => {
    return (
      <Row className="g-1 mb-4">
        {cards.map((card: SummaryCard, index: number) => {
          const IconComponent = card.icon;
          const globalIndex = startIndex + index;
          const animatedValue = animatedValues[globalIndex] ?? 0;

          let displayValue: string;
          if (card.isMonetary) {
            displayValue = FormatBRL(animatedValue);
          } else if (card.isPercentage) {
            displayValue = `${animatedValue.toFixed(2)}%`;
          } else {
            displayValue = Math.floor(animatedValue).toLocaleString();
          }

          const isConversionCard = card.title === 'Conversão por Clique';

          return (
            <Col key={index} xs={12} sm={6} md={6} lg={4} className="d-flex">
              <div
                className="w-100"
                style={{
                  ...cardStyles,
                  borderRadius: '12px',
                  padding: '16px',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {/* Linha superior: Ícone + Título */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: card.iconBgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                    }}
                  >
                    <IconComponent size={16} color="#ffffff" />
                  </div>
                  <div className="d-flex align-items-center" style={{ gap: 6 }}>
                    <h6
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        ...textStyles.title,
                        margin: 0,
                      }}
                    >
                      {card.title}
                    </h6>
                    <InfoTooltip content={card.tooltip} />
                  </div>
                </div>

                {/* Valor principal */}
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    ...textStyles.value,
                    lineHeight: '1.2',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: animatedValue > 0 ? 1 : 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {(() => {
                    let isCardLoading = false;
                    if (startIndex === 0) {
                      if (index === 0 || index === 1 || index === 2) {
                        isCardLoading = revenueStatsLoading;
                      } else if (index === 3) {
                        isCardLoading = conversionStatsLoading;
                      }
                    } else if (startIndex === 4) {
                      isCardLoading = basicStatsLoading;
                    }

                    return isInitialLoad || isCardLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      displayValue
                    );
                  })()}
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      {/* Cards de Métricas Gerais */}
      {renderCards(metricsCards, 0)}
    </>
  );
};

export default SummaryCards;
