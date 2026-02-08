import { FC, useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { Users, UserCheck } from 'react-feather';
import { CreatorSummary } from '../../interfaces/creators.interface';
import { useSkin } from '../../utility/hooks/useSkin';

interface CreatorCard {
  title: string;
  value: string;
  numericValue: number;
  icon: any;
  iconBgColor: string;
}

interface CreatorsCardsProps {
  summary: CreatorSummary;
}

const CreatorsCards: FC<CreatorsCardsProps> = ({ summary }) => {
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

  const creatorsCards: CreatorCard[] = [
    {
      title: 'Creators Cadastrados',
      value: summary.totalCreatorsRegistered.toLocaleString(),
      numericValue: summary.totalCreatorsRegistered,
      icon: Users,
      iconBgColor: '#8b5cf6',
    },
    {
      title: 'Creators Ativos',
      value: summary.totalCreatorsActive.toLocaleString(),
      numericValue: summary.totalCreatorsActive,
      icon: UserCheck,
      iconBgColor: '#10b981',
    },
  ];

  useEffect(() => {
    const duration = 1000;
    const fps = 60;
    const frames = (duration / 1000) * fps;
    const intervals: NodeJS.Timeout[] = [];

    creatorsCards.forEach((card, index) => {
      const targetValue = card.numericValue;
      const increment = targetValue / frames;
      let currentFrame = 0;

      const interval = setInterval(() => {
        currentFrame++;
        const currentValue = Math.min(increment * currentFrame, targetValue);

        setAnimatedValues((prev) => ({
          ...prev,
          [index]: currentValue,
        }));

        if (currentFrame >= frames) {
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
  }, [summary.totalCreatorsRegistered, summary.totalCreatorsActive]);

  return (
    <Row className="g-1 mb-4 d-flex">
      {creatorsCards.map((card: CreatorCard, index: number) => {
        const IconComponent = card.icon;
        const animatedValue = animatedValues[index] ?? 0;
        const displayValue = Math.floor(animatedValue).toLocaleString();

        return (
          <Col key={index} xs={12} sm={6} md={6} lg={6} className="d-flex">
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
                <h6
                  style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    ...textStyles.title,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {card.title}
                </h6>
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
                }}
              >
                {displayValue}
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default CreatorsCards;
