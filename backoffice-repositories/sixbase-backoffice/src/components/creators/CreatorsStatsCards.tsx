import { FC, useEffect, useState } from 'react';
import { Activity, DollarSign, ShoppingCart, UserPlus } from 'react-feather';
import { Card, CardBody, Col, Row, Spinner } from 'reactstrap';
import { CreatorSummary } from '../../interfaces/creators.interface';
import { FormatBRL } from '../../utility/Utils';
import { useSkin } from '../../utility/hooks/useSkin';
import InfoTooltip from '../common/InfoTooltip';

interface StatsCard {
  title: string;
  value: string;
  numericValue: number;
  icon: any;
  isMonetary: boolean;
  isPercentage: boolean;
  tooltip: string;
}

interface CreatorsStatsCardsProps {
  summary: CreatorSummary;
  loading?: boolean;
  isInitialLoad?: boolean;
  newCreatorsStatsLoading?: boolean;
}

const CreatorsStatsCards: FC<CreatorsStatsCardsProps> = ({
  summary,
  loading = false,
  isInitialLoad = false,
  newCreatorsStatsLoading = false,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';
  const [animatedValues, setAnimatedValues] = useState<{
    [key: number]: number;
  }>({});

  const statsCards: StatsCard[] = [
    {
      title: 'Creators Novos',
      value: (summary.newCreatorsCount || 0).toLocaleString(),
      numericValue: summary.newCreatorsCount || 0,
      icon: UserPlus,
      isMonetary: false,
      isPercentage: false,
      tooltip: 'Total de creators cuja primeira identificação como afiliado ocorreu no período selecionado.',
    },
    {
      title: 'Renda Gerada - Creators Novos',
      value: FormatBRL(summary.newCreatorsRevenue || 0),
      numericValue: summary.newCreatorsRevenue || 0,
      icon: DollarSign,
      isMonetary: true,
      isPercentage: false,
      tooltip:
        'Soma do valor total das vendas pagas realizadas por creators cuja primeira venda como afiliado ocorreu no período selecionado.',
    },
    {
      title: 'Vendas - Creators Novos',
      value: (summary.newCreatorsSales || 0).toLocaleString(),
      numericValue: summary.newCreatorsSales || 0,
      icon: ShoppingCart,
      isMonetary: false,
      isPercentage: false,
      tooltip:
        'Número total de vendas pagas realizadas por creators cuja primeira venda como afiliado ocorreu no período selecionado.',
    },
    {
      title: 'Creators Novos Ativos',
      value: (summary.newCreatorsActiveCount || 0).toLocaleString(),
      numericValue: summary.newCreatorsActiveCount || 0,
      icon: Activity,
      isMonetary: false,
      isPercentage: false,
      tooltip:
        'Creators cuja primeira venda como afiliado ocorreu no período selecionado e que realizaram ao menos uma venda paga nos últimos 30 dias.',
    },
    {
      title: 'Creators novos que realizaram vendas',
      value: `${(summary.newCreatorsMadeSale || 0).toFixed(2)}%`,
      numericValue: summary.newCreatorsMadeSale || 0,
      icon: Activity,
      isMonetary: false,
      isPercentage: true,
      tooltip:
        'Percentual de creators identificados no período que efetivamente realizaram vendas como afiliados.',
    },
  ];

  useEffect(() => {
    const duration = loading ? 800 : 1000;
    const fps = 60;
    const frames = (duration / 1000) * fps;
    const intervals: NodeJS.Timeout[] = [];

    statsCards.forEach((card, index) => {
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
    summary.newCreatorsCount,
    summary.newCreatorsSales,
    summary.newCreatorsRevenue,
    summary.newCreatorsActiveCount,
    summary.newCreatorsMadeSale,
  ]);

  const containerGradient = isDark
    ? 'linear-gradient(135deg, #1f2a40 0%, #121826 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';

  return (
    <Card className="mb-3" style={{ border: 0, background: 'transparent' }}>
      <CardBody
        style={{
          background: containerGradient,
          borderRadius: 12,
          padding: 16,
          minHeight: 112,
          display: 'flex',
          alignItems: 'center',
          border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Row className="g-3 align-items-stretch w-100">
          {statsCards.map((card: StatsCard, index: number) => {
            const IconComponent = card.icon;
            const animatedValue = animatedValues[index] ?? 0;

            let displayValue: string;
            if (card.isMonetary) {
              displayValue = FormatBRL(animatedValue);
            } else if (card.isPercentage) {
              displayValue = `${animatedValue.toFixed(2)}%`;
            } else {
              displayValue = Math.floor(animatedValue).toLocaleString();
            }

            return (
              <Col key={index} xs={12} sm={6} lg={4} className="d-flex">
                <div
                  className="d-flex align-items-center w-100"
                  style={{ gap: 12 }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent
                      size={18}
                      color={isDark ? '#ffffff' : '#3b82f6'}
                    />
                  </div>
                  <div className="flex-fill">
                    <div
                      style={{
                        color: isDark ? '#cbd5e1' : '#64748b',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {card.title}
                      <InfoTooltip content={card.tooltip} size={12} />
                    </div>
                    <div
                      style={{
                        color: isDark ? '#ffffff' : '#1e293b',
                        fontWeight: 700,
                        fontSize: 20,
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: animatedValue > 0 ? 1 : 0.7,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isInitialLoad || newCreatorsStatsLoading ? (
                        <Spinner
                          size="sm"
                          color={isDark ? 'light' : 'primary'}
                        />
                      ) : (
                        displayValue
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </CardBody>
    </Card>
  );
};

export default CreatorsStatsCards;
